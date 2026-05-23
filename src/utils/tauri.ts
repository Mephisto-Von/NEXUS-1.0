import type { Task, TaskSummary, ModelProfile, Stats, SecurityInfo, TaskLog, Subtask, ModelResult, ConsensusResult, Ranking, FinalResult } from '@/types';

// Detect if running inside a Tauri container
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;

export async function tauriInvoke<T>(cmd: string, args: Record<string, unknown> = {}): Promise<T> {
  if (isTauri) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(cmd, args);
  }
  
  // Fallback to browser execution simulation
  return browserMockInvoke<T>(cmd, args);
}

// ----------------------------------------------------
// BROWSER-SAFE SIMULATED MULTI-AGENT STATE MACHINE
// ----------------------------------------------------

const STORAGE_KEY = 'nexus_tasks';

const defaultModels: ModelProfile[] = [
  { tag: "qwen2.5:0.5b", name: "Qwen 2.5 0.5B", size: "380 MB", size_bytes: 380000000, specialty: "speed", role: "scanner", strengths: ["ultra-fast responses", "basic Q&A", "simple classification"], context_window: 4096, temperature: 0.5, tier: "micro", available: false },
  { tag: "llama3.2:1b", name: "Llama 3.2 1B", size: "700 MB", size_bytes: 700000000, specialty: "chat", role: "communicator", strengths: ["quick tasks", "conversation", "summarization"], context_window: 4096, temperature: 0.6, tier: "micro", available: false },
  { tag: "qwen2.5:1.5b", name: "Qwen 2.5 1.5B", size: "940 MB", size_bytes: 940000000, specialty: "reasoning", role: "analyst", strengths: ["multilingual", "logical reasoning", "structured output"], context_window: 8192, temperature: 0.4, tier: "small", available: false },
  { tag: "smollm2:1.7b", name: "SmolLM2 1.7B", size: "1.0 GB", size_bytes: 1000000000, specialty: "general", role: "generalist", strengths: ["general purpose", "instruction following", "balanced"], context_window: 4096, temperature: 0.7, tier: "small", available: true },
  { tag: "gemma2:2b", name: "Gemma 2 2B", size: "1.5 GB", size_bytes: 1500000000, specialty: "creative", role: "creative", strengths: ["creative writing", "nuanced understanding", "tone adaptation"], context_window: 8192, temperature: 0.7, tier: "small", available: false },
  { tag: "qwen2.5:3b", name: "Qwen 2.5 3B", size: "1.8 GB", size_bytes: 1800000000, specialty: "complex", role: "thinker", strengths: ["complex tasks", "deep reasoning", "multi-step problems"], context_window: 8192, temperature: 0.4, tier: "medium-small", available: false },
  { tag: "llama3.2:3b", name: "Llama 3.2 3B", size: "2.0 GB", size_bytes: 2000000000, specialty: "writing", role: "writer", strengths: ["long-form content", "chat", "reasoning", "synthesis"], context_window: 8192, temperature: 0.6, tier: "medium-small", available: true },
  { tag: "phi3.5:3.8b", name: "Phi-3.5 Mini 3.8B", size: "2.2 GB", size_bytes: 2200000000, specialty: "code", role: "engineer", strengths: ["code generation", "technical reasoning", "math"], context_window: 4096, temperature: 0.3, tier: "medium-small", available: false },
  { tag: "qwen2.5-coder:3b", name: "Qwen 2.5 Coder 3B", size: "2.0 GB", size_bytes: 2000000000, specialty: "code", role: "coder", strengths: ["code completion", "refactoring", "multiple languages"], context_window: 8192, temperature: 0.2, tier: "medium-small", available: false },
  { tag: "gemini-3.5-flash", name: "Gemini 3.5 Flash", size: "CLOUD", size_bytes: 0, specialty: "speed", role: "synthesizer", strengths: ["ultra-fast cloud generation", "1M+ context window", "next-gen multimodal speed"], context_window: 1048576, temperature: 0.4, tier: "online", available: true },
  { tag: "gemini-3.5-pro", name: "Gemini 3.5 Pro", size: "CLOUD", size_bytes: 0, specialty: "complex", role: "critic", strengths: ["deep logical reasoning", "complex mathematical proofs", "elite architecture design"], context_window: 2097152, temperature: 0.3, tier: "online", available: true },
  { tag: "gemini-3.0-flash", name: "Gemini 3.0 Flash", size: "CLOUD", size_bytes: 0, specialty: "general", role: "generalist", strengths: ["high-speed standard model", "multilingual reasoning", "balanced general tasks"], context_window: 1048576, temperature: 0.5, tier: "online", available: true }
];

function getStoredTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Simulated specialist outputs depending on the prompt
function getMockSpecialistText(prompt: string, modelName: string, role: string): string {
  const isCode = prompt.toLowerCase().includes('code') || prompt.toLowerCase().includes('write a') || prompt.toLowerCase().includes('function') || prompt.toLowerCase().includes('program');
  
  if (isCode) {
    return `// Specialist response from ${modelName} (${role.toUpperCase()})
export function quickBubbleSort(arr: number[]): number[] {
  const len = arr.length;
  let swapped: boolean;
  
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        // Swap elements in memory enclaves
        const temp = arr[i];
        arr[i] = arr[i + 1];
        arr[i + 1] = temp;
        swapped = true;
      }
    }
  } while (swapped);
  
  return arr;
}`;
  }

  return `### Strategic Domain Analysis by ${modelName}
To optimize secure computing boundaries, we must enforce isolated memory domains.
This isolates the sandbox context, protecting the derived keys from standard kernel snooping vectors.`;
}

// Simulated final synthesis text
function getMockSynthesisText(prompt: string): string {
  const isCode = prompt.toLowerCase().includes('code') || prompt.toLowerCase().includes('write a') || prompt.toLowerCase().includes('function') || prompt.toLowerCase().includes('program');
  
  if (isCode) {
    return `# Synthesized Solution
The specialists reached consensus. **Gemini 3.5 Pro** has been selected as the structural foundation.

\`\`\`typescript
/**
 * Optimized Bubble Sort implementation with strong typescript typings.
 * Complexity: O(n^2) average, O(n) best-case.
 */
export function bubbleSort(arr: number[]): number[] {
  const len = arr.length;
  if (len <= 1) return arr;
  
  let swapped: boolean;
  for (let i = 0; i < len; i++) {
    swapped = false;
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Performing optimal in-place swapping
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    // If no elements were swapped, array is fully sorted
    if (!swapped) break;
  }
  
  return arr;
}
\`\`\`

### Verification Features Added
- **O(n) Best Case Safeguard**: A break flag prevents unnecessary iterations if sorted early.
- **Flawless Type Safety**: Correctly types arrays and sets base boundaries.`;
  }

  return `# Synthesized Assessment
By reviewing outputs from Llama 3.2, Qwen Coder, and Gemini 3.5, the Synthesizer model generated this master strategy:

1. **Local Enclaves**: Always run GGUF weights locally on the CPU (using Candle) or GPU (via local Ollama accelerators) to ensure data confidentiality.
2. **Cloud Tunnel**: Use high-speed **Gemini 3.5 Flash** for quick non-critical tasks.
3. **Consensus Voting**: Rigorous score audits verify logical consistency, preventing neural net hallucinations.`;
}

async function browserMockInvoke<T>(cmd: string, args: Record<string, unknown>): Promise<T> {
  const tasks = getStoredTasks();

  switch (cmd) {
    case 'create_task': {
      const prompt = args.prompt as string;
      const models = (args.models as string[]) || [];
      const mode = (args.mode as string) || 'collaborative';
      const taskId = crypto.randomUUID();
      const now = new Date().toISOString();

      const newTask: Task = {
        id: taskId,
        prompt,
        models,
        mode,
        status: 'queued',
        created_at: now,
        updated_at: now,
        logs: [
          { type: 'system', message: 'Directive received. Registering secure task enclave...', timestamp: now }
        ],
        subtasks: [],
        results: [],
        final_result: null,
        consensus: null,
        error: null,
        metrics: { models_used: models.length || 3, iterations: 0, tokens_used: 0, duration_ms: 0 }
      };

      tasks.unshift(newTask);
      saveTasks(tasks);

      // SPAWN AN ASYNC TIMER TO MOCK THE AGENTS TRANSITIONS
      setTimeout(async () => {
        const stored = getStoredTasks();
        const t = stored.find(x => x.id === taskId);
        if (!t) return;

        const activeModels = models.length > 0 ? models : ['gemini-3.5-flash', 'llama3.2:3b', 'smollm2:1.7b'];

        // 1. Decomposing (Architect)
        t.status = 'decomposing';
        t.logs.push({ type: 'architect', message: 'Architect analyzing prompt and decomposing task...', timestamp: new Date().toISOString() });
        t.subtasks = [
          { id: 1, description: 'Deconstruct structural logic requirements and dependencies.', type: 'analysis', priority: 'high', depends_on: [] },
          { id: 2, description: `Execute core implementations matching directive: "${prompt.slice(0, 40)}..."`, type: 'code', priority: 'high', depends_on: [1] },
          { id: 3, description: 'Write validation checks and review potential syntax loopholes.', type: 'code', priority: 'medium', depends_on: [2] }
        ];
        saveTasks(stored);

        await new Promise(r => setTimeout(r, 2000));

        // 2. Executing (Specialists)
        t.status = 'executing';
        t.logs.push({ type: 'specialist', message: `Specialist models (${activeModels.join(', ')}) starting subtasks...`, timestamp: new Date().toISOString() });
        saveTasks(stored);

        await new Promise(r => setTimeout(r, 2500));

        const specResults: ModelResult[] = activeModels.map(tag => {
          const name = defaultModels.find(m => m.tag === tag)?.name || tag;
          const role = defaultModels.find(m => m.tag === tag)?.role || 'specialist';
          return {
            model: name,
            model_tag: tag,
            content: getMockSpecialistText(prompt, name, role),
            score: 0.0,
            tokens: Math.round(180 + Math.random() * 90),
            role_type: 'code'
          };
        });

        t.results = specResults;
        t.logs.push({ type: 'specialist', message: `All ${specResults.length} specialists completed their generation turns.`, timestamp: new Date().toISOString() });
        saveTasks(stored);

        await new Promise(r => setTimeout(r, 1800));

        // 3. Voting (Consensus)
        t.status = 'voting';
        t.logs.push({ type: 'consensus', message: 'Consensus voting on the best response structure...', timestamp: new Date().toISOString() });
        saveTasks(stored);

        await new Promise(r => setTimeout(r, 1500));

        const rankings: Ranking[] = specResults.map((r, i) => ({
          model: r.model,
          score: i === 0 ? 96.0 : i === 1 ? 88.0 : 82.0,
          reason: i === 0 
            ? 'Excellent, robust modular structures adhering strictly to formatting standards.' 
            : 'Good logic, but lacks custom type constraints.'
        }));

        const consensus: ConsensusResult = {
          rankings,
          best: specResults[0].model,
          consensus_score: 94.0,
          summary: `The models selected ${specResults[0].model} as the optimal source structure due to higher coverage of error safety wrappers.`
        };

        t.consensus = consensus;
        t.logs.push({ type: 'consensus', message: `Consensus voting reached decision. Winner: ${consensus.best}. Score: ${consensus.consensus_score}%.`, timestamp: new Date().toISOString() });
        saveTasks(stored);

        await new Promise(r => setTimeout(r, 1500));

        // 4. Synthesizing (Synthesizer)
        t.status = 'synthesizing';
        t.logs.push({ type: 'synthesizer', message: 'Synthesizer combining strengths and compiling final coherence report...', timestamp: new Date().toISOString() });
        saveTasks(stored);

        await new Promise(r => setTimeout(r, 2000));

        const finalContent = getMockSynthesisText(prompt);

        // 5. Reviewing (Critic)
        t.status = 'reviewing';
        t.logs.push({ type: 'critic', message: 'Critic model performing strict mathematical validation checks...', timestamp: new Date().toISOString() });
        saveTasks(stored);

        await new Promise(r => setTimeout(r, 1200));

        const finalResult: FinalResult = {
          content: finalContent,
          quality_score: 0.94,
          consensus,
          all_results: specResults
        };

        t.final_result = finalResult;
        t.status = 'completed';
        t.logs.push({ type: 'system', message: 'Directive completely solved. Secure outputs unlocked.', timestamp: new Date().toISOString() });
        
        t.metrics = {
          models_used: activeModels.length,
          iterations: 3,
          tokens_used: specResults.reduce((acc, r) => acc + r.tokens, 0) + 380,
          duration_ms: 11000
        };
        
        saveTasks(stored);
      }, 500);

      return { taskId, status: 'queued' } as unknown as T;
    }

    case 'list_tasks': {
      const summaries: TaskSummary[] = tasks.map(t => ({
        id: t.id,
        prompt: t.prompt.length > 120 ? `${t.prompt.slice(0, 120)}...` : t.prompt,
        status: t.status,
        models: t.models,
        created_at: t.created_at,
        metrics: t.metrics
      }));
      return { tasks: summaries } as unknown as T;
    }

    case 'get_task': {
      const id = args.id as string;
      const t = tasks.find(x => x.id === id);
      return { task: t } as unknown as T;
    }

    case 'delete_task': {
      const id = args.id as string;
      const filtered = tasks.filter(x => x.id !== id);
      saveTasks(filtered);
      return { ok: true } as unknown as T;
    }

    case 'wipe_all_data': {
      localStorage.removeItem(STORAGE_KEY);
      return { ok: true, message: 'All secure storage cleared' } as unknown as T;
    }

    case 'get_models': {
      // Look if there are any pulled models in localStorage
      const pulled = JSON.parse(localStorage.getItem('pulled_models') || '[]');
      const available = defaultModels.map(m => {
        if (m.tier === 'online' || pulled.includes(m.tag) || m.tag === 'smollm2:1.7b' || m.tag === 'llama3.2:3b') {
          return { ...m, available: true };
        }
        return m;
      });

      return {
        available: available.filter(m => m.available),
        all: available
      } as unknown as T;
    }

    case 'pull_model': {
      const tag = args.model as string;
      const pulled = JSON.parse(localStorage.getItem('pulled_models') || '[]');
      if (!pulled.includes(tag)) {
        pulled.push(tag);
        localStorage.setItem('pulled_models', JSON.stringify(pulled));
      }
      return { ok: true, model: tag } as unknown as T;
    }

    case 'ollama_status': {
      return {
        running: true,
        models_available: 3,
        url: 'http://localhost:11434'
      } as unknown as T;
    }

    case 'get_stats': {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const running = tasks.filter(t => ['decomposing', 'executing', 'voting', 'synthesizing', 'reviewing'].includes(t.status)).length;
      const failed = tasks.filter(t => t.status === 'failed').length;

      const stats: Stats = {
        total,
        completed,
        running,
        failed,
        avg_duration_ms: 11000
      };
      return { stats } as unknown as T;
    }

    case 'get_security_info': {
      const info: SecurityInfo = {
        encryption: 'AES-256-GCM + ChaCha20-Poly1305',
        keyDerivation: 'Argon2id',
        dataLocation: 'secure_local_storage',
        secureMemory: true,
        autoWipe: true,
        sandboxed: true
      };
      return info as unknown as T;
    }

    default:
      throw new Error(`Unknown Tauri IPC call command: ${cmd}`);
  }
}

// ----------------------------------------------------
// NATIVE TAURI RPC WRAPPERS
// ----------------------------------------------------

export async function createTask(prompt: string, models: string[], mode: string) {
  return tauriInvoke<{ taskId: string; status: string }>('create_task', { prompt, models, mode });
}

export async function listTasks() {
  return tauriInvoke<{ tasks: TaskSummary[] }>('list_tasks');
}

export async function getTask(id: string) {
  return tauriInvoke<{ task: Task }>('get_task', { id });
}

export async function deleteTask(id: string) {
  return tauriInvoke<{ ok: boolean }>('delete_task', { id });
}

export async function wipeAllData() {
  return tauriInvoke<{ ok: boolean; message: string }>('wipe_all_data');
}

export async function getModels() {
  return tauriInvoke<{ available: ModelProfile[]; all: ModelProfile[] }>('get_models');
}

export async function pullModel(model: string) {
  return tauriInvoke<{ ok: boolean; model: string }>('pull_model', { model });
}

export async function ollamaStatus() {
  return tauriInvoke<OllamaStatus>('ollama_status');
}

interface OllamaStatus {
  running: boolean;
  models_available: number;
  url: string;
}

export async function getStats() {
  return tauriInvoke<{ stats: Stats }>('get_stats');
}

export async function getSecurityInfo() {
  return tauriInvoke<SecurityInfo>('get_security_info');
}
