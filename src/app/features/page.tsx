'use client';

import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import {
  Zap, Shield, RefreshCw, Brain, FileJson, Lock, Activity, GitBranch,
  BarChart3, Filter, Globe, Clock, AlertTriangle, CheckCircle2, Layers, Workflow,
  SearchX, Wand2, Code2, Database, Cpu, Eye,
} from 'lucide-react';

type F = { icon: any; title: string; desc: string; color: string };

const CORE: F[] = [
  { icon: Zap, title: 'Instant delivery', desc: 'Sub-200ms hop from your producer to the consumer endpoint with hot-path queues.', color: '#fbbf24' },
  { icon: Shield, title: 'HMAC-SHA256 signing', desc: 'Every request carries a rotating secret signature — tamper-evident out of the box.', color: '#22d3ee' },
  { icon: RefreshCw, title: 'Exponential retries', desc: 'Configurable retry policy with jitter, backoff caps, and per-endpoint overrides.', color: '#a78bfa' },
  { icon: AlertTriangle, title: 'Dead-letter queue', desc: 'Failed events land in an inspectable DLQ. Replay individually or in bulk.', color: '#fb7185' },
  { icon: Filter, title: 'Deduplication', desc: 'Content-hash + idempotency-key dedup windows protect consumers from double-fires.', color: '#34d399' },
  { icon: Lock, title: 'AES-256-GCM at rest', desc: 'Payloads encrypted with versioned keys and rolling rotation support.', color: '#60a5fa' },
];

const OPS: F[] = [
  { icon: Activity, title: 'Live event feed', desc: 'Tail every delivery in real time with websocket push.', color: '#f472b6' },
  { icon: BarChart3, title: 'Latency histograms', desc: 'p50/p95/p99 success and failure latency per project + endpoint.', color: '#818cf8' },
  { icon: GitBranch, title: 'Circuit breakers', desc: 'Local Opossum + Redis-shared breakers converge failure state across workers.', color: '#fb923c' },
  { icon: Clock, title: 'Rate limiting', desc: 'Per-endpoint RPS caps with fair-share queuing; Retry-After honored end-to-end.', color: '#c084fc' },
  { icon: Eye, title: 'Canary deploys', desc: 'Route a percentage of events to a canary URL before flipping production.', color: '#4ade80' },
  { icon: Workflow, title: 'Event transformations', desc: 'Shape payloads with JSONata before delivery — no middleware code required.', color: '#06b6d4' },
];

const AI: F[] = [
  { icon: Brain, title: 'Anomaly detection', desc: 'ML-flagged spikes in failure rate, latency, or payload shape shifts.', color: '#a855f7' },
  { icon: SearchX, title: 'Smart search', desc: 'Natural-language event search across millions of historical deliveries.', color: '#ec4899' },
  { icon: Wand2, title: 'AI-assisted transforms', desc: 'Describe the shape you want, get a working JSONata mapping.', color: '#22d3ee' },
  { icon: FileJson, title: 'Payload diagnosis', desc: 'Explain why a delivery failed in plain English — status, headers, body, root cause.', color: '#fbbf24' },
];

const ENT: F[] = [
  { icon: Globe, title: 'Multi-region', desc: 'Deploy close to your consumers. Active-active with Mongo + Redis replication.', color: '#38bdf8' },
  { icon: Layers, title: 'Workspaces & RBAC', desc: 'Fine-grained permissions across projects, endpoints, and billing.', color: '#818cf8' },
  { icon: Database, title: 'PII scrubbing', desc: 'Field-level redaction before storage — GDPR/HIPAA-ready.', color: '#4ade80' },
  { icon: CheckCircle2, title: 'Audit logs', desc: 'Every config change tracked with actor, IP, and diff.', color: '#f472b6' },
  { icon: Cpu, title: 'Bring-your-own storage', desc: 'Archive raw payloads to your own S3 or GCS bucket.', color: '#fb923c' },
  { icon: Code2, title: 'Open API + webhooks (meta)', desc: 'Every capability we ship is available via REST and outbound events.', color: '#c084fc' },
];

function Grid({ items }: { items: F[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18, marginTop: 36 }}>
      {items.map((f, i) => (
        <div key={f.title} className="mk-card" style={{ animationDelay: `${i * 40}ms` }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg,${f.color}33,${f.color}11)`, border: `1px solid ${f.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <f.icon size={18} color={f.color} />
          </div>
          <div className="mk-card-title">{f.title}</div>
          <div className="mk-card-desc">{f.desc}</div>
        </div>
      ))}
    </div>
  );
}

function Section({ label, title, sub, items }: { label: string; title: string; sub: string; items: F[] }) {
  return (
    <section className="mk-sec">
      <div className="mk-wrap">
        <span className="mk-sec-label">{label}</span>
        <h2 className="mk-sec-title">{title}</h2>
        <p className="mk-sec-sub">{sub}</p>
        <Grid items={items} />
      </div>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <MarketingHero
        badge="// FEATURES"
        title={<>Everything you need to ship <span className="mk-grad-text">reliable webhooks.</span></>}
        subtitle="WebhookOS is the production-grade delivery layer between your services and the world — signing, retrying, observing, and scaling every event you fire."
      >
        <Link href="/auth/register" className="mk-btn-big">Start Free <ArrowRight size={15} /></Link>
        <Link href="/pricing" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>See Pricing</Link>
      </MarketingHero>

      <Section label="// CORE DELIVERY" title="Built for delivery, not retries" sub="The fundamentals done right, so your team stops paging on webhook failures." items={CORE} />
      <Section label="// OBSERVABILITY" title="See everything, fix anything" sub="First-class visibility across every event, endpoint, and worker in your fleet." items={OPS} />
      <Section label="// AI ASSIST" title="Let Claude read your delivery logs" sub="Embedded AI for the chores that swallow engineer time — search, diagnosis, and transforms." items={AI} />
      <Section label="// ENTERPRISE" title="When compliance and scale matter" sub="Everything a security review asks for, available without a custom deployment." items={ENT} />

      <section className="mk-sec" style={{ textAlign: 'center' }}>
        <div className="mk-wrap">
          <h2 className="mk-sec-title" style={{ margin: '0 auto 14px' }}>Ready in minutes.</h2>
          <p className="mk-sec-sub" style={{ margin: '0 auto 28px' }}>Free plan. No credit card. Production-grade from day one.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" className="mk-btn-big">Create Free Account <ArrowRight size={15} /></Link>
            <Link href="/docs" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>Read the Docs</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
