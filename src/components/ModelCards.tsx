import styled from 'styled-components';
import type { ModelProfile } from '@/types';

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

const Lede = styled.p`
  font-family: var(--mono); font-size: clamp(14px, 1.1vw, 16px);
  color: var(--bone-dim); max-width: 56ch;
  line-height: 1.7; margin: 16px auto 0;
`;

const Grid = styled.div`
  max-width: var(--maxw); margin: 0 auto;
  padding: 0 var(--pad);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const Card = styled.div<{ $available: boolean }>`
  border: 1px solid ${p => p.$available ? 'var(--neon-green)' : 'var(--rule)'};
  background: var(--void-2);
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.2s;
  ${p => p.$available && `
    &::before {
      content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: var(--neon-green);
    }
  `}
  &:hover { border-color: var(--neon-cyan); transform: translateY(-2px); }
`;

const CardHead = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 12px;
`;

const CardName = styled.span`
  font-family: var(--display); font-size: 11px; color: var(--bone); line-height: 1.3;
`;

const Badge = styled.span<{ $available: boolean }>`
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.2em;
  padding: 3px 8px; text-transform: uppercase;
  color: ${p => p.$available ? 'var(--neon-green)' : 'var(--bone-darker)'};
  border: 1px solid ${p => p.$available ? 'var(--neon-green)' : 'var(--rule)'};
`;

const CardRole = styled.div`
  font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
  color: var(--neon-cyan); text-transform: uppercase; margin-bottom: 10px;
`;

const Strengths = styled.ul`
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-wrap: wrap; gap: 6px;
`;

const Strength = styled.li`
  font-family: var(--mono); font-size: 10px;
  padding: 3px 8px; background: var(--void-3);
  border: 1px solid var(--rule); color: var(--bone-dim);
`;

const PullBtn = styled.button`
  margin-top: 14px;
  font-family: var(--mono); font-size: 10px;
  color: var(--neon-amber); padding: 6px 10px;
  border: 1px solid var(--neon-amber);
  transition: all 0.2s;
  &:hover { background: rgba(255,176,0,0.1); }
`;

interface Props {
  models: ModelProfile[];
  availableTags: Set<string>;
  onPull: (tag: string) => void;
}

export function ModelCards({ models, availableTags, onPull }: Props) {
  const tierOrder: Record<string, number> = { micro: 0, small: 1, 'medium-small': 2, medium: 3, specialized: 4 };
  const sorted = [...models].sort((a, b) => (tierOrder[a.tier] || 5) - (tierOrder[b.tier] || 5));

  return (
    <Section id="models">
      <SectionHead>
        <Eyebrow>— LOCAL MODELS</Eyebrow>
        <Heading>MODEL ARSENAL</Heading>
        <Lede>Free, local, no API keys. Each model has a specialty. Together, they outperform any single model.</Lede>
      </SectionHead>
      <Grid>
        {sorted.map(m => {
          const isAvail = availableTags.has(m.tag);
          return (
            <Card key={m.tag} $available={isAvail}>
              <CardHead>
                <CardName>{m.name}</CardName>
                <Badge $available={isAvail}>{isAvail ? 'READY' : m.size}</Badge>
              </CardHead>
              <CardRole>{m.role} — {m.specialty}</CardRole>
              <Strengths>
                {m.strengths.map(s => <Strength key={s}>{s}</Strength>)}
              </Strengths>
              {!isAvail && <PullBtn onClick={() => onPull(m.tag)}>PULL MODEL</PullBtn>}
            </Card>
          );
        })}
      </Grid>
    </Section>
  );
}
