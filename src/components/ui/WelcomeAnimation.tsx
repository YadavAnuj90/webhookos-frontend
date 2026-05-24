'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/store';

const ORBIT_ICONS: { icon: string; label: string; color: string; bg: string }[] = [
  { icon: '⚡', label: 'Events',      color: '#facc15', bg: 'rgba(250,204,21,.15)' },
  { icon: '🎯', label: 'Endpoints',   color: '#4ade80', bg: 'rgba(74,222,128,.15)' },
  { icon: '📊', label: 'Analytics',   color: '#818cf8', bg: 'rgba(129,140,248,.15)' },
  { icon: '🔄', label: 'Retry',       color: '#f87171', bg: 'rgba(248,113,113,.15)' },
  { icon: '🔑', label: 'API Keys',    color: '#a78bfa', bg: 'rgba(167,139,250,.15)' },
  { icon: '🛡️', label: 'Security',    color: '#22d3ee', bg: 'rgba(34,211,238,.15)' },
];

export default function WelcomeAnimation() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [stage, setStage] = useState(0);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  const raw = user?.firstName || 'there';
  const firstName = raw.charAt(0).toUpperCase() + raw.slice(1);
  const initials = `${(user?.firstName || 'W')[0]}${(user?.lastName || 'O')[0]}`.toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const flag = sessionStorage.getItem('whk-show-welcome');
    if (flag === '1') {
      sessionStorage.removeItem('whk-show-welcome');
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = (fn: () => void, ms: number) => { const id = setTimeout(fn, ms); timeouts.current.push(id); };
    t(() => setStage(1), 100);
    t(() => setStage(2), 600);
    t(() => setStage(3), 1200);
    t(() => setStage(4), 2600);
    t(() => setStage(5), 3800);
    t(() => setShow(false), 4600);
    return () => timeouts.current.forEach(clearTimeout);
  }, [show]);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#020817',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      opacity: stage >= 5 ? 0 : 1,
      transform: stage >= 5 ? 'scale(1.06)' : 'scale(1)',
      transition: 'opacity .8s cubic-bezier(.4,0,.2,1), transform .8s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(99,102,241,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.025) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
      }} />

      <div style={{
        position: 'absolute', width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,.12) 0%, transparent 65%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        animation: 'wc-breathe 6s ease-in-out infinite', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: 300, height: 300, marginBottom: 40 }}>

        <div style={{
          position: 'absolute', inset: 0,
          opacity: stage >= 2 ? 1 : 0,
          transition: 'opacity .6s ease',
        }}>
          <div style={{
            position: 'absolute', inset: -4,
            borderRadius: '50%',
            border: '1px solid rgba(99,102,241,.12)',
            animation: stage >= 2 ? 'wc-orbit-ring 20s linear infinite' : 'none',
          }} />
          <div style={{
            position: 'absolute', inset: -36,
            borderRadius: '50%',
            border: '1px dashed rgba(99,102,241,.07)',
            animation: stage >= 2 ? 'wc-orbit-ring 30s linear infinite reverse' : 'none',
          }} />
        </div>

        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>

          <div style={{
            position: 'absolute', inset: 10,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, rgba(99,102,241,.5), rgba(139,92,246,.5), rgba(6,182,212,.3), rgba(99,102,241,.5))',
            filter: 'blur(16px)',
            opacity: stage >= 1 ? 0.8 : 0,
            transition: 'opacity .8s ease',
            animation: stage >= 1 ? 'wc-glow-spin 4s linear infinite' : 'none',
          }} />

          <div style={{
            position: 'relative', zIndex: 2,
            width: 140, height: 140, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
            border: '3px solid rgba(129,140,248,.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 60px rgba(99,102,241,.3), 0 0 120px rgba(99,102,241,.1), inset 0 0 30px rgba(99,102,241,.05)',
            opacity: stage >= 1 ? 1 : 0,
            transform: stage >= 1 ? 'scale(1)' : 'scale(0.5)',
            transition: 'all .7s cubic-bezier(.34,1.56,.64,1)',
          }}>
            <span style={{
              fontSize: 42, fontWeight: 900, letterSpacing: '-1px',
              background: 'linear-gradient(135deg, #c7d2fe, #a5b4fc, #818cf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {initials}
            </span>
          </div>
        </div>

        {ORBIT_ICONS.map((item, i) => {
          const angle = (360 / ORBIT_ICONS.length) * i - 90;
          const rad = (angle * Math.PI) / 180;
          const radius = 130;
          const x = 150 + Math.cos(rad) * radius;
          const y = 150 + Math.sin(rad) * radius;
          const delay = i * 0.12;

          return (
            <div key={i} style={{
              position: 'absolute',
              left: x - 26, top: y - 26,
              width: 52, height: 52,
              borderRadius: 16,
              background: item.bg,
              border: `1px solid ${item.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              opacity: stage >= 3 ? 1 : 0,
              transform: stage >= 3 ? 'scale(1) translateY(0)' : 'scale(0.3) translateY(20px)',
              transition: `all .5s ${delay}s cubic-bezier(.34,1.56,.64,1)`,
              boxShadow: `0 8px 24px ${item.color}20`,
              zIndex: 3,
              animation: stage >= 3 ? `wc-float ${3 + i * 0.4}s ${delay}s ease-in-out infinite` : 'none',
            }}>
              {item.icon}
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'relative', zIndex: 2, textAlign: 'center',
        opacity: stage >= 4 ? 1 : 0,
        transform: stage >= 4 ? 'translateY(0)' : 'translateY(28px)',
        transition: 'all .7s cubic-bezier(.22,1,.36,1)',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 11, textTransform: 'uppercase', letterSpacing: '.16em',
          color: 'rgba(165,180,252,.6)', marginBottom: 14,
        }}>
          {greeting}
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900,
          letterSpacing: '-1.5px', lineHeight: 1.1, margin: '0 0 14px', color: '#f8fafc',
        }}>
          Welcome back,{' '}
          <span style={{
            background: 'linear-gradient(135deg, #818cf8, #a78bfa, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {firstName}
          </span>
        </h1>

        <p style={{
          fontSize: 15, color: 'rgba(148,163,184,.6)', lineHeight: 1.6, margin: '0 0 20px',
        }}>
          Your webhooks are running. Let's keep building.
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 18px', borderRadius: 24,
          background: 'rgba(74,222,128,.06)',
          border: '1px solid rgba(74,222,128,.18)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, color: 'rgba(74,222,128,.8)',
          opacity: stage >= 4 ? 1 : 0,
          transition: 'opacity .5s .25s ease',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: '#4ade80',
            boxShadow: '0 0 10px rgba(74,222,128,.6)',
            animation: 'wc-dot-pulse 2s ease-in-out infinite',
          }} />
          all systems operational
        </div>
      </div>

      <style>{`
        @keyframes wc-breathe {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: .7; }
          50% { transform: translate(-50%,-50%) scale(1.08); opacity: 1; }
        }
        @keyframes wc-glow-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes wc-orbit-ring {
          to { transform: rotate(360deg); }
        }
        @keyframes wc-float {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.06) translateY(-6px); }
        }
        @keyframes wc-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(.85); }
        }
      `}</style>
    </div>
  );
}
