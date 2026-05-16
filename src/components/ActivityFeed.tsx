import styled from 'styled-components';
import type { AgentType } from '@/types';

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

const Feed = styled.div`
  max-width: var(--maxw); margin: 0 auto;
  padding: 0 var(--pad);
  max-height: 400px; overflow-y: auto;
`;

const Empty = styled.div`
  text-align: center; padding: 60px 20px; color: var(--bone-darker);
  & > span { font-size: 32px; display: block; margin-bottom: 12px; animation: spin 4s linear infinite; }
`;

const Item = styled.div`
  display: grid;
  grid-template-columns: 80px 120px 1fr;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--rule);
  font-size: 12px;
  animation: slideIn 0.3s var(--ease);
  @media (max-width: 760px) { grid-template-columns: 60px 1fr; gap: 8px; }
`;

const Time = styled.span`
  font-family: var(--terminal); font-size: 14px; color: var(--bone-darker);
`;

const Agent = styled.span<{ $type: AgentType }>`
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${p => {
    switch (p.$type) {
      case 'architect': return 'var(--neon-cyan)';
      case 'specialist': return 'var(--neon-amber)';
      case 'critic': return 'var(--neon-red)';
      case 'synthesizer': return 'var(--neon-magenta)';
      case 'consensus': return 'var(--neon-green)';
      default: return 'var(--bone-dim)';
    }
  }};
  @media (max-width: 760px) { display: none; }
`;

const Message = styled.span`
  color: var(--bone-dim);
`;

interface Activity {
  type: AgentType;
  message: string;
  time: string;
}

interface Props {
  activities: Activity[];
}

export function ActivityFeed({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <Section id="agents">
        <SectionHead>
          <Eyebrow>— LIVE FEED</Eyebrow>
          <Heading>AGENT ACTIVITY</Heading>
        </SectionHead>
        <Feed>
          <Empty>
            <span>◈</span>
            <p>No active tasks. Assign one above.</p>
          </Empty>
        </Feed>
      </Section>
    );
  }

  return (
    <Section id="agents">
      <SectionHead>
        <Eyebrow>— LIVE FEED</Eyebrow>
        <Heading>AGENT ACTIVITY</Heading>
      </SectionHead>
      <Feed>
        {activities.map((a, i) => (
          <Item key={`${a.time}-${i}`}>
            <Time>{a.time}</Time>
            <Agent $type={a.type}>{a.type.toUpperCase()}</Agent>
            <Message>{a.message}</Message>
          </Item>
        ))}
      </Feed>
    </Section>
  );
}
