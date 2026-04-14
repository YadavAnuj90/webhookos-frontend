'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import { Check, Sparkles, Building2, Zap } from 'lucide-react';

type Plan = {
  name: string;
  price: { monthly: number; annual: number };
  tagline: string;
  highlight?: boolean;
  icon: any;
  features: string[];
  cta: { label: string; href: string };
};

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    tagline: 'For indie hackers and side projects.',
    icon: Zap,
    features: [
      '10,000 events / month',
      '3 projects, 10 endpoints',
      'HMAC signing + retries',
      '24h event retention',
      'Community support',
    ],
    cta: { label: 'Start Free', href: '/auth/register' },
  },
  {
    name: 'Growth',
    price: { monthly: 49, annual: 39 },
    tagline: 'For production apps with real traffic.',
    highlight: true,
    icon: Sparkles,
    features: [
      '500,000 events / month',
      'Unlimited projects & endpoints',
      'Dead-letter queue + bulk replay',
      '30-day retention',
      'AI anomaly detection',
      'Smart search across events',
      'Email + chat support',
      '99.95% uptime SLA',
    ],
    cta: { label: 'Start 14-day Trial', href: '/auth/register?plan=growth' },
  },
  {
    name: 'Scale',
    price: { monthly: 199, annual: 159 },
    tagline: 'For high-volume teams shipping fast.',
    icon: Building2,
    features: [
      '5M events / month',
      'Canary deployments',
      'Multi-region delivery',
      '90-day retention',
      'Payload encryption + key rotation',
      'Audit logs + RBAC',
      'Priority support',
      '99.99% uptime SLA',
    ],
    cta: { label: 'Start 14-day Trial', href: '/auth/register?plan=scale' },
  },
  {
    name: 'Enterprise',
    price: { monthly: -1, annual: -1 },
    tagline: 'For regulated workloads and custom scale.',
    icon: Building2,
    features: [
      'Unlimited events (metered)',
      'Dedicated infra or BYO-cloud',
      'PII field redaction',
      'Custom data residency',
      'SAML SSO + SCIM',
      'Named customer success',
      'Custom contract & DPA',
      '24×7 pager support',
    ],
    cta: { label: 'Talk to Sales', href: '/contact?reason=enterprise' },
  },
];

const FAQ = [
  { q: 'What counts as an event?', a: 'One inbound event — regardless of how many endpoints it fans out to. A single event broadcast to 5 endpoints is billed as 1 event, not 5.' },
  { q: 'What happens if I exceed my monthly quota?', a: 'New events are paused (not dropped — we queue them for 60 minutes while you upgrade or purchase credits). You can enable auto-overage billing at $0.0004 / event.' },
  { q: 'Do you offer annual discounts?', a: 'Yes — annual plans are ~20% cheaper than monthly. Toggle above. Multi-year enterprise contracts get further discounts.' },
  { q: 'Can I self-host WebhookOS?', a: 'Yes, Enterprise customers can deploy WebhookOS in their own VPC via Helm chart + managed upgrades. Contact sales.' },
  { q: 'Is my payload encrypted?', a: 'On Growth+ plans, payloads are AES-256-GCM encrypted at rest with versioned keys. Key rotation is zero-downtime.' },
  { q: 'Can I switch plans mid-month?', a: 'Yes. Upgrades are immediate and prorated. Downgrades apply at the start of the next billing cycle.' },
  { q: 'Do you offer a startup discount?', a: 'Yes — early-stage startups under $1M ARR can apply for 50% off Growth for 12 months. Email founders@webhookos.com.' },
  { q: 'Can I cancel anytime?', a: 'Yes, no questions asked. You keep access until the end of the current billing period.' },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <MarketingShell>
      <MarketingHero
        badge="// PRICING"
        title={<>Simple pricing that <span className="mk-grad-text">scales with you.</span></>}
        subtitle="Start free. Upgrade when traffic grows. No per-seat games, no surprise bills."
      >
        <div style={{ display: 'inline-flex', background: 'rgba(15,23,42,.7)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 10, padding: 4, marginTop: 8 }}>
          <button onClick={() => setAnnual(false)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: !annual ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent', color: !annual ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Monthly</button>
          <button onClick={() => setAnnual(true)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: annual ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent', color: annual ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Annual <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, background: 'rgba(74,222,128,.15)', color: '#4ade80', fontWeight: 700 }}>-20%</span>
          </button>
        </div>
      </MarketingHero>

      <section className="mk-sec" style={{ paddingTop: 40 }}>
        <div className="mk-wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
            {PLANS.map(plan => {
              const price = annual ? plan.price.annual : plan.price.monthly;
              return (
                <div key={plan.name} className="mk-card" style={{ border: plan.highlight ? '1px solid rgba(129,140,248,.45)' : undefined, boxShadow: plan.highlight ? '0 20px 60px rgba(79,70,229,.25)' : undefined, position: 'relative' }}>
                  {plan.highlight && (
                    <div style={{ position: 'absolute', top: -10, right: 18, padding: '3px 10px', borderRadius: 100, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '.08em' }}>Most Popular</div>
                  )}
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <plan.icon size={16} color="#a5b4fc" />
                  </div>
                  <div className="mk-card-title" style={{ fontSize: 19 }}>{plan.name}</div>
                  <div className="mk-card-desc" style={{ marginBottom: 18, minHeight: 38 }}>{plan.tagline}</div>
                  <div style={{ marginBottom: 18 }}>
                    {price === -1 ? (
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#f8fafc', letterSpacing: '-1px' }}>Custom</div>
                    ) : (
                      <div>
                        <span style={{ fontSize: 34, fontWeight: 900, color: '#f8fafc', letterSpacing: '-1.2px' }}>${price}</span>
                        <span style={{ fontSize: 13, color: '#64748b', marginLeft: 4 }}>/ mo</span>
                      </div>
                    )}
                  </div>
                  <Link href={plan.cta.href} className={plan.highlight ? 'mk-btn-pri' : 'mk-btn-out'} style={{ width: '100%', justifyContent: 'center', marginBottom: 18, padding: '11px 20px' }}>{plan.cta.label}</Link>
                  <div style={{ height: 1, background: 'rgba(99,102,241,.1)', marginBottom: 16 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                        <Check size={14} color="#4ade80" style={{ marginTop: 3, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// FAQ</span>
          <h2 className="mk-sec-title">Frequently asked questions</h2>
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 18 }}>
            {FAQ.map(item => (
              <div key={item.q} className="mk-card">
                <div className="mk-card-title" style={{ fontSize: 15 }}>{item.q}</div>
                <div className="mk-card-desc" style={{ fontSize: 13.5 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-sec" style={{ textAlign: 'center' }}>
        <div className="mk-wrap">
          <h2 className="mk-sec-title">Still not sure which plan?</h2>
          <p className="mk-sec-sub" style={{ margin: '0 auto 28px' }}>Start on Free. Upgrade when you outgrow it. Talk to us any time.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" className="mk-btn-big">Start Free <ArrowRight size={15} /></Link>
            <Link href="/contact" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>Talk to us</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
