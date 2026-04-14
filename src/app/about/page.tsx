'use client';

import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import {
  MapPin, Mail, Phone, Building2, Calendar, Users,
  Target, Compass, Heart, Zap, Shield, Code2, Quote, Github, Linkedin, Twitter,
} from 'lucide-react';

const METRICS = [
  { v: '100M+', l: 'Events delivered / month' },
  { v: '99.98%', l: 'Rolling 90-day uptime' },
  { v: '<180ms', l: 'p95 delivery latency' },
  { v: '2025', l: 'Founded, bootstrapped' },
];

const PRINCIPLES = [
  { icon: Target, title: 'Reliability is the product.', desc: 'Features age. Uptime compounds. Every design review starts with "what breaks when this fails?"' },
  { icon: Compass, title: 'Transparency by default.', desc: 'Public roadmap. Public changelog. Public status page. If we can show it, we should.' },
  { icon: Heart, title: 'Customers, not users.', desc: 'We build for the engineer paged at 3am — not the MAU chart. Every support email is read by the founder.' },
  { icon: Zap, title: 'Small team. Long horizon.', desc: 'Bootstrapped. No VC urgency. We\'ll still be here in ten years, fixing the same kinds of problems, sleeping the same hours.' },
  { icon: Shield, title: 'Security is a feature.', desc: 'Encryption at rest. Signed payloads. Rotated keys. Not because audits say so — because your customers trust you with this data.' },
  { icon: Code2, title: 'Write it once, right.', desc: 'We\'d rather ship slower and own the codebase than ship fast and pay interest forever.' },
];

const TIMELINE = [
  { date: 'Jan 2025', title: 'First commit', desc: 'A single NestJS module in a flat in Devkipur. Goal: deliver one test webhook end-to-end.' },
  { date: 'Mar 2025', title: 'First paying customer', desc: 'A fintech team that had just lost a batch of bank-reconciliation webhooks. They trusted us with the replacement. Still with us today.' },
  { date: 'Aug 2025', title: '1M events / month', desc: 'Retry engine, DLQ, and cursor-based pagination all landed. Uptime hit three nines for the first time.' },
  { date: 'Jan 2026', title: 'WebhookOS v5 — full rewrite', desc: 'New dashboard, AI anomaly detection, canary deploys, envelope encryption with versioned keys.' },
  { date: 'Apr 2026', title: '100M+ events / month', desc: 'Across fintech, SaaS, logistics, and healthcare. Same small team. Same pager discipline.' },
];

const STACK = [
  'NestJS 10', 'TypeScript', 'MongoDB', 'Redis 7', 'BullMQ',
  'Next.js 14', 'React 18', 'Tailwind',
  'AWS', 'Docker', 'GitHub Actions', 'Prometheus',
];

export default function AboutPage() {
  return (
    <MarketingShell>
      <MarketingHero
        badge="// ABOUT · EST. 2025"
        title={<>We build the webhook layer<br /><span className="mk-grad-text">you'd build if you had the time.</span></>}
        subtitle="Anujali Technologies Pvt. Ltd. is a small, bootstrapped engineering team shipping the boring, reliable infrastructure that keeps modern products moving."
      >
        <Link href="/careers" className="mk-btn-big">Join the Team <ArrowRight size={15} /></Link>
        <Link href="/contact" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>Get in Touch</Link>
      </MarketingHero>

      {/* ─── METRICS STRIP ─────────────────────────── */}
      <section style={{ paddingBottom: 20 }}>
        <div className="mk-wrap">
          <div className="mk-card" style={{ padding: '26px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 24, background: 'linear-gradient(135deg,rgba(79,70,229,.06),rgba(124,58,237,.03))' }}>
            {METRICS.map(m => (
              <div key={m.l}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#f8fafc', letterSpacing: '-.8px', fontFamily: 'JetBrains Mono,monospace' }}>{m.v}</div>
                <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOUNDER LETTER ─────────────────────────── */}
      <section className="mk-sec">
        <div className="mk-wrap" style={{ maxWidth: 820 }}>
          <div className="mk-card" style={{ padding: '40px 44px', background: 'linear-gradient(135deg,rgba(99,102,241,.04),rgba(15,23,42,.7))', border: '1px solid rgba(129,140,248,.18)', position: 'relative', overflow: 'hidden' }}>
            <Quote size={52} color="rgba(129,140,248,.12)" style={{ position: 'absolute', top: 20, right: 24 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-.5px', flexShrink: 0 }}>
                AY
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-.3px' }}>Anuj Yadav</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'JetBrains Mono,monospace' }}>Founder & CEO · Anujali Technologies</div>
              </div>
            </div>

            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16, fontFamily: 'JetBrains Mono,monospace' }}>
              // A note from the founder
            </div>

            <div style={{ color: '#cbd5e1', fontSize: 15.5, lineHeight: 1.85 }}>
              <p style={{ marginBottom: 18, fontSize: 17, color: '#f1f5f9', fontWeight: 600, letterSpacing: '-.2px' }}>
                WebhookOS exists because this problem deserves a permanent solution.
              </p>
              <p style={{ marginBottom: 18 }}>
                Early in my career, I rebuilt the same webhook infrastructure repeatedly — retry logic, dead-letter queues, signature verification, delivery monitoring. Each iteration was an improvement on the last, yet none outlasted the team or company that built it. Months later, the same system would be rewritten from scratch by someone else.
              </p>
              <p style={{ marginBottom: 18 }}>
                After the third time, the pattern became impossible to ignore.
              </p>
              <p style={{ marginBottom: 18 }}>
                In January 2025, I set out to build something different — not another internal tool destined to be abandoned, but a piece of infrastructure designed to be trusted, operated, and reused over the long term.
              </p>
              <p style={{ marginBottom: 18 }}>
                Early validation came quickly. A fintech team adopted WebhookOS after losing critical events in their reconciliation pipeline. Since deployment, every event has been delivered without exception.
              </p>
              <p style={{ marginBottom: 18 }}>
                Today, WebhookOS processes over <strong style={{ color: '#f1f5f9' }}>100 million events per month</strong> across fintech, SaaS, logistics, and healthcare. The team remains deliberately small, with an unwavering focus on reliability and operational excellence.
              </p>
              <p style={{ marginBottom: 18 }}>
                We are not optimizing for hype or rapid growth. We are building infrastructure that can run quietly in the background for years — predictable, resilient, and dependable by design.
              </p>
              <p style={{ marginBottom: 18 }}>
                If that is what your systems require, you will find WebhookOS worth your attention.
              </p>
              <p style={{ marginBottom: 20, color: '#94a3b8', fontStyle: 'italic' }}>
                We welcome hard questions. — Anuj
              </p>
              <a
                href="https://www.linkedin.com/in/anuj-yadav90"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 8,
                  background: 'rgba(10,102,194,.1)', border: '1px solid rgba(10,102,194,.3)',
                  color: '#7cc1ff', fontSize: 12.5, fontWeight: 600,
                  textDecoration: 'none', fontFamily: 'JetBrains Mono,monospace',
                  transition: 'all .2s',
                }}
              >
                <Linkedin size={13} /> Connect with Anuj on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSION / PRINCIPLES ─────────────────────────── */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// OPERATING PRINCIPLES</span>
          <h2 className="mk-sec-title">Six rules that show up in every design review.</h2>
          <p className="mk-sec-sub">Not values for a wall poster. Working constraints we actually ship against.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18, marginTop: 32 }}>
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="mk-card" style={{ padding: 26 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p.icon size={16} color="#a5b4fc" />
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#64748b', fontWeight: 700 }}>0{i + 1}</div>
                </div>
                <div className="mk-card-title" style={{ fontSize: 15.5 }}>{p.title}</div>
                <div className="mk-card-desc" style={{ fontSize: 13.5 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─────────────────────────── */}
      <section className="mk-sec">
        <div className="mk-wrap" style={{ maxWidth: 820 }}>
          <span className="mk-sec-label">// THE JOURNEY</span>
          <h2 className="mk-sec-title">From kitchen table to 100M events a month.</h2>
          <p className="mk-sec-sub">Sixteen months of shipping. A few milestones that mattered.</p>

          <div style={{ marginTop: 40, position: 'relative', paddingLeft: 32 }}>
            <div style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 2, background: 'linear-gradient(180deg,rgba(129,140,248,.4),rgba(124,58,237,.4),rgba(99,102,241,.1))' }} />
            {TIMELINE.map((t, i) => (
              <div key={t.date} style={{ position: 'relative', paddingBottom: i === TIMELINE.length - 1 ? 0 : 30 }}>
                <div style={{ position: 'absolute', left: -28, top: 4, width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: '3px solid #020817', boxShadow: '0 0 0 2px rgba(129,140,248,.3), 0 0 16px rgba(79,70,229,.4)' }} />
                <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#a5b4fc', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>{t.date}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-.3px' }}>{t.title}</div>
                <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.65, maxWidth: 620 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STACK ─────────────────────────── */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// THE STACK</span>
          <h2 className="mk-sec-title">What we run on.</h2>
          <p className="mk-sec-sub">Opinionated, well-worn, boring tools. The way infrastructure ought to be.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 28 }}>
            {STACK.map(s => (
              <span key={s} style={{ padding: '8px 16px', borderRadius: 100, background: 'rgba(15,23,42,.7)', border: '1px solid rgba(99,102,241,.2)', fontSize: 12.5, color: '#c7d2fe', fontFamily: 'JetBrains Mono,monospace', fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPANY FACTS ─────────────────────────── */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// REGISTERED ENTITY</span>
          <h2 className="mk-sec-title">The company on paper.</h2>
          <p className="mk-sec-sub">Boring, but you should know who you're doing business with.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginTop: 28 }}>
            <FactCard icon={Building2} label="Legal entity" value="Anujali Technologies Private Limited" meta="Private limited company, India" />
            <FactCard icon={Users} label="Founder & CEO" value="Anuj Yadav" meta="linkedin.com/in/anuj-yadav90" href="https://www.linkedin.com/in/anuj-yadav90" />
            <FactCard icon={Calendar} label="Founded" value="January 2025" meta="Bootstrapped. No outside capital." />
            <FactCard icon={MapPin} label="Headquarters" value="Devkipur, Jaunpur" meta="Uttar Pradesh 222204, India" />
            <FactCard icon={Mail} label="Email" value="anujy5706@gmail.com" meta="The founder's inbox. We reply." href="mailto:anujy5706@gmail.com" />
            <FactCard icon={Phone} label="Phone" value="+91 88515 20832" meta="Also: +91 96530 22795" />
          </div>
        </div>
      </section>

      {/* ─── CLOSING CTA ─────────────────────────── */}
      <section className="mk-sec" style={{ textAlign: 'center' }}>
        <div className="mk-wrap" style={{ maxWidth: 640 }}>
          <h2 className="mk-sec-title">Let's talk.</h2>
          <p className="mk-sec-sub" style={{ margin: '0 auto 28px' }}>Whether you're evaluating WebhookOS for production, thinking about joining the team, or just curious — the founder is one email away.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <Link href="/contact" className="mk-btn-big">Contact the Founder <ArrowRight size={15} /></Link>
            <Link href="/careers" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>Open Roles</Link>
          </div>

          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center' }}>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(99,102,241,.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all .2s' }}><Twitter size={15} /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(99,102,241,.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all .2s' }}><Github size={15} /></a>
            <a href="https://www.linkedin.com/in/anuj-yadav90" target="_blank" rel="noreferrer" aria-label="LinkedIn" style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(99,102,241,.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'all .2s' }}><Linkedin size={15} /></a>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function FactCard({ icon: Icon, label, value, meta, href }: { icon: any; label: string; value: string; meta?: string; href?: string }) {
  const inner = (
    <div className="mk-card" style={{ padding: 22, height: '100%', cursor: href ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color="#a5b4fc" />
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'JetBrains Mono,monospace' }}>{label}</div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-.2px', marginBottom: 4, wordBreak: 'break-word' }}>{value}</div>
      {meta && <div style={{ fontSize: 12.5, color: '#94a3b8' }}>{meta}</div>}
    </div>
  );
  if (href) return <a href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</a>;
  return inner;
}
