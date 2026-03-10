'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, endpointsApi, eventsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Zap, Globe, AlertTriangle, TrendingUp, ArrowRight, Activity, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const PID = 'default';

const statusColors: Record<string, string> = {
  delivered: '#10b981', failed: '#ef4444', dead: '#f59e0b',
  pending: '#818cf8', filtered: '#6b7280', rate_limited: '#38bdf8',
};

function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || '#6b7280';
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px', borderRadius: 6,
      background: `${color}18`, color, border: `1px solid ${color}30`,
      textTransform: 'uppercase' as const, letterSpacing: '0.05em', whiteSpace: 'nowrap' as const,
    }}>{status}</span>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--text)', marginBottom: 2 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text3)' }}>{p.name}:</span> <b style={{ color: p.color }}>{p.value}</b>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: summary, isLoading: sumLoading, refetch: refetchSum } = useQuery({
    queryKey: ['dash-summary', PID],
    queryFn: () => analyticsApi.summary(PID, { days: 7 }),
    refetchInterval: 60_000,
  });
  const { data: tsData } = useQuery({
    queryKey: ['dash-ts', PID],
    queryFn: () => analyticsApi.timeSeries(PID, { granularity: 'day' }),
    refetchInterval: 60_000,
  });
  const { data: endpointsData } = useQuery({
    queryKey: ['dash-endpoints', PID],
    queryFn: () => endpointsApi.list(PID, { limit: 5 }),
  });
  const { data: eventsData } = useQuery({
    queryKey: ['dash-events', PID],
    queryFn: () => eventsApi.list(PID, { limit: 8 }),
  });

  const chartData = (tsData || []).map((b: any) => ({
    time: b._id?.date || b.hour || '',
    Delivered: b.delivered || 0,
    Failed: b.failed || 0,
  }));

  const total = (summary?.delivered || 0) + (summary?.failed || 0);
  const successRate = total > 0 ? ((summary!.delivered / total) * 100).toFixed(1) + '%' : '—';

  const statCards = [
    { label: 'Total Delivered', value: summary?.delivered?.toLocaleString() ?? '—', color: '#10b981', icon: Zap, sub: '7-day total' },
    { label: 'Total Failed', value: summary?.failed?.toLocaleString() ?? '—', color: '#ef4444', icon: AlertTriangle, sub: '7-day total' },
    { label: 'Success Rate', value: successRate, color: '#818cf8', icon: TrendingUp, sub: 'Delivery rate' },
    { label: 'Endpoints', value: endpointsData?.total?.toString() ?? '—', color: '#f59e0b', icon: Globe, sub: 'Registered' },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
            // {user?.firstName} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => refetchSum()} className="btn-ghost" style={{ padding: '8px 12px' }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <Link href="/endpoints" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Globe size={13} /> New Endpoint
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map(({ label, value, color, icon: Icon, sub }) => (
          <div key={label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            {sumLoading
              ? <div className="skeleton" style={{ height: 30, width: '55%', borderRadius: 6 }} />
              : <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            }
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 8 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Delivery Volume</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>7-day delivery trend</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[{ label: 'Delivered', color: '#10b981' }, { label: 'Failed', color: '#ef4444' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-body)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Delivered" stroke="#10b981" strokeWidth={2} fill="url(#gd)" dot={false} />
              <Area type="monotone" dataKey="Failed" stroke="#ef4444" strokeWidth={2} fill="url(#gf)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'var(--text3)' }}>
            <Activity size={24} style={{ opacity: 0.4 }} />
            <span style={{ fontSize: 12, fontFamily: 'var(--font-body)' }}>No delivery data yet</span>
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Endpoints */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Endpoints</div>
            <Link href="/endpoints" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent2)', fontFamily: 'var(--font-body)' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {endpointsData?.endpoints?.length ? endpointsData.endpoints.map((ep: any) => {
              const sc = ep.status === 'active' ? '#10b981' : ep.status === 'paused' ? '#f59e0b' : '#ef4444';
              return (
                <div key={ep._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.url}</div>
                  </div>
                  <StatusBadge status={ep.status} />
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 12 }}>
                <Globe size={20} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.3 }} />
                No endpoints yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Recent Events</div>
            <Link href="/events" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent2)', fontFamily: 'var(--font-body)' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {eventsData?.events?.length ? eventsData.events.map((ev: any) => (
              <div key={ev._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.eventType}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <Clock size={9} style={{ color: 'var(--text3)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{new Date(ev.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <StatusBadge status={ev.status} />
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 12 }}>
                <Zap size={20} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.3 }} />
                No events yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
