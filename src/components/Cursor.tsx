import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const CursorEl = styled.div<{ $x: number; $y: number; $active: boolean }>`
  position: fixed;
  left: 0; top: 0;
  width: ${p => p.$active ? '46px' : '32px'};
  height: ${p => p.$active ? '46px' : '32px'};
  border: 2px solid ${p => p.$active ? 'var(--neon-red)' : 'var(--neon-cyan)'};
  border-radius: 50%;
  pointer-events: none;
  z-index: 400;
  transform: translate(-50%, -50%);
  mix-blend-mode: difference;
  box-shadow: 0 0 8px ${p => p.$active ? 'var(--neon-red)' : 'var(--neon-cyan)'};
  transition: width 0.12s var(--ease), height 0.12s var(--ease), border-color 0.12s;
`;

const Scanlines = styled.div`
  position: fixed; inset: 0; pointer-events: none; z-index: 90;
  background: repeating-linear-gradient(to bottom,
    rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px,
    rgba(0,0,0,0.18) 3px, rgba(0,0,0,0) 4px);
  mix-blend-mode: multiply; opacity: 0.55;
`;

const Grain = styled.div`
  position: fixed; inset: 0; pointer-events: none; z-index: 91; opacity: 0.35;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
  animation: grainShift 1.4s steps(6) infinite;
`;

const Vignette = styled.div`
  position: fixed; inset: 0; pointer-events: none; z-index: 89;
  background: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,.75) 100%);
`;

export function Cursor() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [active, setActive] = useState(false);
  const rafRef = useRef<number>();

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setTx(e.clientX);
      setTy(e.clientY);
    };
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, textarea, input, [data-interactive]')) {
        setActive(true);
      }
    };
    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, textarea, input, [data-interactive]')) {
        setActive(false);
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseover', handleOver);
    window.addEventListener('mouseout', handleOut);

    const loop = () => {
      setX(prev => prev + (tx - prev) * 0.35);
      setY(prev => prev + (ty - prev) * 0.35);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
      window.removeEventListener('mouseout', handleOut);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tx, ty]);

  return <CursorEl $x={x} $y={y} $active={active} />;
}

export function Overlays() {
  return (
    <>
      <Scanlines />
      <Grain />
      <Vignette />
    </>
  );
}
