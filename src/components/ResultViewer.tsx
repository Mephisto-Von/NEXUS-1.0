import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import type { Task } from '@/types';

const Section = styled.section`
  padding: 80px 0;
  border-bottom: 1px solid var(--rule);
`;

const SectionHead = styled.div`
  max-width: var(--maxw); margin: 0 auto;
  padding: 0 var(--pad); margin-bottom: 40px;
  text-align: center;
`;

const Eyebrow = styled.p`
  font-family: var(--mono); font-size: 11px;
  letter-spacing: 0.32em; text-transform: uppercase;
  color: var(--neon-cyan); margin: 0 0 12px;
`;

const Heading = styled.h2`
  font-family: var(--display); font-weight: 400;
  letter-spacing: 0.02em; text-transform: uppercase;
  color: var(--bone); margin: 0; line-height: 1.05;
  font-size: clamp(28px, 5vw, 56px);
  position: relative; display: inline-block;
  &::before {
    content: ""; position: absolute; left: -18px; top: 50%;
    width: 8px; height: 8px; background: var(--neon-red);
    transform: translateY(-50%); box-shadow: 0 0 14px var(--neon-red);
  }
`;

const Viewer = styled.div`
  max-width: var(--maxw); margin: 0 auto;
  padding: 0 var(--pad);
`;

const Empty = styled.div`
  text-align: center; padding: 60px; color: var(--bone-darker);
  border: 1px dashed var(--rule-strong);
  background: var(--void-2);
  & > span { font-size: 40px; display: block; margin-bottom: 12px; }
`;

const DashboardCard = styled.div`
  border: 1px solid var(--rule-strong);
  background: var(--void-2);
  padding: 32px;
  position: relative;
  &::before, &::after {
    content: ""; position: absolute; width: 14px; height: 14px;
    border: 2px solid var(--neon-cyan);
  }
  &::before { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
  &::after { bottom: -2px; right: -2px; border-left: 0; border-top: 0; }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 24px;
  margin-bottom: 28px;
  gap: 24px;
  flex-wrap: wrap;
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InfoLabel = styled.span`
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--bone-dim);
  text-transform: uppercase;
`;

const InfoVal = styled.span`
  font-size: clamp(14px, 1.2vw, 18px);
  font-weight: 700;
  color: var(--bone);
`;

const CircularProgressContainer = styled.div`
  position: relative;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const rotateCircle = keyframes`
  from { stroke-dashoffset: 251.2; }
  to { stroke-dashoffset: var(--dashoffset); }
`;

const SvgCircle = styled.svg<{ $pct: number }>`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  circle {
    fill: none;
    stroke-width: 6;
  }
  .bg {
    stroke: var(--void-3);
  }
  .val {
    stroke: url(#scoreGrad);
    stroke-linecap: round;
    stroke-dasharray: 251.2;
    --dashoffset: ${p => 251.2 - (251.2 * p.$pct) / 100};
    animation: ${rotateCircle} 1.4s var(--ease) forwards;
  }
`;

const ScoreNum = styled.span`
  position: absolute;
  font-family: var(--display);
  font-size: 12px;
  color: var(--neon-green);
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.3);
`;

const Tabs = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--rule);
  padding-bottom: 1px;
  margin-bottom: 28px;
  overflow-x: auto;
`;

const TabButton = styled.button<{ $active: boolean }>`
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  padding: 10px 18px;
  text-transform: uppercase;
  border: 1px solid ${p => p.$active ? 'var(--neon-cyan)' : 'transparent'};
  border-bottom: 1px solid ${p => p.$active ? 'var(--void-2)' : 'transparent'};
  background: ${p => p.$active ? 'var(--void-2)' : 'transparent'};
  color: ${p => p.$active ? 'var(--neon-cyan)' : 'var(--bone-dim)'};
  margin-bottom: -1px;
  transition: all 0.25s;
  &:hover {
    color: var(--bone);
  }
`;

const TabContent = styled.div`
  min-height: 250px;
`;

const FinalOutput = styled.div`
  font-family: var(--mono);
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--bone);
  background: var(--void);
  border: 1px solid var(--rule);
  padding: 24px;
  overflow-x: auto;
  position: relative;
  
  pre {
    background: var(--void-2);
    border: 1px solid var(--rule-strong);
    padding: 18px;
    margin: 16px 0;
    overflow-x: auto;
    font-size: 12px;
  }
  
  code {
    font-family: var(--mono);
    color: var(--neon-cyan);
  }

  p {
    margin-bottom: 16px;
  }

  h1, h2, h3 {
    font-family: var(--display);
    font-weight: 400;
    font-size: 12px;
    text-transform: uppercase;
    color: var(--neon-amber);
    margin: 24px 0 12px;
  }
`;

const CopyButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.15em;
  padding: 4px 8px;
  border: 1px solid var(--rule-strong);
  color: var(--bone-dim);
  background: var(--void-3);
  transition: all 0.2s;
  &:hover {
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);
  }
`;

const DeconstructGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SubtaskRow = styled.div`
  border: 1px solid var(--rule);
  background: var(--void);
  padding: 16px;
  display: grid;
  grid-template-columns: 50px 1fr 120px 100px;
  gap: 16px;
  align-items: center;
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const SubtaskId = styled.span`
  font-family: var(--display);
  font-size: 11px;
  color: var(--neon-cyan);
`;

const SubtaskDesc = styled.span`
  font-size: 12.5px;
  color: var(--bone);
`;

const SubtaskType = styled.span`
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--neon-amber);
  border: 1px solid currentColor;
  padding: 3px 6px;
  text-align: center;
`;

const SubtaskPriority = styled.span<{ $pri: string }>`
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${p => p.$pri === 'high' ? 'var(--neon-red)' : p.$pri === 'medium' ? 'var(--neon-amber)' : 'var(--neon-green)'};
  text-align: center;
`;

const SpecialistGrid = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  border: 1px solid var(--rule);
  background: var(--void);
  min-height: 350px;
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const SpecSidebar = styled.div`
  border-right: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  background: rgba(10,10,15,0.4);
`;

const SpecItem = styled.button<{ $active: boolean }>`
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid var(--rule);
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: ${p => p.$active ? 'var(--neon-cyan)' : 'var(--bone-dim)'};
  background: ${p => p.$active ? 'rgba(0, 240, 255, 0.05)' : 'transparent'};
  transition: all 0.2s;
  &:hover {
    color: var(--bone);
  }
`;

const SpecContent = styled.div`
  padding: 24px;
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.65;
  color: var(--bone-dim);
  white-space: pre-wrap;
  overflow-y: auto;
  max-height: 450px;
`;

const CriticPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ConsensusMeta = styled.div`
  border: 1px dashed var(--neon-green);
  background: rgba(0, 255, 136, 0.03);
  padding: 20px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--bone-dim);
  & > strong {
    color: var(--neon-green);
    display: block;
    margin-bottom: 8px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.15em;
  }
`;

const RankTable = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--rule);
`;

const RankRow = styled.div<{ $header?: boolean }>`
  display: grid;
  grid-template-columns: 200px 100px 1fr;
  gap: 16px;
  padding: 12px 18px;
  font-size: 12px;
  background: ${p => p.$header ? 'var(--void-3)' : 'transparent'};
  border-bottom: ${p => p.$header ? '2px solid var(--rule-strong)' : '1px solid var(--rule)'};
  color: ${p => p.$header ? 'var(--bone)' : 'var(--bone-dim)'};
  align-items: center;
`;

const RefineSection = styled.div`
  margin-top: 36px;
  border-top: 1px solid var(--rule-strong);
  padding-top: 32px;
`;

const RefineTitle = styled.h3`
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--neon-cyan);
  margin: 0 0 16px;
`;

const RefineForm = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: var(--void);
  border: 1px solid var(--rule-strong);
  padding: 12px;
  transition: border-color 0.2s;
  &:focus-within {
    border-color: var(--neon-cyan);
  }
`;

const RefineInput = styled.textarea`
  flex: 1;
  min-height: 48px;
  font-family: var(--mono);
  font-size: 12.5px;
  color: var(--bone);
  resize: vertical;
  background: transparent;
  border: 0;
  outline: 0;
  &::placeholder {
    color: var(--bone-darker);
  }
`;

const RefineSendBtn = styled.button`
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--neon-cyan);
  border: 1px solid var(--neon-cyan);
  background: rgba(0, 240, 255, 0.05);
  padding: 8px 14px;
  transition: all 0.2s;
  &:hover {
    background: rgba(0, 240, 255, 0.15);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(1px);
  }
`;

interface Props {
  task: Task | null;
  onSendFollowUp: (prompt: string) => void;
}

export function ResultViewer({ task, onSendFollowUp }: Props) {
  const [activeTab, setActiveTab] = useState<'output' | 'architect' | 'specialists' | 'consensus'>('output');
  const [activeSpecModel, setActiveSpecModel] = useState<string>('');
  const [followUp, setFollowUp] = useState('');
  const [copied, setCopied] = useState(false);

  if (!task) {
    return (
      <Section id="results">
        <SectionHead>
          <Eyebrow>— OUTPUT</Eyebrow>
          <Heading>RESULTS</Heading>
        </SectionHead>
        <Viewer>
          <Empty>
            <span>⬡</span>
            <p>Select a completed task from the sidebar list to inspect the visual multi-agent report.</p>
          </Empty>
        </Viewer>
      </Section>
    );
  }

  const handleCopy = () => {
    if (!task.final_result) return;
    navigator.clipboard.writeText(task.final_result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFollowUpSubmit = () => {
    if (!followUp.trim()) return;
    onSendFollowUp(followUp.trim());
    setFollowUp('');
  };

  const scorePct = task.final_result ? Math.round(task.final_result.quality_score * 100) : 0;
  const specResults = task.final_result?.all_results || [];

  // Default Spec Selection on active change
  if (specResults.length > 0 && !activeSpecModel) {
    setActiveSpecModel(specResults[0].model_tag);
  }

  const currentSpecText = specResults.find(r => r.model_tag === activeSpecModel)?.content || 'No specialist content recorded.';

  return (
    <Section id="results">
      <SectionHead>
        <Eyebrow>— REPORT INTEGRITY</Eyebrow>
        <Heading>QUANTUM RESULTS</Heading>
      </SectionHead>
      <Viewer>
        <DashboardCard>
          <DashboardHeader>
            <InfoBlock>
              <InfoLabel>Active Task ID</InfoLabel>
              <InfoVal style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--neon-cyan)' }}>{task.id.slice(0, 16).toUpperCase()}...</InfoVal>
            </InfoBlock>
            <InfoBlock>
              <InfoLabel>Computational Pipeline</InfoLabel>
              <InfoVal>{task.mode.toUpperCase()}</InfoVal>
            </InfoBlock>
            <InfoBlock>
              <InfoLabel>Duration / Speed</InfoLabel>
              <InfoVal>{(task.metrics.duration_ms / 1000).toFixed(1)}s ({(task.metrics.tokens_used / (task.metrics.duration_ms / 1000 || 1)).toFixed(0)} T/s)</InfoVal>
            </InfoBlock>
            <InfoBlock>
              <InfoLabel>Safe Memory Footprint</InfoLabel>
              <InfoVal>{task.metrics.tokens_used} tokens</InfoVal>
            </InfoBlock>
            
            <CircularProgressContainer>
              <ScoreNum>{scorePct}%</ScoreNum>
              <SvgCircle $pct={scorePct}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--neon-cyan)" />
                    <stop offset="100%" stopColor="var(--neon-green)" />
                  </linearGradient>
                </defs>
                <circle className="bg" cx="45" cy="45" r="40" />
                <circle className="val" cx="45" cy="45" r="40" />
              </SvgCircle>
            </CircularProgressContainer>
          </DashboardHeader>

          <Tabs>
            <TabButton $active={activeTab === 'output'} onClick={() => setActiveTab('output')}>FINAL OUT</TabButton>
            <TabButton $active={activeTab === 'architect'} onClick={() => setActiveTab('architect')}>ARCHITECT ({task.subtasks.length})</TabButton>
            <TabButton $active={activeTab === 'specialists'} onClick={() => setActiveTab('specialists')}>SPECIALISTS ({specResults.length})</TabButton>
            <TabButton $active={activeTab === 'consensus'} onClick={() => setActiveTab('consensus')}>CRITIC & VOTES</TabButton>
          </Tabs>

          <TabContent>
            {activeTab === 'output' && (
              <FinalOutput>
                <CopyButton onClick={handleCopy}>{copied ? 'COPIED!' : 'COPY CODE'}</CopyButton>
                {task.final_result ? (
                  <div dangerouslySetInnerHTML={{
                    __html: task.final_result.content
                      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
                      .replace(/`([^`]+)`/g, '<code>$1</code>')
                      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br>')
                  }} />
                ) : (
                  <p style={{ color: 'var(--neon-red)' }}>Task execution failed or results not fully synthesized yet. Check agent activity feed.</p>
                )}
              </FinalOutput>
            )}

            {activeTab === 'architect' && (
              <DeconstructGrid>
                {task.subtasks.map(sub => (
                  <SubtaskRow key={sub.id}>
                    <SubtaskId>0{sub.id}</SubtaskId>
                    <SubtaskDesc>{sub.description}</SubtaskDesc>
                    <SubtaskType>{sub.type}</SubtaskType>
                    <SubtaskPriority $pri={sub.priority}>{sub.priority}</SubtaskPriority>
                  </SubtaskRow>
                ))}
              </DeconstructGrid>
            )}

            {activeTab === 'specialists' && (
              <SpecialistGrid>
                <SpecSidebar>
                  {specResults.map(res => (
                    <SpecItem 
                      key={res.model_tag} 
                      $active={res.model_tag === activeSpecModel}
                      onClick={() => setActiveSpecModel(res.model_tag)}
                    >
                      {res.model}
                    </SpecItem>
                  ))}
                </SpecSidebar>
                <SpecContent>{currentSpecText}</SpecContent>
              </SpecialistGrid>
            )}

            {activeTab === 'consensus' && (
              <CriticPanel>
                {task.final_result?.consensus && (
                  <ConsensusMeta>
                    <strong>CONSENSUS VERDICT</strong>
                    {task.final_result.consensus.summary}
                  </ConsensusMeta>
                )}
                
                <RankTable>
                  <RankRow $header>
                    <span>MODEL AGENT</span>
                    <span>RANK SCORE</span>
                    <span>DECISION RATIONALE</span>
                  </RankRow>
                  {task.final_result?.consensus?.rankings.map(rank => (
                    <RankRow key={rank.model}>
                      <span style={{ color: 'var(--bone)', fontWeight: 'bold' }}>{rank.model}</span>
                      <span style={{ color: rank.score >= 90 ? 'var(--neon-green)' : 'var(--neon-amber)' }}>{rank.score}%</span>
                      <span>{rank.reason}</span>
                    </RankRow>
                  ))}
                </RankTable>
              </CriticPanel>
            )}
          </TabContent>

          <RefineSection>
            <RefineTitle>// DEPLOY FOLLOW-UP DIRECTIVE</RefineTitle>
            <RefineForm>
              <RefineInput 
                value={followUp}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFollowUp(e.target.value)}
                placeholder="Ask follow-up questions or refine outputs (e.g., 'optimize this algorithm', 'rewrite it in Go')..."
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFollowUpSubmit(); } }}
              />
              <RefineSendBtn onClick={handleFollowUpSubmit}>SEND TURN</RefineSendBtn>
            </RefineForm>
          </RefineSection>
        </DashboardCard>
      </Viewer>
    </Section>
  );
}
