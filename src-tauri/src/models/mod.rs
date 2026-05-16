use serde::Serialize;
use std::collections::HashMap;
use std::path::PathBuf;
use candle_core::{Device, Tensor};
use candle_transformers::generation::LogitsProcessor;
use hf_hub::{api::sync::Api, Repo, RepoType};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ModelError {
    #[error("Model load failed: {0}")]
    LoadFailed(String),
    #[error("Inference failed: {0}")]
    Inference(String),
    #[error("Download failed: {0}")]
    DownloadFailed(String),
    #[error("Tokenization failed: {0}")]
    Tokenization(String),
}

#[derive(Debug, Clone, Serialize)]
pub struct ModelProfile {
    pub tag: String,
    pub name: String,
    pub size: String,
    pub size_bytes: u64,
    pub specialty: String,
    pub role: String,
    pub strengths: Vec<String>,
    pub context_window: u32,
    pub temperature: f32,
    pub tier: String,
    pub hf_repo: String,
    pub hf_file: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct InferenceStatus {
    pub models_loaded: usize,
    pub models_available: usize,
    pub device: String,
    pub cache_dir: String,
}

pub struct LoadedModel {
    pub profile: ModelProfile,
    pub path: PathBuf,
}

pub struct ModelRegistry {
    profiles: HashMap<String, ModelProfile>,
    loaded: HashMap<String, LoadedModel>,
    cache_dir: PathBuf,
    device: Device,
}

impl ModelRegistry {
    pub fn new() -> Result<Self, ModelError> {
        let cache_dir = dirs::cache_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("nexus1")
            .join("models");
        std::fs::create_dir_all(&cache_dir).map_err(|e| ModelError::LoadFailed(e.to_string()))?;

        let device = Device::Cpu;

        let profiles = Self::build_registry();
        let loaded = HashMap::new();

        Ok(Self {
            profiles,
            loaded,
            cache_dir,
            device,
        })
    }

    fn build_registry() -> HashMap<String, ModelProfile> {
        let mut map = HashMap::new();

        macro_rules! add {
            ($tag:expr, $name:expr, $size:expr, $bytes:expr, $specialty:expr, $role:expr, $strengths:expr, $ctx:expr, $temp:expr, $tier:expr, $repo:expr, $file:expr) => {
                map.insert($tag.to_string(), ModelProfile {
                    tag: $tag.to_string(),
                    name: $name.to_string(),
                    size: $size.to_string(),
                    size_bytes: $bytes,
                    specialty: $specialty.to_string(),
                    role: $role.to_string(),
                    strengths: $strengths.iter().map(|s| s.to_string()).collect(),
                    context_window: $ctx,
                    temperature: $temp,
                    tier: $tier.to_string(),
                    hf_repo: $repo.to_string(),
                    hf_file: $file.to_string(),
                });
            };
        }

        // TIER 1: Micro
        add!("qwen2.5:0.5b", "Qwen 2.5 0.5B", "380 MB", 380_000_000,
            "speed", "scanner",
            ["ultra-fast responses", "basic Q&A", "simple classification"],
            4096, 0.5, "micro",
            "Qwen/Qwen2.5-0.5B-Instruct-GGUF", "qwen2.5-0.5b-instruct-q4_k_m.gguf");

        add!("llama3.2:1b", "Llama 3.2 1B", "700 MB", 700_000_000,
            "chat", "communicator",
            ["quick tasks", "conversation", "summarization"],
            4096, 0.6, "micro",
            "lmstudio-community/Llama-3.2-1B-Instruct-GGUF", "Llama-3.2-1B-Instruct-Q4_K_M.gguf");

        // TIER 2: Small
        add!("qwen2.5:1.5b", "Qwen 2.5 1.5B", "940 MB", 940_000_000,
            "reasoning", "analyst",
            ["multilingual", "logical reasoning", "structured output"],
            8192, 0.4, "small",
            "Qwen/Qwen2.5-1.5B-Instruct-GGUF", "qwen2.5-1.5b-instruct-q4_k_m.gguf");

        add!("smollm2:1.7b", "SmolLM2 1.7B", "1.0 GB", 1_000_000_000,
            "general", "generalist",
            ["general purpose", "instruction following", "balanced"],
            4096, 0.7, "small",
            "HuggingFaceTB/SmolLM2-1.7B-Instruct-GGUF", "SmolLM2-1.7B-Instruct-Q4_K_M.gguf");

        add!("gemma2:2b", "Gemma 2 2B", "1.5 GB", 1_500_000_000,
            "creative", "creative",
            ["creative writing", "nuanced understanding", "tone adaptation"],
            8192, 0.7, "small",
            "bartowski/gemma-2-2b-it-GGUF", "gemma-2-2b-it-Q4_K_M.gguf");

        // TIER 3: Medium-Small
        add!("qwen2.5:3b", "Qwen 2.5 3B", "1.8 GB", 1_800_000_000,
            "complex", "thinker",
            ["complex tasks", "deep reasoning", "multi-step problems"],
            8192, 0.4, "medium-small",
            "Qwen/Qwen2.5-3B-Instruct-GGUF", "qwen2.5-3b-instruct-q4_k_m.gguf");

        add!("llama3.2:3b", "Llama 3.2 3B", "2.0 GB", 2_000_000_000,
            "writing", "writer",
            ["long-form content", "chat", "reasoning", "synthesis"],
            8192, 0.6, "medium-small",
            "lmstudio-community/Llama-3.2-3B-Instruct-GGUF", "Llama-3.2-3B-Instruct-Q4_K_M.gguf");

        add!("phi3.5:3.8b", "Phi-3.5 Mini 3.8B", "2.2 GB", 2_200_000_000,
            "code", "engineer",
            ["code generation", "technical reasoning", "math"],
            4096, 0.3, "medium-small",
            "bartowski/Phi-3.5-mini-instruct-GGUF", "Phi-3.5-mini-instruct-Q4_K_M.gguf");

        add!("qwen2.5-coder:3b", "Qwen 2.5 Coder 3B", "2.0 GB", 2_000_000_000,
            "code", "coder",
            ["code completion", "refactoring", "multiple languages"],
            8192, 0.2, "medium-small",
            "Qwen/Qwen2.5-Coder-3B-Instruct-GGUF", "qwen2.5-coder-3b-instruct-q4_k_m.gguf");

        // TIER 4: Medium
        add!("llama3.2:8b", "Llama 3.2 8B", "4.9 GB", 4_900_000_000,
            "general", "specialist",
            ["strong reasoning", "complex analysis", "quality output"],
            8192, 0.6, "medium",
            "lmstudio-community/Llama-3.2-8B-Instruct-GGUF", "Llama-3.2-8B-Instruct-Q4_K_M.gguf");

        add!("qwen2.5:7b", "Qwen 2.5 7B", "4.4 GB", 4_400_000_000,
            "multilingual", "polyglot",
            ["29 languages", "strong reasoning", "math", "code"],
            8192, 0.5, "medium",
            "Qwen/Qwen2.5-7B-Instruct-GGUF", "qwen2.5-7b-instruct-q4_k_m.gguf");

        add!("mistral:7b", "Mistral 7B", "4.1 GB", 4_100_000_000,
            "efficient", "efficient",
            ["efficient inference", "strong performance", "balanced"],
            8192, 0.6, "medium",
            "TheBloke/Mistral-7B-Instruct-v0.2-GGUF", "mistral-7b-instruct-v0.2.Q4_K_M.gguf");

        add!("gemma2:9b", "Gemma 2 9B", "5.5 GB", 5_500_000_000,
            "quality", "quality",
            ["high quality output", "nuanced reasoning", "creative tasks"],
            8192, 0.6, "medium",
            "bartowski/gemma-2-9b-it-GGUF", "gemma-2-9b-it-Q4_K_M.gguf");

        // TIER 5: Specialized
        add!("deepseek-coder:1.3b", "DeepSeek Coder 1.3B", "800 MB", 800_000_000,
            "code", "code-scanner",
            ["fast code review", "syntax check", "80+ languages"],
            4096, 0.2, "specialized",
            "TheBloke/deepseek-coder-1.3b-instruct-GGUF", "deepseek-coder-1.3b-instruct.Q4_K_M.gguf");

        add!("dolphin-mistral:7b", "Dolphin Mistral 7B", "4.1 GB", 4_100_000_000,
            "uncensored", "researcher",
            ["uncensored research", "complex analysis", "no refusals"],
            8192, 0.7, "specialized",
            "TheBloke/dolphin-2.7-mistral-7b-GGUF", "dolphin-2.7-mistral-7b.Q4_K_M.gguf");

        add!("wizardlm2:7b", "WizardLM 2 7B", "4.4 GB", 4_400_000_000,
            "instruction", "instructor",
            ["complex instructions", "multi-step tasks", "precision"],
            8192, 0.5, "specialized",
            "TheBloke/WizardLM-2-7B-GGUF", "wizardlm-2-7b.Q4_K_M.gguf");

        add!("openhermes:7b", "OpenHermes 7B", "4.1 GB", 4_100_000_000,
            "reasoning", "reasoner",
            ["chain of thought", "logical deduction", "math proofs"],
            8192, 0.4, "specialized",
            "TheBloke/OpenHermes-2.5-Mistral-7B-GGUF", "openhermes-2.5-mistral-7b.Q4_K_M.gguf");

        map
    }

    pub async fn download_model(&mut self, tag: &str) -> Result<PathBuf, ModelError> {
        if let Some(loaded) = self.loaded.get(tag) {
            return Ok(loaded.path.clone());
        }

        let profile = self.profiles.get(tag)
            .ok_or_else(|| ModelError::LoadFailed(format!("Unknown model: {}", tag)))?;

        let api = Api::new().map_err(|e| ModelError::DownloadFailed(e.to_string()))?;
        let repo = Repo::with_revision(
            profile.hf_repo.clone(),
            RepoType::Model,
            "main".to_string(),
        );

        let api_repo = api.repo(repo);
        let path = api_repo.get(&profile.hf_file)
            .map_err(|e| ModelError::DownloadFailed(e.to_string()))?;

        self.loaded.insert(tag.to_string(), LoadedModel {
            profile: profile.clone(),
            path: path.clone(),
        });

        Ok(path)
    }

    pub fn get_all_profiles(&self) -> Vec<ModelProfile> {
        self.profiles.values().cloned().collect()
    }

    pub fn get_available_tags(&self) -> Vec<String> {
        self.loaded.keys().cloned().collect()
    }

    pub fn get_profile(&self, tag: &str) -> Option<&ModelProfile> {
        self.profiles.get(tag)
    }

    pub fn device(&self) -> &Device {
        &self.device
    }

    pub fn inference_status(&self) -> InferenceStatus {
        InferenceStatus {
            models_loaded: self.loaded.len(),
            models_available: self.profiles.len(),
            device: format!("{:?}", self.device),
            cache_dir: self.cache_dir.to_string_lossy().to_string(),
        }
    }
}
