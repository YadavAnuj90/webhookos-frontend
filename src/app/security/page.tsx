'use client';

import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import { Shield, Lock, Key, Eye, FileCheck, Server, Users, AlertTriangle, Mail } from 'lucide-react';

type Item = { icon: any; title: string; desc: string };

const ENCRYPTION: Item[] = [
  { icon: Lock, title: 'AES-256-GCM at rest', desc: 'All payloads encrypted with authenticated encryption. Tamper-evident by design.' },
  { icon: Key, title: 'Versioned key rotation', desc: 'Zero-downtime key rotation with versioned ciphertext (enc:v2:…). Previous-key fallback for in-flight reads.' },
  { icon: Shield, title: 'TLS 1.3 everywhere', desc: 'All transit is TLS 1.3. HSTS on dashboards. No exceptions.' },
  { icon: Lock, title: 'HMAC-SHA256 signatures', desc: 'Every outbound delivery carries a rotating signature so your consumers can verify authenticity.' },
];

const INFRA: Item[] = [
  { icon: Server, title: 'Least-privilege IAM', desc: 'Every service role has the minimum IAM it needs. Audited quarterly.' },
  { icon: Eye, title: 'Immutable audit logs', desc: 'Every config change tracked with actor, IP, and diff. Write-once storage.' },
  { icon: FileCheck, title: 'Backups & DR', desc: 'Point-in-time Mongo backups with 7-day window. Quarterly restore drills.' },
  { icon: AlertTriangle, title: '24×7 security monitoring', desc: 'Anomaly detection on auth events, API usage, and infrastructure access.' },
];

const COMPLIANCE: Item[] = [
  { icon: FileCheck, title: 'SOC 2 Type II (in progress)', desc: 'Audit underway with a Big-4 firm. Report expected Q3 2026.' },
  { icon: Shield, title: 'GDPR-ready', desc: 'DPA available on request. Right-to-erasure supported via API. See our privacy policy.' },
  { icon: Users, title: 'HIPAA / PII support', desc: 'Field-level PII scrubbing, BAA available for regulated workloads on Enterprise.' },
  { icon: Key, title: 'Penetration tested', desc: 'Third-party pen-tests quarterly. Summary report available under NDA.' },
];

function Grid({ items }: { items: Item[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18, marginTop: 28 }}>
      {items.map(i => (
        <div key={i.title} className="mk-card">
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <i.icon size={17} color="#a5b4fc" />
          </div>
          <div className="mk-card-title">{i.title}</div>
          <div className="mk-card-desc">{i.desc}</div>
        </div>
      ))}
    </div>
  );
}

export default function SecurityPage() {
  return (
    <MarketingShell>
      <MarketingHero
        badge="// SECURITY"
        title={<>Security is a <span className="mk-grad-text">feature — not a page.</span></>}
        subtitle="We host your customers' most sensitive events. We treat security the way you'd hope your bank would."
      >
        <a href="#report" className="mk-btn-big"><AlertTriangle size={15} /> Report a Vulnerability</a>
        <Link href="/contact?reason=security" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>Request SOC 2 Report <ArrowRight size={14} /></Link>
      </MarketingHero>

      <section className="mk-sec" style={{ paddingTop: 20 }}>
        <div className="mk-wrap">
          <span className="mk-sec-label">// ENCRYPTION & CRYPTO</span>
          <h2 className="mk-sec-title">Crypto fundamentals</h2>
          <p className="mk-sec-sub">Modern primitives, correctly composed.</p>
          <Grid items={ENCRYPTION} />
        </div>
      </section>

      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// INFRASTRUCTURE</span>
          <h2 className="mk-sec-title">How we run the platform</h2>
          <p className="mk-sec-sub">Isolation, observability, and drills — not just audit checkboxes.</p>
          <Grid items={INFRA} />
        </div>
      </section>

      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// COMPLIANCE</span>
          <h2 className="mk-sec-title">Compliance & certifications</h2>
          <p className="mk-sec-sub">Evidence, not promises. Request our reports under NDA.</p>
          <Grid items={COMPLIANCE} />
        </div>
      </section>

      <section className="mk-sec" id="report">
        <div className="mk-wrap" style={{ maxWidth: 720 }}>
          <div className="mk-card" style={{ padding: '32px 30px', background: 'linear-gradient(135deg,rgba(79,70,229,.08),rgba(124,58,237,.04))', border: '1px solid rgba(129,140,248,.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Shield size={20} color="#a5b4fc" />
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-.4px' }}>Responsible disclosure</h2>
            </div>
            <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.7, marginBottom: 14 }}>
              Found a vulnerability? Please email <a href="mailto:anujy5706@gmail.com" style={{ color: '#a5b4fc' }}>anujy5706@gmail.com</a> with the subject line <code style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, padding: '1px 6px', borderRadius: 5, background: 'rgba(99,102,241,.1)', color: '#c7d2fe' }}>[SECURITY]</code> and a description of the issue, reproduction steps, and your PGP public key if you have one.
            </p>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 18 }}>
              We commit to: acknowledging your report within <strong style={{ color: '#e2e8f0' }}>24 hours</strong>, keeping you informed as we investigate, and crediting you publicly once the issue is fixed (unless you prefer to stay anonymous).
            </p>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 0 }}>
              We do not currently run a paid bug bounty, but we send thank-you swag and a named mention in our hall of fame.
            </p>

            <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid rgba(99,102,241,.15)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <a href="mailto:anujy5706@gmail.com?subject=%5BSECURITY%5D" className="mk-btn-pri" style={{ padding: '10px 20px', fontSize: 13 }}><Mail size={13} /> Email Security</a>
              <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#64748b' }}>anujy5706@gmail.com</span>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
