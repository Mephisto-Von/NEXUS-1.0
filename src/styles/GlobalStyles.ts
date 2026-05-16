import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --void: #0a0a0f;
    --void-2: #11111a;
    --void-3: #1a1a26;
    --bone: #e8e6dc;
    --bone-dim: #a8a69c;
    --bone-darker: #6a6960;
    --neon-red: #ff2e4d;
    --neon-cyan: #00f0ff;
    --neon-amber: #ffb000;
    --neon-magenta: #7a1fff;
    --neon-green: #00ff88;
    --rule: rgba(232,230,220,0.12);
    --rule-strong: rgba(232,230,220,0.28);
    --display: 'Press Start 2P', 'VT323', monospace;
    --terminal: 'VT323', monospace;
    --mono: 'JetBrains Mono', ui-monospace, monospace;
    --pad: clamp(20px, 4vw, 64px);
    --maxw: 1440px;
    --ease: cubic-bezier(.2,.7,.2,1);
  }

  *, *::before, *::after { box-sizing: border-box; }

  html, body {
    margin: 0;
    padding: 0;
    background: var(--void);
    color: var(--bone);
    font-family: var(--mono);
    font-size: 14px;
    line-height: 1.55;
    overflow-x: hidden;
    cursor: none;
    -webkit-font-smoothing: antialiased;
  }

  body {
    background: radial-gradient(ellipse at 50% 0%, #14131c 0%, var(--void) 60%);
  }

  a { color: inherit; text-decoration: none; }
  button { font: inherit; color: inherit; background: none; border: 0; cursor: none; }
  input, textarea { font: inherit; color: inherit; background: transparent; border: 0; outline: 0; }

  ::selection {
    background: var(--neon-cyan);
    color: var(--void);
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--void); }
  ::-webkit-scrollbar-thumb { background: var(--void-3); }

  @keyframes grainShift {
    0% { transform: translate(0,0) }
    20% { transform: translate(-3%,2%) }
    40% { transform: translate(2%,-1%) }
    60% { transform: translate(-2%,-3%) }
    80% { transform: translate(1%,2%) }
    100% { transform: translate(0,0) }
  }

  @keyframes pulse { 50% { opacity: .25 } }
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes slideIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
  @keyframes glitchFlash {
    0% { opacity: 0.7; transform: translateX(-4px) }
    50% { opacity: 0.3; transform: translateX(4px) }
    100% { opacity: 0; transform: translateX(0) }
  }
`;
