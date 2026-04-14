'use client';

import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import { Sparkles, Zap, Shield, Rss } from 'lucide-react';

type Entry = {
  version: string;
  date: string;
  tag: 'major' | 'feature' | 'improvement' | 'fix' | 'security';
  title: string;
  bullets: string[];
};

const ENTRIES: Entry[] = [
  {
    version: 'v5.4.0',
    date: 'April 10, 2026',
    tag: 'major',
    title: 'Request-ID correlation end-to-end',
    bullets: [
      'Every inbound request now carries an `x-request-id` through controllers → event docs → Bull jobs → delivery logs.',
      'Search the entire pipeline by request ID in the dashboard and the CLI.',
      'Prometheus labels extended to include request_id cardinality-safe bucketing.',
    ],
  },
  {
    version: 'v5.3.2',
    date: 'April 2, 2026',
    tag: 'feature',
    title: 'Zero-downtime encryption key rotation',
    bullets: [
      'New `PAYLOAD_ENCRYPTION_KEY_VERSION` env var lets you roll keys without touching stored data.',
      'Legacy ciphertexts stay readable via a `PAYLOAD_ENCRYPTION_KEY_PREVIOUS` fallback.',
      'Re-encryption worker available as a scheduled task for in-place migration.',
    ],
  },
  {
    version: 'v5.3.0',
    date: 'March 26, 2026',
    tag: 'feature',
    title: 'Batched delivery-log writer',
    bullets: [
      'Delivery attempts are now coalesced into `insertMany({ ordered: false })` batches.',
      'Tunable via `DELIVERY_LOG_BATCH_SIZE`, `DELIVERY_LOG_FLUSH_MS`, `DELIVERY_LOG_MAX_BUFFER`.',
      'Graceful drain on shutdown — zero lost rows during rolling deploys.',
    ],
  },
  {
    version: 'v5.2.1',
    date: 'March 18, 2026',
    tag: 'improvement',
    title: 'Redis-shared circuit breaker',
    bullets: [
      'Opossum (local) + Redis-shared breaker layer — all workers converge on OPEN/CLOSED state within 200ms.',
      'Per-endpoint breaker config surfaced in the endpoint settings page.',
    ],
  },
  {
    version: 'v5.2.0',
    date: 'March 5, 2026',
    tag: 'feature',
    title: 'Cursor-based pagination for events',
    bullets: [
      'New `GET /projects/:id/events/cursor` endpoint — opaque base64url cursor for deep scrolls.',
      'Old offset-based list stays for small-page UIs.',
      'Dashboard event feed now uses cursor paging for stable infinite scroll.',
    ],
  },
  {
    version: 'v5.1.4',
    date: 'February 22, 2026',
    tag: 'security',
    title: 'Endpoint cache invalidation on mutation',
    bullets: [
      'Every endpoint mutation (update / rotate-secret / pause / resume) now invalidates the delivery cache.',
      'Closed a window where a rotated secret could keep signing with the old value for up to 60s.',
    ],
  },
  {
    version: 'v5.1.0',
    date: 'February 8, 2026',
    tag: 'feature',
    title: 'AI anomaly detection (beta)',
    bullets: [
      'New ML model flags spikes in failure rate, latency, and payload shape shifts.',
      'Inline explanations for why a delivery failed — status code, headers, body, root cause.',
      'Available on Growth and Scale plans.',
    ],
  },
  {
    version: 'v5.0.3',
    date: 'January 29, 2026',
    tag: 'fix',
    title: 'Dedup window edge-case on key collision',
    bullets: [
      'Fixed a bug where two distinct events with identical idempotency keys submitted within 1ms could both enqueue.',
      'Also tightened TTL index on the dedup collection.',
    ],
  },
  {
    version: 'v5.0.0',
    date: 'January 15, 2026',
    tag: 'major',
    title: 'WebhookOS v5 — full rewrite',
    bullets: [
      'NestJS 10 + Mongoose + BullMQ rebuild from the ground up.',
      'AES-256-GCM at-rest encryption default.',
      'New dashboard with live feed, AI search, and canary deploys.',
    ],
  },
];

const TAG_META: Record<Entry['tag'], { label: string; color: string; bg: string }> = {
  major: { label: 'Major', color: '#fbbf24', bg: 'rgba(251,191,36,.1)' },
  feature: { label: 'New', color: '#4ade80', bg: 'rgba(74,222,128,.1)' },
  improvement: { label: 'Improved', color: '#60a5fa', bg: 'rgba(96,165,250,.1)' },
  fix: { label: 'Fixed', color: '#c084fc', bg: 'rgba(192,132,252,.1)' },
  security: { label: 'Security', color: '#fb7185', bg: 'rgba(251,113,133,.1)' },
};

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <MarketingHero
        badge="// CHANGELOG"
        title={<>What we shipped <span className="mk-grad-text">this month.</span></>}
        subtitle="A record of every notable change — features, improvements, fixes, and security updates. Shipped weekly."
      >
        <a href="/changelog.rss" className="mk-btn-out" style={{ padding: '11px 22px', fontSize: 13 }}><Rss size={14} /> Subscribe via RSS</a>
        <Link href="/roadmap" className="mk-btn-out" style={{ padding: '11px 22px', fontSize: 13 }}>See Roadmap <ArrowRight size={14} /></Link>
      </MarketingHero>

      <section className="mk-sec" style={{ paddingTop: 20 }}>
        <div className="mk-wrap" style={{ maxWidth: 820 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {ENTRIES.map(entry => {
              const meta = TAG_META[entry.tag];
              return (
                <article key={entry.version} className="mk-card" style={{ padding: '26px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 100, background: meta.bg, color: meta.color, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', border: `1px solid ${meta.color}33` }}>{meta.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12, color: '#818cf8', fontWeight: 600 }}>{entry.version}</span>
                    <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#475569' }}>{entry.date}</span>
                  </div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, letterSpacing: '-.4px' }}>{entry.title}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {entry.bullets.map(b => (
                      <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#94a3b8', lineHeight: 1.65 }}>
                        <span style={{ marginTop: 8, width: 5, height: 5, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48, padding: '32px 24px', background: 'rgba(15,23,42,.5)', border: '1px solid rgba(99,102,241,.15)', borderRadius: 14 }}>
            <Sparkles size={22} color="#a5b4fc" style={{ marginBottom: 10 }} />
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Want to hear about new releases?</h3>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 18 }}>We send one email per month summarizing everything that shipped.</p>
            <Link href="/contact?reason=newsletter" className="mk-btn-out" style={{ padding: '10px 22px', fontSize: 13 }}>Subscribe</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
