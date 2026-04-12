'use client';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, heatmapApi } from '@/lib/api';
import { useProjectStore } from '@/lib/store';
import { DeliveryHeatmap, HeatmapCell } from '@/lib/types';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  BarChart3, Zap, AlertTriangle, Clock, TrendingUp, Activity,
  RefreshCw, Loader2, Shield, Filter, ArrowUpRight, ArrowDownRight,
  Minus, Gauge, Flame, ShieldOff, Timer,
} from 'lucide-react';
import { SkeletonCard } from '@/components/ui/Skeleton';

const COLORS = ['#5b6cf8', '#22c55e', '#eab308', '#f43f5e', '#38bdf8', '#f97316', '#a78bfa', '#14b8a6'];

/* ══════════════════════════════════════════════════════════════════════════════
   CUSTOM TOOLTIP
   ══════════════════════════════════════════════════════════════════════════════ */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--b2)',
      borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--s2)',
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>
        {label}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--t2)' }}>{p.name}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--t1)', fontWeight: 600, marginLeft: 'auto' }}>
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   DELIVERY HEATMAP
   ══════════════════════════════════════════════════════════════════════════════ */
function DeliveryHeatmapChart() {
  const { projectId: PID } = useProjectStore();
  const { data, isLoading } = useQuery<DeliveryHeatmap>({
    queryKey: ['heatmap'],
    queryFn: () => heatmapApi.get(PID),
  });

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, gap: 8, color: 'var(--t3)' }}>
      <Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} />
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>Loading heatmap…</span>
    </div>
  );

  const matrix = data?.matrix || Array.from({ length: 7 }, () => Array(24).fill({ total: 0, success: 0, failed: 0 }));
  const days = data?.days || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxVal = Math.max(1, ...matrix.flatMap(row => row.map((c: HeatmapCell) => c.total)));

  const cellColor = (cell: HeatmapCell) => {
    if (cell.total === 0) return 'rgba(91,108,248,.04)';
    const ratio = cell.total / maxVal;
    // Blend toward red if failures dominate
    const failRatio = cell.failed / Math.max(1, cell.total);
    if (failRatio > 0.5) {
      const alpha = 0.15 + ratio * 0.7;
      return `rgba(244,63,94,${alpha.toFixed(2)})`;
    }
    const alpha = 0.1 + ratio * 0.8;
    return `rgba(91,108,248,${alpha.toFixed(2)})`;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 620 }}>
        {/* Hour labels */}
        <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(24,1fr)', gap: 2, marginBottom: 3 }}>
          <div />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} style={{
              fontFamily: 'var(--mono)', fontSize: 7.5, color: h % 3 === 0 ? 'var(--t3)' : 'transparent',
              textAlign: 'center',
            }}>
              {h}h
            </div>
          ))}
        </div>

        {/* Rows */}
        {matrix.map((row: HeatmapCell[], di: number) => (
          <div key={di} style={{ display: 'grid', gridTemplateColumns: '44px repeat(24,1fr)', gap: 2, marginBottom: 2 }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600, color: 'var(--t3)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
            }}>
              {days[di]}
            </div>
            {row.map((cell: HeatmapCell, hi: number) => (
              <div
                key={hi}
                title={`${days[di]} ${hi}:00 — ${cell.total} total · ${cell.success} ok · ${cell.failed} fail`}
                style={{
                  height: 20, borderRadius: 3,
                  background: cellColor(cell),
                  border: '1px solid var(--b1)',
                  cursor: cell.total > 0 ? 'pointer' : 'default',
                  transition: 'transform .1s, opacity .1s',
                }}
                onMouseEnter={e => { if (cell.total > 0) { (e.currentTarget).style.transform = 'scale(1.15)'; (e.currentTarget).style.zIndex = '2'; } }}
                onMouseLeave={e => { (e.currentTarget).style.transform = 'scale(1)'; (e.currentTarget).style.zIndex = '0'; }}
              />
            ))}
          </div>
        ))}

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)' }}>Less</span>
          {[0.04, 0.2, 0.4, 0.65, 0.9].map((a, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: `rgba(91,108,248,${a})`, border: '1px solid var(--b1)' }} />
          ))}
          <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)' }}>More</span>
          <div style={{ width: 1, height: 12, background: 'var(--b1)', margin: '0 4px' }} />
          <div style={{ width: 16, height: 16, borderRadius: 3, background: 'rgba(244,63,94,.5)', border: '1px solid var(--b1)' }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)' }}>Failures</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const { projectId: PID } = useProjectStore();
  const [days, setDays] = useState(7);

  const { data: summary, isLoading: sumLoading, isFetching } = useQuery({
    queryKey: ['analytics-summary', days],
    queryFn: () => analyticsApi.summary(PID, { days }),
  });

  const { data: ts } = useQuery({
    queryKey: ['analytics-ts', days],
    queryFn: () => analyticsApi.timeSeries(PID, { granularity: days <= 7 ? 'hour' : 'day' }),
  });

  const { data: types } = useQuery({
    queryKey: ['analytics-types', days],
    queryFn: () => analyticsApi.eventTypes(PID, { days }),
  });

  /* ── Transform time-series for charts ── */
  const chart = useMemo(() => {
    if (!ts || !Array.isArray(ts)) return [];
    return ts.map((b: any) => {
      // Handle both hour granularity (bucketHour field) and day granularity (_id.date)
      let label = '';
      if (b.bucketHour) {
        const d = new Date(b.bucketHour);
        label = days <= 7
          ? d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })
          : d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
      } else if (b._id?.date) {
        label = b._id.date;
      }
      const delivered = b.delivered || 0;
      const failed = b.failed || 0;
      const count = b.deliveryCount || 0;
      const totalLat = b.totalLatencyMs || 0;
      return {
        t: label,
        delivered,
        failed,
        dead: b.dead || 0,
        rateLimited: b.rateLimited || 0,
        avgLatency: count > 0 ? Math.round(totalLat / count) : (b.avgLatencyMs || 0),
        successRate: delivered + failed > 0 ? Math.round((delivered / (delivered + failed)) * 100) : 100,
      };
    });
  }, [ts, days]);

  const pieData = useMemo(() => {
    if (!types || !Array.isArray(types)) return [];
    return types.slice(0, 8).map((t: any) => ({ name: t.eventType, value: t.count }));
  }, [types]);

  /* ── Summary stats ── */
  const s = summary || {};

  return (
    <div className="page">
      {/* ═══ Header ═══ */}
      <div className="ph">
        <div className="ph-left" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #5b6cf8, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--sa)',
          }}>
            <BarChart3 size={19} color="#fff" />
          </div>
          <div>
            <h1>Analytics</h1>
            <p>Delivery metrics, latency, and usage trends</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div className="tabs">
            {[
              { d: 7, l: '7d' },
              { d: 14, l: '14d' },
              { d: 30, l: '30d' },
            ].map(({ d, l }) => (
              <button key={d} className={`tab ${days === d ? 'on' : ''}`} onClick={() => setDays(d)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Stat Cards — Row 1: Primary ═══ */}
      <div className="stat-grid">
        {sumLoading ? (
          <>{[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}</>
        ) : (
          <>
            <StatCard label="Total Delivered" value={s.delivered || 0} color="var(--green)" icon={Zap}
              trend={`${s.periodDays || days}d window`} />
            <StatCard label="Total Failed" value={s.failed || 0} color="var(--red)" icon={AlertTriangle}
              trend={s.total > 0 ? `${((s.failed / s.total) * 100).toFixed(1)}% fail rate` : undefined} />
            <StatCard label="Success Rate" value={s.successRate || '100.00%'} color="var(--a2)" icon={TrendingUp} isString
              trend={`${s.periodDays || days}d average`} />
            <StatCard label="Avg Latency" value={s.avgLatencyMs ? `${s.avgLatencyMs}ms` : '--'} color="var(--yellow)" icon={Clock} isString
              trend={s.minLatencyMs != null && s.maxLatencyMs != null ? `Min ${s.minLatencyMs}ms · Max ${s.maxLatencyMs}ms` : undefined} />
          </>
        )}
      </div>

      {/* ═══ Stat Cards — Row 2: Extended metrics ═══ */}
      {!sumLoading && (s.dead > 0 || s.filtered > 0 || s.rateLimited > 0 || s.total > 0) && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
          marginBottom: 22,
        }}>
          <MiniMetric label="Total Attempts" value={s.total || 0} icon={Activity} color="var(--t2)" />
          <MiniMetric label="Dead Letter" value={s.dead || 0} icon={Flame} color="var(--orange)" />
          <MiniMetric label="Filtered" value={s.filtered || 0} icon={Filter} color="var(--blue)" />
          <MiniMetric label="Rate Limited" value={s.rateLimited || 0} icon={ShieldOff} color="var(--red)" />
        </div>
      )}

      {/* ═══ Delivery Volume — Area Chart ═══ */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>Delivery Volume</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>
              Delivered vs failed over {days} days
            </div>
          </div>
          {isFetching && <Loader2 size={13} color="var(--t3)" style={{ animation: 'spin .7s linear infinite' }} />}
        </div>
        {chart.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chart} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={.25} />
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--red)" stopOpacity={.2} />
                  <stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)" />
              <XAxis dataKey="t" tick={{ fontFamily: 'var(--mono)', fontSize: 8.5, fill: 'var(--t3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontFamily: 'var(--mono)', fontSize: 8.5, fill: 'var(--t3)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="delivered" stroke="var(--green)" fill="url(#gDelivered)" strokeWidth={2} name="Delivered" />
              <Area type="monotone" dataKey="failed" stroke="var(--red)" fill="url(#gFailed)" strokeWidth={1.5} name="Failed" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart label="No delivery data for this period" />
        )}
      </div>

      {/* ═══ Row: Latency + Success Rate ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Latency Bar Chart */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 2 }}>Avg Latency (ms)</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginBottom: 16 }}>Response time per period</div>
          {chart.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={chart} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)" />
                <XAxis dataKey="t" tick={{ fontFamily: 'var(--mono)', fontSize: 7.5, fill: 'var(--t3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontFamily: 'var(--mono)', fontSize: 7.5, fill: 'var(--t3)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="avgLatency" fill="var(--a2)" radius={[3, 3, 0, 0]} name="Latency (ms)" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No latency data" />}
        </div>

        {/* Event Types Pie */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 2 }}>Event Types</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginBottom: 12 }}>Distribution by type</div>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={64} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {pieData.map((d: any, i: number) => (
                  <div key={d.name} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '5px 0', borderBottom: i < pieData.length - 1 ? '1px solid var(--b1)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--t2)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 600, color: 'var(--t1)' }}>
                      {d.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyChart label="No event type data yet" />}
        </div>
      </div>

      {/* ═══ Success Rate Line + Heatmap ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Success rate over time */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 2 }}>Success Rate (%)</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginBottom: 16 }}>Delivery success percentage over time</div>
          {chart.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={chart} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--a2)" stopOpacity={.2} />
                    <stop offset="95%" stopColor="var(--a2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--b1)" />
                <XAxis dataKey="t" tick={{ fontFamily: 'var(--mono)', fontSize: 7.5, fill: 'var(--t3)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontFamily: 'var(--mono)', fontSize: 7.5, fill: 'var(--t3)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="successRate" stroke="var(--a2)" fill="url(#gRate)" strokeWidth={2} name="Success %" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No data" />}
        </div>

        {/* Delivery Heatmap */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 2 }}>Delivery Heatmap</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginBottom: 14 }}>Activity by day × hour (UTC)</div>
          <DeliveryHeatmapChart />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════════════ */
function StatCard({ label, value, color, icon: Icon, trend, isString }: {
  label: string; value: number | string; color: string; icon: any; trend?: string; isString?: boolean;
}) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="stat-lbl">{label}</span>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div className="stat-val" style={{ color }}>
        {isString ? value : (typeof value === 'number' ? value.toLocaleString() : value)}
      </div>
      {trend && <div className="stat-trend">{trend}</div>}
    </div>
  );
}

function MiniMetric({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: any; color: string;
}) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--b1)',
      borderRadius: 'var(--r2)', padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={13} color={color} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 800, color, letterSpacing: '-0.5px', marginTop: 1 }}>
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div style={{
      height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--t3)', fontSize: 12, fontFamily: 'var(--mono)',
      background: 'var(--card2)', borderRadius: 'var(--r2)',
      border: '1px dashed var(--b1)',
    }}>
      {label}
    </div>
  );
}
