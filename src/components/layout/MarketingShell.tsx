'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Menu, X, ArrowRight } from 'lucide-react';

const CSS = `
  .mk{font-family:'Inter',sans-serif;background:#020817;color:#f8fafc;min-height:100vh;overflow-x:hidden;position:relative}
  .mk *,.mk *::before,.mk *::after{box-sizing:border-box;margin:0;padding:0}

  @keyframes mk-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes mk-grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes mk-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes mk-mesh{0%,100%{opacity:.8;filter:hue-rotate(0deg)}50%{opacity:1;filter:hue-rotate(22deg)}}
  @keyframes mk-orb{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.72;transform:scale(1.08)}}
  @keyframes mk-pulse{0%,100%{opacity:.6}50%{opacity:1}}

  .mk-au0{animation:mk-up .5s ease both}
  .mk-au1{animation:mk-up .5s .08s ease both}
  .mk-au2{animation:mk-up .5s .16s ease both}
  .mk-au3{animation:mk-up .5s .24s ease both}

  .mk-grad-text{background:linear-gradient(135deg,#fff 0%,#c7d2fe 40%,#818cf8 70%,#6366f1 100%);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:mk-grad 4s ease infinite}

  .mk-grain{position:fixed;inset:0;pointer-events:none;z-index:9000;opacity:.028;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:200px 200px}
  .mk-mesh{position:absolute;inset:0;background:radial-gradient(ellipse 65% 55% at 8% 42%,rgba(99,70,255,.16) 0%,transparent 60%),radial-gradient(ellipse 55% 65% at 92% 18%,rgba(59,130,246,.1) 0%,transparent 60%),radial-gradient(ellipse 45% 55% at 62% 88%,rgba(168,85,247,.12) 0%,transparent 60%);animation:mk-mesh 14s ease-in-out infinite;pointer-events:none}

  .mk-wrap{max-width:1180px;margin:0 auto;padding:0 28px;position:relative;z-index:2}

  /* NAV */
  .mk-nav{position:fixed;top:0;left:0;right:0;z-index:1000;transition:all .3s;background:rgba(2,8,23,.92);backdrop-filter:blur(24px);border-bottom:1px solid rgba(99,102,241,.12)}
  .mk-nav-inner{display:flex;align-items:center;justify-content:space-between;padding:16px 0}
  .mk-logo{display:flex;align-items:center;gap:9px;text-decoration:none;color:inherit}
  .mk-logo-icon{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(79,70,229,.4)}
  .mk-logo-text{font-weight:800;font-size:16px;color:#f8fafc;letter-spacing:-.3px}
  .mk-nav-links{display:flex;align-items:center;gap:28px}
  .mk-nav-link{font-size:13.5px;color:#94a3b8;text-decoration:none;font-weight:500;transition:color .15s}
  .mk-nav-link:hover{color:#f8fafc}
  .mk-nav-ctas{display:flex;align-items:center;gap:10px}

  .mk-btn-pri{padding:9px 20px;border-radius:9px;border:none;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-family:inherit;transition:all .22s;position:relative;overflow:hidden}
  .mk-btn-pri::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.13) 50%,transparent 60%);background-size:200%;animation:mk-shimmer 2.6s infinite}
  .mk-btn-pri:hover{transform:translateY(-1px);box-shadow:0 10px 26px rgba(79,70,229,.5);color:#fff}
  .mk-btn-out{padding:9px 20px;border-radius:9px;border:1px solid rgba(99,102,241,.3);background:rgba(99,102,241,.06);color:#c7d2fe;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-family:inherit;transition:all .22s}
  .mk-btn-out:hover{border-color:rgba(99,102,241,.7);background:rgba(99,102,241,.12);color:#fff}
  .mk-btn-big{padding:13px 28px;border-radius:10px;border:none;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:14.5px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:7px;font-family:inherit;transition:all .22s;position:relative;overflow:hidden}
  .mk-btn-big::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.13) 50%,transparent 60%);background-size:200%;animation:mk-shimmer 2.6s infinite}
  .mk-btn-big:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(79,70,229,.5);color:#fff}

  /* HERO */
  .mk-hero{padding:140px 0 72px;position:relative;text-align:center}
  .mk-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:100px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.24);font-size:11.5px;font-weight:600;color:#a5b4fc;margin-bottom:18px;text-transform:uppercase;letter-spacing:.1em;font-family:'JetBrains Mono',monospace}
  .mk-h1{font-size:clamp(34px,5.2vw,58px);font-weight:900;letter-spacing:-1.8px;line-height:1.05;color:#f8fafc;margin-bottom:18px;max-width:860px;margin-left:auto;margin-right:auto}
  .mk-sub{font-size:clamp(15px,1.6vw,17px);color:#94a3b8;line-height:1.65;max-width:640px;margin:0 auto 32px}

  /* SECTIONS */
  .mk-sec{padding:72px 0;position:relative}
  .mk-sec-label{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.16em;color:#818cf8;margin-bottom:12px;display:block}
  .mk-sec-title{font-size:clamp(24px,3.6vw,40px);font-weight:800;letter-spacing:-1.1px;line-height:1.12;color:#f8fafc;margin-bottom:14px}
  .mk-sec-sub{font-size:15px;color:#94a3b8;line-height:1.7;max-width:620px}

  /* CARDS */
  .mk-card{background:rgba(15,23,42,.7);border:1px solid rgba(99,102,241,.12);border-radius:14px;backdrop-filter:blur(8px);padding:28px;transition:all .24s;position:relative;overflow:hidden}
  .mk-card:hover{border-color:rgba(99,102,241,.3);transform:translateY(-3px);box-shadow:0 20px 56px rgba(0,0,0,.45)}
  .mk-card-title{font-size:17px;font-weight:800;color:#f1f5f9;margin-bottom:8px;letter-spacing:-.3px}
  .mk-card-desc{font-size:14px;color:#94a3b8;line-height:1.65}

  /* PROSE */
  .mk-prose{color:#cbd5e1;font-size:15px;line-height:1.8;max-width:760px}
  .mk-prose h2{font-size:24px;font-weight:800;color:#f8fafc;margin:42px 0 14px;letter-spacing:-.6px}
  .mk-prose h3{font-size:18px;font-weight:700;color:#e2e8f0;margin:28px 0 10px}
  .mk-prose p{margin-bottom:16px;color:#94a3b8}
  .mk-prose ul,.mk-prose ol{margin:12px 0 18px 22px;color:#94a3b8}
  .mk-prose li{margin-bottom:6px}
  .mk-prose a{color:#818cf8;text-decoration:none;border-bottom:1px dashed rgba(129,140,248,.3)}
  .mk-prose a:hover{color:#a5b4fc;border-bottom-color:rgba(165,180,252,.6)}
  .mk-prose code{font-family:'JetBrains Mono',monospace;font-size:12.5px;padding:2px 6px;border-radius:5px;background:rgba(99,102,241,.1);color:#c7d2fe;border:1px solid rgba(99,102,241,.18)}
  .mk-prose strong{color:#f1f5f9;font-weight:700}

  /* FOOTER */
  .mk-footer{border-top:1px solid rgba(99,102,241,.08);padding:56px 0 28px;background:rgba(2,8,20,.85);margin-top:80px}
  .mk-foot-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:36px;margin-bottom:40px}
  .mk-foot-col-title{font-weight:700;font-size:11.5px;color:#f1f5f9;margin-bottom:14px;text-transform:uppercase;letter-spacing:.08em}
  .mk-foot-links{display:flex;flex-direction:column;gap:9px}
  .mk-foot-link{font-size:13px;color:#475569;text-decoration:none;transition:color .15s}
  .mk-foot-link:hover{color:#a5b4fc}
  .mk-foot-brand-text{font-size:13px;color:#475569;line-height:1.7;max-width:240px;margin-bottom:18px}
  .mk-divider{height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,.15),transparent)}
  .mk-foot-bottom{display:flex;align-items:center;justify-content:space-between;margin-top:22px;flex-wrap:wrap;gap:12px}
  .mk-mono{font-family:'JetBrains Mono',monospace;font-size:10px;color:#334155}
  .mk-mono-accent{font-family:'JetBrains Mono',monospace;font-size:10px;color:#4f46e5;font-weight:600}

  /* MOBILE MENU */
  .mk-hamburger{display:none;background:none;border:none;color:#c7d2fe;cursor:pointer;padding:8px}
  .mk-mobile-menu{display:none;position:fixed;inset:64px 0 0;background:rgba(2,8,23,.98);backdrop-filter:blur(24px);z-index:999;padding:32px 28px;flex-direction:column;gap:20px;animation:mk-up .25s ease both}
  .mk-mobile-menu.open{display:flex}
  .mk-mobile-link{font-size:18px;font-weight:600;color:#cbd5e1;text-decoration:none;padding:10px 0;border-bottom:1px solid rgba(99,102,241,.1)}

  @media(max-width:820px){
    .mk-nav-links{display:none}
    .mk-hamburger{display:block}
    .mk-foot-grid{grid-template-columns:1fr 1fr;gap:28px}
  }
  @media(max-width:560px){
    .mk-foot-grid{grid-template-columns:1fr}
  }
`;

const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Roadmap', href: '/roadmap' },
  ],
  Developers: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api-reference' },
    { label: 'Status', href: '/status' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Security', href: '/security' },
    { label: 'Cookies', href: '/cookies' },
  ],
};

const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'About', href: '/about' },
];

function MarketingNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) document.body.style.overflow = 'hidden'; else document.body.style.overflow = ''; }, [open]);

  return (
    <>
      <nav className="mk-nav">
        <div className="mk-wrap mk-nav-inner">
          <Link href="/" className="mk-logo">
            <span className="mk-logo-icon"><Activity size={14} color="#fff" /></span>
            <span className="mk-logo-text">WebhookOS</span>
          </Link>
          <div className="mk-nav-links">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="mk-nav-link">{l.label}</Link>
            ))}
          </div>
          <div className="mk-nav-ctas">
            <Link href="/auth/login" className="mk-btn-out" style={{ padding: '8px 16px', fontSize: 12.5 }}>Sign In</Link>
            <Link href="/auth/register" className="mk-btn-pri" style={{ padding: '8px 16px', fontSize: 12.5 }}>Start Free</Link>
            <button className="mk-hamburger" onClick={() => setOpen(v => !v)} aria-label="Menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>
      <div className={`mk-mobile-menu ${open ? 'open' : ''}`}>
        {NAV_LINKS.map(l => (
          <Link key={l.href} href={l.href} className="mk-mobile-link" onClick={() => setOpen(false)}>{l.label}</Link>
        ))}
      </div>
    </>
  );
}

function MarketingFooter() {
  return (
    <footer className="mk-footer">
      <div className="mk-wrap">
        <div className="mk-foot-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <span className="mk-logo-icon" style={{ width: 32, height: 32 }}><Activity size={14} color="#fff" /></span>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#f8fafc' }}>WebhookOS</span>
            </div>
            <p className="mk-foot-brand-text">Production-grade webhook delivery infrastructure. Built by Anujali Technologies.</p>
            <div className="mk-mono">© 2026 Anujali Technologies Pvt. Ltd.</div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([section, items]) => (
            <div key={section}>
              <div className="mk-foot-col-title">{section}</div>
              <div className="mk-foot-links">
                {items.map(item => (
                  <Link key={item.label} href={item.href} className="mk-foot-link">{item.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mk-divider" />
        <div className="mk-foot-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="mk-mono">Developed and Designed by</span>
            <span className="mk-mono-accent">Anuj Kumar</span>
            <span className="mk-mono">·</span>
            <span className="mk-mono">Anujali Technologies Private Limited. All Rights Reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="https://twitter.com" className="mk-mono" target="_blank" rel="noreferrer">Twitter</a>
            <a href="https://github.com" className="mk-mono" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://linkedin.com" className="mk-mono" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="mk-grain" />
      <div className="mk">
        <MarketingNav />
        <main>{children}</main>
        <MarketingFooter />
      </div>
    </>
  );
}

export function MarketingHero({ badge, title, subtitle, children }: { badge?: string; title: React.ReactNode; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section className="mk-hero">
      <div className="mk-mesh" />
      <div className="mk-wrap">
        {badge && <div className="mk-badge mk-au0">{badge}</div>}
        <h1 className="mk-h1 mk-au1">{title}</h1>
        {subtitle && <p className="mk-sub mk-au2">{subtitle}</p>}
        {children && <div className="mk-au3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>{children}</div>}
      </div>
    </section>
  );
}

export { ArrowRight };
