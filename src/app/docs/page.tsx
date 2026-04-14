'use client';

import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import { BookOpen, Rocket, Key, Send, Shield, RefreshCw, Code2, Terminal, Webhook, Database } from 'lucide-react';

type Guide = { icon: any; title: string; desc: string; href: string; time: string };

const QUICKSTART: Guide[] = [
  { icon: Rocket, title: '5-minute quickstart', desc: 'Create your first project, endpoint, and fire a test event.', href: '/docs/quickstart', time: '5 min' },
  { icon: Key, title: 'Authentication', desc: 'JWT for dashboards, API keys for server integrations. SSO/SAML for Enterprise.', href: '/docs/auth', time: '3 min' },
  { icon: Send, title: 'Sending your first event', desc: 'POST /projects/:id/events/send with payload + eventType.', href: '/docs/send-event', time: '4 min' },
];

const CORE: Guide[] = [
  { icon: Webhook, title: 'Endpoints & subscriptions', desc: 'Create endpoints, subscribe to event types, and manage filters.', href: '/docs/endpoints', time: '6 min' },
  { icon: Shield, title: 'HMAC signature verification', desc: 'Verify signatures on your consumer — Node, Python, Go, Ruby examples.', href: '/docs/signing', time: '5 min' },
  { icon: RefreshCw, title: 'Retries & DLQ', desc: 'Retry policies, backoff config, replaying dead-lettered events.', href: '/docs/retries', time: '8 min' },
  { icon: Database, title: 'Idempotency & dedup', desc: 'Using Idempotency-Key headers and content-hash dedup windows.', href: '/docs/idempotency', time: '6 min' },
];

const ADVANCED: Guide[] = [
  { icon: Code2, title: 'Payload transformations', desc: 'JSONata transforms applied before delivery.', href: '/docs/transforms', time: '10 min' },
  { icon: Terminal, title: 'CLI & local tunnels', desc: 'WebhookOS CLI for local dev with tunneled forwarding.', href: '/docs/cli', time: '7 min' },
  { icon: Shield, title: 'Encryption & key rotation', desc: 'AES-256-GCM at rest, versioned keys, zero-downtime rotation.', href: '/docs/encryption', time: '9 min' },
  { icon: BookOpen, title: 'Canary deploys', desc: 'Split traffic between endpoints to validate new consumers.', href: '/docs/canary', time: '6 min' },
];

function Card({ g }: { g: Guide }) {
  return (
    <Link href={g.href} className="mk-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <g.icon size={16} color="#a5b4fc" />
        </div>
        <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono,monospace', fontSize: 10.5, color: '#64748b' }}>{g.time}</span>
      </div>
      <div className="mk-card-title" style={{ fontSize: 15.5 }}>{g.title}</div>
      <div className="mk-card-desc" style={{ fontSize: 13 }}>{g.desc}</div>
    </Link>
  );
}

export default function DocsPage() {
  return (
    <MarketingShell>
      <MarketingHero
        badge="// DOCUMENTATION"
        title={<>Learn WebhookOS <span className="mk-grad-text">in 30 minutes.</span></>}
        subtitle="Everything from your first event to multi-region deployments. Written by the team that built it."
      >
        <Link href="/docs/quickstart" className="mk-btn-big">Start with Quickstart <ArrowRight size={15} /></Link>
        <Link href="/api-reference" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>API Reference</Link>
      </MarketingHero>

      <section className="mk-sec" style={{ paddingTop: 20 }}>
        <div className="mk-wrap">
          <span className="mk-sec-label">// QUICKSTART</span>
          <h2 className="mk-sec-title">Get started</h2>
          <p className="mk-sec-sub">Your first event flowing in minutes.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginTop: 28 }}>
            {QUICKSTART.map(g => <Card key={g.title} g={g} />)}
          </div>
        </div>
      </section>

      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// CORE CONCEPTS</span>
          <h2 className="mk-sec-title">The essentials</h2>
          <p className="mk-sec-sub">Everything you'll touch in your first week on WebhookOS.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginTop: 28 }}>
            {CORE.map(g => <Card key={g.title} g={g} />)}
          </div>
        </div>
      </section>

      <section className="mk-sec">
        <div className="mk-wrap">
          <span className="mk-sec-label">// ADVANCED</span>
          <h2 className="mk-sec-title">Deep dives</h2>
          <p className="mk-sec-sub">For when you're ready to scale or harden your setup.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, marginTop: 28 }}>
            {ADVANCED.map(g => <Card key={g.title} g={g} />)}
          </div>
        </div>
      </section>

      <section className="mk-sec">
        <div className="mk-wrap" style={{ maxWidth: 720, textAlign: 'center' }}>
          <Terminal size={26} color="#a5b4fc" style={{ marginBottom: 12 }} />
          <h2 className="mk-sec-title">Can't find what you need?</h2>
          <p className="mk-sec-sub" style={{ margin: '0 auto 28px' }}>Our docs are a work in progress. If something's missing, unclear, or wrong — tell us.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/api-reference" className="mk-btn-big">Browse API Reference <ArrowRight size={15} /></Link>
            <Link href="/contact?reason=docs" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>Contact Support</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
