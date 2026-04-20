'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/store';

/* ────────────────────────────────────────────────
   WelcomeAnimation – a premium, full-screen
   cinematic welcome overlay after login.

   Stages:
   1. Logo icon fades in with ring pulse
   2. "Welcome back" + user name typewriter reveal
   3. Particle burst + radial light sweep
   4. Whole overlay dissolves outward → dashboard
   ──────────────────────────────────────────────── */

// ─── Particle system ──────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  speed: number;
  opacity: number;
  color: string;
  delay: number;
}

function generateParticles(count: number): Particle[] {
  const colors = [
    'rgba(129,140,248,.8)',
    'rgba(167,139,250,.7)',
    'rgba(99,102,241,.6)',
    'rgba(192,132,252,.5)',
    'rgba(224,231,255,.4)',
    'rgba(6,182,212,.5)',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 6,
    y: 50 + (Math.random() - 0.5) * 6,
    size: 2 + Math.random() * 4,
    angle: Math.random() * 360,
    speed: 60 + Math.random() * 180,
    opacity: 0.3 + Math.random() * 0.7,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.6,
  }));
}

// ─── Floating orbs for background ─────────────────
function Orbs() {
  return (
    <>
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)',
        top: '-20%', left: '-15%',
        animation: 'wc-orb 16s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 550, height: 550, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,.15) 0%, transparent 70%)',
        bottom: '-18%', right: '-10%',
        animation: 'wc-orb 20s ease-in-out infinite reverse',
      }} />
      <div style={{
        position: 'absolute', width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,.08) 0%, transparent 70%)',
        top: '40%', left: '55%',
        animation: 'wc-orb 24s ease-in-out infinite 3s',
      }} />
    </>
  );
}

// ─── Main Component ───────────────────────────────
export default function WelcomeAnimation() {
  const { user } = useAuth();
  const [stage, setStage] = useState(0);
  // 0 = mount, 1 = logo in, 2 = text in, 3 = burst, 4 = dissolve out, 5 = unmount
  const [show, setShow] = useState(false);
  const [particles] = useState(() => generateParticles(60));
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  const firstName = user?.firstName || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Check sessionStorage flag from login
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const flag = sessionStorage.getItem('whk-show-welcome');
    if (flag === '1') {
      sessionStorage.removeItem('whk-show-welcome');
      setShow(true);
    }
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timeouts.current.push(t);
    return t;
  }, []);

  useEffect(() => {
    if (!show) return;
    // Stage timeline
    schedule(() => setStage(1), 200);   // logo
    schedule(() => setStage(2), 900);   // text
    schedule(() => setStage(3), 2200);  // burst
    schedule(() => setStage(4), 3400);  // dissolve
    schedule(() => setShow(false), 4200); // unmount
    return () => timeouts.current.forEach(clearTimeout);
  }, [show, schedule]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#020817',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        opacity: stage >= 4 ? 0 : 1,
        transform: stage >= 4 ? 'scale(1.08)' : 'scale(1)',
        transition: 'opacity .8s cubic-bezier(.4,0,.2,1), transform .8s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(99,102,241,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px', pointerEvents: 'none',
      }} />

      {/* Orbs */}
      <Orbs />

      {/* Radial sweep on burst */}
      <div style={{
        position: 'absolute', inset: 0,
        background: stage >= 3
          ? 'radial-gradient(circle at 50% 45%, rgba(99,102,241,.12) 0%, transparent 60%)'
          : 'radial-gradient(circle at 50% 45%, rgba(99,102,241,0) 0%, transparent 60%)',
        transition: 'background 1s ease',
        pointerEvents: 'none',
      }} />

      {/* Particles */}
      {stage >= 3 && particles.map(p => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.speed;
        const ty = Math.sin(rad) * p.speed;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.color,
              opacity: 0,
              transform: 'translate(-50%,-50%) scale(0)',
              animation: `wc-particle 1.4s ${p.delay}s cubic-bezier(.15,.8,.3,1) forwards`,
              ['--tx' as any]: `${tx}px`,
              ['--ty' as any]: `${ty}px`,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* ─ Logo icon ─ */}
      <div style={{
        position: 'relative', zIndex: 2,
        opacity: stage >= 1 ? 1 : 0,
        transform: stage >= 1 ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(20px)',
        transition: 'all .7s cubic-bezier(.34,1.56,.64,1)',
        marginBottom: 32,
      }}>
        {/* Outer ring pulse */}
        <div style={{
          position: 'absolute', inset: -16, borderRadius: 28,
          border: '2px solid rgba(99,102,241,.25)',
          animation: stage >= 1 ? 'wc-ring-pulse 2s ease-in-out infinite' : 'none',
        }} />
        {/* Second ring */}
        <div style={{
          position: 'absolute', inset: -30, borderRadius: 34,
          border: '1px solid rgba(99,102,241,.1)',
          animation: stage >= 1 ? 'wc-ring-pulse 2s .4s ease-in-out infinite' : 'none',
        }} />
        {/* Logo */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 60px rgba(99,102,241,.5), 0 0 120px rgba(99,102,241,.2)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
      </div>

      {/* ─ Text block ─ */}
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center',
        opacity: stage >= 2 ? 1 : 0,
        transform: stage >= 2 ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .8s cubic-bezier(.22,1,.36,1)',
      }}>
        {/* Greeting */}
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 11, textTransform: 'uppercase', letterSpacing: '.16em',
          color: 'rgba(165,180,252,.7)', marginBottom: 12,
        }}>
          // {greeting}
        </div>

        {/* Welcome line */}
        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 900,
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
          margin: '0 0 10px',
          color: '#f8fafc',
        }}>
          Welcome back,
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {firstName}.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 15, color: 'rgba(148,163,184,.7)',
          lineHeight: 1.6, margin: '0 0 20px',
          maxWidth: 380, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Your infrastructure is running. Let&apos;s keep it that way.
        </p>

        {/* Mono tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 20,
          background: 'rgba(99,102,241,.08)',
          border: '1px solid rgba(99,102,241,.18)',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 10, color: 'rgba(165,180,252,.6)',
          opacity: stage >= 2 ? 1 : 0,
          transition: 'opacity .6s .3s ease',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 8px rgba(74,222,128,.6)',
          }} />
          all systems operational
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes wc-orb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.06); }
          66% { transform: translate(-25px, 20px) scale(0.94); }
        }
        @keyframes wc-ring-pulse {
          0%, 100% { opacity: .6; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.15); }
        }
        @keyframes wc-particle {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          30% { opacity: var(--particle-o, 0.8); transform: translate(-50%, -50%) scale(1.2); }
          100% {
            opacity: 0;
            transform: translate(
              calc(-50% + var(--tx, 0px)),
              calc(-50% + var(--ty, 0px))
            ) scale(0.3);
          }
        }
      `}</style>
    </div>
  );
}
