#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod security;
mod models;
mod agents;
mod store;

use std::sync::Arc;
use parking_lot::RwLock;
use tauri::{Manager, State};
use crate::store::TaskStore;
use crate::security::SecurityManager;
use crate::models::ModelRegistry;
use crate::agents::Orchestrator;

pub struct AppState {
    pub task_store: Arc<RwLock<TaskStore>>,
    pub security: Arc<SecurityManager>,
    pub model_registry: Arc<parking_lot::RwLock<ModelRegistry>>,
}

#[tauri::command]
async fn create_task(
    prompt: String,
    models: Option<Vec<String>>,
    mode: Option<String>,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let mode = mode.unwrap_or_else(|| "collaborative".to_string());
    let models = models.unwrap_or_default();

    let task = {
        let store = state.task_store.read();
        store.create(prompt, models, mode).map_err(|e| e.to_string())?
    };

    let task_id = task.id.clone();

    let orchestrator = Orchestrator::new(
        task,
        state.model_registry.clone(),
        state.security.clone(),
    );

    tauri::async_runtime::spawn(async move {
        if let Err(e) = orchestrator.run().await {
            let ts = state.task_store.clone();
            if let Ok(mut store) = ts.write() {
                let _ = store.fail_task(&task_id, &e.to_string());
            }
        }
    });

    Ok(serde_json::json!({ "taskId": task_id, "status": "queued" }))
}

#[tauri::command]
fn list_tasks(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let store = state.task_store.read();
    let tasks = store.list();
    Ok(serde_json::json!({ "tasks": tasks }))
}

#[tauri::command]
fn get_task(id: String, state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let store = state.task_store.read();
    let task = store.get(&id).ok_or("Task not found")?;
    Ok(serde_json::json!({ "task": task }))
}

#[tauri::command]
fn delete_task(id: String, state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let mut store = state.task_store.write();
    store.delete(&id).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({ "ok": true }))
}

#[tauri::command]
fn wipe_all_data(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let sec = &state.security;
    sec.secure_wipe().map_err(|e| e.to_string())?;
    let mut store = state.task_store.write();
    store.wipe_all().map_err(|e| e.to_string())?;
    Ok(serde_json::json!({ "ok": true, "message": "All data securely wiped" }))
}

#[tauri::command]
fn get_models(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let registry = &state.model_registry;
    let available = registry.get_available_tags();
    let all = registry.get_all_profiles();
    let available_profiles: Vec<_> = all.iter()
        .filter(|p| available.contains(&p.tag))
        .cloned()
        .collect();
    Ok(serde_json::json!({
        "available": available_profiles,
        "all": all,
    }))
}

#[tauri::command]
async fn pull_model(model: String, state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let mut registry = state.model_registry.write().map_err(|_| "Lock error")?;
    registry.download_model(&model).await
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({ "ok": true, "model": model }))
}

#[tauri::command]
fn ollama_status(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let registry = &state.model_registry;
    let status = registry.inference_status();
    Ok(serde_json::json!({
        "running": status.models_loaded > 0,
        "models_available": status.models_loaded,
        "models_total": status.models_available,
        "device": status.device,
        "cache_dir": status.cache_dir,
    }))
}

#[tauri::command]
fn get_stats(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let store = state.task_store.read();
    Ok(serde_json::json!({ "stats": store.stats() }))
}

#[tauri::command]
fn get_security_info(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let sec = &state.security;
    Ok(serde_json::json!({
        "encryption": "AES-256-GCM + ChaCha20-Poly1305",
        "keyDerivation": "Argon2id",
        "dataLocation": sec.data_dir(),
        "secureMemory": true,
        "autoWipe": true,
        "sandboxed": true,
    }))
}

pub fn run() {
    env_logger::init();

    let security = Arc::new(SecurityManager::new().expect("Failed to initialize security"));
    let model_registry = Arc::new(parking_lot::RwLock::new(
        ModelRegistry::new().expect("Failed to initialize model registry")
    ));
    let task_store = Arc::new(RwLock::new(TaskStore::new()));

    let app_state = AppState {
        task_store,
        security,
        model_registry,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            create_task,
            list_tasks,
            get_task,
            delete_task,
            wipe_all_data,
            get_models,
            pull_model,
            ollama_status,
            get_stats,
            get_security_info,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running NEXUS 1.0");
}
