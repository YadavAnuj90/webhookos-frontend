'use client';

import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import { CheckCircle2, Circle, Clock, Zap, MessageSquare } from 'lucide-react';

type Item = { title: string; desc: string; status: 'shipped' | 'in_progress' | 'planned' };

const SHIPPED: Item[] = [
  { title: 'Request-ID correlation', desc: 'Every request tracked end-to-end through controllers, queues, and logs.', status: 'shipped' },
  { title: 'Zero-downtime key rotation', desc: 'AES-256-GCM envelope encryption with versioned keys.', status: 'shipped' },
  { title: 'AI anomaly detection (beta)', desc: 'ML-flagged spikes in failure rate, latency, and payload shape.', status: 'shipped' },
  { title: 'Cursor-based pagination', desc: 'Stable deep-scroll paging for event lists.', status: 'shipped' },
  { title: 'Redis-shared circuit breakers', desc: 'All workers converge on failure state in <200ms.', status: 'shipped' },
];

const IN_PROGRESS: Item[] = [
  { title: 'Multi-region active-active', desc: 'Write from the nearest region — Mongo + Redis replication across 3 regions. Targeted: Q2 2026.', status: 'in_progress' },
  { title: 'JSONata transform studio', desc: 'Visual editor for payload transforms with live preview. Beta rolling out to Scale customers.', status: 'in_progress' },
  { title: 'SCIM user provisioning', desc: 'Automated user lifecycle sync with Okta, Azure AD, and Google Workspace.', status: 'in_progress' },
  { title: 'Native SDKs', desc: 'First-class Node, Python, Go, and Ruby SDKs with idempotency + retries built in.', status: 'in_progress' },
];

const PLANNED: Item[] = [
  { title: 'Event replay scheduling', desc: 'Replay historical events on a cron. Useful for downstream system backfills.', status: 'planned' },
  { title: 'Bring-your-own Kafka', desc: 'Consume from Kafka, fan-out to webhooks. Managed Kafka bridge.', status: 'planned' },
  { title: 'Static IP allowlisting', desc: 'Fixed egress IPs per workspace for customers with strict allowlists.', status: 'planned' },
  { title: 'On-prem / self-hosted', desc: 'Helm chart + managed upgrades for Enterprise customers who need air-gapped deploys.', status: 'planned' },
  { title: 'Webhook playgrounds', desc: 'Public sandbox URLs for testing consumer integrations.', status: 'planned' },
  { title: 'Stripe / Shopify event mirrors', desc: 'One-click mirror popular SaaS webhooks through WebhookOS for retries and observability.', status: 'planned' },
];

const STATUS_META = {
  shipped: { icon: CheckCircle2, color: '#4ade80', label: 'Shipped', bg: 'rgba(74,222,128,.1)' },
  in_progress: { icon: Clock, color: '#fbbf24', label: 'In progress', bg: 'rgba(251,191,36,.1)' },
  planned: { icon: Circle, color: '#64748b', label: 'Planned', bg: 'rgba(100,116,139,.1)' },
};

function Column({ title, items, subtitle }: { title: string; items: Item[]; subtitle: string }) {
  return (
    <div style={{ flex: 1, minWidth: 280 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{title}</h3>
        <p style={{ fontSize: 12.5, color: '#64748b' }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => {
          const meta = STATUS_META[item.status];
          return (
            <div key={item.title} className="mk-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <meta.icon size={14} color={meta.color} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '.08em' }}>{meta.label}</span>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#f1f5f9', marginBottom: 5, letterSpacing: '-.2px' }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.55 }}>{item.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <MarketingShell>
      <MarketingHero
        badge="// ROADMAP"
        title={<>What we're building <span className="mk-grad-text">next.</span></>}
        subtitle="Public roadmap — because your bets depend on ours. Timelines are directional, not promises."
      >
        <Link href="/contact?reason=roadmap" className="mk-btn-out" style={{ padding: '11px 22px', fontSize: 13 }}><MessageSquare size={14} /> Request a feature</Link>
        <Link href="/changelog" className="mk-btn-out" style={{ padding: '11px 22px', fontSize: 13 }}>See Changelog <ArrowRight size={14} /></Link>
      </MarketingHero>

      <section className="mk-sec" style={{ paddingTop: 20 }}>
        <div className="mk-wrap">
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Column title="Recently shipped" subtitle="The last 90 days." items={SHIPPED} />
            <Column title="In progress" subtitle="Landing in the next quarter." items={IN_PROGRESS} />
            <Column title="Planned" subtitle="On the board — timing TBD." items={PLANNED} />
          </div>
        </div>
      </section>

      <section className="mk-sec" style={{ textAlign: 'center' }}>
        <div className="mk-wrap" style={{ maxWidth: 640 }}>
          <Zap size={28} color="#a5b4fc" style={{ marginBottom: 12 }} />
          <h2 className="mk-sec-title">Something missing?</h2>
          <p className="mk-sec-sub" style={{ margin: '0 auto 28px' }}>Our roadmap is shaped by real customer pain. Tell us what you need and we'll prioritize it.</p>
          <Link href="/contact?reason=roadmap" className="mk-btn-big">Request a Feature <ArrowRight size={15} /></Link>
        </div>
      </section>
    </MarketingShell>
  );
}
