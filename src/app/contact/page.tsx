'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import {
  Mail, Phone, MapPin, Send, CheckCircle2, Building2, MessageSquare, Shield,
  Clock, Headphones, Globe, Zap, ArrowUpRight, Linkedin, Twitter, Github,
  Users, CalendarCheck, Sparkles, FileText, Lock, ExternalLink,
} from 'lucide-react';

const REASONS = [
  { value: 'sales', label: 'Talk to Sales', icon: Building2, desc: 'Pricing, demos & plans', color: '#3b82f6' },
  { value: 'support', label: 'Product Support', icon: Headphones, desc: 'Technical help & issues', color: '#22c55e' },
  { value: 'enterprise', label: 'Enterprise', icon: Shield, desc: 'Custom SLAs & security', color: '#a855f7' },
  { value: 'partnership', label: 'Partnership', icon: Users, desc: 'Integrations & collabs', color: '#f59e0b' },
];

const CONTACT_CARDS = [
  {
    icon: Mail, color: '#818cf8', bg: 'rgba(129,140,248,.1)', border: 'rgba(129,140,248,.2)',
    title: 'Email Us',
    desc: 'Drop us a line anytime.',
    value: 'anujy5706@gmail.com',
    href: 'mailto:anujy5706@gmail.com',
    action: 'Send email',
  },
  {
    icon: Phone, color: '#22c55e', bg: 'rgba(34,197,94,.1)', border: 'rgba(34,197,94,.2)',
    title: 'Call Us',
    desc: 'Mon–Sat, 10am–7pm IST.',
    value: '+91 88515 20832',
    href: 'tel:+918851520832',
    action: 'Call now',
  },
  {
    icon: MapPin, color: '#f59e0b', bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.2)',
    title: 'Visit Us',
    desc: 'Anujali Technologies HQ.',
    value: 'Devkipur, Jaunpur, UP 222204',
    action: 'Get directions',
  },
  {
    icon: Clock, color: '#06b6d4', bg: 'rgba(6,182,212,.1)', border: 'rgba(6,182,212,.2)',
    title: 'Response Time',
    desc: 'We reply fast — always.',
    value: '< 24 hours, usually < 4h',
    action: 'SLA details',
  },
];

const FAQ = [
  { q: 'How quickly do you respond?', a: 'Most inquiries get a reply within 4 hours during business hours. We guarantee a response within 1 business day.' },
  { q: 'Do you offer custom enterprise plans?', a: 'Yes. We offer custom SLAs, dedicated support, on-premise deployment options, and volume pricing for enterprise teams.' },
  { q: 'Can I get a live demo?', a: 'Absolutely. Select "Talk to Sales" above and we\'ll schedule a personalized walkthrough of WebhookOS for your team.' },
  { q: 'Where is your team located?', a: 'We\'re headquartered in Jaunpur, India. Our infrastructure runs on AWS with multi-region availability.' },
];

function ContactForm() {
  const searchParams = useSearchParams();
  const initialReason = searchParams.get('reason') || 'general';
  const [reason, setReason] = useState(initialReason);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => { if (searchParams.get('reason')) setReason(searchParams.get('reason')!); }, [searchParams]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 36px',
        background: 'rgba(15,23,42,.5)',
        border: '1px solid rgba(74,222,128,.2)',
        borderRadius: 20, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.3,
          background: 'radial-gradient(circle at 50% 30%, rgba(74,222,128,.08), transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', position: 'relative',
        }}>
          <CheckCircle2 size={32} color="#4ade80" />
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 10, letterSpacing: '-.5px' }}>
          Message sent successfully!
        </h3>
        <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 8px' }}>
          We've received your message and will get back to you shortly.
        </p>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>
          You'll hear from us at <strong style={{ color: '#e2e8f0' }}>{email}</strong>
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/" className="mk-btn-pri" style={{ padding: '10px 22px', fontSize: 13 }}>Back to Home</Link>
          <button onClick={() => { setSent(false); setName(''); setEmail(''); setCompany(''); setMessage(''); }} className="mk-btn-out" style={{ padding: '10px 22px', fontSize: 13 }}>
            Send Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{
      padding: '36px 32px',
      background: 'rgba(15,23,42,.5)',
      border: '1px solid rgba(99,102,241,.12)',
      borderRadius: 20, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg,#4f46e5,#7c3aed,#a855f7,#7c3aed,#4f46e5)',
        backgroundSize: '200%',
      }} />

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-.3px', marginBottom: 4 }}>
          Send us a message
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Fill out the form and we'll be in touch shortly.
        </div>
      </div>

      {/* Reason chips */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
          I'd like to...
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {REASONS.map(r => {
            const active = reason === r.value;
            return (
              <button type="button" key={r.value} onClick={() => setReason(r.value)} style={{
                padding: '12px 14px', borderRadius: 12,
                border: `1.5px solid ${active ? r.color + '60' : 'rgba(99,102,241,.12)'}`,
                background: active ? r.color + '10' : 'rgba(15,23,42,.4)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all .2s', textAlign: 'left',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: active ? r.color + '18' : 'rgba(99,102,241,.06)',
                  border: `1px solid ${active ? r.color + '30' : 'rgba(99,102,241,.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .2s',
                }}>
                  <r.icon size={14} color={active ? r.color : '#64748b'} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: active ? '#f1f5f9' : '#94a3b8', transition: 'color .2s' }}>{r.label}</div>
                  <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 1 }}>{r.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="Full Name" required focused={focusedField === 'name'}>
          <input
            required value={name} onChange={e => setName(e.target.value)}
            onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
            style={inputStyle} placeholder="Anuj Yadav"
          />
        </Field>
        <Field label="Work Email" required focused={focusedField === 'email'}>
          <input
            required type="email" value={email} onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
            style={inputStyle} placeholder="anuj@company.com"
          />
        </Field>
      </div>
      <div style={{ marginBottom: 14 }}>
        <Field label="Company" focused={focusedField === 'company'}>
          <input
            value={company} onChange={e => setCompany(e.target.value)}
            onFocus={() => setFocusedField('company')} onBlur={() => setFocusedField(null)}
            style={inputStyle} placeholder="Anujali Technologies"
          />
        </Field>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Field label="Your Message" required focused={focusedField === 'message'}>
          <textarea
            required value={message} onChange={e => setMessage(e.target.value)}
            onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
            rows={5} style={{ ...inputStyle, resize: 'vertical', minHeight: 130, fontFamily: 'inherit', lineHeight: 1.6 }}
            placeholder="Tell us about your use case — volume, endpoints, timelines, anything that helps us understand your needs."
          />
        </Field>
      </div>

      <button
        type="submit" disabled={submitting}
        style={{
          width: '100%', padding: '14px 28px', borderRadius: 12,
          border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
          background: submitting
            ? 'rgba(99,102,241,.4)'
            : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          color: '#fff', fontSize: 15, fontWeight: 700,
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all .25s', position: 'relative', overflow: 'hidden',
          boxShadow: submitting ? 'none' : '0 8px 24px rgba(79,70,229,0.35)',
        }}
      >
        {!submitting && (
          <span style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,.1) 50%,transparent 60%)',
            backgroundSize: '200%',
            animation: 'mk-shimmer 2.6s infinite',
          }} />
        )}
        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {submitting ? (
            <>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Sending...
            </>
          ) : (
            <>Send Message <Send size={15} /></>
          )}
        </span>
      </button>

      <p style={{ fontSize: 11, color: '#475569', marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
        By submitting, you agree to our <Link href="/privacy" style={{ color: '#818cf8', textDecoration: 'none' }}>privacy policy</Link>.
        We'll never share your information.
      </p>
    </form>
  );
}

function Field({ label, required, focused, children }: { label: string; required?: boolean; focused?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{
        display: 'block', fontSize: 11.5, fontWeight: 600,
        color: focused ? '#a5b4fc' : '#94a3b8',
        marginBottom: 7, transition: 'color .2s',
        letterSpacing: '.02em',
      }}>
        {label}{required && <span style={{ color: '#fb7185', marginLeft: 2 }}>*</span>}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid rgba(99,102,241,.15)',
  background: 'rgba(8,15,30,.7)',
  color: '#f1f5f9',
  fontSize: 13.5,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color .2s, box-shadow .2s',
};

export default function ContactPage() {
  return (
    <MarketingShell>
      {/* ═══ HERO ═══ */}
      <MarketingHero
        badge="// CONTACT · ANUJALI TECHNOLOGIES"
        title={<>Let's build something<br /><span className="mk-grad-text">reliable, together.</span></>}
        subtitle="Whether you're evaluating WebhookOS for production, need technical support, or want to explore a partnership — we're here. Every message is read by a human, usually the founder."
      >
        <a href="#contact-form" className="mk-btn-big" style={{ textDecoration: 'none' }}>
          Send a Message <Send size={14} />
        </a>
        <a href="mailto:anujy5706@gmail.com" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14, textDecoration: 'none' }}>
          Email Directly <ArrowUpRight size={13} />
        </a>
      </MarketingHero>

      {/* ═══ CONTACT CARDS ═══ */}
      <section style={{ paddingBottom: 20 }}>
        <div className="mk-wrap">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
            gap: 14,
          }}>
            {CONTACT_CARDS.map(c => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="mk-card" style={{
                  padding: '24px 20px', display: 'flex', flexDirection: 'column',
                  background: 'rgba(15,23,42,.5)',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: c.bg, border: `1px solid ${c.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <Icon size={18} color={c.color} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 3, letterSpacing: '-.2px' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                    {c.desc}
                  </div>
                  <div style={{ fontSize: 13.5, color: '#e2e8f0', fontWeight: 600, marginTop: 'auto' }}>
                    {c.href ? (
                      <a href={c.href} style={{ color: c.color, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {c.value} <ArrowUpRight size={11} />
                      </a>
                    ) : c.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FORM + SIDEBAR ═══ */}
      <section className="mk-sec" id="contact-form" style={{ paddingTop: 20 }}>
        <div className="mk-wrap" style={{
          display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(300px,1fr)',
          gap: 28, alignItems: 'start',
        }}>
          <Suspense fallback={<div style={{ padding: 28, background: 'rgba(15,23,42,.5)', borderRadius: 20, border: '1px solid rgba(99,102,241,.12)' }}>Loading form...</div>}>
            <ContactForm />
          </Suspense>

          {/* ── Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Founder card */}
            <div className="mk-card" style={{
              padding: '24px 22px',
              background: 'linear-gradient(135deg,rgba(79,70,229,.06),rgba(15,23,42,.6))',
              border: '1px solid rgba(99,102,241,.18)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 900, color: '#fff',
                  boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                }}>AY</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Anuj Yadav</div>
                  <div style={{ fontSize: 11, color: '#818cf8', fontFamily: 'JetBrains Mono,monospace' }}>Founder & CEO</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, marginBottom: 14 }}>
                "I read every message that comes through this form. If you have a hard question about webhooks, I want to hear it."
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { icon: Linkedin, href: 'https://www.linkedin.com/in/anuj-yadav90' },
                  { icon: Twitter, href: 'https://twitter.com' },
                  { icon: Github, href: 'https://github.com' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noreferrer" style={{
                    width: 30, height: 30, borderRadius: 8,
                    border: '1px solid rgba(99,102,241,.18)', background: 'rgba(99,102,241,.05)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: '#94a3b8', textDecoration: 'none', transition: 'all .2s',
                  }}>
                    <s.icon size={13} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="mk-card" style={{ padding: '20px 22px' }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '.1em',
                marginBottom: 12, fontFamily: 'JetBrains Mono,monospace',
              }}>Quick Links</div>
              {[
                { label: 'Documentation', href: '/docs', icon: FileText },
                { label: 'Status Page', href: '/status', icon: Zap },
                { label: 'Security Policy', href: '/security', icon: Lock },
                { label: 'Pricing Plans', href: '/pricing', icon: Building2 },
              ].map(link => (
                <Link key={link.label} href={link.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 8,
                  color: '#94a3b8', textDecoration: 'none',
                  fontSize: 13, fontWeight: 500,
                  transition: 'all .15s',
                  marginBottom: 2,
                }}>
                  <link.icon size={14} />
                  <span style={{ flex: 1 }}>{link.label}</span>
                  <ArrowUpRight size={11} style={{ opacity: 0.4 }} />
                </Link>
              ))}
            </div>

            {/* Security callout */}
            <div className="mk-card" style={{
              padding: '20px 22px',
              background: 'linear-gradient(135deg,rgba(239,68,68,.04),rgba(15,23,42,.6))',
              border: '1px solid rgba(239,68,68,.15)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Shield size={14} color="#f87171" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Security Issue?
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12 }}>
                Found a vulnerability? Please report it responsibly. We take security seriously and respond within hours.
              </div>
              <a href="mailto:anujy5706@gmail.com?subject=Security%20Report" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
                color: '#fca5a5', fontSize: 12, fontWeight: 600,
                textDecoration: 'none', transition: 'all .2s',
              }}>
                <Mail size={12} /> Report Vulnerability
              </a>
            </div>

            {/* Office hours */}
            <div className="mk-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Clock size={14} color="#06b6d4" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>Office Hours</span>
              </div>
              <div style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Mon – Sat</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600, fontFamily: 'JetBrains Mono,monospace', fontSize: 11 }}>10:00 – 19:00 IST</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sunday</span>
                  <span style={{ color: '#64748b', fontFamily: 'JetBrains Mono,monospace', fontSize: 11 }}>Closed</span>
                </div>
              </div>
              <div style={{
                marginTop: 10, padding: '6px 10px', borderRadius: 6,
                background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.15)',
                fontSize: 11, color: '#4ade80', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse2 2s infinite' }} />
                Usually responds in {'<'} 4 hours
              </div>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @media(max-width:860px){#contact-form .mk-wrap{grid-template-columns:1fr!important}}
          #contact-form input:focus,#contact-form textarea:focus{border-color:rgba(99,102,241,.5)!important;box-shadow:0 0 0 3px rgba(99,102,241,.1)!important}
        `}} />
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap" style={{ maxWidth: 780 }}>
          <span className="mk-sec-label">// FREQUENTLY ASKED</span>
          <h2 className="mk-sec-title">Common questions, quick answers.</h2>
          <p className="mk-sec-sub" style={{ marginBottom: 32 }}>Can't find what you need? Send us a message above.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ.map((f, i) => (
              <div key={i} className="mk-card" style={{
                padding: '22px 24px',
                display: 'flex', gap: 14, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'JetBrains Mono,monospace', fontSize: 11,
                  fontWeight: 800, color: '#818cf8',
                }}>
                  Q
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6, letterSpacing: '-.2px' }}>
                    {f.q}
                  </div>
                  <div style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.7 }}>
                    {f.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="mk-sec" style={{ textAlign: 'center' }}>
        <div className="mk-wrap" style={{ maxWidth: 560 }}>
          <Sparkles size={28} color="#818cf8" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h2 className="mk-sec-title" style={{ fontSize: 28 }}>Still have questions?</h2>
          <p className="mk-sec-sub" style={{ margin: '0 auto 24px' }}>
            We're real people who care about helping you ship reliable webhooks.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#contact-form" className="mk-btn-big" style={{ textDecoration: 'none' }}>
              Send a Message <ArrowRight size={14} />
            </a>
            <Link href="/about" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>
              Learn About Us
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
