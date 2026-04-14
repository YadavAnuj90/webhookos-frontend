'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MarketingShell, { MarketingHero } from '@/components/layout/MarketingShell';
import { Mail, Phone, MapPin, Send, CheckCircle2, Building2, MessageSquare, Shield } from 'lucide-react';

const REASONS = [
  { value: 'sales', label: 'Talk to sales', icon: Building2 },
  { value: 'support', label: 'Product support', icon: MessageSquare },
  { value: 'enterprise', label: 'Enterprise plan', icon: Shield },
  { value: 'general', label: 'General inquiry', icon: Mail },
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
      <div className="mk-card" style={{ textAlign: 'center', padding: '48px 28px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(74,222,128,.12)', border: '1px solid rgba(74,222,128,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <CheckCircle2 size={24} color="#4ade80" />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Thanks — message received.</h3>
        <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.65, maxWidth: 380, margin: '0 auto 22px' }}>We reply to every inquiry within one business day. You'll hear from us at <strong style={{ color: '#e2e8f0' }}>{email}</strong> soon.</p>
        <Link href="/" className="mk-btn-out" style={{ padding: '10px 22px', fontSize: 13 }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mk-card" style={{ padding: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>What's this about?</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8, marginBottom: 22 }}>
        {REASONS.map(r => (
          <button type="button" key={r.value} onClick={() => setReason(r.value)} style={{ padding: '10px 12px', borderRadius: 9, border: `1px solid ${reason === r.value ? 'rgba(129,140,248,.5)' : 'rgba(99,102,241,.15)'}`, background: reason === r.value ? 'rgba(99,102,241,.12)' : 'rgba(15,23,42,.5)', color: reason === r.value ? '#f1f5f9' : '#94a3b8', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'inherit', transition: 'all .2s' }}>
            <r.icon size={13} /> {r.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Field label="Your name" required><input required value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Jane Doe" /></Field>
        <Field label="Work email" required><input required type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="jane@company.com" /></Field>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Field label="Company (optional)"><input value={company} onChange={e => setCompany(e.target.value)} style={inputStyle} placeholder="Acme Corp" /></Field>
      </div>
      <div style={{ marginBottom: 18 }}>
        <Field label="Message" required>
          <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={6} style={{ ...inputStyle, resize: 'vertical', minHeight: 120, fontFamily: 'inherit' }} placeholder="Tell us what you need — volume, use case, timelines." />
        </Field>
      </div>

      <button type="submit" disabled={submitting} className="mk-btn-pri" style={{ padding: '12px 26px', fontSize: 14, width: '100%', justifyContent: 'center', opacity: submitting ? .6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
        {submitting ? 'Sending…' : <>Send Message <Send size={14} /></>}
      </button>
      <p style={{ fontSize: 11, color: '#475569', marginTop: 12, textAlign: 'center' }}>We reply within one business day. By submitting, you agree to our <Link href="/privacy" style={{ color: '#818cf8' }}>privacy policy</Link>.</p>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>{label}{required && <span style={{ color: '#fb7185' }}> *</span>}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 9,
  border: '1px solid rgba(99,102,241,.2)',
  background: 'rgba(15,23,42,.8)',
  color: '#f1f5f9',
  fontSize: 13.5,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color .2s',
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <MarketingHero
        badge="// CONTACT"
        title={<>Talk to the <span className="mk-grad-text">team that builds it.</span></>}
        subtitle="Every message is read by a human at Anujali Technologies — often by the founder himself. We reply within one business day."
      />

      <section className="mk-sec" style={{ paddingTop: 20 }}>
        <div className="mk-wrap" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(280px,1fr)', gap: 32, alignItems: 'start' }}>
          <Suspense fallback={<div className="mk-card" style={{ padding: 28 }}>Loading…</div>}>
            <ContactForm />
          </Suspense>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="mk-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Mail size={16} color="#a5b4fc" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Email</span>
              </div>
              <a href="mailto:anujy5706@gmail.com" style={{ fontSize: 13.5, color: '#a5b4fc', textDecoration: 'none', wordBreak: 'break-all' }}>anujy5706@gmail.com</a>
            </div>

            <div className="mk-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Phone size={16} color="#a5b4fc" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Phone</span>
              </div>
              <div style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.8 }}>
                <div>+91 88515 20832</div>
                <div>+91 96530 22795</div>
              </div>
            </div>

            <div className="mk-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <MapPin size={16} color="#a5b4fc" />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Headquarters</span>
              </div>
              <div style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.7 }}>
                Anujali Technologies Pvt. Ltd.<br />
                Devkipur, Jaunpur<br />
                Uttar Pradesh 222204, India
              </div>
            </div>

            <div className="mk-card" style={{ padding: 22, background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.2)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#a5b4fc', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>Security issue?</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 }}>Please email us directly so we can respond quickly.</div>
              <Link href="/security" style={{ fontSize: 12.5, color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>See our security page →</Link>
            </div>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `@media(max-width:820px){.mk-wrap:has(form){grid-template-columns:1fr!important}}` }} />
      </section>
    </MarketingShell>
  );
}
