'use client';
import { useState, useEffect } from 'react';
import { usageApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { BarChart2, Zap, CheckCircle, XCircle, Clock, TrendingUp, ArrowUpRight, CreditCard, AlertTriangle } from 'lucide-react';
import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';
import Link from 'next/link';

const PERIODS = [{ label: '24h', val: 'day' }, { label: '7d', val: 'week' }, { label: '30d', val: 'month' }];

function UsageBar({ label, used, max, color }: { label: string; used: number; max: number; color: string }) {
  const pct = max === Infinity ? 0 : Math.min((used / max) * 100, 100);
  const isUnlimited = max === Infinity;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>{isUnlimited ? `${used.toLocaleString()} / Infinity` : `${used.toLocaleString()} / ${max.toLocaleString()}`}</span>
      </div>
      <div style={{ height: 7, background: 'var(--bg3)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: isUnlimited ? '0%' : `${pct}%`, background: pct > 85 ? '#f87171' : pct > 65 ? '#f59e0b' : color, borderRadius: 6, transition: 'width 0.6s ease' }} />
      </div>
      {!isUnlimited && pct > 85 && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#f87171', marginTop: 3 }}>  {pct.toFixed(0)}% used -- consider upgrading</div>}
    </div>
  );
}

export default function UsagePage() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const [d, s] = await Promise.all([usageApi.get(period), usageApi.summary()]); setData(d); setSummary(s); } catch { toast.error('Could not load usage data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [period]);

  const S: any = { card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 } };

  const chartMax = data?.chart ? Math.max(...data.chart.map((d: any) => d.delivered + d.failed + d.pending), 1) : 1;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#0891b2,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart2 size={18} color="#fff" /></div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Usage Dashboard</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Track your webhook delivery usage and plan limits</p>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: 3 }}>
          {PERIODS.map(p => (
            <button key={p.val} onClick={() => setPeriod(p.val)} style={{ padding: '5px 14px', borderRadius: 7, border: 'none', background: period === p.val ? 'var(--bg2)' : 'transparent', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: period === p.val ? 600 : 400, color: period === p.val ? 'var(--text)' : 'var(--text3)', cursor: 'pointer', boxShadow: period === p.val ? '0 1px 4px rgba(0,0,0,0.2)' : 'none' }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Overage banner */}
      {(data?.overage?.events > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 11, marginBottom: 20 }}>
          <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#f87171' }}>Overage detected — </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>
              You've used <strong>{data.overage.events.toLocaleString()}</strong> extra events this month.
              Estimated additional cost:{' '}
              <strong style={{ color: '#f87171' }}>${data.overage.estimatedCost.toFixed(2)} {data.overage.currency}</strong>
            </span>
          </div>
          <Link href="/billing" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, background: '#f87171', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <CreditCard size={12} />Upgrade Plan
          </Link>
        </div>
      )}

      {/* Bandwidth row */}
      {(data?.bandwidth?.bytes > 0) && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
          {[
            { label: 'Bandwidth Used', val: data.bandwidth.bytes > 1_048_576 ? `${(data.bandwidth.bytes / 1_048_576).toFixed(1)} MB` : `${(data.bandwidth.bytes / 1024).toFixed(0)} KB` },
            { label: 'HTTP Requests',  val: data.bandwidth.requests?.toLocaleString() || '—' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{s.val}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {loading ? (
          <>{[0,1,2,3].map(i => <SkeletonCard key={i} />)}</>
        ) : [
          { label: 'Total Events', val: data?.totals?.total || 0, icon: Zap, color: '#6366f1', change: null },
          { label: 'Delivered', val: data?.totals?.delivered || 0, icon: CheckCircle, color: '#4ade80', change: null },
          { label: 'Failed', val: data?.totals?.failed || 0, icon: XCircle, color: '#f87171', change: null },
          { label: 'Success Rate', val: data?.totals?.total > 0 ? ((data.totals.delivered / data.totals.total) * 100).toFixed(1) + '%' : '100%', icon: TrendingUp, color: '#22d3ee', change: null },
        ].map(s => (
          <div key={s.label} style={{ ...S.card, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={16} color={s.color} /></div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{typeof s.val === 'number' ? s.val.toLocaleString() : s.val}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Chart */}
        <div style={{ ...S.card, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Delivery Volume</h3>
            <div style={{ display: 'flex', gap: 14 }}>
              {[['#4ade80', 'Delivered'], ['#f87171', 'Failed'], ['#94a3b8', 'Pending']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>{l}</span></div>
              ))}
            </div>
          </div>
          {data?.chart?.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 160 }}>
              {data.chart.map((d: any, i: number) => {
                const total = d.delivered + d.failed + d.pending;
                const h = (total / chartMax) * 140;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }} title={`${d.date}: ${total} events`}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: Math.max(h, 2), borderRadius: '3px 3px 0 0', overflow: 'hidden' }}>
                      {d.delivered > 0 && <div style={{ flex: d.delivered, background: '#4ade80' }} />}
                      {d.failed > 0 && <div style={{ flex: d.failed, background: '#f87171' }} />}
                      {d.pending > 0 && <div style={{ flex: d.pending, background: '#94a3b8' }} />}
                      {total === 0 && <div style={{ flex: 1, background: 'var(--bg3)' }} />}
                    </div>
                    {data.chart.length <= 14 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text3)', transform: 'rotate(-45deg)', marginTop: 2 }}>{d.date.slice(5)}</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 13 }}>No delivery data for this period</div>
          )}
        </div>

        {/* Plan limits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...S.card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Plan Limits</h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 8px', borderRadius: 5, background: 'rgba(99,102,241,0.15)', color: 'var(--accent2)', fontWeight: 700, textTransform: 'uppercase' }}>{summary?.plan || 'Free'}</span>
            </div>
            <UsageBar label="Events this month" used={summary?.thisMonth?.events || 0} max={summary?.limits?.events || 10000} color="#6366f1" />
            <UsageBar label="Active Endpoints" used={0} max={summary?.limits?.endpoints || 3} color="#22d3ee" />
            <UsageBar label="Projects" used={0} max={summary?.limits?.projects || 1} color="#a78bfa" />
            <Link href="/billing" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', marginTop: 4 }}>
              <CreditCard size={13} />Upgrade Plan
            </Link>
          </div>
          <div style={{ ...S.card, padding: 18 }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12, marginTop: 0 }}>This vs Last Month</h3>
            {[
              { label: 'Events', curr: summary?.thisMonth?.events || 0, prev: summary?.lastMonth?.events || 0 },
              { label: 'Delivered', curr: summary?.thisMonth?.delivered || 0, prev: summary?.lastMonth?.delivered || 0 },
              { label: 'Failed', curr: summary?.thisMonth?.failed || 0, prev: summary?.lastMonth?.failed || 0 },
            ].map(row => {
              const diff = row.prev > 0 ? (((row.curr - row.prev) / row.prev) * 100) : 0;
              return (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{row.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{row.curr.toLocaleString()}</span>
                    {diff !== 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: diff > 0 ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 2 }}><ArrowUpRight size={10} style={{ transform: diff < 0 ? 'rotate(180deg)' : 'none' }} />{Math.abs(diff).toFixed(0)}%</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
