'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { endpointsApi, eventsApi, analyticsApi } from '@/lib/api';
import { useProjectStore } from '@/lib/store';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Activity,
  RefreshCw, AlertTriangle, Zap, TrendingUp, TrendingDown,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '@/components/ui/StatusBadge';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import Link from 'next/link';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, color, icon: Icon, trend,
}: {
  label: string; value: string | number; sub?: string;
  color?: string; icon?: any; trend?: 'up' | 'down' | null;
}) {
  const c = color || 'var(--accent2)';
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="stat-lbl">{label}</span>
        {Icon && (
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${c}15`, border: `1px solid ${c}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={13} style={{ color: c }} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
        <div className="stat-val" style={{ color: c }}>{value}</div>
        {trend === 'up' && <TrendingUp size={12} color="#4ade80" />}
        {trend === 'down' && <TrendingDown size={12} color="#f87171" />}
      </div>
      {sub && <div className="stat-trend">{sub}</div>}
    </div>
  );
}

// ─── Health Score Ring ─────────────────────────────────────────────────────────
function HealthRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 95 ? '#4ade80' : score >= 80 ? '#facc15' : '#f87171';
  const label = score >= 95 ? 'Healthy' : score >= 80 ? 'Degraded' : 'Critical';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle
          cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s' }}
        />
        <text x={55} y={50} textAnchor="middle" fontSize={22} fontWeight={800} fill={color} fontFamily="var(--font-head)">{score}</text>
        <text x={55} y={67} textAnchor="middle" fontSize={9} fill="var(--text3)" fontFamily="var(--font-mono)">/ 100</text>
      </svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color, marginTop: 2, letterSpacing: '0.08em' }}>{label}</span>
    </div>
  );
}

// ─── Retry History Bar ────────────────────────────────────────────────────────
function RetryBar({ count, maxRetries }: { count: number; maxRetries: number }) {
  const filled = Math.min(count, maxRetries);
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: Math.max(maxRetries, 1) }).map((_, i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: i < filled ? '#f59e0b' : 'var(--border)' }} />
      ))}
    </div>
  );
}

export default function EndpointHealthPage() {
  const { projectId: PID } = useProjectStore();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Fetch endpoint detail
  const { data: ep, isLoading: epLoading } = useQuery({
    queryKey: ['ep-detail', id],
    queryFn: () => endpointsApi.get(PID, id),
    refetchInterval: 30000,
  });

  // Fetch last 50 events for this endpoint
  const { data: eventsData, isLoading: evtLoading } = useQuery({
    queryKey: ['ep-health-events', id],
    queryFn: () => eventsApi.list(PID, { limit: 50, endpointId: id }),
    refetchInterval: 30000,
  });

  // Fetch analytics for this endpoint (7 days time series)
  const { data: ts, isLoading: tsLoading } = useQuery({
    queryKey: ['ep-ts', id],
    queryFn: () => analyticsApi.timeSeries(PID, { granularity: 'day', endpointId: id }),
    refetchInterval: 60000,
  });

  const events: any[] = eventsData?.events || [];

  // Compute health metrics from events
  const delivered = events.filter(e => e.status === 'delivered').length;
  const failed    = events.filter(e => e.status === 'failed').length;
  const dead      = events.filter(e => e.status === 'dead').length;
  const total     = events.length;
  const successRate = total > 0 ? Math.round((delivered / total) * 100) : 100;
  const avgRetries  = total > 0 ? (events.reduce((s, e) => s + (e.retryCount || 0), 0) / total).toFixed(1) : '0';

  // Avg latency from attempts
  const latencies = events.flatMap((e: any) => e.attempts?.map((a: any) => a.duration).filter(Boolean) || []);
  const avgLatency = latencies.length > 0
    ? Math.round(latencies.reduce((s: number, l: number) => s + l, 0) / latencies.length)
    : null;

  // Health score (weighted)
  const healthScore = Math.max(0, Math.round(successRate - (dead / Math.max(total, 1)) * 20 - (Number(avgRetries) > 2 ? 10 : 0)));

  // Chart data from time series
  const chart = (ts || []).map((b: any) => ({
    t: b._id?.date ? new Date(b._id.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '',
    delivered: b.delivered || 0,
    failed: b.failed || 0,
  }));

  // Retry distribution chart
  const retryDist = [0, 1, 2, 3, 4, 5].map(r => ({
    retries: r === 5 ? '5+' : String(r),
    count: events.filter(e => (r === 5 ? e.retryCount >= 5 : e.retryCount === r)).length,
  }));

  if (epLoading) {
    return (
      <div className="page">
        <div className="stat-grid">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="ph" style={{ marginBottom: 24 }}>
        <div className="ph-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <button
              onClick={() => router.push(`/endpoints/${id}`)}
              className="btn-icon btn-sm"
              style={{ marginRight: 4 }}
            >
              <ArrowLeft size={14} />
            </button>
            <h1 style={{ margin: 0 }}>{ep?.name || 'Endpoint'} — Health</h1>
            <StatusBadge status={ep?.status || 'active'} />
          </div>
          <p style={{ marginLeft: 46 }}>// Real-time health metrics · last 50 events · auto-refresh 30s</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/endpoints/${id}`} className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: 12 }}>
            Edit Config
          </Link>
          <Link href={`/events?endpointId=${id}`} className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: 12 }}>
            <Zap size={12} />View Events
          </Link>
        </div>
      </div>

      {/* Top row: Health ring + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, marginBottom: 20 }}>
        {/* Health Score */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Health Score</div>
          <HealthRing score={healthScore} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>Based on last {total} events</div>
        </div>

        {/* Stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <StatCard label="Success Rate" value={`${successRate}%`} color={successRate >= 95 ? 'var(--green)' : successRate >= 80 ? '#facc15' : 'var(--red)'} icon={TrendingUp} sub="Last 50 events" />
          <StatCard label="Delivered" value={delivered} color="var(--green)" icon={CheckCircle2} sub={`of ${total} total`} />
          <StatCard label="Failed / Dead" value={`${failed} / ${dead}`} color="var(--red)" icon={XCircle} sub="Needs attention" />
          <StatCard label="Avg Latency" value={avgLatency !== null ? `${avgLatency}ms` : '—'} color="var(--accent2)" icon={Clock} sub="Per delivery attempt" />
        </div>
      </div>

      {/* Endpoint meta */}
      <div className="card mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
        {[
          { label: 'URL', val: ep?.url || ep?.storageConfig?.bucket || '—' },
          { label: 'Signature', val: ep?.signatureScheme?.toUpperCase() || 'HMAC-SHA256' },
          { label: 'Max Retries', val: ep?.maxRetries ?? '—' },
          { label: 'Retry Strategy', val: ep?.retryStrategy || 'Exponential' },
        ].map(({ label, val }) => (
          <div key={label}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', wordBreak: 'break-all', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Delivery trend */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Delivery Trend — 7 Days</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 14 }}>delivered vs failed per day</div>
          {tsLoading ? (
            <div className="skel" style={{ height: 140, borderRadius: 8 }} />
          ) : chart.length === 0 ? (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chart} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="hgG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2} /><stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hgR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} /><stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,180,.07)" />
                <XAxis dataKey="t" tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                <Area type="monotone" dataKey="delivered" stroke="#4ade80" fill="url(#hgG)" strokeWidth={1.5} name="Delivered" />
                <Area type="monotone" dataKey="failed" stroke="#f87171" fill="url(#hgR)" strokeWidth={1.5} name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Retry distribution */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Retry Distribution</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 14 }}>events by retry count</div>
          {evtLoading ? (
            <div className="skel" style={{ height: 140, borderRadius: 8 }} />
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={retryDist} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,180,.07)" vertical={false} />
                <XAxis dataKey="retries" tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                <Bar dataKey="count" fill="rgba(245,158,11,0.7)" radius={[4,4,0,0]} name="Events" />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <AlertTriangle size={11} color="#f59e0b" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>Avg retries: {avgRetries}</span>
          </div>
        </div>
      </div>

      {/* Last 50 Deliveries Table */}
      <div className="tbl-wrap">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Last 50 Deliveries</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginLeft: 10 }}>
              {total} events · {delivered} delivered · {failed + dead} failed
            </span>
          </div>
          <Link href={`/events`} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent2)', textDecoration: 'none' }}>
            View all events →
          </Link>
        </div>

        {evtLoading ? (
          <table className="tbl">
            <thead><tr><th>Event Type</th><th>Status</th><th>Retries</th><th>Latency</th><th>Created</th></tr></thead>
            <SkeletonTable rows={8} cols={5} />
          </table>
        ) : events.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
            No events found for this endpoint yet.
          </div>
        ) : (
          <table className="tbl">
            <thead><tr>
              <th>Event Type</th>
              <th>Status</th>
              <th>Retries</th>
              <th>Latency</th>
              <th>Created</th>
            </tr></thead>
            <tbody>
              {events.map((e: any) => {
                const lastAttempt = e.attempts?.[e.attempts.length - 1];
                const latency = lastAttempt?.duration;
                return (
                  <tr key={e._id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>{e.eventType}</span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{e._id?.slice(-10)}</div>
                    </td>
                    <td><StatusBadge status={e.status} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: e.retryCount > 0 ? '#f59e0b' : 'var(--text3)', fontWeight: e.retryCount > 0 ? 600 : 400 }}>
                          ×{e.retryCount || 0}
                        </span>
                        {e.retryCount > 0 && <RetryBar count={e.retryCount} maxRetries={ep?.maxRetries || 5} />}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: latency ? (latency > 2000 ? 'var(--red)' : latency > 500 ? '#f59e0b' : 'var(--green)') : 'var(--text3)' }}>
                        {latency ? `${latency}ms` : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                        {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
