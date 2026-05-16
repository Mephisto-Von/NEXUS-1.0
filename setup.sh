#!/bin/bash
# NEXUS 1.0 v3.0 — Setup Script
# Tech Stack: Tauri 2.0 + Rust + Candle + React 18 + TypeScript + styled-components + Vite + GGUF

set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║  NEXUS 1.0 v3.0 — Agentic AI Platform Setup           ║"
echo "║  Tauri 2.0 | Rust + Candle | React 18 + TS | Vite   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo "✓ Node.js $(node -v)"
    else
        echo "✗ Node.js 18+ required (found $(node -v))"
        exit 1
    fi
else
    echo "✗ Node.js not found. Install from https://nodejs.org"
    exit 1
fi

# Check Rust
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version | awk '{print $2}')
    echo "✓ Rust $RUST_VERSION"
else
    echo "→ Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
    echo "✓ Rust $(rustc --version | awk '{print $2}')"
fi

# Check Tauri CLI
if cargo tauri --version &> /dev/null; then
    echo "✓ Tauri CLI $(cargo tauri --version)"
else
    echo "→ Installing Tauri CLI..."
    cargo install tauri-cli --version "^2"
    echo "✓ Tauri CLI installed"
fi

# Install npm dependencies
echo "→ Installing npm dependencies..."
npm install
echo "✓ npm dependencies installed"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Setup complete!                                    ║"
echo "║                                                     ║"
echo "║  Desktop:  npm run tauri:dev                        ║"
echo "║  Browser:  npm run dev                              ║"
echo "║  Build:    npm run tauri:build                      ║"
echo "║  Android:  npm run tauri:android                    ║"
echo "║                                                     ║"
echo "║  Models download automatically from HuggingFace     ║"
echo "║  as GGUF quantized files on first use.              ║"
echo "╚══════════════════════════════════════════════════════╝"
