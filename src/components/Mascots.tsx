'use client';

/**
 * Floating 3D-style mascot characters — pure CSS, zero images.
 * 6 characters themed to WebhookOS:
 *   Astronaut (purple)  — reliability, always online
 *   Cat (pink)          — dev companion, watching events
 *   Duck (yellow)       — rubber-duck debugging / DLQ
 *   Robot (cyan)        — AI features, smart automation
 *   Fox (orange)        — speed, low-latency delivery
 *   Owl (teal)          — analytics, wisdom, monitoring
 *
 * Each floats/bobs with unique timing. Hidden on mobile.
 */

const MASCOT_CSS = `
  /* ── FLOAT KEYFRAMES ── */
  @keyframes mc-f1{0%,100%{transform:translateY(0) rotate(-3deg)}25%{transform:translateY(-20px) rotate(2deg)}50%{transform:translateY(-8px) rotate(-1deg)}75%{transform:translateY(-24px) rotate(3deg)}}
  @keyframes mc-f2{0%,100%{transform:translateY(0) rotate(2deg)}30%{transform:translateY(-16px) rotate(-3deg)}60%{transform:translateY(-26px) rotate(1deg)}}
  @keyframes mc-f3{0%,100%{transform:translateY(0) rotate(1deg)}40%{transform:translateY(-22px) rotate(-3deg)}70%{transform:translateY(-12px) rotate(2deg)}}
  @keyframes mc-f4{0%,100%{transform:translateY(0) rotate(-2deg)}35%{transform:translateY(-18px) rotate(3deg)}65%{transform:translateY(-10px) rotate(-1deg)}}
  @keyframes mc-f5{0%,100%{transform:translateY(0) rotate(3deg)}20%{transform:translateY(-14px) rotate(-2deg)}55%{transform:translateY(-20px) rotate(1deg)}80%{transform:translateY(-6px) rotate(-3deg)}}
  @keyframes mc-f6{0%,100%{transform:translateY(0) rotate(-1deg)}45%{transform:translateY(-24px) rotate(2deg)}80%{transform:translateY(-8px) rotate(-2deg)}}
  @keyframes mc-blink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}
  @keyframes mc-glow1{0%,100%{filter:drop-shadow(0 0 10px rgba(139,92,246,.25))}50%{filter:drop-shadow(0 0 22px rgba(139,92,246,.5))}}
  @keyframes mc-glow2{0%,100%{filter:drop-shadow(0 0 10px rgba(6,182,212,.2))}50%{filter:drop-shadow(0 0 22px rgba(6,182,212,.45))}}
  @keyframes mc-glow3{0%,100%{filter:drop-shadow(0 0 10px rgba(249,115,22,.2))}50%{filter:drop-shadow(0 0 22px rgba(249,115,22,.45))}}
  @keyframes mc-sparkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}
  @keyframes mc-twinkle{0%,100%{opacity:.15;transform:scale(.6) rotate(0deg)}50%{opacity:.8;transform:scale(1) rotate(180deg)}}
  @keyframes mc-antenna{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}

  .mc-scene{position:absolute;inset:0;pointer-events:none;z-index:2;overflow:hidden}

  /* ═══════ ASTRONAUT (purple — reliability) ═══════ */
  .mc-astro{position:absolute;animation:mc-f1 7s ease-in-out infinite,mc-glow1 5s ease-in-out infinite}
  .mc-astro-body{width:72px;height:64px;background:linear-gradient(145deg,#a78bfa,#7c3aed);border-radius:22px 22px 18px 18px;position:relative;box-shadow:inset -6px -6px 16px rgba(0,0,0,.2),inset 3px 3px 8px rgba(255,255,255,.15),0 8px 32px rgba(124,58,237,.4)}
  .mc-astro-visor{position:absolute;top:10px;left:12px;width:48px;height:36px;background:linear-gradient(145deg,#1e1b4b,#312e81);border-radius:12px;box-shadow:inset 2px 2px 8px rgba(99,102,241,.5),0 0 12px rgba(99,102,241,.2);overflow:hidden}
  .mc-astro-visor::after{content:'';position:absolute;top:4px;left:4px;width:12px;height:8px;background:rgba(165,180,252,.3);border-radius:4px}
  .mc-astro-ear-l,.mc-astro-ear-r{position:absolute;top:8px;width:14px;height:20px;background:linear-gradient(145deg,#a78bfa,#8b5cf6);border-radius:7px 7px 5px 5px;box-shadow:inset -2px -2px 4px rgba(0,0,0,.2)}
  .mc-astro-ear-l{left:-6px}.mc-astro-ear-r{right:-6px}
  .mc-astro-ant{position:absolute;top:-14px;left:50%;transform:translateX(-50%);width:3px;height:14px;background:linear-gradient(180deg,#c4b5fd,#8b5cf6);border-radius:2px;animation:mc-antenna 2s ease-in-out infinite}
  .mc-astro-ant::after{content:'';position:absolute;top:-6px;left:-4px;width:11px;height:11px;background:linear-gradient(135deg,#c4b5fd,#a78bfa);border-radius:50%;box-shadow:0 0 8px rgba(196,181,253,.6)}
  .mc-astro-pack{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:36px;height:12px;background:linear-gradient(145deg,#7c3aed,#6d28d9);border-radius:4px 4px 8px 8px;box-shadow:inset -2px -2px 4px rgba(0,0,0,.25)}
  .mc-astro-star{position:absolute;top:14px;right:6px;width:8px;height:8px;background:#fbbf24;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:mc-twinkle 3s ease infinite}

  /* ═══════ CAT (pink — dev companion) ═══════ */
  .mc-cat{position:absolute;animation:mc-f2 8s ease-in-out infinite}
  .mc-cat-body{width:56px;height:52px;background:linear-gradient(145deg,#f0abfc,#d946ef);border-radius:18px;position:relative;box-shadow:inset -5px -5px 14px rgba(0,0,0,.15),inset 3px 3px 8px rgba(255,255,255,.2),0 8px 28px rgba(217,70,239,.35)}
  .mc-cat-ear-l,.mc-cat-ear-r{position:absolute;top:-10px;width:16px;height:18px;background:linear-gradient(145deg,#f0abfc,#e879f9);clip-path:polygon(50% 0%,0% 100%,100% 100%)}
  .mc-cat-ear-l{left:6px;transform:rotate(-10deg)}.mc-cat-ear-r{right:6px;transform:rotate(10deg)}
  .mc-cat-ear-l::after,.mc-cat-ear-r::after{content:'';position:absolute;top:5px;left:4px;width:8px;height:10px;background:rgba(255,255,255,.15);clip-path:polygon(50% 0%,0% 100%,100% 100%)}
  .mc-cat-eye{position:absolute;top:18px;width:11px;height:12px;background:#1a1a2e;border-radius:50%;animation:mc-blink 4s ease infinite}
  .mc-cat-eye-l{left:12px}.mc-cat-eye-r{right:12px}
  .mc-cat-eye::after{content:'';position:absolute;top:2px;left:2px;width:4px;height:4px;background:rgba(255,255,255,.7);border-radius:50%}
  .mc-cat-nose{position:absolute;top:30px;left:50%;transform:translateX(-50%);width:5px;height:3px;background:#a855f7;border-radius:2px}
  .mc-cat-mouth{position:absolute;top:33px;left:50%;transform:translateX(-50%);width:12px;height:4px;border-bottom:2px solid rgba(168,85,247,.4);border-radius:0 0 6px 6px}
  .mc-cat-blush-l,.mc-cat-blush-r{position:absolute;top:26px;width:8px;height:5px;background:rgba(251,113,133,.3);border-radius:50%}
  .mc-cat-blush-l{left:4px}.mc-cat-blush-r{right:4px}
  .mc-cat-tail{position:absolute;bottom:-2px;right:-8px;width:18px;height:10px;border:3px solid #d946ef;border-color:transparent transparent #d946ef transparent;border-radius:0 0 50% 50%;animation:mc-antenna 2.5s ease-in-out infinite}

  /* ═══════ DUCK (yellow — DLQ / debugging) ═══════ */
  .mc-duck{position:absolute;animation:mc-f3 6.5s ease-in-out infinite}
  .mc-duck-body{width:50px;height:48px;background:linear-gradient(145deg,#fde68a,#f59e0b);border-radius:50%;position:relative;box-shadow:inset -5px -5px 14px rgba(0,0,0,.1),inset 3px 3px 8px rgba(255,255,255,.25),0 8px 24px rgba(245,158,11,.35)}
  .mc-duck-eye{position:absolute;top:14px;width:9px;height:10px;background:#292524;border-radius:50%;animation:mc-blink 5s ease infinite .5s}
  .mc-duck-eye-l{left:11px}.mc-duck-eye-r{right:11px}
  .mc-duck-eye::after{content:'';position:absolute;top:2px;left:2px;width:3px;height:3px;background:rgba(255,255,255,.7);border-radius:50%}
  .mc-duck-beak{position:absolute;top:22px;left:50%;transform:translateX(-50%);width:18px;height:10px;background:linear-gradient(145deg,#fb923c,#ea580c);border-radius:50%;box-shadow:inset -1px -1px 3px rgba(0,0,0,.15)}
  .mc-duck-wing-l,.mc-duck-wing-r{position:absolute;top:22px;width:10px;height:16px;background:linear-gradient(145deg,#fbbf24,#f59e0b);border-radius:50%}
  .mc-duck-wing-l{left:-4px;transform:rotate(15deg)}.mc-duck-wing-r{right:-4px;transform:rotate(-15deg)}
  .mc-duck-hat{position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:28px;height:6px;background:#292524;border-radius:3px}
  .mc-duck-hat::after{content:'';position:absolute;top:-8px;left:6px;width:16px;height:10px;background:#292524;border-radius:4px 4px 0 0}

  /* ═══════ ROBOT (cyan — AI / automation) ═══════ */
  .mc-robot{position:absolute;animation:mc-f4 7.5s ease-in-out infinite,mc-glow2 6s ease-in-out infinite}
  .mc-robot-body{width:58px;height:54px;background:linear-gradient(145deg,#67e8f9,#06b6d4);border-radius:14px;position:relative;box-shadow:inset -5px -5px 14px rgba(0,0,0,.15),inset 3px 3px 8px rgba(255,255,255,.2),0 8px 28px rgba(6,182,212,.35)}
  .mc-robot-eye{position:absolute;top:16px;width:14px;height:10px;background:#083344;border-radius:3px;overflow:hidden}
  .mc-robot-eye-l{left:8px}.mc-robot-eye-r{right:8px}
  .mc-robot-eye::after{content:'';position:absolute;top:2px;left:2px;width:6px;height:6px;background:#22d3ee;border-radius:50%;box-shadow:0 0 6px #22d3ee;animation:mc-blink 6s ease infinite 1s}
  .mc-robot-mouth{position:absolute;top:32px;left:50%;transform:translateX(-50%);width:20px;height:3px;background:#083344;border-radius:2px}
  .mc-robot-mouth::before,.mc-robot-mouth::after{content:'';position:absolute;top:0;width:4px;height:3px;background:#22d3ee;border-radius:1px}
  .mc-robot-mouth::before{left:2px}.mc-robot-mouth::after{right:2px}
  .mc-robot-ant-l,.mc-robot-ant-r{position:absolute;top:-10px;width:2px;height:10px;background:#67e8f9;border-radius:1px;animation:mc-antenna 1.8s ease-in-out infinite}
  .mc-robot-ant-l{left:16px;transform-origin:bottom}.mc-robot-ant-r{right:16px;transform-origin:bottom;animation-delay:.5s}
  .mc-robot-ant-l::after,.mc-robot-ant-r::after{content:'';position:absolute;top:-5px;left:-3px;width:8px;height:8px;background:#22d3ee;border-radius:50%;box-shadow:0 0 8px rgba(34,211,238,.6)}
  .mc-robot-bolt{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:10px;height:12px;clip-path:polygon(40% 0%,70% 0%,55% 40%,80% 40%,30% 100%,45% 55%,20% 55%);background:#fbbf24}

  /* ═══════ FOX (orange — speed / latency) ═══════ */
  .mc-fox{position:absolute;animation:mc-f5 6s ease-in-out infinite,mc-glow3 5.5s ease-in-out infinite}
  .mc-fox-body{width:52px;height:50px;background:linear-gradient(145deg,#fdba74,#f97316);border-radius:16px 16px 20px 20px;position:relative;box-shadow:inset -5px -5px 14px rgba(0,0,0,.12),inset 3px 3px 8px rgba(255,255,255,.2),0 8px 24px rgba(249,115,22,.3)}
  .mc-fox-ear-l,.mc-fox-ear-r{position:absolute;top:-12px;width:18px;height:20px;background:linear-gradient(145deg,#fb923c,#ea580c);clip-path:polygon(50% 0%,0% 100%,100% 100%)}
  .mc-fox-ear-l{left:4px;transform:rotate(-8deg)}.mc-fox-ear-r{right:4px;transform:rotate(8deg)}
  .mc-fox-ear-l::after,.mc-fox-ear-r::after{content:'';position:absolute;top:6px;left:5px;width:8px;height:10px;background:rgba(255,255,255,.2);clip-path:polygon(50% 0%,0% 100%,100% 100%)}
  .mc-fox-eye{position:absolute;top:16px;width:9px;height:11px;background:#431407;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;animation:mc-blink 3.5s ease infinite .3s}
  .mc-fox-eye-l{left:10px}.mc-fox-eye-r{right:10px}
  .mc-fox-eye::after{content:'';position:absolute;top:2px;left:1px;width:4px;height:4px;background:rgba(255,255,255,.6);border-radius:50%}
  .mc-fox-nose{position:absolute;top:26px;left:50%;transform:translateX(-50%);width:7px;height:5px;background:#431407;border-radius:50%}
  .mc-fox-cheek{position:absolute;top:22px;width:14px;height:10px;background:rgba(255,255,255,.18);border-radius:50%}
  .mc-fox-cheek-l{left:1px}.mc-fox-cheek-r{right:1px}
  .mc-fox-snout{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:22px;height:14px;background:linear-gradient(145deg,#fef3c7,#fde68a);border-radius:50%;box-shadow:inset -1px -1px 3px rgba(0,0,0,.06)}
  .mc-fox-streak-l,.mc-fox-streak-r{position:absolute;top:6px;width:6px;height:2px;background:rgba(255,255,255,.15);border-radius:1px}
  .mc-fox-streak-l{left:-4px;transform:rotate(-20deg)}.mc-fox-streak-r{right:-4px;transform:rotate(20deg)}

  /* ═══════ OWL (teal — analytics / monitoring) ═══════ */
  .mc-owl{position:absolute;animation:mc-f6 9s ease-in-out infinite}
  .mc-owl-body{width:54px;height:56px;background:linear-gradient(145deg,#5eead4,#14b8a6);border-radius:20px 20px 24px 24px;position:relative;box-shadow:inset -5px -5px 14px rgba(0,0,0,.15),inset 3px 3px 8px rgba(255,255,255,.18),0 8px 28px rgba(20,184,166,.3)}
  .mc-owl-ear-l,.mc-owl-ear-r{position:absolute;top:-8px;width:14px;height:14px;background:linear-gradient(145deg,#5eead4,#2dd4bf);clip-path:polygon(50% 0%,0% 100%,100% 100%)}
  .mc-owl-ear-l{left:6px;transform:rotate(-6deg)}.mc-owl-ear-r{right:6px;transform:rotate(6deg)}
  .mc-owl-eye-ring{position:absolute;top:12px;width:18px;height:18px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.2);border-radius:50%}
  .mc-owl-eye-ring-l{left:6px}.mc-owl-eye-ring-r{right:6px}
  .mc-owl-eye{position:absolute;top:15px;width:12px;height:12px;background:#042f2e;border-radius:50%}
  .mc-owl-eye-l{left:9px}.mc-owl-eye-r{right:9px}
  .mc-owl-eye::after{content:'';position:absolute;top:2px;left:3px;width:5px;height:5px;background:#2dd4bf;border-radius:50%;box-shadow:0 0 4px #2dd4bf}
  .mc-owl-beak{position:absolute;top:28px;left:50%;transform:translateX(-50%);width:10px;height:8px;background:linear-gradient(145deg,#fbbf24,#d97706);clip-path:polygon(50% 100%,0% 0%,100% 0%);border-radius:0 0 2px 2px}
  .mc-owl-wing-l,.mc-owl-wing-r{position:absolute;top:28px;width:8px;height:20px;background:linear-gradient(145deg,#2dd4bf,#14b8a6);border-radius:50%;opacity:.7}
  .mc-owl-wing-l{left:-2px;transform:rotate(10deg)}.mc-owl-wing-r{right:-2px;transform:rotate(-10deg)}
  .mc-owl-belly{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:24px;height:16px;background:rgba(255,255,255,.1);border-radius:50%}
  .mc-owl-chart{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);display:flex;gap:2px;align-items:flex-end}
  .mc-owl-bar{width:3px;background:#2dd4bf;border-radius:1px;opacity:.6}

  /* ── SPARKLE PARTICLES ── */
  .mc-sparkle{position:absolute;border-radius:50%;animation:mc-sparkle 3s ease-in-out infinite}
  .mc-star{position:absolute;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:mc-twinkle 4s ease-in-out infinite}

  /* Override absolute positioning inside centered section mascots */
  .mc-section-mascot-wrap .mc-astro,
  .mc-section-mascot-wrap .mc-cat,
  .mc-section-mascot-wrap .mc-duck,
  .mc-section-mascot-wrap .mc-robot,
  .mc-section-mascot-wrap .mc-fox,
  .mc-section-mascot-wrap .mc-owl{position:relative !important;top:auto !important;left:auto !important;right:auto !important;bottom:auto !important}

  @media(max-width:860px){.mc-scene{display:none}.mc-section-mascot-wrap{display:none}}
`;

/* ── Types ── */
interface CharPos {
  top?: string; left?: string; right?: string; bottom?: string;
  scale?: number; delay?: string;
}

export interface MascotConfig {
  astronaut?: CharPos;
  cat?:       CharPos;
  duck?:      CharPos;
  robot?:     CharPos;
  fox?:       CharPos;
  owl?:       CharPos;
  sparkles?:  { top: string; left: string; delay: string; size?: number; color?: string }[];
  stars?:     { top: string; left: string; delay: string; size?: number; color?: string }[];
}

function pos(p: CharPos): React.CSSProperties {
  return {
    ...(p.top && { top: p.top }),
    ...(p.left && { left: p.left }),
    ...(p.right && { right: p.right }),
    ...(p.bottom && { bottom: p.bottom }),
    transform: `scale(${p.scale ?? 1})`,
    animationDelay: p.delay || '0s',
  };
}

/* ══════════════════════════════════════════════════════════════════════════ */
export function FloatingMascots({ config }: { config?: MascotConfig }) {
  const c = config || {};
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MASCOT_CSS }} />
      <div className="mc-scene">

        {/* ── SPARKLES ── */}
        {c.sparkles?.map((s, i) => (
          <div key={`sp${i}`} className="mc-sparkle" style={{
            top: s.top, left: s.left, animationDelay: s.delay,
            width: s.size || 4, height: s.size || 4,
            background: s.color || '#fff',
          }} />
        ))}

        {/* ── STARS ── */}
        {c.stars?.map((s, i) => (
          <div key={`st${i}`} className="mc-star" style={{
            top: s.top, left: s.left, animationDelay: s.delay,
            width: s.size || 8, height: s.size || 8,
            background: s.color || '#fbbf24',
          }} />
        ))}

        {/* ── ASTRONAUT ── */}
        {c.astronaut && (
          <div className="mc-astro" style={pos(c.astronaut)}>
            <div className="mc-astro-body">
              <div className="mc-astro-ant" />
              <div className="mc-astro-ear-l" />
              <div className="mc-astro-ear-r" />
              <div className="mc-astro-visor" />
              <div className="mc-astro-pack" />
              <div className="mc-astro-star" />
            </div>
          </div>
        )}

        {/* ── CAT ── */}
        {c.cat && (
          <div className="mc-cat" style={pos(c.cat)}>
            <div className="mc-cat-body">
              <div className="mc-cat-ear-l" />
              <div className="mc-cat-ear-r" />
              <div className="mc-cat-eye mc-cat-eye-l" />
              <div className="mc-cat-eye mc-cat-eye-r" />
              <div className="mc-cat-nose" />
              <div className="mc-cat-mouth" />
              <div className="mc-cat-blush-l" />
              <div className="mc-cat-blush-r" />
              <div className="mc-cat-tail" />
            </div>
          </div>
        )}

        {/* ── DUCK ── */}
        {c.duck && (
          <div className="mc-duck" style={pos(c.duck)}>
            <div className="mc-duck-body">
              <div className="mc-duck-hat" />
              <div className="mc-duck-eye mc-duck-eye-l" />
              <div className="mc-duck-eye mc-duck-eye-r" />
              <div className="mc-duck-beak" />
              <div className="mc-duck-wing-l" />
              <div className="mc-duck-wing-r" />
            </div>
          </div>
        )}

        {/* ── ROBOT ── */}
        {c.robot && (
          <div className="mc-robot" style={pos(c.robot)}>
            <div className="mc-robot-body">
              <div className="mc-robot-ant-l" />
              <div className="mc-robot-ant-r" />
              <div className="mc-robot-eye mc-robot-eye-l" />
              <div className="mc-robot-eye mc-robot-eye-r" />
              <div className="mc-robot-mouth" />
              <div className="mc-robot-bolt" />
            </div>
          </div>
        )}

        {/* ── FOX ── */}
        {c.fox && (
          <div className="mc-fox" style={pos(c.fox)}>
            <div className="mc-fox-body">
              <div className="mc-fox-ear-l" />
              <div className="mc-fox-ear-r" />
              <div className="mc-fox-eye mc-fox-eye-l" />
              <div className="mc-fox-eye mc-fox-eye-r" />
              <div className="mc-fox-cheek mc-fox-cheek-l" />
              <div className="mc-fox-cheek mc-fox-cheek-r" />
              <div className="mc-fox-snout" />
              <div className="mc-fox-nose" />
              <div className="mc-fox-streak-l" />
              <div className="mc-fox-streak-r" />
            </div>
          </div>
        )}

        {/* ── OWL ── */}
        {c.owl && (
          <div className="mc-owl" style={pos(c.owl)}>
            <div className="mc-owl-body">
              <div className="mc-owl-ear-l" />
              <div className="mc-owl-ear-r" />
              <div className="mc-owl-eye-ring mc-owl-eye-ring-l" />
              <div className="mc-owl-eye-ring mc-owl-eye-ring-r" />
              <div className="mc-owl-eye mc-owl-eye-l" />
              <div className="mc-owl-eye mc-owl-eye-r" />
              <div className="mc-owl-beak" />
              <div className="mc-owl-wing-l" />
              <div className="mc-owl-wing-r" />
              <div className="mc-owl-belly" />
              <div className="mc-owl-chart">
                <div className="mc-owl-bar" style={{ height: 4 }} />
                <div className="mc-owl-bar" style={{ height: 7 }} />
                <div className="mc-owl-bar" style={{ height: 5 }} />
                <div className="mc-owl-bar" style={{ height: 9 }} />
                <div className="mc-owl-bar" style={{ height: 6 }} />
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  SectionMascot — centered mascot above section heading (GitHub-style).  */
/*  Place INLINE inside the heading wrapper — it's a flow element, not     */
/*  absolutely positioned.                                                 */
/* ══════════════════════════════════════════════════════════════════════════ */

type MascotType = 'astronaut' | 'cat' | 'duck' | 'robot' | 'fox' | 'owl';

const MASCOT_BUILDERS: Record<MascotType, (s: number) => React.ReactElement> = {
  astronaut: (s) => (
    <div style={{ transform: `scale(${s})` }}>
      <div className="mc-astro-body">
        <div className="mc-astro-ant" /><div className="mc-astro-ear-l" /><div className="mc-astro-ear-r" />
        <div className="mc-astro-visor" /><div className="mc-astro-pack" /><div className="mc-astro-star" />
      </div>
    </div>
  ),
  cat: (s) => (
    <div style={{ transform: `scale(${s})` }}>
      <div className="mc-cat-body">
        <div className="mc-cat-ear-l" /><div className="mc-cat-ear-r" />
        <div className="mc-cat-eye mc-cat-eye-l" /><div className="mc-cat-eye mc-cat-eye-r" />
        <div className="mc-cat-nose" /><div className="mc-cat-mouth" />
        <div className="mc-cat-blush-l" /><div className="mc-cat-blush-r" /><div className="mc-cat-tail" />
      </div>
    </div>
  ),
  duck: (s) => (
    <div style={{ transform: `scale(${s})` }}>
      <div className="mc-duck-body">
        <div className="mc-duck-hat" />
        <div className="mc-duck-eye mc-duck-eye-l" /><div className="mc-duck-eye mc-duck-eye-r" />
        <div className="mc-duck-beak" /><div className="mc-duck-wing-l" /><div className="mc-duck-wing-r" />
      </div>
    </div>
  ),
  robot: (s) => (
    <div style={{ transform: `scale(${s})` }}>
      <div className="mc-robot-body">
        <div className="mc-robot-ant-l" /><div className="mc-robot-ant-r" />
        <div className="mc-robot-eye mc-robot-eye-l" /><div className="mc-robot-eye mc-robot-eye-r" />
        <div className="mc-robot-mouth" /><div className="mc-robot-bolt" />
      </div>
    </div>
  ),
  fox: (s) => (
    <div style={{ transform: `scale(${s})` }}>
      <div className="mc-fox-body">
        <div className="mc-fox-ear-l" /><div className="mc-fox-ear-r" />
        <div className="mc-fox-eye mc-fox-eye-l" /><div className="mc-fox-eye mc-fox-eye-r" />
        <div className="mc-fox-cheek mc-fox-cheek-l" /><div className="mc-fox-cheek mc-fox-cheek-r" />
        <div className="mc-fox-snout" /><div className="mc-fox-nose" />
        <div className="mc-fox-streak-l" /><div className="mc-fox-streak-r" />
      </div>
    </div>
  ),
  owl: (s) => (
    <div style={{ transform: `scale(${s})` }}>
      <div className="mc-owl-body">
        <div className="mc-owl-ear-l" /><div className="mc-owl-ear-r" />
        <div className="mc-owl-eye-ring mc-owl-eye-ring-l" /><div className="mc-owl-eye-ring mc-owl-eye-ring-r" />
        <div className="mc-owl-eye mc-owl-eye-l" /><div className="mc-owl-eye mc-owl-eye-r" />
        <div className="mc-owl-beak" /><div className="mc-owl-wing-l" /><div className="mc-owl-wing-r" />
        <div className="mc-owl-belly" />
        <div className="mc-owl-chart">
          <div className="mc-owl-bar" style={{ height: 4 }} /><div className="mc-owl-bar" style={{ height: 7 }} />
          <div className="mc-owl-bar" style={{ height: 5 }} /><div className="mc-owl-bar" style={{ height: 9 }} />
          <div className="mc-owl-bar" style={{ height: 6 }} />
        </div>
      </div>
    </div>
  ),
};

/* Mapping mascot type to its float animation class */
const FLOAT_CLASS: Record<MascotType, string> = {
  astronaut: 'mc-astro', cat: 'mc-cat', duck: 'mc-duck',
  robot: 'mc-robot', fox: 'mc-fox', owl: 'mc-owl',
};

/* Glow color per mascot */
const GLOW_COLOR: Record<MascotType, string> = {
  astronaut: 'rgba(139,92,246,.35)',
  cat: 'rgba(217,70,239,.3)',
  duck: 'rgba(245,158,11,.3)',
  robot: 'rgba(6,182,212,.3)',
  fox: 'rgba(249,115,22,.3)',
  owl: 'rgba(20,184,166,.3)',
};

/**
 * Centered mascot that sits inline above a section heading.
 * Place it inside the centered heading wrapper — NOT as an absolute overlay.
 * scale defaults to 1.6 (large & prominent like GitHub's Mona).
 */
export function SectionMascot({
  type, scale = 1.6,
}: {
  type: MascotType;
  scale?: number;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MASCOT_CSS }} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 18,
          pointerEvents: 'none',
          position: 'relative',
        }}
        className="mc-section-mascot-wrap"
      >
        {/* Soft glow beneath the mascot */}
        <div style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 100 * scale,
          height: 40 * scale,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${GLOW_COLOR[type]}, transparent 70%)`,
          filter: 'blur(8px)',
          zIndex: 0,
        }} />
        <div className={FLOAT_CLASS[type]} style={{ position: 'relative', zIndex: 1 }}>
          {MASCOT_BUILDERS[type](scale)}
        </div>
      </div>
    </>
  );
}
