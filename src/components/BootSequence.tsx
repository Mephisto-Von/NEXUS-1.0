import { useState, useEffect } from 'react';
import styled from 'styled-components';

const BootContainer = styled.div<{ $visible: boolean }>`
  position: fixed; inset: 0; z-index: 300;
  background: var(--void);
  display: grid; place-items: center;
  opacity: ${p => p.$visible ? 1 : 0};
  pointer-events: ${p => p.$visible ? 'auto' : 'none'};
  transition: opacity 0.4s var(--ease);
`;

const BootInner = styled.div`
  width: min(560px, 88vw);
`;

const BootLog = styled.pre`
  font-family: var(--terminal);
  font-size: 18px;
  color: var(--neon-cyan);
  margin: 0 0 18px;
  min-height: 220px;
  white-space: pre-wrap;
`;

const BootBar = styled.div`
  height: 8px;
  background: var(--void-3);
  position: relative;
  overflow: hidden;
`;

const BootBarFill = styled.div<{ $width: number }>`
  position: absolute; left: 0; top: 0; bottom: 0;
  width: ${p => p.$width}%;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-red));
  transition: width 0.15s linear;
`;

const bootLines = [
  '$ NEXUS 1.0 v3.0 // SECURE AGENTIC PLATFORM',
  '$ initializing secure enclave...',
  '$ AES-256-GCM encryption [OK]',
  '$ Argon2id key derivation [OK]',
  '$ Candle GGUF inference engine [OK]',
  '$ loading agent protocols...',
  '$ ARCHITECT ........ online',
  '$ SPECIALIST ....... online',
  '$ CRITIC ........... online',
  '$ SYNTHESIZER ...... online',
  '$ CONSENSUS ........ online',
  '$ Tauri sandbox [ACTIVE]',
  '$ READY.',
];

interface Props {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= bootLines.length) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          onComplete();
        }, 400);
        return;
      }
      setLines(prev => [...prev, bootLines[idx]]);
      setProgress(Math.round(((idx + 1) / bootLines.length) * 99));
      idx++;
    }, 100 + Math.random() * 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <BootContainer $visible={visible}>
      <BootInner>
        <BootLog>{lines.join('\n')}</BootLog>
        <BootBar>
          <BootBarFill $width={progress} />
        </BootBar>
      </BootInner>
    </BootContainer>
  );
}
