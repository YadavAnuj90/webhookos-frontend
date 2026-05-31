'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import {
  Check, Sparkles, Building2, Zap, X, Shield, Clock, Users, Globe,
  ArrowUpRight, Star, Award, Headphones, Lock, BarChart3, RefreshCw,
  Cpu, Layers, ChevronDown, ChevronUp, Infinity, Server, Heart,
  CreditCard, TrendingUp, CheckCircle2, HelpCircle, Minus,
} from 'lucide-react';

/* ══════════════════════════════════════════
   DATA
   ══════════════════════════════════════════ */

type Plan = {
  name: string;
  price: { monthly: number; annual: number };
  tagline: string;
  highlight?: boolean;
  icon: any;
  color: string;
  gradient: string;
  features: string[];
  cta: { label: string; href: string };
};

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    tagline: 'For indie hackers and side projects.',
    icon: Zap,
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
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
    color: '#818cf8',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
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
    icon: TrendingUp,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
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

const TRUST_METRICS = [
  { value: '99.98%', label: 'Uptime SLA', icon: Shield, color: '#22c55e' },
  { value: '100M+', label: 'Events delivered', icon: Zap, color: '#818cf8' },
  { value: '<180ms', label: 'p95 latency', icon: Clock, color: '#f59e0b' },
  { value: '0', label: 'Data breaches', icon: Lock, color: '#f43f5e' },
];

type CompareRow = {
  feature: string;
  category?: string;
  free: string | boolean;
  growth: string | boolean;
  scale: string | boolean;
  enterprise: string | boolean;
};

const COMPARE: CompareRow[] = [
  { feature: '', category: 'Limits & Delivery' , free: false, growth: false, scale: false, enterprise: false },
  { feature: 'Monthly events', free: '10K', growth: '500K', scale: '5M', enterprise: 'Unlimited' },
  { feature: 'Projects', free: '3', growth: 'Unlimited', scale: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Endpoints', free: '10', growth: 'Unlimited', scale: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Event retention', free: '24 hours', growth: '30 days', scale: '90 days', enterprise: 'Custom' },
  { feature: 'Multi-region delivery', free: false, growth: false, scale: true, enterprise: true },
  { feature: 'Canary deployments', free: false, growth: false, scale: true, enterprise: true },

  { feature: '', category: 'Security & Compliance', free: false, growth: false, scale: false, enterprise: false },
  { feature: 'HMAC signing', free: true, growth: true, scale: true, enterprise: true },
  { feature: 'Payload encryption (AES-256)', free: false, growth: true, scale: true, enterprise: true },
  { feature: 'Key rotation', free: false, growth: false, scale: true, enterprise: true },
  { feature: 'Audit logs + RBAC', free: false, growth: false, scale: true, enterprise: true },
  { feature: 'SAML SSO + SCIM', free: false, growth: false, scale: false, enterprise: true },
  { feature: 'PII field redaction', free: false, growth: false, scale: false, enterprise: true },
  { feature: 'Custom data residency', free: false, growth: false, scale: false, enterprise: true },

  { feature: '', category: 'AI & Debugging', free: false, growth: false, scale: false, enterprise: false },
  { feature: 'DLQ + manual replay', free: true, growth: true, scale: true, enterprise: true },
  { feature: 'Bulk replay', free: false, growth: true, scale: true, enterprise: true },
  { feature: 'AI anomaly detection', free: false, growth: true, scale: true, enterprise: true },
  { feature: 'Smart search', free: false, growth: true, scale: true, enterprise: true },
  { feature: 'AI DLQ triage', free: false, growth: true, scale: true, enterprise: true },

  { feature: '', category: 'Support & SLA', free: false, growth: false, scale: false, enterprise: false },
  { feature: 'Community support', free: true, growth: true, scale: true, enterprise: true },
  { feature: 'Email + chat support', free: false, growth: true, scale: true, enterprise: true },
  { feature: 'Priority support', free: false, growth: false, scale: true, enterprise: true },
  { feature: '24×7 pager support', free: false, growth: false, scale: false, enterprise: true },
  { feature: 'Named CSM', free: false, growth: false, scale: false, enterprise: true },
  { feature: 'Uptime SLA', free: false, growth: '99.95%', scale: '99.99%', enterprise: 'Custom' },
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

const TESTIMONIALS = [
  { text: 'We switched from building our own retry logic to WebhookOS — haven\'t lost a webhook since. It just works.', name: 'Aditya M.', role: 'CTO, FinSync', avatar: 'AM' },
  { text: 'The AI debugging saved us 12 hours on a production incident. Worth every penny of the Growth plan.', name: 'Priya K.', role: 'Lead Engineer, ShipTrack', avatar: 'PK' },
  { text: 'Enterprise support is exceptional. Named CSM, custom SLAs, and they actually care about our uptime.', name: 'Rohit S.', role: 'VP Eng, PayLoop', avatar: 'RS' },
];

/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */

function CellValue({ val }: { val: string | boolean }) {
  if (val === true) return <Check size={15} color="#22c55e" />;
  if (val === false) return <Minus size={14} style={{ opacity: .25 }} />;
  return <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{val}</span>;
}

function FAQItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 14,
        overflow: 'hidden', transition: 'border-color .2s, box-shadow .2s',
        ...(open ? { borderColor: 'var(--abd)', boxShadow: '0 0 0 1px var(--abd)' } : {}),
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px',
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: open ? 'var(--abd)' : 'var(--abg)',
          border: `1px solid ${open ? 'var(--a)' : 'var(--b2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .2s',
        }}>
          <HelpCircle size={14} color="var(--a)" />
        </div>
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'var(--t1)', lineHeight: 1.4 }}>{item.q}</span>
        {open ? <ChevronUp size={16} style={{ color: 'var(--a)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'var(--t3)', flexShrink: 0 }} />}
      </button>
      <div style={{
        maxHeight: open ? 200 : 0, overflow: 'hidden',
        transition: 'max-height .3s ease, padding .3s ease',
        padding: open ? '0 22px 18px 66px' : '0 22px 0 66px',
      }}>
        <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.7 }}>{item.a}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════ */

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  return (
    <MarketingShell>
      {/* ═══ HERO ═══ */}
      <MarketingHero
        badge="// PRICING"
        title={<>Simple pricing that <span className="mk-grad-text">scales with you.</span></>}
        subtitle="Start free. Upgrade when traffic grows. No per-seat games, no surprise bills."
      >
        {/* Billing toggle */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 0,
          background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, padding: 4,
          marginTop: 12, boxShadow: 'var(--s1)',
        }}>
          <button
            onClick={() => setAnnual(false)}
            style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: !annual ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
              color: !annual ? '#fff' : 'var(--t3)',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all .25s',
              boxShadow: !annual ? '0 2px 12px rgba(99,102,241,.35)' : 'none',
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: annual ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
              color: annual ? '#fff' : 'var(--t3)',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              transition: 'all .25s',
              boxShadow: annual ? '0 2px 12px rgba(99,102,241,.35)' : 'none',
            }}
          >
            Annual
            <span style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 6,
              background: annual ? 'rgba(255,255,255,.2)' : 'rgba(74,222,128,.12)',
              color: annual ? '#fff' : '#22c55e',
              fontWeight: 700, letterSpacing: '.02em',
            }}>
              SAVE 20%
            </span>
          </button>
        </div>
      </MarketingHero>

      {/* ═══ PLAN CARDS ═══ */}
      <section className="mk-sec" style={{ paddingTop: 36 }}>
        <div className="mk-wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 20 }}>
            {PLANS.map(plan => {
              const price = annual ? plan.price.annual : plan.price.monthly;
              const isHighlight = plan.highlight;
              return (
                <div
                  key={plan.name}
                  style={{
                    position: 'relative',
                    background: 'var(--card)',
                    border: `1px solid ${isHighlight ? 'rgba(129,140,248,.4)' : 'var(--b1)'}`,
                    borderRadius: 18,
                    padding: 0,
                    overflow: 'hidden',
                    boxShadow: isHighlight
                      ? '0 20px 60px rgba(99,102,241,.2), 0 0 0 1px rgba(129,140,248,.15)'
                      : 'var(--s1)',
                    transition: 'transform .25s, box-shadow .25s, border-color .25s',
                    transform: isHighlight ? 'scale(1.02)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isHighlight) {
                      e.currentTarget.style.borderColor = 'var(--b3)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,.15)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isHighlight) {
                      e.currentTarget.style.borderColor = 'var(--b1)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'var(--s1)';
                    }
                  }}
                >
                  {/* Top accent bar */}
                  <div style={{
                    height: 3, background: plan.gradient, width: '100%',
                  }} />

                  {/* Most Popular badge */}
                  {isHighlight && (
                    <div style={{
                      position: 'absolute', top: 16, right: 16,
                      padding: '5px 12px', borderRadius: 100,
                      background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                      fontSize: 10, fontWeight: 700, color: '#fff',
                      textTransform: 'uppercase', letterSpacing: '.08em',
                      boxShadow: '0 2px 12px rgba(99,102,241,.4)',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Star size={10} fill="#fff" /> Most Popular
                    </div>
                  )}

                  <div style={{ padding: '28px 26px 26px' }}>
                    {/* Icon + Plan name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: `${plan.color}15`,
                        border: `1px solid ${plan.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <plan.icon size={18} color={plan.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-.02em' }}>{plan.name}</div>
                      </div>
                    </div>

                    <p style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 22, minHeight: 40 }}>{plan.tagline}</p>

                    {/* Price */}
                    <div style={{ marginBottom: 22, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      {price === -1 ? (
                        <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--t1)', letterSpacing: '-1.5px' }}>Custom</span>
                      ) : price === 0 ? (
                        <>
                          <span style={{ fontSize: 42, fontWeight: 900, color: 'var(--t1)', letterSpacing: '-1.5px' }}>$0</span>
                          <span style={{ fontSize: 14, color: 'var(--t3)', fontWeight: 500 }}>forever</span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: 42, fontWeight: 900, color: 'var(--t1)', letterSpacing: '-1.5px' }}>${price}</span>
                          <span style={{ fontSize: 14, color: 'var(--t3)', fontWeight: 500 }}>/ mo</span>
                          {annual && (
                            <span style={{
                              fontSize: 12, color: '#22c55e', fontWeight: 600, marginLeft: 6,
                              padding: '2px 8px', borderRadius: 6, background: 'rgba(34,197,94,.1)',
                            }}>
                              ${(plan.price.monthly - plan.price.annual) * 12} saved / yr
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* CTA button */}
                    <Link
                      href={plan.cta.href}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        width: '100%', padding: '13px 20px', borderRadius: 12,
                        background: isHighlight ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
                        border: isHighlight ? 'none' : '1px solid var(--b2)',
                        color: isHighlight ? '#fff' : 'var(--t1)',
                        fontSize: 14, fontWeight: 700, textDecoration: 'none',
                        cursor: 'pointer', transition: 'all .2s',
                        boxShadow: isHighlight ? '0 4px 16px rgba(99,102,241,.35)' : 'none',
                        marginBottom: 22,
                      }}
                    >
                      {plan.cta.label}
                      <ArrowRight size={14} />
                    </Link>

                    {/* Divider */}
                    <div style={{ height: 1, background: 'var(--b1)', marginBottom: 18 }} />

                    {/* Features */}
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
                      What&apos;s included
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                            background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: 1,
                          }}>
                            <Check size={11} color="#22c55e" strokeWidth={3} />
                          </div>
                          <span style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.5 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compare link */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => setShowCompare(!showCompare)}
              style={{
                background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 12,
                padding: '12px 28px', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: 'var(--a)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'all .2s',
                boxShadow: 'var(--s1)',
              }}
            >
              {showCompare ? 'Hide' : 'Compare all plans'}
              {showCompare ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      {showCompare && (
        <section className="mk-sec" style={{ paddingTop: 8 }}>
          <div className="mk-wrap">
            <div style={{
              background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 18,
              overflow: 'hidden', boxShadow: 'var(--s1)',
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%', borderCollapse: 'collapse', minWidth: 700,
                }}>
                  <thead>
                    <tr>
                      <th style={{
                        textAlign: 'left', padding: '18px 24px', fontSize: 13, fontWeight: 700,
                        color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em',
                        borderBottom: '1px solid var(--b1)', background: 'var(--card2)',
                        width: '30%',
                      }}>Features</th>
                      {['Free', 'Growth', 'Scale', 'Enterprise'].map(p => (
                        <th key={p} style={{
                          textAlign: 'center', padding: '18px 16px', fontSize: 14, fontWeight: 700,
                          color: p === 'Growth' ? 'var(--a)' : 'var(--t1)',
                          borderBottom: '1px solid var(--b1)', background: 'var(--card2)',
                          width: '17.5%',
                        }}>
                          {p}
                          {p === 'Growth' && <div style={{ width: 4, height: 4, borderRadius: 4, background: 'var(--a)', margin: '4px auto 0' }} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map((row, i) => {
                      if (row.category) {
                        return (
                          <tr key={`cat-${i}`}>
                            <td colSpan={5} style={{
                              padding: '14px 24px', fontSize: 12, fontWeight: 700,
                              color: 'var(--a)', textTransform: 'uppercase', letterSpacing: '.06em',
                              background: 'var(--abg)', borderBottom: '1px solid var(--b1)',
                              borderTop: i > 0 ? '1px solid var(--b1)' : 'none',
                            }}>
                              {row.category}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={row.feature} style={{
                          borderBottom: '1px solid var(--b1)',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--abg)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <td style={{ padding: '13px 24px', fontSize: 13.5, color: 'var(--t2)', fontWeight: 500 }}>{row.feature}</td>
                          <td style={{ padding: '13px 16px', textAlign: 'center' }}><CellValue val={row.free} /></td>
                          <td style={{ padding: '13px 16px', textAlign: 'center', background: 'rgba(99,102,241,.03)' }}><CellValue val={row.growth} /></td>
                          <td style={{ padding: '13px 16px', textAlign: 'center' }}><CellValue val={row.scale} /></td>
                          <td style={{ padding: '13px 16px', textAlign: 'center' }}><CellValue val={row.enterprise} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ TRUST METRICS ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="mk-sec-label">// TRUSTED BY ENGINEERING TEAMS</span>
            <h2 className="mk-sec-title">Infrastructure you can count on.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
            {TRUST_METRICS.map(m => (
              <div key={m.label} style={{
                background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 16,
                padding: '28px 22px', textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                {/* Watermark icon */}
                <div style={{
                  position: 'absolute', top: -8, right: -8, opacity: .04,
                }}>
                  <m.icon size={80} />
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, margin: '0 auto 14px',
                  background: `${m.color}12`, border: `1px solid ${m.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <m.icon size={18} color={m.color} />
                </div>
                <div style={{
                  fontSize: 30, fontWeight: 900, letterSpacing: '-1px',
                  background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginBottom: 4,
                }}>
                  {m.value}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--t3)', fontWeight: 500 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="mk-sec-label">// WHAT TEAMS SAY</span>
            <h2 className="mk-sec-title">Loved by engineering teams.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 16,
                padding: '26px 24px', position: 'relative',
              }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                {/* Quote */}
                <p style={{
                  fontSize: 14, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 22,
                  fontStyle: 'italic',
                }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff',
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INCLUDED IN EVERY PLAN ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="mk-sec-label">// EVERY PLAN INCLUDES</span>
            <h2 className="mk-sec-title">Core features on every tier.</h2>
            <p className="mk-sec-sub" style={{ maxWidth: 600, margin: '0 auto' }}>
              No matter which plan you choose, you get the essentials to deliver webhooks reliably.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16 }}>
            {[
              { icon: RefreshCw, title: 'Automatic retries', desc: 'Exponential backoff with jitter. Never lose an event to a transient failure.', color: '#22c55e' },
              { icon: Shield, title: 'HMAC signatures', desc: 'Every payload is signed with HMAC-SHA256. Verify the origin on your end.', color: '#818cf8' },
              { icon: BarChart3, title: 'Real-time dashboard', desc: 'Track events, delivery rates, latency percentiles — all in real time.', color: '#f59e0b' },
              { icon: Layers, title: 'Event transformations', desc: 'Rename fields, filter payloads, add computed properties — no code.', color: '#3b82f6' },
              { icon: Globe, title: 'REST API + SDKs', desc: 'Full API access. Node.js, Python, Go SDKs. Everything documented.', color: '#06b6d4' },
              { icon: Lock, title: 'SOC 2 ready', desc: 'Built-in controls for SOC 2 compliance. Audit-ready from day one.', color: '#a855f7' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 14,
                padding: '24px 22px', transition: 'border-color .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}40`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b1)'; }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${item.color}12`, border: `1px solid ${item.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  <item.icon size={17} color={item.color} />
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{item.title}</div>
                <p style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="mk-sec-label">// FAQ</span>
            <h2 className="mk-sec-title">Frequently asked questions</h2>
            <p className="mk-sec-sub" style={{ maxWidth: 520, margin: '0 auto' }}>
              Everything you need to know about pricing, billing, and plans.
            </p>
          </div>
          <div style={{ maxWidth: 750, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ.map(item => <FAQItem key={item.q} item={item} />)}
          </div>
        </div>
      </section>

      {/* ═══ GUARANTEE + CTA ═══ */}
      <section className="mk-sec">
        <div className="mk-wrap">
          {/* Guarantee strip */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginBottom: 48,
            padding: '24px 32px', background: 'var(--card)', border: '1px solid var(--b1)',
            borderRadius: 16,
          }}>
            {[
              { icon: CreditCard, text: 'No credit card for free tier' },
              { icon: RefreshCw, text: 'Switch plans anytime' },
              { icon: Shield, text: '14-day money-back guarantee' },
              { icon: Clock, text: 'Cancel anytime, no questions' },
            ].map(g => (
              <div key={g.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <g.icon size={14} color="#22c55e" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)' }}>{g.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            textAlign: 'center',
            background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 24,
            padding: '56px 40px', position: 'relative', overflow: 'hidden',
          }}>
            {/* Gradient glow bg */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(99,102,241,.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', boxShadow: '0 8px 30px rgba(99,102,241,.35)',
            }}>
              <Sparkles size={24} color="#fff" />
            </div>
            <h2 style={{
              fontSize: 28, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-.02em',
              marginBottom: 10,
            }}>
              Still not sure which plan?
            </h2>
            <p style={{
              fontSize: 15, color: 'var(--t2)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7,
            }}>
              Start on Free — no credit card required. Upgrade when your traffic grows. Or talk to us and we&apos;ll help you pick the right plan.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
              <Link href="/auth/register" className="mk-btn-big" style={{ padding: '14px 32px', fontSize: 15 }}>
                Start Free <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="mk-btn-out" style={{ padding: '14px 28px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Headphones size={15} /> Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
