export interface ModelProfile {
  tag: string;
  name: string;
  size: string;
  size_bytes: number;
  specialty: string;
  role: string;
  strengths: string[];
  context_window: number;
  temperature: number;
  tier: string;
  available: boolean;
  path?: string;
}

export interface Subtask {
  id: number;
  description: string;
  type: string;
  priority: string;
  depends_on: number[];
}

export interface ModelResult {
  model: string;
  model_tag: string;
  content: string;
  score: number;
  tokens: number;
  role_type: string;
}

export interface Ranking {
  model: string;
  score: number;
  reason: string;
}

export interface ConsensusResult {
  rankings: Ranking[];
  best: string;
  consensus_score: number;
  summary: string;
}

export interface FinalResult {
  content: string;
  quality_score: number;
  consensus: ConsensusResult | null;
  all_results: ModelResult[];
}

export interface TaskMetrics {
  models_used: number;
  iterations: number;
  tokens_used: number;
  duration_ms: number;
}

export interface TaskLog {
  type: string;
  message: string;
  timestamp: string;
}

export interface Task {
  id: string;
  prompt: string;
  models: string[];
  mode: string;
  status: string;
  created_at: string;
  updated_at: string;
  logs: TaskLog[];
  subtasks: Subtask[];
  results: ModelResult[];
  final_result: FinalResult | null;
  consensus: ConsensusResult | null;
  error: string | null;
  metrics: TaskMetrics;
}

export interface TaskSummary {
  id: string;
  prompt: string;
  status: string;
  models: string[];
  created_at: string;
  metrics: TaskMetrics;
}

export interface Stats {
  total: number;
  completed: number;
  running: number;
  failed: number;
  avg_duration_ms: number;
}

export interface OllamaStatus {
  running: boolean;
  models_available: number;
  url: string;
}

export interface SecurityInfo {
  encryption: string;
  keyDerivation: string;
  dataLocation: string;
  secureMemory: boolean;
  autoWipe: boolean;
  sandboxed: boolean;
}

export type AgentType = 'architect' | 'specialist' | 'critic' | 'synthesizer' | 'consensus' | 'system';
export type TaskMode = 'collaborative' | 'competitive' | 'sequential';
