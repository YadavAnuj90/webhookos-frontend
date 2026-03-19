'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';
import {
  Zap, Shield, BarChart3, RefreshCw, ArrowRight, Check,
  Globe, Activity, Code2, Layers, Star, X,
  Sparkles, Brain, FileJson, SearchX, Wand2, ChevronRight,
} from 'lucide-react';

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  .lp{font-family:'Inter',sans-serif;background:#020817;color:#f8fafc;overflow-x:hidden}
  .lp *,.lp *::before,.lp *::after{box-sizing:border-box;margin:0;padding:0}

  /* KEYFRAMES */
  @keyframes lp-orb{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.72;transform:scale(1.08)}}
  @keyframes lp-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes lp-grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes lp-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes lp-event{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
  @keyframes lp-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes lp-cursor{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes lp-activity-in{from{opacity:0;transform:translateX(110px)}to{opacity:1;transform:translateX(0)}}
  @keyframes lp-activity-out{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(110px)}}
  @keyframes lp-mesh{0%,100%{opacity:.8;filter:hue-rotate(0deg)}50%{opacity:1;filter:hue-rotate(22deg)}}
  @keyframes lp-reveal{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
  @keyframes lp-ai-pulse{0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,.35)}50%{box-shadow:0 0 0 8px rgba(168,85,247,0)}}
  @keyframes lp-ai-scan{0%{transform:translateY(-100%)}100%{transform:translateY(400%)}}
  @keyframes lp-spin-slow{to{transform:rotate(360deg)}}
  @keyframes lp-float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes lp-border-breathe{0%,100%{border-color:rgba(99,102,241,.15)}50%{border-color:rgba(99,102,241,.45)}}
  @keyframes lp-dot-blink{0%,100%{opacity:.5}50%{opacity:1}}
  @keyframes lp-count-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes lp-glow-pulse{0%,100%{box-shadow:0 0 20px rgba(99,102,241,.0)}50%{box-shadow:0 0 40px rgba(99,102,241,.25)}}

  /* ANIMATIONS */
  .lp-au0{animation:lp-up .6s ease both}
  .lp-au1{animation:lp-up .6s .1s ease both}
  .lp-au2{animation:lp-up .6s .2s ease both}
  .lp-au3{animation:lp-up .6s .3s ease both}
  .lp-au4{animation:lp-up .6s .4s ease both}
  .lp-grad-text{background:linear-gradient(135deg,#fff 0%,#c7d2fe 40%,#818cf8 70%,#6366f1 100%);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:lp-grad 4s ease infinite}
  .lp-grad-green{background:linear-gradient(135deg,#4ade80,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

  /* SCROLL REVEAL */
  .lp-reveal{opacity:0;transform:translateY(32px);transition:opacity .65s ease,transform .65s ease}
  .lp-revealed{opacity:1!important;transform:translateY(0)!important}

  /* GRAIN OVERLAY */
  .lp-grain{position:fixed;inset:0;pointer-events:none;z-index:9000;opacity:.028;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px 200px;background-repeat:repeat}

  /* GRADIENT MESH */
  .lp-mesh{position:absolute;inset:0;background:radial-gradient(ellipse 65% 55% at 8% 42%,rgba(99,70,255,.16) 0%,transparent 60%),radial-gradient(ellipse 55% 65% at 92% 18%,rgba(59,130,246,.1) 0%,transparent 60%),radial-gradient(ellipse 45% 55% at 62% 88%,rgba(168,85,247,.12) 0%,transparent 60%);animation:lp-mesh 14s ease-in-out infinite;pointer-events:none}

  /* NAV */
  .lp-nav{position:fixed;top:0;left:0;right:0;z-index:1000;transition:all .3s}
  .lp-nav-on{background:rgba(2,8,23,.92);backdrop-filter:blur(24px);border-bottom:1px solid rgba(99,102,241,.12)}
  .lp-wrap{max-width:1180px;margin:0 auto;padding:0 28px}

  /* BUTTONS */
  .lp-btn-pri{padding:12px 28px;border-radius:10px;border:none;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:7px;font-family:inherit;transition:all .22s;position:relative;overflow:hidden}
  .lp-btn-pri::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.13) 50%,transparent 60%);background-size:200%;animation:lp-shimmer 2.6s infinite}
  .lp-btn-pri:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(79,70,229,.5);text-decoration:none;color:#fff}
  .lp-btn-out{padding:12px 28px;border-radius:10px;border:1px solid rgba(99,102,241,.32);background:rgba(99,102,241,.06);color:#c7d2fe;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:7px;font-family:inherit;transition:all .22s}
  .lp-btn-out:hover{border-color:rgba(99,102,241,.7);background:rgba(99,102,241,.12);color:#fff;transform:translateY(-1px);text-decoration:none}
  .lp-btn-sm{padding:7px 16px;border-radius:8px;border:none;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:12.5px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:5px;font-family:inherit;transition:all .2s}
  .lp-btn-sm:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(79,70,229,.4);text-decoration:none;color:#fff}
  .lp-btn-ghost-sm{padding:7px 16px;border-radius:8px;border:1px solid rgba(99,102,241,.28);background:transparent;color:#a5b4fc;font-size:12.5px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;font-family:inherit;transition:all .2s}
  .lp-btn-ghost-sm:hover{border-color:rgba(99,102,241,.6);color:#fff;background:rgba(99,102,241,.08);text-decoration:none}

  /* CARDS */
  .lp-card{background:rgba(15,23,42,.75);border:1px solid rgba(99,102,241,.12);border-radius:14px;backdrop-filter:blur(8px);transition:all .24s;position:relative;overflow:hidden}
  .lp-card:hover{border-color:rgba(99,102,241,.32);transform:translateY(-3px);box-shadow:0 20px 56px rgba(0,0,0,.45),0 0 0 1px rgba(99,102,241,.1)}
  .lp-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent 60%,rgba(99,102,241,.04));pointer-events:none}

  /* GLOW CARDS */
  .lp-glow-card{background:rgba(15,23,42,.8);border:1px solid rgba(99,102,241,.1);border-radius:14px;backdrop-filter:blur(8px);transition:border-color .3s,transform .3s,box-shadow .3s;position:relative;overflow:hidden;cursor:default}
  .lp-glow-card:hover{transform:translateY(-5px);border-color:rgba(99,102,241,.3);box-shadow:0 24px 64px rgba(0,0,0,.5)}

  /* TICKER */
  .lp-ticker-wrap{overflow:hidden;white-space:nowrap;border-top:1px solid rgba(99,102,241,.07);border-bottom:1px solid rgba(99,102,241,.07);background:rgba(10,15,30,.5);padding:0;mask-image:linear-gradient(90deg,transparent,black 8%,black 92%,transparent)}
  .lp-ticker-track{display:inline-flex;animation:lp-ticker 32s linear infinite}
  .lp-ticker-track:hover{animation-play-state:paused}
  .lp-ticker-item{display:inline-flex;align-items:center;gap:0;padding:14px 0;font-size:13px;font-weight:700;color:#1e293b;white-space:nowrap}
  .lp-ticker-sep{color:rgba(99,102,241,.25);font-size:14px;padding:0 24px;user-select:none}

  /* TERMINAL */
  .lp-terminal{background:#080f1e;border:1px solid rgba(99,102,241,.2);border-radius:14px;overflow:hidden;box-shadow:0 28px 80px rgba(0,0,0,.6),0 0 0 1px rgba(99,102,241,.06)}
  .lp-tbar{background:rgba(20,30,50,.9);padding:10px 16px;display:flex;align-items:center;gap:7px;border-bottom:1px solid rgba(99,102,241,.1)}
  .lp-dot{width:10px;height:10px;border-radius:50%}
  .lp-erow{display:flex;align-items:center;gap:10px;padding:7px 14px;border-bottom:1px solid rgba(255,255,255,.025);animation:lp-event .35s ease both;font-family:'JetBrains Mono',monospace;font-size:11px}
  .lp-erow:hover{background:rgba(99,102,241,.04)}

  /* ACTIVITY FEED */
  .lp-activity{position:fixed;bottom:24px;right:24px;z-index:8000;pointer-events:none}
  .lp-act-item{background:rgba(8,14,28,.96);border:1px solid rgba(99,102,241,.22);border-radius:12px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;width:280px;backdrop-filter:blur(24px);box-shadow:0 8px 32px rgba(0,0,0,.6),0 0 0 1px rgba(99,102,241,.06)}
  .lp-act-entering{animation:lp-activity-in .4s cubic-bezier(.34,1.56,.64,1) both}
  .lp-act-leaving{animation:lp-activity-out .35s ease both}

  /* CODE TABS */
  .lp-code-wrap{background:#060d1a;border:1px solid rgba(99,102,241,.18);border-radius:14px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.55)}
  .lp-code-tabbar{display:flex;border-bottom:1px solid rgba(99,102,241,.1);background:rgba(10,18,36,.9)}
  .lp-code-tab{padding:11px 20px;font-family:'JetBrains Mono',monospace;font-size:11.5px;color:#334155;cursor:pointer;border:none;border-bottom:2px solid transparent;background:none;font-weight:600;transition:all .2s}
  .lp-code-tab.lp-tab-active{color:#818cf8;border-bottom-color:#818cf8;background:rgba(99,102,241,.05)}
  .lp-code-tab:hover:not(.lp-tab-active){color:#64748b}
  .lp-code-body{padding:24px;overflow-x:auto;min-height:200px}
  .lp-code-body pre{font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.8;margin:0;color:#64748b}
  .lp-kw{color:#818cf8}.lp-str{color:#4ade80}.lp-fn{color:#38bdf8}.lp-cm{color:#1e3a5f}.lp-num{color:#fb923c}.lp-prop{color:#c084fc}.lp-op{color:#94a3b8}

  /* FLOW DIAGRAM */
  .lp-flow-wrap{background:#060d1a;border:1px solid rgba(99,102,241,.15);border-radius:16px;overflow:hidden;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:lp-glow-pulse 4s ease infinite}

  /* TYPOGRAPHY */
  .lp-sec-label{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.16em;color:#818cf8;margin-bottom:12px;display:block}
  .lp-sec-title{font-size:clamp(26px,4vw,44px);font-weight:800;letter-spacing:-1.2px;line-height:1.08;color:#f8fafc;margin-bottom:14px}
  .lp-sec-sub{font-size:15px;color:#94a3b8;line-height:1.7;max-width:540px}
  .lp-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:100px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.24);font-size:12px;font-weight:600;color:#a5b4fc;margin-bottom:20px}

  /* MISC */
  .lp-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;animation:lp-orb 6s ease infinite}
  .lp-grid{background-image:linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px);background-size:60px 60px}
  .lp-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,.18),transparent);max-width:900px;margin:0 auto}
  .lp-step-line{position:absolute;top:22px;left:calc(50% + 42px);width:calc(100% - 84px);height:1px;background:linear-gradient(90deg,rgba(99,102,241,.4),rgba(99,102,241,.08))}
  .lp-price-popular{border-color:rgba(99,102,241,.5)!important;background:rgba(79,70,229,.08)!important}
  .lp-popular-tag{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:11px;font-weight:700;padding:3px 14px;border-radius:0 0 8px 8px;letter-spacing:.04em;white-space:nowrap}
  .lp-typewriter-cursor{display:inline-block;width:3px;height:.82em;background:#818cf8;margin-left:2px;vertical-align:middle;border-radius:1px;animation:lp-cursor .85s ease infinite}

  /* AI SECTION */
  .lp-ai-card{background:rgba(15,10,30,.8);border:1px solid rgba(168,85,247,.18);border-radius:14px;backdrop-filter:blur(10px);transition:all .28s;position:relative;overflow:hidden}
  .lp-ai-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(168,85,247,.05),transparent 60%);pointer-events:none}
  .lp-ai-card:hover{border-color:rgba(168,85,247,.45);transform:translateY(-4px);box-shadow:0 24px 60px rgba(109,40,217,.22),0 0 0 1px rgba(168,85,247,.15)}
  .lp-ai-grad{background:linear-gradient(135deg,#c084fc 0%,#a855f7 40%,#7c3aed 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .lp-ai-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 13px;border-radius:100px;background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.3);font-size:11.5px;font-weight:600;color:#c084fc}
  .lp-provider-pill{display:inline-flex;align-items:center;gap:7px;padding:8px 18px;border-radius:100px;font-size:13px;font-weight:700;transition:all .22s;cursor:default}
  .lp-provider-pill:hover{transform:translateY(-2px)}
  .lp-ai-scan-line{position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(168,85,247,.6),transparent);animation:lp-ai-scan 3s linear infinite;pointer-events:none}

  /* SCROLLBAR */
  .lp::-webkit-scrollbar{width:4px}.lp::-webkit-scrollbar-thumb{background:rgba(99,102,241,.4);border-radius:10px}

  /* RESPONSIVE */
  @media(max-width:900px){
    .lp-hide-mob{display:none!important}
    .lp-hero-flex{flex-direction:column!important;gap:40px!important}
    .lp-feat-grid{grid-template-columns:1fr 1fr!important}
    .lp-price-grid{grid-template-columns:1fr!important}
    .lp-step-grid{grid-template-columns:1fr!important}
    .lp-step-line{display:none!important}
    .lp-footer-grid{grid-template-columns:1fr 1fr!important}
    .lp-stats-grid{grid-template-columns:repeat(3,1fr)!important}
    .lp-testi-grid{grid-template-columns:1fr!important}
    .lp-activity{display:none}
    .lp-code-flex{flex-direction:column!important}
    .lp-flow-flex{flex-direction:column!important}
    .lp-ai-grid{grid-template-columns:1fr!important}
  }
  @media(max-width:600px){
    .lp-feat-grid{grid-template-columns:1fr!important}
    .lp-stats-grid{grid-template-columns:1fr 1fr!important}
    .lp-footer-grid{grid-template-columns:1fr!important}
  }
`;

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useTypewriter(phrases: string[], typingMs = 55, deletingMs = 26, pauseMs = 2600) {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const pauseRef = useRef(false);

  useEffect(() => {
    if (pauseRef.current) return;
    const current = phrases[idx];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < current.length) {
      timer = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), typingMs);
    } else if (!deleting && displayed.length === current.length) {
      pauseRef.current = true;
      timer = setTimeout(() => { pauseRef.current = false; setDeleting(true); }, pauseMs);
    } else if (deleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), deletingMs);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((idx + 1) % phrases.length);
    }
    return () => clearTimeout(timer);
  }, [displayed, deleting, idx, phrases, typingMs, deletingMs, pauseMs]);

  return displayed;
}

function useInView(ref: { current: Element | null }, threshold = 0.18): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function useCountUp(target: number, duration = 1800, active = false): number {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return val;
}

// ─── PARTICLES ───────────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;
    const resize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w; canvas.height = h;
    };
    resize();

    const N = 75, DIST = 125;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .32, vy: (Math.random() - .5) * .32,
      r: Math.random() * 1.4 + .5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < DIST) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${.11 * (1 - d / DIST)})`;
            ctx.lineWidth = .6;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(129,140,248,.4)';
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

// ─── TILT WRAPPER ────────────────────────────────────────────────────────────
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    setTilt({ x: dy * -7, y: dx * 7 });
    setGlare({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const onLeave = () => { setTilt({ x: 0, y: 0 }); setGlare({ x: 50, y: 50 }); };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform .12s ease', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,.055) 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 10, borderRadius: 14 }} />
      {children}
    </div>
  );
}

// ─── GLOW CARD ───────────────────────────────────────────────────────────────
function GlowCard({ children, color = '#6366f1', style = {} }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };
  return (
    <div ref={ref} className="lp-glow-card" style={style} onMouseMove={onMove} onMouseLeave={() => setPos(null)}>
      {pos && (
        <div style={{ position: 'absolute', left: pos.x, top: pos.y, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle at center,${color}22,transparent 68%)`, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 0, transition: 'opacity .25s' }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: .12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`lp-reveal ${vis ? 'lp-revealed' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── LIVE TERMINAL ───────────────────────────────────────────────────────────
const ALL_EVENTS = [
  { type: 'payment.success',      status: 'delivered', ms: 42,   color: '#4ade80', id: 'evt_8Kx2mN' },
  { type: 'order.created',        status: 'delivered', ms: 67,   color: '#4ade80', id: 'evt_9Lm4pR' },
  { type: 'subscription.renewed', status: 'delivered', ms: 38,   color: '#4ade80', id: 'evt_2Np7qT' },
  { type: 'user.signup',          status: 'retrying',  ms: 503,  color: '#fbbf24', id: 'evt_4Qq1sW' },
  { type: 'invoice.paid',         status: 'delivered', ms: 51,   color: '#4ade80', id: 'evt_7Rr9vX' },
  { type: 'refund.initiated',     status: 'delivered', ms: 44,   color: '#4ade80', id: 'evt_3Ss5uY' },
  { type: 'checkout.completed',   status: 'delivered', ms: 29,   color: '#4ade80', id: 'evt_1Tt3wZ' },
];

function LiveTerminal() {
  const [count, setCount] = useState(3);
  const [clock, setClock] = useState('');
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setClock(fmt());
    const t1 = setInterval(() => setClock(fmt()), 1000);
    const t2 = setInterval(() => setCount(v => v >= ALL_EVENTS.length ? 3 : v + 1), 1650);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <div className="lp-terminal" style={{ animation: 'lp-float2 7s ease-in-out infinite' }}>
      <div className="lp-tbar">
        <div className="lp-dot" style={{ background: '#f87171' }} />
        <div className="lp-dot" style={{ background: '#fbbf24' }} />
        <div className="lp-dot" style={{ background: '#4ade80' }} />
        <span style={{ marginLeft: 10, fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#475569' }}>webhook-delivery-log</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80', animation: 'lp-dot-blink 1.2s infinite' }} />
          <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: '#4ade80' }}>LIVE</span>
        </div>
      </div>
      <div style={{ padding: '4px 0' }}>
        {ALL_EVENTS.slice(0, count).map((ev, i) => (
          <div key={i} className="lp-erow" style={{ animationDelay: `${i * .08}s` }}>
            <span style={{ color: '#1e293b', fontSize: 10, flexShrink: 0 }}>{ev.id}</span>
            <span style={{ color: '#38bdf8', flexShrink: 0, fontSize: 10 }}>{clock}</span>
            <span style={{ color: '#e2e8f0', flex: 1 }}>{ev.type}</span>
            <span style={{ padding: '2px 8px', borderRadius: 4, background: `${ev.color}18`, color: ev.color, fontSize: 10, flexShrink: 0 }}>{ev.status}</span>
            <span style={{ color: '#334155', flexShrink: 0 }}>{ev.ms}ms</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid rgba(99,102,241,.1)', padding: '10px 14px', gap: 22, background: 'rgba(6,10,22,.8)' }}>
        {[['247,891', 'Delivered', '#4ade80'], ['3', 'Failed', '#f87171'], ['68ms', 'Latency', '#38bdf8'], ['99.99%', 'Uptime', '#a78bfa']].map(([v, l, c]) => (
          <div key={l as string} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 13, fontWeight: 700, color: c as string }}>{v}</span>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 8, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '.06em' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── WEBHOOK FLOW DIAGRAM ────────────────────────────────────────────────────
function WebhookFlowDiagram() {
  const sources = [
    { label: 'payment', sub: '.success', y: 55, color: '#4ade80' },
    { label: 'order', sub: '.created', y: 155, color: '#fbbf24' },
    { label: 'user', sub: '.signup', y: 255, color: '#c084fc' },
  ];
  const dests = [
    { label: 'ep_prod', sub: '_01 → 200', y: 55, color: '#38bdf8' },
    { label: 'ep_prod', sub: '_02 → 200', y: 155, color: '#38bdf8' },
    { label: 'ep_prod', sub: '_03 → 200', y: 255, color: '#38bdf8' },
  ];
  const paths = [
    { id: 'fp1', d: 'M 90 55 C 165 55 175 155 240 155', fromColor: '#4ade80' },
    { id: 'fp2', d: 'M 90 155 C 165 155 175 155 240 155', fromColor: '#fbbf24' },
    { id: 'fp3', d: 'M 90 255 C 165 255 175 155 240 155', fromColor: '#c084fc' },
    { id: 'fp4', d: 'M 290 155 C 335 155 345 55 400 55', fromColor: '#38bdf8' },
    { id: 'fp5', d: 'M 290 155 C 335 155 345 155 400 155', fromColor: '#38bdf8' },
    { id: 'fp6', d: 'M 290 155 C 335 155 345 255 400 255', fromColor: '#38bdf8' },
  ];

  return (
    <div className="lp-flow-wrap">
      <svg viewBox="0 0 500 310" style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}>
        <defs>
          {paths.map(p => <path key={p.id} id={p.id} d={p.d} fill="none" />)}
          <filter id="ff-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Path lines */}
        {paths.slice(0, 3).map(p => (
          <use key={p.id} href={`#${p.id}`} stroke="rgba(99,102,241,.18)" strokeWidth="1.5" strokeDasharray="5 4" />
        ))}
        {paths.slice(3).map(p => (
          <use key={p.id} href={`#${p.id}`} stroke="rgba(56,189,248,.18)" strokeWidth="1.5" strokeDasharray="5 4" />
        ))}

        {/* Animated dots - left side */}
        {[{ id: 'fp1', delay: '0s', fill: '#4ade80' }, { id: 'fp2', delay: '.9s', fill: '#fbbf24' }, { id: 'fp3', delay: '1.8s', fill: '#c084fc' }].map((d, i) => (
          <circle key={i} r="4" fill={d.fill} filter="url(#ff-glow)">
            {/* @ts-ignore */}
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={d.delay}><mpath href={`#${d.id}`} /></animateMotion>
          </circle>
        ))}

        {/* Animated dots - right side */}
        {[{ id: 'fp4', delay: '.3s' }, { id: 'fp5', delay: '1.1s' }, { id: 'fp6', delay: '1.9s' }].map((d, i) => (
          <circle key={i + 10} r="4" fill="#38bdf8" filter="url(#ff-glow)">
            {/* @ts-ignore */}
            <animateMotion dur="2.2s" repeatCount="indefinite" begin={d.delay}><mpath href={`#${d.id}`} /></animateMotion>
          </circle>
        ))}

        {/* Source nodes */}
        {sources.map(s => (
          <g key={s.label}>
            <rect x="8" y={s.y - 20} width="78" height="40" rx="9" fill={`${s.color}12`} stroke={`${s.color}35`} strokeWidth="1.2" />
            <text x="47" y={s.y - 5} textAnchor="middle" fill={s.color} fontSize="8.5" fontFamily="JetBrains Mono,monospace" fontWeight="700">{s.label}</text>
            <text x="47" y={s.y + 8} textAnchor="middle" fill={s.color} fontSize="8" fontFamily="JetBrains Mono,monospace" opacity=".65">{s.sub}</text>
          </g>
        ))}

        {/* Central node */}
        <rect x="238" y="125" width="54" height="60" rx="12" fill="rgba(79,70,229,.18)" stroke="rgba(99,102,241,.55)" strokeWidth="1.5" />
        <text x="265" y="151" textAnchor="middle" fill="#818cf8" fontSize="9.5" fontFamily="JetBrains Mono,monospace" fontWeight="800">WHK</text>
        <text x="265" y="165" textAnchor="middle" fill="#818cf8" fontSize="9" fontFamily="JetBrains Mono,monospace" fontWeight="600">OS</text>
        <circle cx="265" cy="155" r="26" fill="none" stroke="rgba(99,102,241,.2)" strokeWidth="1" strokeDasharray="3 3">
          <animateTransform attributeName="transform" type="rotate" from="0 265 155" to="360 265 155" dur="14s" repeatCount="indefinite" />
        </circle>
        <circle cx="265" cy="155" r="34" fill="none" stroke="rgba(99,102,241,.08)" strokeWidth="1">
          <animateTransform attributeName="transform" type="rotate" from="360 265 155" to="0 265 155" dur="20s" repeatCount="indefinite" />
        </circle>

        {/* Destination nodes */}
        {dests.map(d => (
          <g key={d.label + d.y}>
            <rect x="398" y={d.y - 20} width="82" height="40" rx="9" fill="rgba(56,189,248,.08)" stroke="rgba(56,189,248,.28)" strokeWidth="1.2" />
            <text x="439" y={d.y - 5} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontFamily="JetBrains Mono,monospace" fontWeight="700">{d.label}</text>
            <text x="439" y={d.y + 8} textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="JetBrains Mono,monospace" opacity=".6">{d.sub}</text>
          </g>
        ))}

        {/* Labels */}
        <text x="265" y="302" textAnchor="middle" fill="rgba(99,102,241,.4)" fontSize="9" fontFamily="JetBrains Mono,monospace">HMAC signed · retried · logged</text>
      </svg>
    </div>
  );
}

// ─── CODE TABS ───────────────────────────────────────────────────────────────
const LANGS = ['Node.js', 'Python', 'Go', 'PHP'] as const;
type Lang = typeof LANGS[number];

const CODES: Record<Lang, React.ReactNode> = {
  'Node.js': (
    <pre><span className="lp-kw">const</span> client = <span className="lp-kw">new</span> <span className="lp-fn">WebhookOS</span>{'({'} apiKey: process.env.<span className="lp-prop">WEBHOOKOS_KEY</span> {'}'});{'\n\n'}<span className="lp-cm">{'// Fire-and-forget — retries, signing, DLQ all handled'}</span>{'\n'}<span className="lp-kw">await</span> client.events.<span className="lp-fn">send</span>({'({'}{'\n'}{'  '}eventType: <span className="lp-str">'payment.success'</span>,{'\n'}{'  '}payload: {'{'} amount: <span className="lp-num">4999</span>, currency: <span className="lp-str">'INR'</span> {'}'},{'  '}{'\n'}{'  '}endpoints: [<span className="lp-str">'ep_prod_01'</span>],{'\n'}{'}'});</pre>
  ),
  Python: (
    <pre><span className="lp-kw">import</span> webhookos{'\n\n'}client = webhookos.<span className="lp-fn">Client</span>(api_key=os.environ[<span className="lp-str">"WEBHOOKOS_KEY"</span>]){'\n\n'}<span className="lp-cm">{'# Fire-and-forget — retries, signing, DLQ all handled'}</span>{'\n'}client.events.<span className="lp-fn">send</span>({'\n'}    event_type=<span className="lp-str">"payment.success"</span>,{'\n'}    payload={'{'}<span className="lp-str">"amount"</span>: <span className="lp-num">4999</span>, <span className="lp-str">"currency"</span>: <span className="lp-str">"INR"</span>{'}'},{'  '}{'\n'}    endpoints=[<span className="lp-str">"ep_prod_01"</span>],{'\n'})</pre>
  ),
  Go: (
    <pre>client := webhookos.<span className="lp-fn">NewClient</span>(webhookos.<span className="lp-fn">WithAPIKey</span>(os.<span className="lp-fn">Getenv</span>(<span className="lp-str">"WEBHOOKOS_KEY"</span>))){'\n\n'}<span className="lp-cm">{'// Fire-and-forget — retries, signing, DLQ all handled'}</span>{'\n'}_, err := client.Events.<span className="lp-fn">Send</span>(ctx, &webhookos.EventParams{'{'}{'\n'}{'    '}EventType: <span className="lp-str">"payment.success"</span>,{'\n'}{'    '}Payload:   <span className="lp-kw">map</span>[<span className="lp-kw">string</span>]<span className="lp-kw">any</span>{'{'}<span className="lp-str">"amount"</span>: <span className="lp-num">4999</span>, <span className="lp-str">"currency"</span>: <span className="lp-str">"INR"</span>{'}'},{'  '}{'\n'}{'    '}Endpoints: []<span className="lp-kw">string</span>{'{'}<span className="lp-str">"ep_prod_01"</span>{'}'},{'  '}{'\n'}{'}'})</pre>
  ),
  PHP: (
    <pre>$client = <span className="lp-kw">new</span> WebhookOS\<span className="lp-fn">Client</span>([<span className="lp-str">'api_key'</span> =&gt; $_ENV[<span className="lp-str">'WEBHOOKOS_KEY'</span>]]);{'\n\n'}<span className="lp-cm">{'// Fire-and-forget — retries, signing, DLQ all handled'}</span>{'\n'}$client-&gt;events-&gt;<span className="lp-fn">send</span>([{'\n'}{'    '}<span className="lp-str">'event_type'</span> =&gt; <span className="lp-str">'payment.success'</span>,{'\n'}{'    '}<span className="lp-str">'payload'</span>    =&gt; [<span className="lp-str">'amount'</span> =&gt; <span className="lp-num">4999</span>, <span className="lp-str">'currency'</span> =&gt; <span className="lp-str">'INR'</span>],{'\n'}{'    '}<span className="lp-str">'endpoints'</span>  =&gt; [<span className="lp-str">'ep_prod_01'</span>],{'\n'}]);</pre>
  ),
};

function CodeTabs() {
  const [active, setActive] = useState<Lang>('Node.js');
  return (
    <div className="lp-code-wrap">
      <div className="lp-code-tabbar">
        {LANGS.map(l => (
          <button key={l} className={`lp-code-tab ${active === l ? 'lp-tab-active' : ''}`} onClick={() => setActive(l)}>{l}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 14, gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
          <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color: '#334155' }}>SDK v2.4.1</span>
        </div>
      </div>
      <div className="lp-code-body">{CODES[active]}</div>
    </div>
  );
}

// ─── ACTIVITY FEED ───────────────────────────────────────────────────────────
const FEED = [
  { icon: '⚡', text: 'payment.success → ep_prod_01', sub: '42ms · delivered', color: '#4ade80' },
  { icon: '🔄', text: 'user.signup retrying · attempt 2/5', sub: '503ms → backoff 2s', color: '#fbbf24' },
  { icon: '🛡️', text: 'HMAC verified · ep_prod_03', sub: '18ms · signature ok', color: '#818cf8' },
  { icon: '📊', text: '1,247 events delivered this hour', sub: '100% success rate', color: '#38bdf8' },
  { icon: '🔒', text: 'PII detected & masked in payload', sub: 'AI scanner · email field', color: '#fb923c' },
  { icon: '♻️', text: 'DLQ replay: 23 events restored', sub: 'just now · all delivered', color: '#a78bfa' },
];

function ActivityFeed() {
  const [item, setItem] = useState<typeof FEED[0] | null>(null);
  const [phase, setPhase] = useState<'in' | 'out' | 'idle'>('idle');
  const idxRef = useRef(0);

  useEffect(() => {
    const start = setTimeout(() => {
      setItem(FEED[0]); setPhase('in');
    }, 4000);
    return () => clearTimeout(start);
  }, []);

  useEffect(() => {
    if (!item || phase === 'idle') return;
    if (phase === 'in') {
      const t = setTimeout(() => setPhase('out'), 4500);
      return () => clearTimeout(t);
    }
    if (phase === 'out') {
      const t = setTimeout(() => {
        idxRef.current = (idxRef.current + 1) % FEED.length;
        setItem(FEED[idxRef.current]);
        setPhase('in');
      }, 400);
      return () => clearTimeout(t);
    }
  }, [item, phase]);

  if (!item) return null;
  return (
    <div className="lp-activity">
      <div className={`lp-act-item ${phase === 'in' ? 'lp-act-entering' : phase === 'out' ? 'lp-act-leaving' : ''}`}>
        <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4, marginBottom: 3 }}>{item.text}</div>
          <div style={{ fontSize: 10, color: item.color, fontFamily: 'JetBrains Mono,monospace' }}>{item.sub}</div>
        </div>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0, boxShadow: `0 0 6px ${item.color}` }} />
      </div>
    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <nav className={`lp-nav ${scrolled ? 'lp-nav-on' : ''}`}>
      <div className="lp-wrap" style={{ height: 64, display: 'flex', alignItems: 'center', gap: 28 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(79,70,229,.5)' }}>
            <Activity size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#f8fafc', letterSpacing: '-.3px' }}>WebhookOS</span>
        </Link>
        <div className="lp-hide-mob" style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, marginLeft: 8 }}>
          {[['Features', '#features'], ['AI', '#ai'], ['Pricing', '#pricing'], ['Docs', '#']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 13.5, fontWeight: 500, color: '#64748b', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f8fafc'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}>{l}</a>
          ))}
        </div>
        <div className="lp-hide-mob" style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <Link href="/auth/login" className="lp-btn-ghost-sm">Sign In</Link>
          <Link href="/auth/register" className="lp-btn-sm">Start Free <ArrowRight size={12} /></Link>
        </div>
        <button onClick={() => setMob(!mob)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: 'auto', padding: 4 }}>
          {mob ? <X size={20} /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>}
        </button>
      </div>
      {mob && (
        <div style={{ background: 'rgba(2,8,23,.97)', borderTop: '1px solid rgba(99,102,241,.1)', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[['Features', '#features'], ['AI', '#ai'], ['Pricing', '#pricing'], ['Docs', '#']].map(([l, h]) => (
            <a key={l} href={h} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 15 }} onClick={() => setMob(false)}>{l}</a>
          ))}
          <Link href="/auth/login" style={{ color: '#a5b4fc', textDecoration: 'none', fontSize: 15 }}>Sign In</Link>
          <Link href="/auth/register" className="lp-btn-pri" style={{ justifyContent: 'center' }}>Start Free</Link>
        </div>
      )}
    </nav>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────────
const TYPEWRITER_PHRASES = [
  'never fails.',
  'scales with you.',
  'signs every payload.',
  'retries automatically.',
  'debugs itself with AI.',
];

function Hero() {
  const tagline = useTypewriter(TYPEWRITER_PHRASES);
  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      {/* Gradient mesh */}
      <div className="lp-mesh" />
      {/* Particle network */}
      <ParticleCanvas />
      {/* Grid */}
      <div className="lp-grid" style={{ position: 'absolute', inset: 0, opacity: .5 }} />
      {/* Orbs */}
      <div className="lp-orb" style={{ width: 560, height: 560, background: 'radial-gradient(circle,rgba(79,70,229,.2),transparent 70%)', top: -100, left: -120, animationDuration: '7s' }} />
      <div className="lp-orb" style={{ width: 440, height: 440, background: 'radial-gradient(circle,rgba(139,92,246,.13),transparent 70%)', bottom: -80, right: -60, animationDuration: '9s', animationDelay: '2s' }} />
      <div className="lp-orb" style={{ width: 260, height: 260, background: 'radial-gradient(circle,rgba(56,189,248,.08),transparent 70%)', top: '44%', right: '30%', animationDuration: '11s', animationDelay: '1s' }} />
      <div style={{ position: 'absolute', top: '48%', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,.12),transparent)', pointerEvents: 'none' }} />

      <div className="lp-wrap" style={{ width: '100%', paddingTop: 120, paddingBottom: 80, position: 'relative', zIndex: 1 }}>
        <div className="lp-hero-flex" style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
          {/* Left */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }} className="lp-au0">
              <div className="lp-badge"><Sparkles size={12} />Trusted by 1,200+ engineering teams</div>
              <div className="lp-ai-badge"><Brain size={12} />AI-Powered · DeepSeek V3 &amp; Gemini 2.0</div>
            </div>
            <h1 className="lp-au1" style={{ fontSize: 'clamp(34px,5.5vw,66px)', fontWeight: 900, letterSpacing: '-2.5px', lineHeight: 1.04, marginBottom: 20 }}>
              <span className="lp-grad-text">Webhook delivery</span><br />
              <span style={{ color: '#f8fafc' }}>infrastructure that</span><br />
              <span style={{ color: '#f8fafc' }}>
                {tagline}
                <span className="lp-typewriter-cursor" />
              </span>
            </h1>
            <p className="lp-au2" style={{ fontSize: 16.5, color: '#94a3b8', lineHeight: 1.75, maxWidth: 470, marginBottom: 18 }}>
              Production-grade webhook delivery — 5-layer retry, HMAC signing, real-time analytics, and dead letter queue. Built for scale, priced for startups.
            </p>
            <div className="lp-au2" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(168,85,247,.07)', border: '1px solid rgba(168,85,247,.2)', marginBottom: 28, maxWidth: 470 }}>
              <Sparkles size={14} color="#a855f7" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#c084fc', lineHeight: 1.5 }}>New: AI Debugger, Schema Generator, DLQ Triage &amp; PII Detector — all in your dashboard.</span>
            </div>
            <div className="lp-au3" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 40 }}>
              <Link href="/auth/register" className="lp-btn-pri" style={{ fontSize: 15, padding: '14px 32px' }}>Start for Free <ArrowRight size={16} /></Link>
              <a href="#features" className="lp-btn-out" style={{ fontSize: 15, padding: '14px 32px' }}>See how it works</a>
            </div>
            <div className="lp-au4" style={{ display: 'flex', flexWrap: 'wrap', gap: 22 }}>
              {['No credit card required', 'Free plan forever', 'Setup in 5 minutes'].map(l => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569' }}>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>✓</span>{l}
                </span>
              ))}
            </div>
          </div>
          {/* Right — tilt card + terminal */}
          <div style={{ flex: 1, minWidth: 0, maxWidth: 460 }}>
            <TiltCard><LiveTerminal /></TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TICKER BAR ───────────────────────────────────────────────────────────────
const LOGOS = ['Stripe', 'Razorpay', 'Shopify', 'Twilio', 'Vercel', 'PostHog', 'Lemon Squeezy', 'Paddle', 'Chargebee', 'Braintree', 'Adyen', 'Mollie'];

function TickerBar() {
  const all = [...LOGOS, ...LOGOS];
  return (
    <div className="lp-ticker-wrap">
      <div className="lp-ticker-track">
        {all.map((name, i) => (
          <span key={i} className="lp-ticker-item">
            <span className="lp-ticker-sep">✦</span>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── STATS WITH COUNT-UP ─────────────────────────────────────────────────────
const STAT_ITEMS = [
  { target: 2347891, fmt: (v: number) => `${(v / 1000000).toFixed(1)}M+`, label: 'Events Delivered', color: '#4ade80' },
  { target: 80, fmt: (v: number) => `<${v}ms`, label: 'Avg Latency', color: '#38bdf8' },
  { target: 9999, fmt: (v: number) => `${(v / 100).toFixed(2)}%`, label: 'Uptime SLA', color: '#a78bfa' },
  { target: 1200, fmt: (v: number) => `${v.toLocaleString()}+`, label: 'Engineering Teams', color: '#fb923c' },
  { target: 5, fmt: (v: number) => `${v}×`, label: 'Retry Layers', color: '#f472b6' },
];

function StatCard({ target, fmt, label, color, delay }: { target: number; fmt: (v: number) => string; label: string; color: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const val = useCountUp(target, 1900, inView);
  return (
    <div ref={ref} className="lp-card" style={{ padding: '22px 16px', textAlign: 'center', animation: `lp-count-in .5s ${delay}ms ease both` }}>
      <div style={{ fontSize: 'clamp(20px,2.5vw,32px)', fontWeight: 900, color, letterSpacing: '-1px', marginBottom: 5 }}>{fmt(val)}</div>
      <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 9.5, color: '#334155', textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</div>
    </div>
  );
}

function Stats() {
  return (
    <section style={{ padding: '56px 0' }}>
      <div className="lp-wrap">
        <div className="lp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
          {STAT_ITEMS.map((s, i) => <StatCard key={s.label} {...s} delay={i * 70} />)}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES WITH GLOW CARDS ────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap, color: '#fbbf24', title: 'Guaranteed Delivery', desc: '5-level exponential retry. Every webhook delivered or moved to Dead Letter Queue for one-click replay.' },
  { icon: Shield, color: '#4ade80', title: 'HMAC-SHA256 Signing', desc: 'Every payload signed with your secret. Verify authenticity with our SDK or your own 10-line implementation.' },
  { icon: BarChart3, color: '#818cf8', title: 'Real-time Analytics', desc: 'Delivery rates, latency histograms, event type breakdown — live in your dashboard, zero config.' },
  { icon: RefreshCw, color: '#f87171', title: 'Dead Letter Queue', desc: 'Failed events captured automatically. Full request/response audit trail. Replay any event with one click.' },
  { icon: Code2, color: '#38bdf8', title: 'Payload Transformations', desc: 'Modify, filter, or enrich payloads with JavaScript before delivery. Powerful and sandboxed.' },
  { icon: Layers, color: '#fb923c', title: 'Circuit Breaker', desc: 'Auto endpoint protection when failure rate spikes. Self-heals on recovery. Zero manual intervention.' },
];

function Features() {
  return (
    <section id="features" style={{ padding: '88px 0' }}>
      <div className="lp-wrap">
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="lp-sec-label" style={{ textAlign: 'center' }}>// CAPABILITIES</span>
            <h2 className="lp-sec-title" style={{ textAlign: 'center', margin: '0 auto 14px' }}>Everything you need for<br /><span className="lp-grad-text">reliable webhook delivery</span></h2>
            <p className="lp-sec-sub" style={{ margin: '0 auto', textAlign: 'center' }}>Built by developers who got tired of writing the same retry logic over and over.</p>
          </div>
        </Reveal>
        <div className="lp-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
            <Reveal key={title} delay={i * 80}>
              <GlowCard color={color} style={{ padding: '26px 22px', height: '100%' }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: `${color}14`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 0 18px ${color}14` }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>{desc}</div>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CODE SECTION ────────────────────────────────────────────────────────────
function CodeSection() {
  return (
    <section style={{ padding: '80px 0', background: 'rgba(5,10,22,.7)' }}>
      <div className="lp-wrap">
        <div className="lp-code-flex" style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
          <Reveal style={{ flex: 1, minWidth: 0 }}>
            <span className="lp-sec-label">// DEVELOPER EXPERIENCE</span>
            <h2 className="lp-sec-title">Ship in any language,<br /><span className="lp-grad-text">in minutes.</span></h2>
            <p className="lp-sec-sub" style={{ marginBottom: 28 }}>Official SDKs for every major language. One API call is all it takes — we handle signing, retries, DLQ, and observability automatically.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📦', text: 'Official SDKs: Node.js, Python, Go, PHP, Ruby' },
                { icon: '🔑', text: 'One API key — works across all environments' },
                { icon: '🚀', text: 'Zero-config retry, signing & DLQ out of the box' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#94a3b8' }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>{text}
                </div>
              ))}
            </div>
          </Reveal>
          <div style={{ flex: 1, minWidth: 0, maxWidth: 520 }}>
            <Reveal delay={120}><CodeTabs /></Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FLOW SECTION ─────────────────────────────────────────────────────────────
function FlowSection() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="lp-wrap">
        <div className="lp-flow-flex" style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
          <div style={{ flex: 1, minWidth: 0, maxWidth: 520 }}>
            <Reveal><WebhookFlowDiagram /></Reveal>
          </div>
          <Reveal delay={100} style={{ flex: 1, minWidth: 0 }}>
            <span className="lp-sec-label">// HOW DELIVERY WORKS</span>
            <h2 className="lp-sec-title">From event to endpoint,<br /><span className="lp-grad-text">guaranteed.</span></h2>
            <p className="lp-sec-sub" style={{ marginBottom: 28 }}>Every event you fire travels through a hardened pipeline — signed, queued, delivered, verified, and automatically retried if anything goes wrong.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { step: '01', title: 'Sign', desc: 'Payload HMAC-SHA256 signed with your secret key', color: '#4ade80' },
                { step: '02', title: 'Queue & Dispatch', desc: 'WebhookOS durably queues and fires to your endpoint', color: '#818cf8' },
                { step: '03', title: 'Verify & Retry', desc: '5-layer exponential backoff on failures, DLQ for persistents', color: '#38bdf8' },
                { step: '04', title: 'Observe', desc: 'Full delivery log, latency, and AI triage in real time', color: '#fb923c' },
              ].map(({ step, title, desc, color }) => (
                <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}16`, border: `1px solid ${color}32`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color, fontWeight: 700 }}>{step}</div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── AI SECTION ──────────────────────────────────────────────────────────────
const AI_FEATURES = [
  { icon: Brain, title: 'AI Webhook Debugger', desc: 'Ask plain-English questions about your delivery failures. Get root-cause analysis, severity ratings, and one-click event replay.', bullets: ['Natural language Q&A', 'Severity classification', 'Suggested fixes with copy', 'Pre-filtered by endpoint / event type'], badge: 'On Events, DLQ & Endpoints', color: '#a855f7' },
  { icon: FileJson, title: 'AI Schema Generator', desc: 'Paste any raw JSON payload and get a complete, production-ready event schema — name, description, tags, and full JSON Schema — in seconds.', bullets: ['2-step wizard UI', 'Suggests name, version & tags', 'Generates valid JSON Schema', 'One-click save to Event Catalog'], badge: 'On Event Types page', color: '#38bdf8' },
  { icon: Wand2, title: 'Smart DLQ Triage', desc: 'Stop staring at raw error lists. AI groups your dead-letter events by failure pattern, estimates recovery rates, and identifies quick wins.', bullets: ['Groups failures by root cause', 'Recovery rate progress bar', 'Per-group replay buttons', 'Fix commands & quick wins'], badge: 'On Dead Letter Queue', color: '#fb923c' },
  { icon: SearchX, title: 'PII Auto-Detector', desc: 'Automatically scan any payload for personally identifiable information — email, phone, SSN, auth tokens and more — with confidence scoring.', bullets: ['20+ PII field types detected', 'High/medium/low confidence', 'One-click masking to endpoint', 'Standalone scanner in Settings'], badge: 'On Endpoints & Settings', color: '#4ade80' },
];
const AI_PROVIDERS = [
  { name: 'DeepSeek V3', desc: 'Ultra-fast reasoning model', dot: '#38bdf8', ring: 'rgba(56,189,248,.25)' },
  { name: 'Gemini 2.0 Flash', desc: 'Google multimodal AI', dot: '#4ade80', ring: 'rgba(74,222,128,.25)' },
];

function AiSection() {
  return (
    <section id="ai" style={{ padding: '96px 0', background: 'rgba(6,5,18,.95)', position: 'relative', overflow: 'hidden' }}>
      <div className="lp-orb" style={{ width: 700, height: 700, background: 'radial-gradient(circle,rgba(109,40,217,.14),transparent 65%)', top: -200, left: -200, animationDuration: '8s' }} />
      <div className="lp-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(168,85,247,.1),transparent 65%)', bottom: -150, right: -100, animationDuration: '10s', animationDelay: '2s' }} />
      <div className="lp-grid" style={{ position: 'absolute', inset: 0, opacity: .35 }} />
      <div className="lp-wrap" style={{ position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 100, background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.28)', marginBottom: 18 }}>
              <Sparkles size={13} color="#a855f7" />
              <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.14em', color: '#a855f7' }}>AI-Powered Intelligence</span>
            </div>
            <h2 className="lp-sec-title" style={{ textAlign: 'center', margin: '0 auto 16px' }}>Your webhook platform,<br /><span className="lp-ai-grad">now thinks for itself.</span></h2>
            <p className="lp-sec-sub" style={{ textAlign: 'center', margin: '0 auto 32px' }}>Four AI features built directly into your dashboard. Debug, generate, triage, and detect — all in natural language.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#334155', textTransform: 'uppercase', letterSpacing: '.1em' }}>Powered by</span>
              {AI_PROVIDERS.map(p => (
                <div key={p.name} className="lp-provider-pill" style={{ background: 'rgba(0,0,0,.35)', border: `1px solid ${p.ring}`, color: '#f1f5f9' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.dot, boxShadow: `0 0 7px ${p.dot}`, animation: 'lp-ai-pulse 2s infinite' }} />
                  <span>{p.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#334155' }}>{p.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <div className="lp-ai-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
          {AI_FEATURES.map(({ icon: Icon, title, desc, bullets, badge, color }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="lp-ai-card" style={{ padding: '28px 26px' }}>
                <div className="lp-ai-scan-line" />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: `${color}14`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 18px ${color}18` }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15.5, color: '#f1f5f9', marginBottom: 5, letterSpacing: '-.3px' }}>{title}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 5, background: `${color}12`, border: `1px solid ${color}22`, fontFamily: 'JetBrains Mono,monospace', fontSize: 9, color, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                      <ChevronRight size={9} />{badge}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, marginBottom: 16 }}>{desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {bullets.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#94a3b8' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 4px ${color}` }} />{b}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div style={{ marginTop: 48, textAlign: 'center', padding: '32px 40px', borderRadius: 16, background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.15)' }}>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 10 }}>// Works with your existing setup</div>
            <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.65, maxWidth: 560, margin: '0 auto' }}>All AI features are optional. Configure your preferred AI provider (DeepSeek or Gemini) in project settings — no code changes needed.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: '01', icon: Globe, color: '#818cf8', title: 'Create an Endpoint', desc: 'Add your server URL, pick event types, get a signing secret. Done in 30 seconds.' },
    { n: '02', icon: Globe, color: '#4ade80', title: 'Send Events via API', desc: 'POST to our API from any language. We queue, sign, and dispatch instantly.' },
    { n: '03', icon: BarChart3, color: '#38bdf8', title: 'Monitor & Replay', desc: 'Watch live delivery. Retry any failed event. Full audit trail included.' },
  ];
  return (
    <section style={{ padding: '88px 0', background: 'rgba(8,13,26,.6)' }}>
      <div className="lp-wrap">
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="lp-sec-label" style={{ display: 'block', textAlign: 'center' }}>// HOW IT WORKS</span>
            <h2 className="lp-sec-title" style={{ textAlign: 'center', margin: '0 auto' }}>Up and running in <span className="lp-grad-green">5 minutes</span></h2>
          </div>
        </Reveal>
        <div className="lp-step-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32, position: 'relative' }}>
          {steps.map(({ n, icon: Icon, color, title, desc }, i) => (
            <Reveal key={n} delay={i * 100}>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                {i < steps.length - 1 && <div className="lp-step-line" />}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${color}16`, border: `2px solid ${color}38`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', position: 'relative', zIndex: 1, boxShadow: `0 0 0 6px ${color}07` }}>
                  <Icon size={18} color={color} />
                </div>
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#1e293b', marginBottom: 8 }}>{n}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9', marginBottom: 9 }}>{title}</div>
                <div style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.65 }}>{desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ─────────────────────────────────────────────────────────────────
const PLANS = [
  { name: 'Starter', price: '$0', inr: '₹0/mo', popular: false, desc: 'For side projects & early testing.', features: ['10,000 events/month', '3 endpoints', '5-retry backoff', 'HMAC signing', 'Basic analytics', 'Community support'], cta: 'Start Free', href: '/auth/register' },
  { name: 'Pro', price: '$49', inr: '₹4,100/mo', popular: true, desc: 'For teams shipping to production.', features: ['500,000 events/month', 'Unlimited endpoints', 'Dead Letter Queue', 'Payload transformations', 'Advanced analytics', 'Priority email support'], cta: 'Start Pro Trial', href: '/auth/register' },
  { name: 'Business', price: '$199', inr: '₹16,600/mo', popular: false, desc: 'High-volume with SLA guarantees.', features: ['5M events/month', 'Everything in Pro', 'Circuit breaker', '99.99% uptime SLA', 'Custom integrations', 'Dedicated Slack support'], cta: 'Contact Sales', href: '/auth/register' },
];

function Pricing() {
  return (
    <section id="pricing" style={{ padding: '88px 0' }}>
      <div className="lp-wrap">
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="lp-sec-label" style={{ display: 'block', textAlign: 'center' }}>// PRICING</span>
            <h2 className="lp-sec-title" style={{ textAlign: 'center', margin: '0 auto 14px' }}>Simple pricing, <span className="lp-grad-text">no surprises</span></h2>
            <p className="lp-sec-sub" style={{ textAlign: 'center', margin: '0 auto' }}>Pay only for what you use. Upgrade or downgrade anytime.</p>
          </div>
        </Reveal>
        <div className="lp-price-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, alignItems: 'start' }}>
          {PLANS.map(({ name, price, inr, popular, desc, features, cta, href }, i) => (
            <Reveal key={name} delay={i * 90}>
              <div className={`lp-card ${popular ? 'lp-price-popular' : ''}`} style={{ padding: '32px 26px', position: 'relative', animation: popular ? 'lp-border-breathe 3s ease infinite' : undefined }}>
                {popular && <div className="lp-popular-tag">⚡ Most Popular</div>}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', marginBottom: 4 }}>{name}</div>
                  <div style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>{desc}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                    <span style={{ fontSize: 'clamp(30px,4vw,44px)', fontWeight: 900, color: '#f8fafc', letterSpacing: '-2px' }}>{price}</span>
                    <span style={{ fontSize: 14, color: '#334155' }}>/mo</span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#334155', marginTop: 2 }}>{inr}</div>
                </div>
                <Link href={href} className={popular ? 'lp-btn-pri' : 'lp-btn-out'} style={{ width: '100%', justifyContent: 'center', marginBottom: 22, fontSize: 13, padding: '11px 0', display: 'flex' }}>{cta}</Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: '#94a3b8' }}>
                      <div style={{ width: 16, height: 16, borderRadius: 5, background: 'rgba(129,140,248,.12)', border: '1px solid rgba(129,140,248,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={9} color="#818cf8" />
                      </div>{f}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
const TESTI = [
  { name: 'Priya Sharma', role: 'CTO @ Fintech Startup', text: 'Migrated from Svix in a day. Same features, 60% cheaper. The analytics dashboard is actually beautiful.', stars: 5 },
  { name: 'Raj Mehta', role: 'Lead Engineer @ SaaS Co.', text: 'The DLQ + one-click replay alone saved us 4 hours of on-call debugging. Worth every rupee.', stars: 5 },
  { name: 'Ananya Singh', role: 'Founder @ EduTech', text: 'Free plan gave us everything we needed to launch. Upgraded to Pro at scale. Zero friction.', stars: 5 },
];

function Testimonials() {
  return (
    <section style={{ padding: '88px 0', background: 'rgba(8,13,26,.6)' }}>
      <div className="lp-wrap">
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="lp-sec-label" style={{ display: 'block', textAlign: 'center' }}>// WHAT TEAMS SAY</span>
            <h2 className="lp-sec-title" style={{ textAlign: 'center', margin: '0 auto' }}>Loved by <span className="lp-grad-text">engineering teams</span></h2>
          </div>
        </Reveal>
        <div className="lp-testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {TESTI.map(({ name, role, text, stars }, i) => (
            <Reveal key={name} delay={i * 80}>
              <GlowCard color="#6366f1" style={{ padding: '24px 22px', height: '100%' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {Array(stars).fill(0).map((_, j) => <Star key={j} size={13} color="#fbbf24" fill="#fbbf24" />)}
                </div>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.7, marginBottom: 18 }}>"{text}"</p>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{name}</div>
                <div style={{ fontSize: 12, color: '#334155', marginTop: 2 }}>{role}</div>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA BANNER ──────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section style={{ padding: '88px 0' }}>
      <div className="lp-wrap">
        <Reveal>
          <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', padding: '64px 44px', textAlign: 'center', background: 'linear-gradient(135deg,rgba(79,70,229,.14),rgba(139,92,246,.09))', border: '1px solid rgba(99,102,241,.2)' }}>
            <div className="lp-orb" style={{ width: 280, height: 280, background: 'radial-gradient(circle,rgba(79,70,229,.28),transparent)', top: -70, left: -50, animationDuration: '5s' }} />
            <div className="lp-orb" style={{ width: 240, height: 240, background: 'radial-gradient(circle,rgba(139,92,246,.2),transparent)', bottom: -50, right: -30, animationDuration: '7s', animationDelay: '1s' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span className="lp-sec-label" style={{ display: 'block', textAlign: 'center' }}>// GET STARTED</span>
              <h2 style={{ fontSize: 'clamp(26px,4vw,50px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#f8fafc', marginBottom: 14 }}>Start delivering webhooks<br /><span className="lp-grad-text">reliably in minutes.</span></h2>
              <p style={{ fontSize: 15.5, color: '#94a3b8', margin: '0 auto 36px', maxWidth: 440 }}>Free plan, no credit card, production-grade from day one.</p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/auth/register" className="lp-btn-pri" style={{ fontSize: 16, padding: '15px 38px' }}>Create Free Account <ArrowRight size={17} /></Link>
                <Link href="/auth/login" className="lp-btn-out" style={{ fontSize: 15, padding: '15px 32px' }}>Sign In</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  const links: Record<string, string[]> = { 'Product': ['Features', 'Pricing', 'Changelog', 'Roadmap'], 'Developers': ['Documentation', 'API Reference', 'SDKs', 'Status'], 'Company': ['About', 'Blog', 'Careers', 'Contact'], 'Legal': ['Privacy', 'Terms', 'Security', 'Cookies'] };
  return (
    <footer style={{ borderTop: '1px solid rgba(99,102,241,.08)', padding: '64px 0 32px', background: 'rgba(2,8,20,.85)' }}>
      <div className="lp-wrap">
        <div className="lp-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 36, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(79,70,229,.4)' }}>
                <Activity size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#f8fafc' }}>WebhookOS</span>
            </div>
            <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, maxWidth: 210, marginBottom: 20 }}>Production-grade webhook delivery infrastructure. Built by Anujali Technologies.</p>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#1e293b' }}>© 2026 Anujali Technologies Pvt. Ltd.</div>
          </div>
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div style={{ fontWeight: 700, fontSize: 11.5, color: '#f1f5f9', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '.06em' }}>{section}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(item => (
                  <a key={item} href="#" style={{ fontSize: 13, color: '#334155', textDecoration: 'none', transition: 'color .15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#334155'}>{item}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="lp-divider" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#1e293b' }}>Developed and Designed by</span>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#4f46e5', fontWeight: 600 }}>Anuj Kumar</span>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#0f172a' }}>·</span>
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#1e293b' }}>Anujali Technologies Private Limited. All Rights Reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Twitter', 'GitHub', 'LinkedIn'].map(s => (
              <a key={s} href="#" style={{ fontSize: 12, color: '#1e293b', textDecoration: 'none', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#818cf8'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#1e293b'}>{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (user) router.replace('/dashboard'); }, [user, router]);
  if (user) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {/* Grain texture overlay */}
      <div className="lp-grain" />
      {/* Corner activity feed */}
      <ActivityFeed />
      <div className="lp">
        <Navbar />
        <Hero />
        <TickerBar />
        <Stats />
        <Features />
        <CodeSection />
        <FlowSection />
        <AiSection />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <CTABanner />
        <Footer />
      </div>
    </>
  );
}
