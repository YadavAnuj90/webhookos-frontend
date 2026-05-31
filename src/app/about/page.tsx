'use client';

import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import {
  MapPin, Mail, Phone, Building2, Calendar, Users,
  Target, Compass, Heart, Zap, Shield, Code2, Quote, Github, Linkedin, Twitter,
  Globe, Server, Lock, BarChart3, Clock, CheckCircle2, TrendingUp,
  Award, Cpu, Database, GitBranch, Layers, ArrowUpRight,
  Rocket, Eye, RefreshCw, Wifi, Activity, FileCheck,
} from 'lucide-react';

const METRICS = [
  { v: '100M+', l: 'Events / month', icon: Zap, color: '#818cf8' },
  { v: '99.98%', l: '90-day uptime', icon: Activity, color: '#22c55e' },
  { v: '<180ms', l: 'p95 latency', icon: Clock, color: '#f59e0b' },
  { v: '50+', l: 'Enterprise clients', icon: Building2, color: '#3b82f6' },
  { v: '0', l: 'Data breaches', icon: Shield, color: '#a855f7' },
  { v: '2025', l: 'Year founded', icon: Calendar, color: '#06b6d4' },
];

const PRINCIPLES = [
  { icon: Target, title: 'Reliability is the product.', desc: 'Features age. Uptime compounds. Every design review starts with "what breaks when this fails?" We measure availability in nines because our customers measure trust in pennies lost.' },
  { icon: Compass, title: 'Transparency by default.', desc: 'Public roadmap. Public changelog. Public status page. If we can show it, we should. No hidden pricing, no surprise fees, no dark patterns. We earn trust by being radically open.' },
  { icon: Heart, title: 'Customers, not users.', desc: 'We build for the engineer paged at 3am — not the MAU chart. Every support email is read by the founder. We don\'t optimize for engagement; we optimize for sleep.' },
  { icon: Zap, title: 'Small team. Long horizon.', desc: 'Bootstrapped. No VC urgency. We\'ll still be here in ten years, fixing the same kinds of problems, sleeping the same hours. Sustainability over speed.' },
  { icon: Shield, title: 'Security is a feature.', desc: 'Encryption at rest. Signed payloads. Rotated keys. SOC2-ready controls. Not because audits say so — because your customers trust you with their data, and you trust us with yours.' },
  { icon: Code2, title: 'Write it once, right.', desc: 'We\'d rather ship slower and own the codebase than ship fast and pay interest forever. Zero tech debt is a myth, but minimal tech debt is a discipline.' },
];

const TIMELINE = [
  { date: 'Jan 2025', title: 'First commit', desc: 'A single NestJS module in a flat in Devkipur. Goal: deliver one test webhook end-to-end. The first successful delivery took 47 hours of debugging.', milestone: true },
  { date: 'Mar 2025', title: 'First paying customer', desc: 'A fintech team that had just lost a batch of bank-reconciliation webhooks. They trusted us with the replacement. Still with us today. Zero missed events since.', milestone: true },
  { date: 'Jun 2025', title: 'Retry engine v2', desc: 'Exponential backoff with jitter, configurable retry policies per endpoint. DLQ with automatic triage. First time hitting 99.9% delivery rate.' },
  { date: 'Aug 2025', title: '1M events / month', desc: 'Retry engine, DLQ, and cursor-based pagination all landed. Uptime hit three nines for the first time. Hired first engineer.', milestone: true },
  { date: 'Nov 2025', title: 'SOC2-ready controls', desc: 'Envelope encryption with versioned keys, audit logging, role-based access control, signed webhook payloads. Enterprise customers started paying attention.' },
  { date: 'Jan 2026', title: 'WebhookOS v5 — full rewrite', desc: 'New dashboard, AI anomaly detection, canary deploys, real-time analytics. Complete architecture overhaul for 10x scale.', milestone: true },
  { date: 'Apr 2026', title: '100M+ events / month', desc: 'Across fintech, SaaS, logistics, and healthcare. Same small team. Same pager discipline. Zero data breaches. Ever.', milestone: true },
];

const STACK_GROUPS = [
  { label: 'Backend', items: ['NestJS 10', 'TypeScript', 'Node.js 20'], color: '#22c55e' },
  { label: 'Database', items: ['MongoDB Atlas', 'Redis 7', 'BullMQ'], color: '#3b82f6' },
  { label: 'Frontend', items: ['Next.js 14', 'React 18', 'Zustand'], color: '#a855f7' },
  { label: 'Infrastructure', items: ['AWS', 'Docker', 'Nginx'], color: '#f59e0b' },
  { label: 'DevOps', items: ['GitHub Actions', 'Prometheus', 'Grafana'], color: '#06b6d4' },
  { label: 'AI / ML', items: ['Google Gemini', 'DeepSeek', 'Custom Models'], color: '#f43f5e' },
];

const WHY_US = [
  { icon: RefreshCw, title: 'Automatic retries with intelligence', desc: 'Exponential backoff with jitter, customizable per endpoint. Our retry engine learns from failure patterns to optimize delivery.' },
  { icon: Shield, title: 'Enterprise-grade security', desc: 'Envelope encryption, signed payloads, key rotation, audit trails. SOC2-ready from day one. Your data never touches our logs.' },
  { icon: BarChart3, title: 'Real-time analytics dashboard', desc: 'Track delivery rates, latency percentiles, error patterns, and event volume — all in real-time with historical comparisons.' },
  { icon: Cpu, title: 'AI-powered debugging', desc: 'Gemini-powered anomaly detection, automatic DLQ triage, PII scanning, and intelligent root cause analysis.' },
  { icon: Globe, title: 'Multi-region delivery', desc: 'Route events through the nearest edge node. Automatic failover. Geographic redundancy for mission-critical webhooks.' },
  { icon: Layers, title: 'Event transformations', desc: 'Rename fields, filter payloads, add computed properties, template substitution — all without writing code.' },
];

const INDUSTRIES = [
  { name: 'Fintech', desc: 'Payment notifications, KYC webhooks, transaction reconciliation', icon: TrendingUp, color: '#22c55e' },
  { name: 'SaaS', desc: 'User lifecycle events, billing webhooks, integration sync', icon: Layers, color: '#3b82f6' },
  { name: 'Healthcare', desc: 'HIPAA-compliant event delivery, appointment notifications', icon: Heart, color: '#f43f5e' },
  { name: 'Logistics', desc: 'Shipment tracking, status updates, warehouse sync', icon: Globe, color: '#f59e0b' },
  { name: 'E-commerce', desc: 'Order events, inventory sync, payment confirmations', icon: Building2, color: '#a855f7' },
  { name: 'Developer Tools', desc: 'CI/CD webhooks, deployment notifications, monitoring alerts', icon: Code2, color: '#06b6d4' },
];

export default function AboutPage() {
  return (
    <MarketingShell>
      {/* ═══ HERO ═══ */}
      <MarketingHero
        badge="// ABOUT · ANUJALI TECHNOLOGIES · EST. 2025"
        title={<>The webhook infrastructure<br /><span className="mk-grad-text">trusted by the world's best teams.</span></>}
        subtitle="We're a small, bootstrapped engineering company building the most reliable webhook delivery platform on the internet. No VC, no hype — just great infrastructure that works when everything else doesn't."
      >
        <Link href="/careers" className="mk-btn-big">Join the Team <ArrowRight size={15} /></Link>
        <Link href="/contact" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>Get in Touch</Link>
      </MarketingHero>

      {/* ═══ METRICS STRIP ═══ */}
      <section style={{ paddingBottom: 20 }}>
        <div className="mk-wrap">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
            gap: 0, borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(99,102,241,.15)',
            background: 'rgba(15,23,42,.6)',
          }}>
            {METRICS.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={m.l} style={{
                  padding: '28px 24px', textAlign: 'center',
                  borderRight: i < METRICS.length - 1 ? '1px solid rgba(99,102,241,.1)' : 'none',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 12, right: 12, opacity: 0.08 }}>
                    <Icon size={40} color={m.color} />
                  </div>
                  <div style={{
                    fontSize: 32, fontWeight: 900, letterSpacing: '-1px',
                    fontFamily: 'JetBrains Mono,monospace',
                    background: `linear-gradient(135deg, #fff, ${m.color})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>{m.v}</div>
                  <div style={{
                    fontSize: 11, color: '#64748b', marginTop: 6,
                    textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600,
                  }}>{m.l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ MISSION STATEMENT ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap" style={{ maxWidth: 860, textAlign: 'center' }}>
          <span className="mk-sec-label">// OUR MISSION</span>
          <h2 className="mk-sec-title" style={{ maxWidth: 700, margin: '0 auto 20px' }}>
            Make webhook delivery a solved problem.
          </h2>
          <p style={{
            fontSize: 17, color: '#94a3b8', lineHeight: 1.85,
            maxWidth: 680, margin: '0 auto',
          }}>
            Every engineering team on the planet rebuilds webhook infrastructure from scratch.
            Retry logic, dead-letter queues, signature verification, delivery monitoring — the same
            undifferentiated heavy lifting, over and over. We believe this problem deserves a
            permanent, shared solution. That's WebhookOS.
          </p>
        </div>
      </section>

      {/* ═══ WHY WEBHOOKOS ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// WHY WEBHOOKOS</span>
          <h2 className="mk-sec-title">Everything you need. Nothing you don't.</h2>
          <p className="mk-sec-sub">Six capabilities that make WebhookOS the last webhook system you'll ever integrate.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16, marginTop: 36 }}>
            {WHY_US.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="mk-card" style={{ padding: '28px 26px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg,rgba(99,102,241,.12),rgba(124,58,237,.08))',
                    border: '1px solid rgba(99,102,241,.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={20} color="#a5b4fc" />
                  </div>
                  <div className="mk-card-title" style={{ fontSize: 16 }}>{item.title}</div>
                  <div className="mk-card-desc" style={{ fontSize: 13.5 }}>{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FOUNDER LETTER ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap" style={{ maxWidth: 1000 }}>
          <span className="mk-sec-label">// A NOTE FROM THE FOUNDER</span>
          <h2 className="mk-sec-title" style={{ marginBottom: 32 }}>The story behind WebhookOS.</h2>

          <div style={{
            display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0,
            borderRadius: 18, overflow: 'hidden',
            border: '1px solid rgba(129,140,248,.15)',
            background: 'rgba(15,23,42,.5)',
          }}>
            {/* ── Left: Founder Profile Sidebar ── */}
            <div style={{
              padding: '40px 28px', textAlign: 'center',
              background: 'linear-gradient(180deg, rgba(79,70,229,.08) 0%, rgba(15,23,42,.6) 100%)',
              borderRight: '1px solid rgba(129,140,248,.1)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              {/* Avatar */}
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <div style={{
                  width: 88, height: 88, borderRadius: 22,
                  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-1px',
                  boxShadow: '0 12px 32px rgba(79,70,229,0.35)',
                }}>
                  AY
                </div>
                <div style={{
                  position: 'absolute', bottom: -3, right: -3,
                  width: 22, height: 22, borderRadius: 7,
                  background: '#22c55e', border: '3px solid #0a1628',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle2 size={11} color="#fff" />
                </div>
              </div>

              {/* Name */}
              <div style={{ fontSize: 19, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-.4px' }}>
                Anuj Yadav
              </div>
              <div style={{
                fontSize: 11, color: '#818cf8', fontFamily: 'JetBrains Mono,monospace',
                marginTop: 4, fontWeight: 600,
                padding: '3px 12px', borderRadius: 100,
                background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.2)',
              }}>
                Founder & CEO
              </div>

              {/* Company */}
              <div style={{
                marginTop: 16, fontSize: 12, color: '#94a3b8',
                lineHeight: 1.5,
              }}>
                Anujali Technologies<br />Private Limited
              </div>

              {/* Divider */}
              <div style={{
                width: 40, height: 1, background: 'rgba(99,102,241,.2)',
                margin: '20px 0',
              }} />

              {/* Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                {[
                  { label: 'Building since', val: 'Jan 2025' },
                  { label: 'Events shipped', val: '100M+/mo' },
                  { label: 'Capital raised', val: '$0' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-.3px' }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{
                width: 40, height: 1, background: 'rgba(99,102,241,.2)',
                margin: '20px 0',
              }} />

              {/* Social */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { icon: Linkedin, href: 'https://www.linkedin.com/in/anuj-yadav90', label: 'LinkedIn' },
                  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                  { icon: Github, href: 'https://github.com', label: 'GitHub' },
                  { icon: Mail, href: 'mailto:anujy5706@gmail.com', label: 'Email' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                    style={{
                      width: 34, height: 34, borderRadius: 9,
                      border: '1px solid rgba(99,102,241,.18)',
                      background: 'rgba(99,102,241,.05)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      color: '#94a3b8', transition: 'all .2s', textDecoration: 'none',
                    }}>
                    <s.icon size={14} />
                  </a>
                ))}
              </div>

              {/* CTA */}
              <a
                href="https://www.linkedin.com/in/anuj-yadav90"
                target="_blank" rel="noreferrer"
                style={{
                  marginTop: 20, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 9,
                  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  textDecoration: 'none', transition: 'all .2s',
                  boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
                }}
              >
                Connect <ArrowUpRight size={12} />
              </a>
            </div>

            {/* ── Right: Letter Content ── */}
            <div style={{ padding: '40px 44px', position: 'relative', overflow: 'hidden' }}>
              {/* Background quote */}
              <Quote size={140} color="rgba(129,140,248,.03)" style={{ position: 'absolute', top: -20, right: -20 }} />

              {/* Opening quote */}
              <div style={{
                fontSize: 22, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.35,
                letterSpacing: '-.5px', marginBottom: 28, position: 'relative', zIndex: 1,
                paddingLeft: 20,
                borderLeft: '3px solid #6366f1',
              }}>
                "WebhookOS exists because this problem deserves a permanent solution."
              </div>

              <div style={{ color: '#b0bec5', fontSize: 14.5, lineHeight: 1.9, position: 'relative', zIndex: 1 }}>
                <p style={{ marginBottom: 16 }}>
                  Early in my career, I rebuilt the same webhook infrastructure repeatedly — retry logic, dead-letter queues, signature verification, delivery monitoring. Each iteration improved on the last, yet none outlasted the team or company that built it.
                </p>
                <p style={{ marginBottom: 16 }}>
                  After the third time, the pattern became impossible to ignore.
                </p>
                <p style={{ marginBottom: 16 }}>
                  In January 2025, I set out to build something different — not another internal tool destined to be abandoned, but infrastructure designed to be <strong style={{ color: '#e2e8f0' }}>trusted, operated, and reused</strong> over the long term. A system that improves with every customer, every edge case, every 3am incident.
                </p>
                <p style={{ marginBottom: 16 }}>
                  Early validation came quickly. A fintech team adopted WebhookOS after losing critical events in their reconciliation pipeline. Since deployment, every single event has been delivered. <strong style={{ color: '#e2e8f0' }}>Not most. Every one.</strong>
                </p>
                <p style={{ marginBottom: 16 }}>
                  Today, WebhookOS processes over <strong style={{ color: '#f1f5f9' }}>100 million events per month</strong> across fintech, SaaS, logistics, and healthcare. The team remains deliberately small, with an unwavering focus on reliability.
                </p>
                <p style={{ marginBottom: 16 }}>
                  We are not optimizing for hype. We are building infrastructure that runs quietly in the background for years — predictable, resilient, and dependable by design.
                </p>

                {/* Signature */}
                <div style={{
                  marginTop: 28, paddingTop: 20,
                  borderTop: '1px solid rgba(99,102,241,.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                      We welcome hard questions.
                    </div>
                    <div style={{
                      fontFamily: 'Georgia, serif', fontSize: 20, fontStyle: 'italic',
                      color: '#f1f5f9', fontWeight: 400, marginTop: 6, letterSpacing: '0.5px',
                    }}>
                      — Anuj Yadav
                    </div>
                  </div>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 900, color: '#fff',
                    opacity: 0.6,
                  }}>
                    AY
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OPERATING PRINCIPLES ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// OPERATING PRINCIPLES</span>
          <h2 className="mk-sec-title">Six rules that govern every decision we make.</h2>
          <p className="mk-sec-sub">Not values for a wall poster. Working constraints we actually ship against, every single day.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16, marginTop: 36 }}>
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="mk-card" style={{ padding: '28px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 11,
                    background: 'rgba(99,102,241,.1)',
                    border: '1px solid rgba(99,102,241,.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <p.icon size={18} color="#a5b4fc" />
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono,monospace', fontSize: 11,
                    color: '#4f46e5', fontWeight: 800,
                    background: 'rgba(79,70,229,.1)', padding: '3px 10px',
                    borderRadius: 6,
                  }}>0{i + 1}</div>
                </div>
                <div className="mk-card-title" style={{ fontSize: 16 }}>{p.title}</div>
                <div className="mk-card-desc" style={{ fontSize: 13.5, lineHeight: 1.7 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INDUSTRIES ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// INDUSTRIES WE SERVE</span>
          <h2 className="mk-sec-title">Built for teams that can't afford missed events.</h2>
          <p className="mk-sec-sub">From payment reconciliation to patient data — WebhookOS delivers where failure isn't an option.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14, marginTop: 32 }}>
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon;
              return (
                <div key={ind.name} className="mk-card" style={{ padding: '24px 22px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `${ind.color}14`,
                    border: `1px solid ${ind.color}28`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={ind.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, letterSpacing: '-.2px' }}>{ind.name}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{ind.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap" style={{ maxWidth: 860 }}>
          <span className="mk-sec-label">// THE JOURNEY</span>
          <h2 className="mk-sec-title">From a kitchen table to 100M events a month.</h2>
          <p className="mk-sec-sub">Sixteen months of shipping. Every milestone earned, never bought.</p>

          <div style={{ marginTop: 44, position: 'relative', paddingLeft: 36 }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute', left: 13, top: 12, bottom: 12, width: 2,
              background: 'linear-gradient(180deg,rgba(129,140,248,.5),rgba(124,58,237,.4),rgba(99,102,241,.1))',
            }} />

            {TIMELINE.map((t, i) => (
              <div key={t.date} style={{ position: 'relative', paddingBottom: i === TIMELINE.length - 1 ? 0 : 36 }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: -30, top: 4,
                  width: t.milestone ? 24 : 18,
                  height: t.milestone ? 24 : 18,
                  borderRadius: '50%',
                  background: t.milestone
                    ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
                    : 'rgba(99,102,241,.3)',
                  border: `3px solid #020817`,
                  boxShadow: t.milestone
                    ? '0 0 0 3px rgba(129,140,248,.25), 0 0 20px rgba(79,70,229,.4)'
                    : '0 0 0 2px rgba(99,102,241,.15)',
                  marginLeft: t.milestone ? -3 : 0,
                }} />

                <div style={{
                  fontFamily: 'JetBrains Mono,monospace', fontSize: 11,
                  color: '#a5b4fc', fontWeight: 700, marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: '.08em',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {t.date}
                  {t.milestone && (
                    <span style={{
                      fontSize: 9, padding: '2px 7px', borderRadius: 4,
                      background: 'rgba(79,70,229,.15)', color: '#818cf8',
                      fontWeight: 700, letterSpacing: '.05em',
                    }}>MILESTONE</span>
                  )}
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 800, color: '#f1f5f9',
                  marginBottom: 8, letterSpacing: '-.3px',
                }}>{t.title}</div>
                <div style={{
                  fontSize: 14, color: '#94a3b8', lineHeight: 1.7, maxWidth: 640,
                }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TECH STACK ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// THE STACK</span>
          <h2 className="mk-sec-title">Opinionated tools. Boring on purpose.</h2>
          <p className="mk-sec-sub">We pick technologies that have survived hype cycles. The infrastructure underneath your infrastructure should be the least exciting part of your day.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14, marginTop: 32 }}>
            {STACK_GROUPS.map(group => (
              <div key={group.label} className="mk-card" style={{ padding: '22px 20px' }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: group.color,
                  textTransform: 'uppercase', letterSpacing: '.12em',
                  fontFamily: 'JetBrains Mono,monospace', marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: group.color, display: 'inline-block',
                  }} />
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {group.items.map(item => (
                    <span key={item} style={{
                      padding: '6px 14px', borderRadius: 100,
                      background: `${group.color}0a`,
                      border: `1px solid ${group.color}20`,
                      fontSize: 12, color: '#e2e8f0',
                      fontFamily: 'JetBrains Mono,monospace', fontWeight: 600,
                    }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPANY FACTS ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// REGISTERED ENTITY</span>
          <h2 className="mk-sec-title">The company behind WebhookOS.</h2>
          <p className="mk-sec-sub">You should know who you're trusting with your infrastructure. Here's the boring-but-important stuff.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14, marginTop: 32 }}>
            <FactCard icon={Building2} label="Legal entity" value="Anujali Technologies Private Limited" meta="Private limited company, India" />
            <FactCard icon={Users} label="Founder & CEO" value="Anuj Yadav" meta="linkedin.com/in/anuj-yadav90" href="https://www.linkedin.com/in/anuj-yadav90" />
            <FactCard icon={Calendar} label="Founded" value="January 2025" meta="Bootstrapped. No outside capital." />
            <FactCard icon={MapPin} label="Headquarters" value="Devkipur, Jaunpur" meta="Uttar Pradesh 222204, India" />
            <FactCard icon={Mail} label="Email" value="anujy5706@gmail.com" meta="The founder's inbox. We reply fast." href="mailto:anujy5706@gmail.com" />
            <FactCard icon={Phone} label="Phone" value="+91 88515 20832" meta="Also: +91 96530 22795" />
          </div>
        </div>
      </section>

      {/* ═══ TRUST INDICATORS ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: 14,
          }}>
            <TrustCard icon={Lock} title="SOC2-Ready" desc="Enterprise-grade security controls, audit logging, and compliance documentation." />
            <TrustCard icon={Activity} title="99.98% Uptime" desc="Rolling 90-day SLA with transparent status reporting. We publish every incident." />
            <TrustCard icon={FileCheck} title="GDPR Compliant" desc="Data processing agreements, right to deletion, and privacy-by-design architecture." />
            <TrustCard icon={Eye} title="Full Transparency" desc="Public changelog, public roadmap, public status page. We earn trust by being open." />
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="mk-sec" style={{ textAlign: 'center' }}>
        <div className="mk-wrap" style={{ maxWidth: 680 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
          }}>
            <Rocket size={24} color="#fff" />
          </div>
          <h2 className="mk-sec-title">Ready to never think about webhooks again?</h2>
          <p className="mk-sec-sub" style={{ margin: '0 auto 32px', maxWidth: 520 }}>
            Whether you're evaluating WebhookOS for production, thinking about joining the team,
            or just curious — the founder is one email away.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            <Link href="/auth/register" className="mk-btn-big">Start Free Trial <ArrowRight size={15} /></Link>
            <Link href="/contact" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>Talk to the Founder</Link>
            <Link href="/careers" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>Open Roles</Link>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
            {[
              { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
              { icon: Github, href: 'https://github.com', label: 'GitHub' },
              { icon: Linkedin, href: 'https://www.linkedin.com/in/anuj-yadav90', label: 'LinkedIn' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                style={{
                  width: 40, height: 40, borderRadius: 11,
                  border: '1px solid rgba(99,102,241,.18)',
                  background: 'rgba(99,102,241,.04)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8', transition: 'all .2s', textDecoration: 'none',
                }}>
                <s.icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}

function FactCard({ icon: Icon, label, value, meta, href }: { icon: any; label: string; value: string; meta?: string; href?: string }) {
  const inner = (
    <div className="mk-card" style={{ padding: '24px 22px', height: '100%', cursor: href ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'rgba(99,102,241,.1)',
          border: '1px solid rgba(99,102,241,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color="#a5b4fc" />
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#64748b',
          textTransform: 'uppercase', letterSpacing: '.1em',
          fontFamily: 'JetBrains Mono,monospace',
        }}>{label}</div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-.2px', marginBottom: 4, wordBreak: 'break-word' }}>{value}</div>
      {meta && <div style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5 }}>{meta}</div>}
    </div>
  );
  if (href) return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</a>;
  return inner;
}

function TrustCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="mk-card" style={{
      padding: '26px 22px', display: 'flex', alignItems: 'flex-start', gap: 14,
      background: 'linear-gradient(135deg,rgba(34,197,94,.02),rgba(15,23,42,.6))',
      border: '1px solid rgba(34,197,94,.12)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'rgba(34,197,94,.1)',
        border: '1px solid rgba(34,197,94,.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} color="#4ade80" />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4, letterSpacing: '-.2px' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}
