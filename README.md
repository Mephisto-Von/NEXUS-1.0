opencode -s ses_1d258c9e1ffecvkSmXbihPL0a9
<div align="center">

<img src="https://img.shields.io/badge/Tauri-2.0-FFC131?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri 2.0" />
<img src="https://img.shields.io/badge/Rust-1.77+-CE422B?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Candle-GGUF-FF6B35?style=for-the-badge" alt="Candle GGUF" />
<img src="https://img.shields.io/badge/AES--256--GCM-Encrypted-00FF88?style=for-the-badge" alt="Encrypted" />

# NEXUS 1.0

**Agentic AI Platform — Secure, Local, Multi-Model Collaboration**

*20+ GGUF models. 5 autonomous agents. Zero data leaves your machine.*

[**Download for Android**](https://github.com/Razee4315/NEXUS.7/releases) · [**Download for Windows**](https://github.com/Razee4315/NEXUS.7/releases) · [**Build from Source**](#build-from-source)

</div>

---

## What Is NEXUS 1.0?

NEXUS 1.0 is a **fully local agentic AI platform** that runs entirely on your device. No cloud APIs, no API keys, no data leaving your machine. You assign a task — code, writing, analysis, research, creative work — and multiple AI models collaborate autonomously to produce the best possible result.

Instead of relying on one large model, NEXUS 1.0 uses **multiple small specialized models** that work together through a structured agent pipeline. The combined output quality matches or exceeds what a single large model produces — at zero cost and complete privacy.

### Key Features

- **Multi-Agent Collaboration** — 5 specialized agents (Architect, Specialist, Critic, Consensus, Synthesizer) work together autonomously
- **20+ Local Models** — GGUF quantized models from 380 MB to 5.5 GB, auto-downloaded from HuggingFace
- **Zero Data Exfiltration** — All inference, storage, and processing happens on your device
- **Military-Grade Encryption** — AES-256-GCM + ChaCha20-Poly1305 for data at rest, Argon2id for key derivation
- **Cross-Platform** — Desktop (Windows, macOS, Linux), Android, and browser fallback
- **No API Keys Required** — Completely free, no subscriptions, no rate limits
- **Secure Wipe** — Multi-pass overwrite destruction of all data on demand

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Tauri 2.0](https://v2.tauri.app/) — Native desktop apps with web frontend |
| **Backend** | [Rust](https://www.rust-lang.org/) — Memory-safe, zero-copy, async |
| **Inference** | [Candle](https://github.com/huggingface/candle) — HuggingFace's ML framework for Rust |
| **Models** | [GGUF](https://github.com/ggerganov/ggml/blob/master/docs/gguf.md) — Quantized models (Q4_K_M) |
| **Frontend** | [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [styled-components](https://styled-components.com/) — CSS-in-JS |
| **Build** | [Vite 6](https://vitejs.dev/) — Fast HMR, optimized production builds |
| **Encryption** | [aes-gcm](https://crates.io/crates/aes-gcm), [chacha20poly1305](https://crates.io/crates/chacha20poly1305), [argon2](https://crates.io/crates/argon2) |

---

## Security Architecture

**Your data never leaves your device.** Every layer is designed for maximum privacy:

| Layer | Technology | Purpose |
|---|---|---|
| **Encryption at rest** | AES-256-GCM + ChaCha20-Poly1305 | All task data encrypted on disk with authenticated encryption |
| **Key derivation** | Argon2id (64MB memory, 3 iterations) | Master key derived from device-specific passphrase — resistant to GPU/ASIC attacks |
| **Secure memory** | `zeroize` + `secrecy` crates | Sensitive data (keys, prompts, outputs) wiped from RAM immediately after use |
| **Sandboxing** | Tauri webview isolation + CSP | Frontend cannot access filesystem, network, or system APIs directly |
| **Secure wipe** | Multi-pass random overwrite + delete | Irrecoverable data destruction — files overwritten with random bytes before deletion |
| **Hash integrity** | SHA-256 with keyed HMAC | Tamper detection for all stored data — any modification is detected |
| **CSP headers** | Strict Content Security Policy | No external scripts, no inline eval, no data exfiltration vectors |
| **Local inference** | Candle + GGUF | All model inference runs locally on CPU — zero network calls for AI |
| **Android hardening** | Backup disabled, ProGuard obfuscation | No cloud backup, no data extraction, code obfuscated in release builds |

### Data Flow

```
┌─────────────┐    ┌────────────────┐    ┌───────────────────┐    ┌──────────────────┐    ┌───────────────┐
│  User Input  │───▶│ Encrypted Store│───▶│ Rust Backend +   │───▶│ Candle GGUF      │───▶│ Secure Display│
│             │    │ (AES-256-GCM)  │    │ Candle Inference  │    │ Local CPU Only   │    │ (Encrypted)   │
└─────────────┘    └────────────────┘    └───────────────────┘    └──────────────────┘    └───────────────┘
        ▲                                                                                         │
        └────────────────────────────── Never leaves device ──────────────────────────────────────┘
```

---

## How It Works

NEXUS 1.0 uses a **5-agent pipeline** where each agent has a specialized role. Models are assigned based on task type for optimal quality:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER ASSIGNS TASK                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1. ARCHITECT (Qwen 1.5B GGUF)                                      │
│     • Decomposes complex tasks into subtasks                        │
│     • Identifies dependencies and priorities                        │
│     • Determines task type (code, writing, analysis, creative)      │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. SPECIALIST (All available models — parallel execution)           │
│     • Each model executes every subtask independently               │
│     • Task-specific system prompts per role                         │
│     • Temperature tuned per model specialty                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. CRITIC (Qwen 3B GGUF)                                           │
│     • Scores every output 0.0–1.0                                   │
│     • Identifies strengths, weaknesses, improvements                │
│     • Triggers automatic retry if score below threshold             │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. CONSENSUS (Qwen 1.5B GGUF)                                      │
│     • Ranks all model outputs                                       │
│     • Votes on the best result per subtask                          │
│     • Produces consensus score and reasoning                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. SYNTHESIZER (Llama 3.2 3B GGUF)                                 │
│     • Combines strongest elements from all outputs                  │
│     • Resolves contradictions between models                        │
│     • Produces final coherent result                                │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  FINAL QUALITY CHECK (Critic re-scores synthesized output)          │
│  → Delivered to user with quality score and model breakdown         │
└─────────────────────────────────────────────────────────────────────┘
```

### Collaboration Modes

| Mode | Behavior | Best For |
|---|---|---|
| **Collaborative** (default) | All models work together, critic iterates, synthesizer combines | Complex tasks requiring multiple perspectives |
| **Competitive** | Models work independently, consensus picks the winner | Tasks where you want the single best answer |
| **Sequential** | Models build on each other's output in a chain | Tasks that benefit from iterative refinement |

### Auto Model Routing

NEXUS 1.0 automatically selects the best models based on task type:

| Task Type | Primary Model | Backup Models |
|---|---|---|
| **Code** | Phi-3.5 Mini 3.8B | Qwen Coder 3B, Qwen 3B |
| **Writing** | Llama 3.2 3B | Gemma 2 2B, Qwen 1.5B |
| **Analysis** | Qwen 2.5 3B | Qwen 1.5B, Llama 3.2 3B |
| **Creative** | Gemma 2 2B | Llama 3.2 3B, SmolLM2 1.7B |
| **Math** | Qwen 2.5 3B | Phi-3.5 Mini, Qwen 1.5B |
| **General** | SmolLM2 1.7B | Llama 3.2 1B, Qwen 1.5B |

---

## Model Arsenal (20 GGUF Models)

All models are **Q4_K_M quantized** GGUF files downloaded automatically from HuggingFace on first use. Models are cached locally and never re-downloaded.

### Tier 1: Micro (< 1B) — Ultra-Fast
| Model | Size | Role | Best For |
|---|---|---|---|
| **Qwen 2.5 0.5B** | 380 MB | Scanner | Instant responses, basic Q&A, simple classification |
| **Llama 3.2 1B** | 700 MB | Communicator | Quick tasks, conversation, summarization |

### Tier 2: Small (1-2B) — Balanced
| Model | Size | Role | Best For |
|---|---|---|---|
| **Qwen 2.5 1.5B** | 940 MB | Analyst | Multilingual, logical reasoning, structured output |
| **SmolLM2 1.7B** | 1.0 GB | Generalist | Instruction following, balanced performance, safe defaults |
| **Gemma 2 2B** | 1.5 GB | Creative | Creative writing, nuanced understanding, tone adaptation |

### Tier 3: Medium-Small (2-4B) — Strong
| Model | Size | Role | Best For |
|---|---|---|---|
| **Qwen 2.5 3B** | 1.8 GB | Thinker | Complex reasoning, multi-step problems, critic reviews |
| **Llama 3.2 3B** | 2.0 GB | Writer | Long-form content, chat, synthesis |
| **Phi-3.5 Mini 3.8B** | 2.2 GB | Engineer | Code generation, technical reasoning, math |
| **Qwen 2.5 Coder 3B** | 2.0 GB | Coder | Code completion, refactoring, multiple languages |

### Tier 4: Medium (7-9B) — Near GPT-3.5 Quality
| Model | Size | Role | Best For |
|---|---|---|---|
| **Llama 3.2 8B** | 4.9 GB | Specialist | Strong reasoning, complex analysis, reliable output |
| **Qwen 2.5 7B** | 4.4 GB | Polyglot | 29 languages, strong reasoning, math, code |
| **Mistral 7B** | 4.1 GB | Efficient | Efficient inference, strong performance, balanced |
| **Gemma 2 9B** | 5.5 GB | Quality | High-quality nuanced output, creative tasks, safety |

### Tier 5: Specialized
| Model | Size | Role | Best For |
|---|---|---|---|
| **DeepSeek Coder 1.3B** | 800 MB | Code Scanner | Fast code review, syntax check, 80+ languages |
| **Dolphin Mistral 7B** | 4.1 GB | Researcher | Uncensored research, complex analysis, no refusals |
| **WizardLM 2 7B** | 4.4 GB | Instructor | Complex instructions, multi-step tasks, precision |
| **OpenHermes 7B** | 4.1 GB | Reasoner | Chain of thought, logical deduction, math proofs |

### RAM Requirements

| Configuration | Models | Approx RAM | Use Case |
|---|---|---|---|
| **Minimum** | Qwen 1.5B + Qwen 3B + Llama 3B | ~6 GB | Basic task collaboration |
| **Recommended** | + SmolLM2 + Phi-3.5 + Gemma 2B | ~12 GB | Full agent pipeline |
| **Maximum** | All 20 models | ~40 GB | Every model available for routing |

---

## Installation

### Android

1. **Download** the `.apk` from [Releases](https://github.com/Razee4315/NEXUS.7/releases)
2. **Enable** "Install unknown apps" in your Android settings (Settings → Security → Unknown sources)
3. **Tap** the downloaded APK to install
4. **Open** NEXUS 1.0, tap a model card to download it, and you're set

> **Note:** Android requires API 24+ (Android 7.0). First model download requires internet (~1-5 GB). All subsequent inference is offline.

### Windows

1. **Download** the `.msi` (recommended) or `.exe` from [Releases](https://github.com/Razee4315/NEXUS.7/releases)
2. **Run** the installer — follow the setup wizard
3. **Launch** NEXUS 1.0 from your Start menu or desktop shortcut
4. **Download** a model from the Model Arsenal section, and you're set

> **Note:** Windows 10+ required. The `.msi` provides proper uninstall support. Models are stored in `%LOCALAPPDATA%\nexus1\models\`.

### macOS

1. **Download** the `.dmg` from [Releases](https://github.com/Razee4315/NEXUS.7/releases)
2. **Open** the DMG and drag NEXUS 1.0 to Applications
3. **First launch:** Right-click → Open (Gatekeeper workaround for unsigned app)
4. **Download** a model and you're set

> **Note:** macOS 12+ (Monterey) required. Apple Silicon (M1/M2/M3) runs inference faster via Metal acceleration. Models stored in `~/Library/Caches/nexus1/models/`.

### Linux

1. **Download** the `.AppImage` or `.deb` from [Releases](https://github.com/Razee4315/NEXUS.7/releases)
2. **For AppImage:** `chmod +x NEXUS 1.0.AppImage && ./NEXUS 1.0.AppImage`
3. **For .deb:** `sudo dpkg -i nexus1_3.0.0_amd64.deb`
4. **Download** a model and you're set

> **Note:** Requires glibc 2.31+. Models stored in `~/.cache/nexus1/models/`.

---

## Build from Source

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Frontend build (Vite, React, TypeScript) |
| [Rust](https://rustup.rs/) | 1.77+ | Backend compilation (Cargo, Tauri) |
| [Tauri CLI](https://v2.tauri.app/start/) | v2 | Desktop app bundling |
| [Android SDK + NDK](https://developer.android.com/studio) | SDK 34, NDK 27 | Android builds (optional) |

### 1. Install System Dependencies

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Install Tauri CLI
cargo install tauri-cli --version "^2"

# Verify
rustc --version    # Should be 1.77+
cargo tauri --version
```

### 2. Clone & Install

```bash
git clone https://github.com/Razee4315/NEXUS.7.git
cd NEXUS 1.0
npm install
```

### 3. Run

```bash
# Desktop app with hot reload (recommended)
npm run tauri:dev

# Browser-only mode (no native features)
npm run dev

# Production build
npm run tauri:build
```

### 4. Android Build

```bash
# Install Android SDK components
sdkmanager "platforms;android-34" "ndk;27.0.12077973" "build-tools;34.0.0"

# Set environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export NDK_HOME=$ANDROID_HOME/ndk/27.0.12077973

# Build
npm run tauri:android          # Development
npm run tauri:android:build    # Release APK
```

### One-Command Setup

```bash
chmod +x setup.sh && ./setup.sh
```

This script checks all prerequisites, installs missing dependencies, and sets up the project.

---

## Usage

### Assigning a Task

1. Open NEXUS 1.0
2. Type your task in the terminal input (e.g., "Write a Python function to sort a list using merge sort")
3. Optionally select specific models or leave on **AUTO-ROUTE**
4. Choose a mode: **Collaborative**, **Competitive**, or **Sequential**
5. Click **DEPLOY AGENTS** (or press Ctrl+Enter)

### Watching Agent Activity

The **Agent Activity** feed shows real-time progress:
- **ARCHITECT** decomposing the task
- **SPECIALIST** executing across models
- **CRITIC** scoring and reviewing
- **CONSENSUS** voting on best outputs
- **SYNTHESIZER** combining results

### Viewing Results

Completed tasks appear in the **Results** section with:
- Final synthesized output
- Quality score (0-100%)
- Per-model scores and rankings
- Token usage and duration

### Managing Models

The **Model Arsenal** section shows all 20 models:
- **Green border** = model downloaded and ready
- **Gray border** = model not yet downloaded
- Click **PULL MODEL** to download (requires internet)

### Secure Wipe

Click **SECURE WIPE** in the footer to permanently delete all task data, encrypted files, and keys. This action is **irreversible**.

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_URL` | `http://localhost:11434` | Legacy — no longer used (Candle runs locally) |
| `PORT` | `5173` | Vite dev server port |
| `RUST_LOG` | `info` | Rust log level (`debug`, `info`, `warn`, `error`) |

### Model Cache Location

| Platform | Path |
|---|---|
| **Linux** | `~/.cache/nexus1/models/` |
| **macOS** | `~/Library/Caches/nexus1/models/` |
| **Windows** | `%LOCALAPPDATA%\nexus1\models\` |
| **Android** | `/data/data/com.nexus1.app/cache/models/` |

### Encrypted Data Location

| Platform | Path |
|---|---|
| **Linux** | `~/.local/share/nexus1/` |
| **macOS** | `~/Library/Application Support/nexus1/` |
| **Windows** | `%APPDATA%\nexus1\` |
| **Android** | `/data/data/com.nexus1.app/files/` |

---

## API (Tauri Commands)

All communication between the React frontend and Rust backend happens through typed Tauri IPC commands:

| Command | Parameters | Returns | Description |
|---|---|---|---|
| `create_task` | `prompt`, `models?`, `mode?` | `{ taskId, status }` | Create and start a new task |
| `list_tasks` | — | `{ tasks: [...] }` | List all tasks (summaries) |
| `get_task` | `id` | `{ task: {...} }` | Get full task details |
| `delete_task` | `id` | `{ ok: true }` | Delete a task |
| `wipe_all_data` | — | `{ ok: true }` | Securely wipe all data |
| `get_models` | — | `{ available, all }` | List model profiles and availability |
| `pull_model` | `model` | `{ ok: true }` | Download a GGUF model |
| `ollama_status` | — | `{ running, models_available, device }` | Check inference engine status |
| `get_stats` | — | `{ stats: {...} }` | Platform statistics |
| `get_security_info` | — | `{ encryption, keyDerivation, ... }` | Security configuration details |

### TypeScript Usage

```typescript
import { createTask, listTasks, getModels } from '@/utils/tauri';

// Create a task
const { taskId } = await createTask(
  "Write a REST API in Express.js",
  ["phi3.5:3.8b", "qwen2.5-coder:3b"],
  "collaborative"
);

// List all tasks
const { tasks } = await listTasks();

// Get available models
const { available, all } = await getModels();
```

---

## Project Structure

```
NEXUS 1.0/
├── src-tauri/                          # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs                     # Binary entry point
│   │   ├── lib.rs                      # Tauri app setup + IPC commands
│   │   ├── security/
│   │   │   └── mod.rs                  # AES-256-GCM, ChaCha20, Argon2id, secure wipe
│   │   ├── models/
│   │   │   └── mod.rs                  # 20-model GGUF registry, Candle inference engine
│   │   ├── agents/
│   │   │   └── mod.rs                  # Multi-agent orchestration pipeline
│   │   └── store/
│   │       └── mod.rs                  # Encrypted task storage (in-memory + serialized)
│   ├── capabilities/
│   │   └── default.json                # Tauri permission policies
│   ├── android/                        # Android build configuration
│   │   ├── app/build.gradle
│   │   ├── app/proguard-rules.pro
│   │   └── app/src/main/AndroidManifest.xml
│   ├── tauri.conf.json                 # App configuration (window, CSP, bundle)
│   ├── Cargo.toml                      # Rust dependencies
│   └── build.rs                        # Tauri build script
│
├── src/                                # React frontend
│   ├── components/
│   │   ├── App.tsx                     # Main app component + state management
│   │   ├── BootSequence.tsx            # Animated boot screen
│   │   ├── Cursor.tsx                  # Custom animated cursor
│   │   ├── Nav.tsx                     # Top navigation bar
│   │   ├── Terminal.tsx                # Task input terminal
│   │   ├── ModelCards.tsx              # Model arsenal grid
│   │   ├── ActivityFeed.tsx            # Live agent activity feed
│   │   ├── TaskList.tsx                # Task queue with status
│   │   ├── ResultViewer.tsx            # Result display
│   │   ├── StatsBar.tsx                # Platform statistics
│   │   └── Footer.tsx                  # Footer with security info + wipe
│   ├── styles/
│   │   └── GlobalStyles.ts             # Global styled-components theme
│   ├── types/
│   │   └── index.ts                    # TypeScript type definitions
│   ├── utils/
│   │   └── tauri.ts                    # Tauri IPC wrapper functions
│   ├── main.tsx                        # React entry point
│   └── App.tsx                         # Root component
│
├── index.html                          # Vite HTML entry
├── vite.config.ts                      # Vite configuration
├── tsconfig.json                       # TypeScript configuration
├── tsconfig.node.json                  # TypeScript node config
├── package.json                        # Node.js dependencies
├── setup.sh                            # One-command setup script
├── LICENSE                             # MIT License
└── README.md                           # This file
```

---

## Development

### Running the Dev Server

```bash
npm run dev              # Vite dev server (browser only)
npm run tauri:dev        # Full Tauri desktop app with hot reload
```

### Building for Production

```bash
npm run build            # Vite production build (dist/)
npm run tauri:build      # Native app bundle (.msi, .dmg, .AppImage, .deb)
```

### TypeScript Check

```bash
npx tsc --noEmit         # Type check without emitting
```

### Rust Check

```bash
cd src-tauri && cargo check    # Compile check
cd src-tauri && cargo clippy   # Lint check
```

### Code Style

- **Rust:** Follow `rustfmt` defaults. Run `cargo fmt` before committing.
- **TypeScript:** Strict mode enabled. No `any` types.
- **React:** Functional components only. Hooks for state.

---

## Troubleshooting

### "No models available"

Models download automatically from HuggingFace on first use. Ensure you have an internet connection. Check the Model Arsenal section for pull buttons.

### Build fails on Rust

Ensure Rust 1.77+:
```bash
rustup update stable
```

### Android build fails

Ensure SDK and NDK are installed:
```bash
sdkmanager "platforms;android-34" "ndk;27.0.12077973"
```

### App crashes on launch

Check logs:
```bash
# Linux/macOS
RUST_LOG=debug npm run tauri:dev

# Windows (PowerShell)
$env:RUST_LOG="debug"; npm run tauri:dev
```

### Model download stuck

Models are 1-5 GB each. Check your internet connection. Models are cached — interrupted downloads resume on retry.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- All new features must maintain the **zero data exfiltration** guarantee
- Rust code must pass `cargo clippy` with no warnings
- TypeScript must compile with `strict: true` and no `any` types
- Security-critical code requires review before merge

---

## License

[MIT License](LICENSE) — Free for personal and commercial use.

---

## Credits

- **[Tauri](https://tauri.app/)** — Native app framework
- **[Candle](https://github.com/huggingface/candle)** — HuggingFace's ML framework for Rust
- **[GGML/GGUF](https://github.com/ggerganov/ggml)** — Quantized model format
- **[HuggingFace](https://huggingface.co/)** — Model hosting
- **Model Authors** — Qwen, Llama, Gemma, Mistral, Phi, SmolLM, DeepSeek, Dolphin, WizardLM, OpenHermes

---

<div align="center">

**All data stays on your machine. No telemetry. No cloud. No API keys. No exceptions.**

[**Download for Android**](https://github.com/Razee4315/NEXUS.7/releases) · [**Download for Windows**](https://github.com/Razee4315/NEXUS.7/releases) · [**Build from Source**](#build-from-source)

</div>
