import styled from 'styled-components';
import type { SecurityInfo } from '@/types';

const FooterEl = styled.footer`
  padding: 24px var(--pad);
  background: #050610;
`;

const Bar = styled.div`
  max-width: var(--maxw); margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
  gap: 18px; flex-wrap: wrap;
`;

const Left = styled.span`
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.24em;
  color: var(--bone-darker); text-transform: uppercase;
`;

const Log = styled.span`
  font-family: var(--terminal); font-size: 14px; color: var(--neon-cyan);
  letter-spacing: 0.05em;
`;

const Actions = styled.div`
  display: flex; gap: 12px;
`;

const WipeBtn = styled.button`
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
  color: var(--neon-red); padding: 4px 10px;
  border: 1px solid var(--neon-red);
  transition: all 0.2s;
  &:hover { background: rgba(255,46,77,0.1); }
`;

interface Props {
  ollamaRunning: boolean;
  ollamaCount: number;
  securityInfo: SecurityInfo | null;
  onWipe: () => void;
}

export function Footer({ ollamaRunning, ollamaCount, securityInfo, onWipe }: Props) {
  const now = new Date().toTimeString().slice(0, 8);
  const status = ollamaRunning
    ? `[${now}] ${ollamaCount} model(s) ready`
    : `[${now}] Ollama not detected`;

  return (
    <FooterEl>
      <Bar>
        <Left>NEXUS 1.0 v3.0 // CANDLE GGUF LOCAL INFERENCE</Left>
        <Log>{status}</Log>
        <Actions>
          {securityInfo && (
            <Left style={{ color: 'var(--neon-green)' }}>
              {securityInfo.encryption}
            </Left>
          )}
          <WipeBtn onClick={onWipe}>SECURE WIPE</WipeBtn>
        </Actions>
      </Bar>
    </FooterEl>
  );
}
