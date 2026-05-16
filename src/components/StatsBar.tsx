import styled from 'styled-components';
import type { Stats } from '@/types';

const Section = styled.section`
  padding: 40px var(--pad);
  border-bottom: 1px solid var(--rule);
`;

const Grid = styled.div`
  max-width: var(--maxw); margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); }
`;

const Stat = styled.div`
  text-align: center;
  padding: 20px;
  border: 1px solid var(--rule);
  background: var(--void-2);
`;

const Value = styled.span<{ $color?: string }>`
  display: block;
  font-family: var(--display);
  font-size: clamp(24px, 3vw, 40px);
  color: ${p => p.$color || 'var(--bone)'};
  margin-bottom: 8px;
`;

const Label = styled.span`
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--bone-dim);
`;

interface Props {
  stats: Stats;
}

export function StatsBar({ stats }: Props) {
  return (
    <Section>
      <Grid>
        <Stat>
          <Value>{stats.total}</Value>
          <Label>TOTAL</Label>
        </Stat>
        <Stat>
          <Value $color="var(--neon-green)">{stats.completed}</Value>
          <Label>COMPLETED</Label>
        </Stat>
        <Stat>
          <Value $color="var(--neon-amber)">{stats.running}</Value>
          <Label>RUNNING</Label>
        </Stat>
        <Stat>
          <Value $color="var(--neon-red)">{stats.failed}</Value>
          <Label>FAILED</Label>
        </Stat>
      </Grid>
    </Section>
  );
}
