import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #181724 0%, var(--void) 70%);
  padding: var(--pad);
  position: relative;
  overflow: hidden;
`;

const GrainOverlay = styled.div`
  position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E");
  pointer-events: none;
`;

const GlitchText = styled.h1`
  font-family: var(--display);
  font-size: clamp(20px, 4.5vw, 42px);
  color: var(--bone);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  margin-bottom: 8px;
  position: relative;
  text-shadow: 2px 2px 0 var(--neon-red), -2px -2px 0 var(--neon-cyan);
`;

const Subtitle = styled.p`
  font-family: var(--mono);
  font-size: clamp(10px, 1.1vw, 13px);
  color: var(--bone-dim);
  text-transform: uppercase;
  letter-spacing: 0.25em;
  text-align: center;
  margin-bottom: 40px;
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 460px;
  border: 1px solid var(--rule-strong);
  background: rgba(17, 17, 26, 0.7);
  backdrop-filter: blur(16px);
  padding: 40px;
  position: relative;
  &::before, &::after {
    content: ""; position: absolute; width: 16px; height: 16px;
    border: 2px solid var(--neon-cyan);
  }
  &::before { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
  &::after { bottom: -2px; right: -2px; border-left: 0; border-top: 0; }
`;

const TerminalRow = styled.div`
  font-family: var(--mono);
  font-size: 11px;
  color: var(--neon-cyan);
  margin-bottom: 24px;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const GoogleBtn = styled.button`
  width: 100%;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: var(--void-2);
  border: 1px solid var(--bone-dim);
  color: var(--bone);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transition: all 0.25s var(--ease);
  position: relative;
  &:hover {
    border-color: var(--neon-cyan);
    color: var(--neon-cyan);
    box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(1px);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: var(--void);
  border: 1px solid var(--rule-strong);
  color: var(--bone);
  font-family: var(--mono);
  font-size: 12px;
  margin-top: 8px;
  margin-bottom: 16px;
  transition: border-color 0.2s;
  &:focus {
    border-color: var(--neon-amber);
  }
`;

const Label = styled.label`
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--bone-dim);
  text-transform: uppercase;
`;

interface Props {
  onLogin: (user: { name: string; email: string; avatarUrl: string }) => void;
}

export function LoginPortal({ onLogin }: Props) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('Nexus Navigator');

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin({
        name: username || 'Quantum User',
        email: 'nexus.user@quantum.net',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <Container>
      <GrainOverlay />
      <AuthCard>
        <GlitchText>NEXUS // 1.0</GlitchText>
        <Subtitle>Quantum Agentic Gateway</Subtitle>
        
        <TerminalRow>
          $ ssh gateway@nexus.local{'\n'}
          $ authentication required...{'\n'}
          $ status: cloud_agents = LOCKED (auth_required)
        </TerminalRow>

        <Label>Navigator Username</Label>
        <Input 
          type="text" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="Enter agent name..." 
        />

        <GoogleBtn onClick={handleGoogleLogin} disabled={loading}>
          {loading ? (
            <span>AUTHENTICATING AGENT...</span>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Sign In With Google</span>
            </>
          )}
        </GoogleBtn>
      </AuthCard>
    </Container>
  );
}
