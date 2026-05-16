import { useState } from 'react';
import styled from 'styled-components';
import type { ModelProfile } from '@/types';

const Section = styled.section`
  padding: 140px var(--pad) 80px;
  border-bottom: 1px solid var(--rule);
`;

const Inner = styled.div`
  max-width: 900px; margin: 0 auto;
  border: 1px solid var(--rule-strong);
  background: var(--void-2);
  padding: 32px;
  position: relative;
  &::before, &::after {
    content: ""; position: absolute; width: 20px; height: 20px;
    border: 2px solid var(--neon-red);
  }
  &::before { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
  &::after { bottom: -2px; right: -2px; border-left: 0; border-top: 0; }
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
`;

const Tag = styled.span`
  font-family: var(--terminal); font-size: 16px;
  color: var(--neon-cyan); letter-spacing: 0.1em;
`;

const Clock = styled.span`
  font-family: var(--terminal); font-size: 16px; color: var(--bone-dim);
`;

const TextArea = styled.textarea`
  width: 100%; min-height: 120px;
  font-family: var(--mono); font-size: 14px; line-height: 1.6;
  color: var(--bone); background: var(--void);
  border: 1px solid var(--rule-strong);
  padding: 16px; resize: vertical;
  transition: border-color 0.2s;
  &:focus { border-color: var(--neon-cyan); }
  &::placeholder { color: var(--bone-darker); }
`;

const Options = styled.div`
  display: flex; flex-wrap: wrap; gap: 24px; margin-top: 20px;
`;

const OptionGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px;
`;

const OptionLabel = styled.span`
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.3em;
  color: var(--bone-dim);
`;

const ChipContainer = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px;
`;

const Chip = styled.button<{ $active: boolean }>`
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
  padding: 6px 12px;
  border: 1px solid ${p => p.$active ? 'var(--neon-cyan)' : 'var(--rule-strong)'};
  color: ${p => p.$active ? 'var(--neon-cyan)' : 'var(--bone-dim)'};
  background: ${p => p.$active ? 'rgba(0,240,255,0.08)' : 'transparent'};
  transition: all 0.2s;
  &:hover { border-color: var(--neon-cyan); color: var(--bone); }
`;

const Actions = styled.div`
  display: flex; gap: 12px; margin-top: 24px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: inline-flex; align-items: center; gap: 10px;
  padding: 12px 18px;
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.28em;
  text-transform: uppercase;
  border: 1px solid ${p => p.$primary ? 'var(--bone)' : 'var(--bone)'};
  background: ${p => p.$primary ? 'var(--bone)' : 'rgba(10,10,15,.7)'};
  color: ${p => p.$primary ? 'var(--void)' : 'var(--bone)'};
  box-shadow: ${p => p.$primary ? '3px 3px 0 rgba(0,0,0,.7)' : 'none'};
  transition: transform 0.15s var(--ease), box-shadow 0.15s var(--ease);
  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: ${p => p.$primary ? '4px 4px 0 var(--neon-red)' : '4px 4px 0 var(--neon-cyan)'};
  }
  &:active { transform: translate(0, 0); box-shadow: none; }
  &:disabled { opacity: 0.5; pointer-events: none; }
`;

interface Props {
  onSubmit: (prompt: string) => void;
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
  selectedMode: string;
  setSelectedMode: (mode: string) => void;
  availableModels: ModelProfile[];
}

export function Terminal({ onSubmit, selectedModels, setSelectedModels, selectedMode, setSelectedMode, availableModels }: Props) {
  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim() || submitting) return;
    setSubmitting(true);
    await onSubmit(prompt.trim());
    setPrompt('');
    setSubmitting(false);
  };

  const toggleModel = (tag: string) => {
    if (selectedModels.includes(tag)) {
      setSelectedModels(selectedModels.filter(m => m !== tag));
    } else {
      setSelectedModels([...selectedModels, tag]);
    }
  };

  return (
    <Section id="terminal">
      <Inner>
        <Header>
          <Tag>// ASSIGN TASK</Tag>
          <Clock>{new Date().toTimeString().slice(0, 8)}</Clock>
        </Header>
        <TextArea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe your task. Local AI agents will collaborate to produce the best result..."
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
        />
        <Options>
          <OptionGroup>
            <OptionLabel>MODELS ({selectedModels.length > 0 ? selectedModels.length : 'AUTO'})</OptionLabel>
            <ChipContainer>
              <Chip $active={selectedModels.length === 0} onClick={() => setSelectedModels([])}>
                AUTO-ROUTE
              </Chip>
              {availableModels.map(m => (
                <Chip key={m.tag} $active={selectedModels.includes(m.tag)} onClick={() => toggleModel(m.tag)}>
                  {m.name.split(' ').slice(0, 2).join(' ')}
                </Chip>
              ))}
            </ChipContainer>
          </OptionGroup>
          <OptionGroup>
            <OptionLabel>MODE</OptionLabel>
            <ChipContainer>
              {['collaborative', 'competitive', 'sequential'].map(mode => (
                <Chip key={mode} $active={selectedMode === mode} onClick={() => setSelectedMode(mode)}>
                  {mode.toUpperCase()}
                </Chip>
              ))}
            </ChipContainer>
          </OptionGroup>
        </Options>
        <Actions>
          <Button $primary onClick={handleSubmit} disabled={submitting}>
            <span>{submitting ? 'DEPLOYING...' : 'DEPLOY AGENTS'}</span>
            <svg viewBox="0 0 16 16" width="14" height="14"><path d="M2 8h10M8 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
          </Button>
          <Button onClick={() => setPrompt('')}>CLEAR</Button>
        </Actions>
      </Inner>
    </Section>
  );
}
