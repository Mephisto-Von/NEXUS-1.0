import styled from 'styled-components';
import type { TaskSummary } from '@/types';

const Section = styled.section`
  padding: 80px 0;
  border-bottom: 1px solid var(--rule);
`;

const SectionHead = styled.div`
  max-width: var(--maxw); margin: 0 auto;
  padding: 0 var(--pad); margin-bottom: 40px;
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

const List = styled.div`
  max-width: var(--maxw); margin: 0 auto;
  padding: 0 var(--pad);
  display: grid; gap: 12px;
`;

const Empty = styled.div`
  text-align: center; padding: 40px; color: var(--bone-darker);
`;

const Card = styled.div`
  border: 1px solid var(--rule-strong);
  background: var(--void-2);
  padding: 16px 20px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  transition: border-color 0.2s;
  cursor: none;
  &:hover { border-color: var(--neon-cyan); }
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;

const Prompt = styled.div`
  font-size: 13px; color: var(--bone);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const Meta = styled.div`
  display: flex; gap: 16px; align-items: center;
`;

const Status = styled.span<{ $status: string }>`
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
  padding: 4px 8px;
  color: ${p => {
    switch (p.$status) {
      case 'completed': return 'var(--neon-green)';
      case 'running': return 'var(--neon-amber)';
      case 'failed': return 'var(--neon-red)';
      case 'voting': return 'var(--neon-magenta)';
      case 'synthesizing': return 'var(--neon-cyan)';
      default: return 'var(--bone-dim)';
    }
  }};
  border: 1px solid currentColor;
  ${p => p.$status === 'running' && 'animation: pulse 1.6s steps(2) infinite;'}
`;

const Time = styled.span`
  font-size: 10px; color: var(--bone-darker);
`;

const ViewBtn = styled.button`
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
  color: var(--neon-cyan); padding: 4px 8px;
  border: 1px solid var(--neon-cyan);
  transition: all 0.2s;
  &:hover { background: rgba(0,240,255,0.1); }
`;

const ProgressBar = styled.div`
  width: 100%; height: 4px;
  background: var(--void-3); margin-top: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-green));
  animation: progressPulse 2s ease-in-out infinite;
`;

interface Props {
  tasks: TaskSummary[];
}

export function TaskList({ tasks }: Props) {
  if (tasks.length === 0) {
    return (
      <Section id="tasks">
        <SectionHead>
          <Eyebrow>— TASK QUEUE</Eyebrow>
          <Heading>TASKS</Heading>
        </SectionHead>
        <List>
          <Empty><p>No tasks yet. Deploy agents to begin.</p></Empty>
        </List>
      </Section>
    );
  }

  return (
    <Section id="tasks">
      <SectionHead>
        <Eyebrow>— TASK QUEUE</Eyebrow>
        <Heading>TASKS</Heading>
      </SectionHead>
      <List>
        {tasks.map(t => (
          <Card key={t.id}>
            <div>
              <Prompt>{t.prompt}</Prompt>
              <Meta>
                <Status $status={t.status}>{t.status.toUpperCase()}</Status>
                <Time>{new Date(t.created_at).toLocaleTimeString()}</Time>
                {t.metrics?.duration_ms > 0 && (
                  <Time>{(t.metrics.duration_ms / 1000).toFixed(1)}s</Time>
                )}
              </Meta>
              {t.status === 'running' && (
                <ProgressBar><ProgressFill /></ProgressBar>
              )}
            </div>
            {t.status === 'completed' && <ViewBtn>VIEW</ViewBtn>}
          </Card>
        ))}
      </List>
    </Section>
  );
}
