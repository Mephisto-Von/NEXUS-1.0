import { invoke } from '@tauri-apps/api/core';

export async function tauriInvoke<T>(cmd: string, args: Record<string, unknown> = {}): Promise<T> {
  return invoke<T>(cmd, args);
}

export async function createTask(prompt: string, models: string[], mode: string) {
  return tauriInvoke<{ taskId: string; status: string }>('create_task', { prompt, models, mode });
}

export async function listTasks() {
  return tauriInvoke<{ tasks: import('@/types').TaskSummary[] }>('list_tasks');
}

export async function getTask(id: string) {
  return tauriInvoke<{ task: import('@/types').Task }>('get_task', { id });
}

export async function deleteTask(id: string) {
  return tauriInvoke<{ ok: boolean }>('delete_task', { id });
}

export async function wipeAllData() {
  return tauriInvoke<{ ok: boolean; message: string }>('wipe_all_data');
}

export async function getModels() {
  return tauriInvoke<{ available: import('@/types').ModelProfile[]; all: import('@/types').ModelProfile[] }>('get_models');
}

export async function pullModel(model: string) {
  return tauriInvoke<{ ok: boolean; model: string }>('pull_model', { model });
}

export async function ollamaStatus() {
  return tauriInvoke<import('@/types').OllamaStatus>('ollama_status');
}

export async function getStats() {
  return tauriInvoke<{ stats: import('@/types').Stats }>('get_stats');
}

export async function getSecurityInfo() {
  return tauriInvoke<import('@/types').SecurityInfo>('get_security_info');
}
