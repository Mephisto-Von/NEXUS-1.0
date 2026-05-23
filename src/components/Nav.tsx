import styled from 'styled-components';

const NavEl = styled.header`
  position: fixed; top: 0; left: 0; right: 0; z-index: 80;
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; padding: 18px var(--pad);
  background: linear-gradient(to bottom, rgba(10,10,15,.85), rgba(10,10,15,0));
  backdrop-filter: blur(2px);
`;

const Brand = styled.a`
  font-family: var(--display);
  font-size: 22px;
  letter-spacing: 0.04em;
  color: var(--bone);
  text-shadow: -1px 0 0 rgba(255,46,77,0.85), 1px 0 0 rgba(0,240,255,0.85);
`;

const LogoDot = styled.span`
  color: var(--bone-dim); margin: 0 0.05em; text-shadow: none;
`;

const LogoNum = styled.span`
  position: relative;
  &::after {
    content: ""; position: absolute; right: -6px; top: -4px;
    width: 6px; height: 6px; background: var(--neon-red);
    box-shadow: 0 0 12px var(--neon-red);
  }
`;

const Links = styled.nav`
  display: flex; gap: 22px;
  @media (max-width: 880px) { display: none; }
`;

const Link = styled.a<{ $active?: boolean }>`
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.24em;
  color: ${p => p.$active ? 'var(--bone)' : 'var(--bone-dim)'};
  position: relative;
  padding: 4px 0;
  transition: color 0.2s;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: ${p => p.$active ? '0' : '100%'};
    bottom: -2px;
    height: 1px;
    background: var(--neon-red);
    transition: right 0.25s var(--ease);
  }
  &:hover { color: var(--bone); &::after { right: 0; } }
`;

const Status = styled.div`
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--bone-dim);
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const Dot = styled.span<{ $connected: boolean }>`
  width: 8px; height: 8px;
  background: ${p => p.$connected ? 'var(--neon-green)' : 'var(--bone-darker)'};
  box-shadow: ${p => p.$connected ? '0 0 10px var(--neon-green)' : 'none'};
  ${p => p.$connected && 'animation: pulse 1.6s steps(2) infinite;'}
`;

interface Props {
  user?: { name: string; email: string; avatarUrl: string } | null;
}

export function Nav({ user }: Props) {
  return (
    <NavEl>
      <Brand href="#">
        NEXUS <LogoNum>1.0</LogoNum>
      </Brand>
      <Links>
        <Link href="#terminal" $active>TERMINAL</Link>
        <Link href="#models">MODELS</Link>
        <Link href="#agents">AGENTS</Link>
        <Link href="#tasks">TASKS</Link>
        <Link href="#results">RESULTS</Link>
      </Links>
      <Status>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--rule)', paddingRight: '12px' }}>
            <img src={user.avatarUrl} alt={user.name} style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid var(--neon-cyan)' }} />
            <span style={{ fontSize: '10px', color: 'var(--neon-cyan)', letterSpacing: '0.1em' }}>{user.name.toUpperCase()}</span>
          </div>
        )}
        <Dot $connected />
        <span>CONNECTED</span>
      </Status>
    </NavEl>
  );
}
