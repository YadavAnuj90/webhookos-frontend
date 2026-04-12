'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, endpointsApi, eventsApi } from '@/lib/api';
import { useAuth, useProjectStore } from '@/lib/store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Globe, AlertTriangle, TrendingUp, ArrowRight, Activity, RefreshCw, Plus, CheckCircle2, Radio } from 'lucide-react';
import LiveFeed from '@/components/realtime/LiveFeed';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '@/components/ui/StatusBadge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import OnboardingBanner from '@/components/ui/OnboardingBanner';
import { useState, useEffect } from 'react';

// ─── Live Indicator ───────────────────────────────────────────────────────────
function LiveIndicator({ lastUpdated }: { lastUpdated: Date | null }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const secsAgo = lastUpdated ? Math.floor((now.getTime() - lastUpdated.getTime()) / 1000) : null;
  const label = secsAgo === null ? 'Connecting...'
    : secsAgo < 5 ? 'Just now'
    : secsAgo < 60 ? `${secsAgo}s ago`
    : `${Math.floor(secsAgo / 60)}m ago`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%', background: '#4ade80',
          animation: 'ping 1.5s cubic-bezier(0,0,.2,1) infinite', opacity: 0.6,
        }} />
        <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
        LIVE · Updated {label}
      </span>
    </div>
  );
}

// ─── Chart Skeleton ───────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 10, padding: '0 8px' }}>
      {[60, 85, 45, 100, 70, 90, 55].map((h, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'stretch' }}>
          <div className="skel" style={{ height: h * 1.4, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

// ─── Onboarding Steps (shown when no data) ────────────────────────────────────
function OnboardingSteps({ hasEndpoints, hasEvents }: { hasEndpoints: boolean; hasEvents: boolean }) {
  const steps = [
    { done: hasEndpoints, label: 'Create your first endpoint', href: '/endpoints', cta: 'Create Endpoint', desc: 'Configure a webhook delivery target — HTTP, S3, or GCS.' },
    { done: hasEvents,    label: 'Send your first event',      href: '/events',    cta: 'Send Event',      desc: 'Fire a webhook event and see it flow through the pipeline.' },
    { done: false,        label: 'Set up an alert',            href: '/alerts',    cta: 'Create Alert',    desc: 'Get notified via Slack or email on failures.' },
  ];
  return (
    <div style={{ marginBottom: 24, background: 'linear-gradient(135deg,rgba(79,70,229,0.06),rgba(124,58,237,0.04))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <Activity size={16} color="var(--accent2)" />
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Get started with WebhookOS</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', color: 'var(--accent2)', border: '1px solid rgba(99,102,241,0.25)' }}>
          {steps.filter(s => s.done).length}/{steps.length} done
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ padding: '14px 16px', borderRadius: 10, background: s.done ? 'rgba(74,222,128,0.06)' : 'var(--bg2)', border: `1px solid ${s.done ? 'rgba(74,222,128,0.2)' : 'var(--border)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              {s.done
                ? <CheckCircle2 size={14} color="#4ade80" />
                : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text3)', fontWeight: 700 }}>{i + 1}</span>
                  </div>
              }
              <span style={{ fontSize: 12, fontWeight: 600, color: s.done ? '#4ade80' : 'var(--text)', textDecoration: s.done ? 'line-through' : 'none', opacity: s.done ? 0.7 : 1 }}>{s.label}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', margin: '0 0 10px', lineHeight: 1.5 }}>{s.desc}</p>
            {!s.done && (
              <Link href={s.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--accent2)', textDecoration: 'none', padding: '4px 10px', borderRadius: 7, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Plus size={10} />{s.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { projectId: PID } = useProjectStore();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data: summary, isLoading: sl, dataUpdatedAt: sumUpdated } = useQuery({
    queryKey: ['ds'],
    queryFn: () => analyticsApi.summary(PID, { days: 7 }),
    refetchInterval: 30000,
  });

  const { data: ts, isLoading: tsLoading } = useQuery({
    queryKey: ['dt'],
    queryFn: () => analyticsApi.timeSeries(PID, { granularity: 'day' }),
    refetchInterval: 30000,
  });

  const { data: eps, isLoading: epsLoading } = useQuery({
    queryKey: ['de'],
    queryFn: () => endpointsApi.list(PID, { limit: 5 }),
    refetchInterval: 60000,
  });

  const { data: evts, isLoading: evtLoading, refetch: refetchEvts } = useQuery({
    queryKey: ['dv'],
    queryFn: () => eventsApi.list(PID, { limit: 8 }),
    refetchInterval: 30000,
  });

  // Track last updated from most frequently refreshed query
  useEffect(() => {
    if (sumUpdated) setLastUpdated(new Date(sumUpdated));
  }, [sumUpdated]);

  const chart = (ts || []).map((b: any) => ({
    t: b._id?.date ? new Date(b._id.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : (b._id?.hour || ''),
    delivered: b.delivered || 0, failed: b.failed || 0,
  }));

  const stats = [
    { label: 'Delivered',    val: (summary?.delivered || 0).toLocaleString(), color: 'var(--green)',  icon: Zap,           sub: '7-day total' },
    { label: 'Failed',       val: (summary?.failed || 0).toLocaleString(),    color: 'var(--red)',    icon: AlertTriangle,  sub: '7-day total' },
    { label: 'Success Rate', val: summary?.successRate || '--',                color: 'var(--a2)',     icon: TrendingUp,    sub: '7-day avg' },
    { label: 'Endpoints',    val: (eps?.total || 0).toString(),               color: 'var(--yellow)', icon: Globe,         sub: 'Total active' },
  ];

  const hasEndpoints = (eps?.total || 0) > 0;
  const hasEvents    = (evts?.events?.length || 0) > 0;
  const showOnboarding = !sl && !hasEndpoints;

  return (
    <div className="page">
      {/* Onboarding Banner (from store) */}
      <OnboardingBanner />

      {/* Header */}
      <div className="ph">
        <div className="ph-left">
          <h1>Dashboard</h1>
          <p>// Hello {user?.firstName} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LiveIndicator lastUpdated={lastUpdated} />
          <Link href="/events" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <Zap size={12} />Send Event
          </Link>
        </div>
      </div>

      {/* Onboarding steps for new users */}
      {showOnboarding && <OnboardingSteps hasEndpoints={hasEndpoints} hasEvents={hasEvents} />}

      {/* Stats */}
      <div className="stat-grid">
        {stats.map(({ label, val, color, icon: Icon, sub }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="stat-lbl">{label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <div className="stat-val" style={{ color }}>
              {sl ? <span className="skel" style={{ width: 80, height: 26, display: 'block' }} /> : val}
            </div>
            <div className="stat-trend">{sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card mb-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)' }}>Delivery Volume — 7 Days</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>delivered vs failed · auto-refresh every 30s</div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {[{ c: 'var(--green)', l: 'Delivered' }, { c: 'var(--red)', l: 'Failed' }].map(({ c, l }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>{l}</span>
              </div>
            ))}
            <Link href="/analytics" style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--a2)' }}>
              Full report <ArrowRight size={9} />
            </Link>
          </div>
        </div>

        {tsLoading ? (
          <ChartSkeleton />
        ) : chart.length === 0 ? (
          <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>
            <Activity size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>No delivery data yet</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, marginTop: 4, opacity: 0.6 }}>Send events to see your chart</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chart} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.22} /><stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--red)" stopOpacity={0.18} /><stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,180,.07)" />
              <XAxis dataKey="t" tick={{ fontFamily: 'var(--mono)', fontSize: 9, fill: 'var(--t3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'var(--mono)', fontSize: 9, fill: 'var(--t3)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card2)', border: '1px solid var(--b2)', borderRadius: 8, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t1)' }} />
              <Area type="monotone" dataKey="delivered" stroke="var(--green)" fill="url(#gG)" strokeWidth={1.5} name="Delivered" />
              <Area type="monotone" dataKey="failed" stroke="var(--red)" fill="url(#gR)" strokeWidth={1.5} name="Failed" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Events */}
        <div className="tbl-wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--b1)' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Recent Events</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => refetchEvts()} className="btn-icon btn-sm"><RefreshCw size={11} /></button>
              <Link href="/events" style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--a2)' }}>View all →</Link>
            </div>
          </div>
          {evtLoading ? (
            <table className="tbl"><thead><tr><th>Type</th><th>Status</th><th>Time</th></tr></thead>
              <SkeletonTable rows={5} cols={3} /></table>
          ) : evts?.events?.length ? (
            <table className="tbl"><tbody>
              {evts.events.map((e: any) => (
                <tr key={e._id}>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t1)' }}>{e.eventType}</span></td>
                  <td><StatusBadge status={e.status} /></td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textAlign: 'right' }}>
                    {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody></table>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Zap size={28} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 10 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>No events yet</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14 }}>Fire your first webhook to see delivery status here</div>
              <Link href="/events" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', fontSize: 12 }}>
                <Zap size={11} />Send First Event
              </Link>
            </div>
          )}
        </div>

        {/* Endpoints */}
        <div className="tbl-wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--b1)' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Endpoints</div>
            <Link href="/endpoints" style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--a2)' }}>View all →</Link>
          </div>
          {epsLoading ? (
            <table className="tbl"><thead><tr><th>Name</th><th>Status</th></tr></thead>
              <SkeletonTable rows={4} cols={2} /></table>
          ) : eps?.endpoints?.length ? (
            <table className="tbl"><tbody>
              {eps.endpoints.map((ep: any) => (
                <tr key={ep._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--t1)' }}>{ep.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.url}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}><StatusBadge status={ep.status} /></td>
                </tr>
              ))}
            </tbody></table>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Globe size={28} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 10 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>No endpoints yet</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14 }}>Create a delivery target to start routing events</div>
              <Link href="/endpoints" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', fontSize: 12 }}>
                <Plus size={11} />Create Endpoint
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Live Delivery Feed */}
      <div style={{ marginTop: 16 }}>
        <LiveFeed projectId={PID} maxHeight={260}/>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
