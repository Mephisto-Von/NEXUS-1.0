use std::sync::Arc;
use parking_lot::RwLock;
use candle_core::{Device, Tensor, DType};
use candle_transformers::models::qwen2::{Config as QwenConfig, Model as QwenModel};
use candle_nn::VarBuilder;
use tokenizers::Tokenizer;
use crate::store::{Task, TaskMetrics, FinalResult, ConsensusResult, ModelResult, Ranking, Subtask};
use crate::models::ModelRegistry;
use crate::security::SecurityManager;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AgentError {
    #[error("Inference error: {0}")]
    Inference(String),
    #[error("Parse error: {0}")]
    Parse(String),
    #[error("Task error: {0}")]
    Task(String),
    #[error("Model error: {0}")]
    Model(#[from] crate::models::ModelError),
}

pub struct Orchestrator {
    task: Task,
    model_registry: Arc<parking_lot::RwLock<ModelRegistry>>,
    security: Arc<SecurityManager>,
}

impl Orchestrator {
    pub fn new(task: Task, model_registry: Arc<parking_lot::RwLock<ModelRegistry>>, security: Arc<SecurityManager>) -> Self {
        Self {
            task,
            model_registry,
            security,
        }
    }

    pub async fn run(&self) -> Result<(), AgentError> {
        let start = std::time::Instant::now();

        let models = self.route_models(&self.task.prompt, &self.task.models);
        if models.is_empty() {
            return Err(AgentError::Task("No models available".into()));
        }

        let plan = self.decompose(&self.task.prompt).await?;

        let mut all_results = Vec::new();
        for subtask in &plan {
            let subtask_results = self.execute_subtask(subtask, &models).await?;
            all_results.extend(subtask_results);
        }

        let consensus = self.run_consensus(&self.task.prompt, &all_results).await?;
        let final_content = self.synthesize(&self.task.prompt, &all_results).await?;
        let quality = self.critic_review(&self.task.prompt, &final_content).await?;

        let duration = start.elapsed().as_millis() as u64;
        let total_tokens: u64 = all_results.iter().map(|r| r.tokens).sum();

        let final_result = FinalResult {
            content: final_content,
            quality_score: quality,
            consensus: Some(consensus),
            all_results,
        };

        let metrics = TaskMetrics {
            models_used: models.len(),
            iterations: plan.len(),
            tokens_used: total_tokens,
            duration_ms: duration,
        };

        Ok(())
    }

    fn route_models(&self, prompt: &str, requested: &[String]) -> Vec<String> {
        if !requested.is_empty() {
            return requested.to_vec();
        }

        let p = prompt.to_lowercase();
        let task_type = if p.contains("code") || p.contains("function") || p.contains("api") || p.contains("debug") {
            "code"
        } else if p.contains("write") || p.contains("essay") || p.contains("article") {
            "writing"
        } else if p.contains("analyze") || p.contains("analysis") || p.contains("compare") {
            "analysis"
        } else if p.contains("creative") || p.contains("imagine") || p.contains("design") {
            "creative"
        } else if p.contains("math") || p.contains("calculate") {
            "math"
        } else {
            "general"
        };

        let primary = match task_type {
            "code" => vec!["phi3.5:3.8b", "qwen2.5-coder:3b", "qwen2.5:3b"],
            "writing" => vec!["llama3.2:3b", "gemma2:2b", "qwen2.5:1.5b"],
            "analysis" => vec!["qwen2.5:3b", "qwen2.5:1.5b", "llama3.2:3b"],
            "creative" => vec!["gemma2:2b", "llama3.2:3b", "smollm2:1.7b"],
            "math" => vec!["qwen2.5:3b", "phi3.5:3.8b", "qwen2.5:1.5b"],
            _ => vec!["smollm2:1.7b", "llama3.2:1b", "qwen2.5:1.5b"],
        };

        primary.iter().map(|s| s.to_string()).collect()
    }

    async fn decompose(&self, prompt: &str) -> Result<Vec<Subtask>, AgentError> {
        let system = "Break this task into subtasks. Respond with JSON array: [{\"id\":1,\"description\":\"...\",\"type\":\"code|writing|analysis|creative|general\",\"priority\":\"high|medium|low\",\"depends_on\":[]}]";
        let user = format!("Decompose:\n\n{}", prompt);

        let resp = self.generate("qwen2.5:1.5b", system, &user, 0.3, 2048).await?;

        if let Ok(arr) = serde_json::from_str::<Vec<serde_json::Value>>(&resp) {
            let subtasks: Vec<Subtask> = arr.iter().enumerate().map(|(i, v)| {
                Subtask {
                    id: (i + 1) as u32,
                    description: v.get("description").and_then(|d| d.as_str()).unwrap_or("").to_string(),
                    task_type: v.get("type").and_then(|t| t.as_str()).unwrap_or("general").to_string(),
                    priority: v.get("priority").and_then(|p| p.as_str()).unwrap_or("medium").to_string(),
                    depends_on: v.get("depends_on").and_then(|d| d.as_array())
                        .map(|arr| arr.iter().filter_map(|v| v.as_u64().map(|n| n as u32)).collect())
                        .unwrap_or_default(),
                }
            }).collect();
            if !subtasks.is_empty() {
                return Ok(subtasks);
            }
        }

        Ok(vec![Subtask {
            id: 1,
            description: prompt.to_string(),
            task_type: "general".to_string(),
            priority: "high".to_string(),
            depends_on: vec![],
        }])
    }

    async fn execute_subtask(&self, subtask: &Subtask, models: &[String]) -> Result<Vec<ModelResult>, AgentError> {
        let mut results = Vec::new();

        for model in models {
            let profile = {
                let registry = self.model_registry.read();
                registry.get_profile(model).cloned()
            };
            let role_type = &subtask.task_type;
            let system_prompt = match role_type.as_str() {
                "code" => "You are a code specialist. Write clean, working code with comments and error handling.",
                "writing" => "You are a writing specialist. Produce clear, well-structured content.",
                "analysis" => "You are an analyst. Provide thorough, evidence-based analysis with reasoning.",
                "creative" => "You are a creative specialist. Think outside the box. Generate original ideas.",
                _ => "You are a capable assistant. Provide thorough, accurate responses.",
            };

            let temp = profile.as_ref().map(|p| p.temperature).unwrap_or(0.7);
            match self.generate(model, system_prompt, &subtask.description, temp, 4096).await {
                Ok(content) => {
                    results.push(ModelResult {
                        model: profile.map(|p| p.name).unwrap_or(model.clone()),
                        model_tag: model.clone(),
                        content,
                        score: 0.0,
                        tokens: 0,
                        role_type: role_type.clone(),
                    });
                }
                Err(e) => {
                    log::warn!("Model {} failed: {}", model, e);
                }
            }
        }

        Ok(results)
    }

    async fn run_consensus(&self, prompt: &str, results: &[ModelResult]) -> Result<ConsensusResult, AgentError> {
        let outputs: String = results.iter().map(|r| {
            format!("### {}\n{}\n---", r.model, &r.content[..r.content.len().min(1500)])
        }).collect::<Vec<_>>().join("\n\n");

        let system = "Rank these outputs. JSON: {\"rankings\":[{\"model\":\"name\",\"score\":0-100,\"reason\":\"brief\"}],\"best\":\"model-name\",\"consensus_score\":0-100,\"summary\":\"why best\"}";
        let user = format!("Task: {}\n\nOutputs:\n\n{}", prompt, outputs);

        let resp = self.generate("qwen2.5:1.5b", system, &user, 0.2, 1024).await?;

        if let Ok(val) = serde_json::from_str::<serde_json::Value>(&resp) {
            let rankings: Vec<Ranking> = val.get("rankings")
                .and_then(|r| r.as_array())
                .map(|arr| arr.iter().filter_map(|v| {
                    Some(Ranking {
                        model: v.get("model")?.as_str()?.to_string(),
                        score: v.get("score")?.as_f64()?,
                        reason: v.get("reason")?.as_str()?.to_string(),
                    })
                }).collect())
                .unwrap_or_default();

            let best = val.get("best").and_then(|b| b.as_str()).unwrap_or("").to_string();
            let consensus_score = val.get("consensus_score").and_then(|s| s.as_f64()).unwrap_or(50.0);
            let summary = val.get("summary").and_then(|s| s.as_str()).unwrap_or("").to_string();

            return Ok(ConsensusResult {
                rankings,
                best,
                consensus_score,
                summary,
            });
        }

        Ok(ConsensusResult {
            rankings: results.iter().map(|r| Ranking {
                model: r.model.clone(),
                score: 50.0,
                reason: "Default".into(),
            }).collect(),
            best: results.first().map(|r| r.model.clone()).unwrap_or_default(),
            consensus_score: 50.0,
            summary: "Default consensus".into(),
        })
    }

    async fn synthesize(&self, prompt: &str, results: &[ModelResult]) -> Result<String, AgentError> {
        let outputs: String = results.iter().map(|r| {
            format!("--- {}\n{}\n", r.model, &r.content[..r.content.len().min(2000)])
        }).collect::<Vec<_>>().join("\n\n");

        let system = "Combine multiple outputs into one best result. Take strongest elements, resolve contradictions, ensure completeness.";
        let user = format!("Task: {}\n\nOutputs:\n\n{}", prompt, outputs);

        self.generate("llama3.2:3b", system, &user, 0.5, 4096).await
    }

    async fn critic_review(&self, prompt: &str, output: &str) -> Result<f64, AgentError> {
        let system = "Score this output 0.0-1.0. Respond with just the number.";
        let user = format!("Task: {}\n\nOutput:\n{}", prompt, &output[..output.len().min(3000)]);

        let resp = self.generate("qwen2.5:3b", system, &user, 0.2, 128).await?;
        let score = resp.trim().parse::<f64>().unwrap_or(0.7).min(1.0).max(0.0);
        Ok(score)
    }

    async fn generate(&self, model: &str, system: &str, user: &str, temperature: f32, max_tokens: u32) -> Result<String, AgentError> {
        let path = {
            let mut registry = self.model_registry.write();
            registry.download_model(model).await?
        };
        let profile = {
            let registry = self.model_registry.read();
            registry.get_profile(model)
                .ok_or_else(|| AgentError::Inference("Model profile not found".into()))?
                .clone()
        };

        let device = {
            let registry = self.model_registry.read();
            registry.device().clone()
        };

        let tokenizer = Tokenizer::from_file(&path)
            .map_err(|e| AgentError::Inference(format!("Tokenizer error: {}", e)))?;

        let vb = unsafe {
            VarBuilder::from_mmaped_safetensors(&[&path], DType::Q4_0, &device)
        }.map_err(|e| AgentError::Inference(format!("Model load error: {}", e)))?;

        let config = QwenConfig::qwen2_0_5b();
        let mut model = QwenModel::new(&config, vb).map_err(|e| AgentError::Inference(e.to_string()))?;

        let mut logits_processor = LogitsProcessor::from_sampling(
            42,
            candle_transformers::generation::SamplingParams::default(),
        );

        let mut tokens = tokenizer.encode(format!("<|system|>\n{}\n<|user|>\n{}\n<|assistant|>\n", system, user), true)
            .map_err(|e| AgentError::Inference(e.to_string()))?
            .get_ids()
            .to_vec();

        let mut generated = String::new();
        let mut token_count = 0u64;

        for _ in 0..max_tokens.min(4096) {
            let context_size = if tokens.len() > 4096 { 4096 } else { tokens.len() };
            let ctxt = &tokens[tokens.len().saturating_sub(context_size)..];
            let input = Tensor::new(ctxt, &device)?.unsqueeze(0)
                .map_err(|e| AgentError::Inference(e.to_string()))?;

            let logits = model.forward(&input, 0)
                .map_err(|e| AgentError::Inference(e.to_string()))?;
            let logits = logits.squeeze(0)
                .map_err(|e| AgentError::Inference(e.to_string()))?;

            let next_token = logits_processor.sample(&logits)
                .map_err(|e| AgentError::Inference(e.to_string()))?;

            tokens.push(next_token);
            token_count += 1;

            if let Ok(token_str) = tokenizer.decode(&[next_token], false) {
                if token_str.contains("<|end|>") || token_str.contains("<|im_end|>") {
                    break;
                }
                generated.push_str(&token_str);
            }
        }

        Ok(generated)
    }
}
