import styled from 'styled-components';

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
  & > span { font-size: 40px; display: block; margin-bottom: 12px; }
`;

export function ResultViewer() {
  return (
    <Section id="results">
      <SectionHead>
        <Eyebrow>— OUTPUT</Eyebrow>
        <Heading>RESULTS</Heading>
      </SectionHead>
      <Viewer>
        <Empty>
          <span>⬡</span>
          <p>Completed results will appear here.</p>
        </Empty>
      </Viewer>
    </Section>
  );
}
