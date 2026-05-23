use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use parking_lot::RwLock;
use std::collections::HashMap;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StoreError {
    #[error("Task not found: {0}")]
    NotFound(String),
    #[error("Serialization error: {0}")]
    Serialization(String),
    #[error("Storage error: {0}")]
    Storage(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subtask {
    pub id: u32,
    pub description: String,
    #[serde(rename = "type")]
    pub task_type: String,
    pub priority: String,
    #[serde(default)]
    pub depends_on: Vec<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelResult {
    pub model: String,
    pub model_tag: String,
    pub content: String,
    pub score: f64,
    pub tokens: u64,
    pub role_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsensusResult {
    pub rankings: Vec<Ranking>,
    pub best: String,
    pub consensus_score: f64,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ranking {
    pub model: String,
    pub score: f64,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinalResult {
    pub content: String,
    pub quality_score: f64,
    pub consensus: Option<ConsensusResult>,
    pub all_results: Vec<ModelResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskMetrics {
    pub models_used: usize,
    pub iterations: usize,
    pub tokens_used: u64,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub prompt: String,
    pub models: Vec<String>,
    pub mode: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub logs: Vec<TaskLog>,
    pub subtasks: Vec<Subtask>,
    pub results: Vec<ModelResult>,
    pub final_result: Option<FinalResult>,
    pub consensus: Option<ConsensusResult>,
    pub error: Option<String>,
    pub metrics: TaskMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskLog {
    #[serde(rename = "type")]
    pub log_type: String,
    pub message: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskSummary {
    pub id: String,
    pub prompt: String,
    pub status: String,
    pub models: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub metrics: TaskMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stats {
    pub total: usize,
    pub completed: usize,
    pub running: usize,
    pub failed: usize,
    pub avg_duration_ms: f64,
}

pub struct TaskStore {
    tasks: HashMap<String, Task>,
}

impl TaskStore {
    pub fn new() -> Self {
        Self {
            tasks: HashMap::new(),
        }
    }

    pub fn load_from_disk(&mut self, security: &crate::security::SecurityManager) -> Result<(), StoreError> {
        let path = std::path::PathBuf::from(security.data_dir()).join("tasks.enc");
        if path.exists() {
            let encrypted = std::fs::read(&path).map_err(|e| StoreError::Storage(e.to_string()))?;
            if !encrypted.is_empty() {
                let decrypted = security.decrypt_data(&encrypted).map_err(|e| StoreError::Storage(e.to_string()))?;
                let tasks: HashMap<String, Task> = serde_json::from_slice(&decrypted).map_err(|e| StoreError::Serialization(e.to_string()))?;
                self.tasks = tasks;
            }
        }
        Ok(())
    }

    pub fn save_to_disk(&self, security: &crate::security::SecurityManager) -> Result<(), StoreError> {
        let path = std::path::PathBuf::from(security.data_dir()).join("tasks.enc");
        let serialized = serde_json::to_vec(&self.tasks).map_err(|e| StoreError::Serialization(e.to_string()))?;
        let encrypted = security.encrypt_data(&serialized).map_err(|e| StoreError::Storage(e.to_string()))?;
        std::fs::write(&path, encrypted).map_err(|e| StoreError::Storage(e.to_string()))?;
        Ok(())
    }

    pub fn add_log(&mut self, id: &str, log_type: &str, message: &str) -> Result<(), StoreError> {
        let task = self.tasks.get_mut(id).ok_or_else(|| StoreError::NotFound(id.to_string()))?;
        task.logs.push(TaskLog {
            log_type: log_type.to_string(),
            message: message.to_string(),
            timestamp: Utc::now(),
        });
        task.updated_at = Utc::now();
        Ok(())
    }

    pub fn set_subtasks(&mut self, id: &str, subtasks: Vec<Subtask>) -> Result<(), StoreError> {
        let task = self.tasks.get_mut(id).ok_or_else(|| StoreError::NotFound(id.to_string()))?;
        task.subtasks = subtasks;
        task.updated_at = Utc::now();
        Ok(())
    }

    pub fn create(&mut self, prompt: String, models: Vec<String>, mode: String) -> Result<Task, StoreError> {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let task = Task {
            id: id.clone(),
            prompt,
            models,
            mode,
            status: "queued".to_string(),
            created_at: now,
            updated_at: now,
            logs: vec![],
            subtasks: vec![],
            results: vec![],
            final_result: None,
            consensus: None,
            error: None,
            metrics: TaskMetrics {
                models_used: 0,
                iterations: 0,
                tokens_used: 0,
                duration_ms: 0,
            },
        };

        self.tasks.insert(id.clone(), task.clone());
        Ok(task)
    }

    pub fn get(&self, id: &str) -> Option<Task> {
        self.tasks.get(id).cloned()
    }

    pub fn update_status(&mut self, id: &str, status: &str) -> Result<(), StoreError> {
        let task = self.tasks.get_mut(id).ok_or_else(|| StoreError::NotFound(id.to_string()))?;
        task.status = status.to_string();
        task.updated_at = Utc::now();
        Ok(())
    }

    pub fn fail_task(&mut self, id: &str, error: &str) -> Result<(), StoreError> {
        let task = self.tasks.get_mut(id).ok_or_else(|| StoreError::NotFound(id.to_string()))?;
        task.status = "failed".to_string();
        task.error = Some(error.to_string());
        task.updated_at = Utc::now();
        Ok(())
    }

    pub fn add_result(&mut self, id: &str, result: ModelResult) -> Result<(), StoreError> {
        let task = self.tasks.get_mut(id).ok_or_else(|| StoreError::NotFound(id.to_string()))?;
        task.results.push(result);
        task.updated_at = Utc::now();
        Ok(())
    }

    pub fn complete_task(&mut self, id: &str, final_result: FinalResult, metrics: TaskMetrics) -> Result<(), StoreError> {
        let task = self.tasks.get_mut(id).ok_or_else(|| StoreError::NotFound(id.to_string()))?;
        task.status = "completed".to_string();
        task.final_result = Some(final_result);
        task.metrics = metrics;
        task.updated_at = Utc::now();
        Ok(())
    }

    pub fn delete(&mut self, id: &str) -> Result<(), StoreError> {
        self.tasks.remove(id).ok_or_else(|| StoreError::NotFound(id.to_string()))?;
        Ok(())
    }

    pub fn wipe_all(&mut self) -> Result<(), StoreError> {
        self.tasks.clear();
        Ok(())
    }

    pub fn list(&self) -> Vec<TaskSummary> {
        let mut tasks: Vec<_> = self.tasks.values()
            .map(|t| TaskSummary {
                id: t.id.clone(),
                prompt: if t.prompt.len() > 120 {
                    format!("{}...", &t.prompt[..120])
                } else {
                    t.prompt.clone()
                },
                status: t.status.clone(),
                models: t.models.clone(),
                created_at: t.created_at,
                metrics: t.metrics.clone(),
            })
            .collect();
        tasks.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        tasks
    }

    pub fn stats(&self) -> Stats {
        let all: Vec<_> = self.tasks.values().collect();
        let total = all.len();
        let completed = all.iter().filter(|t| t.status == "completed").count();
        let running = all.iter().filter(|t| t.status == "running").count();
        let failed = all.iter().filter(|t| t.status == "failed").count();
        let durations: Vec<u64> = all.iter()
            .filter(|t| t.metrics.duration_ms > 0)
            .map(|t| t.metrics.duration_ms)
            .collect();
        let avg_duration = if durations.is_empty() {
            0.0
        } else {
            durations.iter().sum::<u64>() as f64 / durations.len() as f64
        };

        Stats {
            total,
            completed,
            running,
            failed,
            avg_duration_ms: avg_duration,
        }
    }
}
