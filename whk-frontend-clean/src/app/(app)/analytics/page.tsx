'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, endpointsApi } from '@/lib/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Zap, AlertTriangle, Filter } from 'lucide-react';

const PID = 'default';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--text)', marginBottom: 2 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text3)' }}>{p.name}:</span> <b style={{ color: p.color }}>{p.value?.toLocaleString()}</b>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [granularity, setGranularity] = useState<'hour' | 'day'>('day');

  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ['analytics-summary', PID, days],
    queryFn: () => analyticsApi.summary(PID, { days }),
    refetchInterval: 60_000,
  });
  const { data: tsData, isLoading: tsLoading } = useQuery({
    queryKey: ['analytics-ts', PID, granularity, days],
    queryFn: () => analyticsApi.timeSeries(PID, { granularity }),
    refetchInterval: 60_000,
  });
  const { data: etData } = useQuery({
    queryKey: ['analytics-et', PID, days],
    queryFn: () => analyticsApi.eventTypes(PID, { days }),
  });

  const chartData = (tsData || []).map((b: any) => ({
    time: b._id?.date || b.hour || '',
    Delivered: b.delivered || 0,
    Failed: b.failed || 0,
    Dead: b.dead || 0,
  }));

  const etChartData = Object.entries(etData?.breakdown || {}).map(([name, value]) => ({
    name: name.length > 18 ? name.slice(0, 18) + '…' : name,
    value: value as number,
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  const PIE_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#10b981', '#34d399', '#f59e0b', '#fbbf24', '#ef4444'];

  const total = (summary?.delivered || 0) + (summary?.failed || 0);
  const successRate = total > 0 ? ((summary!.delivered / total) * 100).toFixed(1) : '0';
  const avgLatency = summary?.avgLatency ? `${Math.round(summary.avgLatency)}ms` : '—';

  const kpiCards = [
    { label: 'Total Delivered', value: summary?.delivered?.toLocaleString() ?? '—', color: '#10b981', icon: Zap, trend: null },
    { label: 'Total Failed', value: summary?.failed?.toLocaleString() ?? '—', color: '#ef4444', icon: AlertTriangle, trend: null },
    { label: 'Success Rate', value: `${successRate}%`, color: successRate >= '95' ? '#10b981' : '#f59e0b', icon: TrendingUp, trend: null },
    { label: 'Avg Latency', value: avgLatency, color: '#818cf8', icon: BarChart3, trend: null },
    { label: 'Dead Letter Q', value: summary?.dead?.toLocaleString() ?? '—', color: '#f59e0b', icon: AlertTriangle, trend: null },
    { label: 'Filtered', value: summary?.filtered?.toLocaleString() ?? '—', color: '#6b7280', icon: Filter, trend: null },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Analytics</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>// Delivery metrics and performance insights</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {[7, 14, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                style={{
                  padding: '8px 14px', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer', border: 'none',
                  background: days === d ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: days === d ? 'var(--accent3)' : 'var(--text3)',
                  transition: 'all 0.15s',
                }}>{d}d</button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
        {kpiCards.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `${color}14`, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            {sumLoading
              ? <div className="skeleton" style={{ height: 24, width: '70%', borderRadius: 5 }} />
              : <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            }
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text3)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Time Series Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Delivery Timeline</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{days}-day trend</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['hour', 'day'] as const).map(g => (
              <button key={g} onClick={() => setGranularity(g)}
                style={{
                  padding: '6px 12px', borderRadius: 7, fontSize: 11, fontFamily: 'var(--font-body)', cursor: 'pointer',
                  background: granularity === g ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: granularity === g ? '1px solid rgba(99,102,241,0.35)' : '1px solid var(--border)',
                  color: granularity === g ? 'var(--accent3)' : 'var(--text3)',
                }}>{g}</button>
            ))}
          </div>
        </div>
        {tsLoading ? (
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gd2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gf2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Delivered" stroke="#10b981" strokeWidth={2} fill="url(#gd2)" dot={false} />
              <Area type="monotone" dataKey="Failed" stroke="#ef4444" strokeWidth={2} fill="url(#gf2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>
            No data for this period
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Event Type Breakdown Bar Chart */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>Top Event Types</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 18 }}>{days}-day breakdown</div>
          {etChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={etChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#475569', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>No event type data</div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>Delivery Status</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 18 }}>Distribution ({days}d)</div>
          {summary && (summary.delivered + summary.failed + (summary.dead || 0)) > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Delivered', value: summary.delivered || 0 },
                    { name: 'Failed', value: summary.failed || 0 },
                    { name: 'Dead', value: summary.dead || 0 },
                    { name: 'Filtered', value: summary.filtered || 0 },
                  ].filter(d => d.value > 0)}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value"
                >
                  {['#10b981', '#ef4444', '#f59e0b', '#6b7280'].map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 12 }}>No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
