'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MarketingShell, { MarketingHero } from '@/components/layout/MarketingShell';
import { CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

type Status = 'operational' | 'degraded' | 'outage';

const COMPONENTS: { name: string; desc: string; status: Status }[] = [
  { name: 'API — ingestion', desc: 'POST /events/send, /broadcast', status: 'operational' },
  { name: 'API — dashboard', desc: 'GET list/detail endpoints', status: 'operational' },
  { name: 'Delivery workers (US-East)', desc: 'Primary BullMQ worker fleet', status: 'operational' },
  { name: 'Delivery workers (EU-West)', desc: 'Regional worker fleet', status: 'operational' },
  { name: 'Webhooks signing & retries', desc: 'HMAC + exponential backoff engine', status: 'operational' },
  { name: 'AI anomaly detection', desc: 'ML inference endpoint', status: 'operational' },
  { name: 'Billing & subscriptions', desc: 'Razorpay webhook receiver', status: 'operational' },
  { name: 'Dashboard websockets', desc: 'Live event feed', status: 'operational' },
];

const STATUS_META: Record<Status, { label: string; color: string; bg: string; icon: any }> = {
  operational: { label: 'Operational', color: '#4ade80', bg: 'rgba(74,222,128,.1)', icon: CheckCircle2 },
  degraded: { label: 'Degraded', color: '#fbbf24', bg: 'rgba(251,191,36,.1)', icon: AlertTriangle },
  outage: { label: 'Outage', color: '#fb7185', bg: 'rgba(251,113,133,.1)', icon: AlertTriangle },
};

const RECENT: { date: string; title: string; status: 'resolved' | 'monitoring'; desc: string }[] = [
  { date: 'Apr 8, 2026 · 14:22 UTC', title: 'Scheduled maintenance — Redis cluster failover', status: 'resolved', desc: 'Completed rolling failover of Redis 7 cluster in US-East. No customer impact. Duration: 18 minutes.' },
  { date: 'Mar 24, 2026 · 09:51 UTC', title: 'Elevated latency on EU-West deliveries', status: 'resolved', desc: 'p95 latency rose to 2.1s for 22 minutes due to a downstream network blip at our EU provider. Auto-recovered once upstream stabilized.' },
  { date: 'Mar 11, 2026 · 16:03 UTC', title: 'Dashboard slowness — resolved', status: 'resolved', desc: 'MongoDB read replica lag caused slow dashboard loads for ~8 minutes. Replication caught up automatically.' },
];

function Bar({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 100, background: meta.bg, border: `1px solid ${meta.color}33` }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
      <span style={{ fontSize: 11.5, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '.08em' }}>{meta.label}</span>
    </div>
  );
}

export default function StatusPage() {
  const [now, setNow] = useState<string>('');
  useEffect(() => {
    const update = () => setNow(new Date().toUTCString());
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  const overall: Status = COMPONENTS.some(c => c.status === 'outage') ? 'outage' : COMPONENTS.some(c => c.status === 'degraded') ? 'degraded' : 'operational';
  const overallMeta = STATUS_META[overall];

  return (
    <MarketingShell>
      <section style={{ padding: '110px 0 20px' }}>
        <div className="mk-wrap">
          <span className="mk-sec-label">// SYSTEM STATUS</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f8fafc', letterSpacing: '-1.4px' }}>
              {overall === 'operational' ? 'All systems operational' : overall === 'degraded' ? 'Partial degradation' : 'Active incident'}
            </h1>
            <Bar status={overall} />
          </div>
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#64748b' }}>
            Last updated {now || '—'} · <Link href="/status.rss" style={{ color: '#818cf8' }}>RSS</Link>
          </div>
        </div>
      </section>

      <section className="mk-sec" style={{ paddingTop: 32 }}>
        <div className="mk-wrap">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Current status</h2>
          <div className="mk-card" style={{ padding: 0, overflow: 'hidden' }}>
            {COMPONENTS.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderTop: i === 0 ? 'none' : '1px solid rgba(99,102,241,.08)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{c.desc}</div>
                </div>
                <Bar status={c.status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-sec">
        <div className="mk-wrap">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Uptime (last 90 days)</h2>
          <div className="mk-card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(90,1fr)', gap: 3, marginBottom: 14 }}>
              {Array.from({ length: 90 }).map((_, i) => {
                const bad = i === 62 || i === 77;
                const warn = i === 82;
                return <div key={i} style={{ height: 28, borderRadius: 3, background: bad ? '#fb7185' : warn ? '#fbbf24' : '#4ade80', opacity: bad ? .9 : warn ? .85 : .55 }} title={`Day ${i + 1}`} />;
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'JetBrains Mono,monospace', fontSize: 10, color: '#64748b' }}>
              <span>90 days ago</span>
              <span style={{ color: '#4ade80' }}>99.98% uptime</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mk-sec">
        <div className="mk-wrap">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Recent incidents</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {RECENT.map(inc => (
              <div key={inc.title} className="mk-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <CheckCircle2 size={14} color="#4ade80" />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '.08em' }}>Resolved</span>
                  <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#64748b' }}>{inc.date}</span>
                </div>
                <div className="mk-card-title" style={{ fontSize: 15 }}>{inc.title}</div>
                <div className="mk-card-desc" style={{ fontSize: 13 }}>{inc.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-sec" style={{ textAlign: 'center' }}>
        <div className="mk-wrap" style={{ maxWidth: 640 }}>
          <Activity size={26} color="#a5b4fc" style={{ marginBottom: 12 }} />
          <h2 className="mk-sec-title">Subscribe to status updates</h2>
          <p className="mk-sec-sub" style={{ margin: '0 auto 24px' }}>Get notified when we post incidents or scheduled maintenance.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/status.rss" className="mk-btn-out" style={{ padding: '11px 22px', fontSize: 13 }}>RSS Feed</a>
            <Link href="/contact?reason=status" className="mk-btn-out" style={{ padding: '11px 22px', fontSize: 13 }}>Email updates</Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
