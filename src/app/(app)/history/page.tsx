'use client';
import { useState, useEffect } from 'react';
import { auditApi } from '@/lib/api';
import { FileText, Filter, User, Shield, Zap, Globe, Settings, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const ACTION_COLORS: any = {
  create: '#4ade80', delete: '#f87171', update: '#fbbf24',
  login: '#60a5fa', logout: '#94a3b8', replay: '#a78bfa',
  pause: '#f59e0b', resume: '#4ade80', rotate: '#22d3ee',
};

const ACTION_ICONS: any = {
  login: User, logout: User, create: Zap, delete: Zap,
  update: Settings, replay: RefreshCw, pause: Globe, resume: Globe,
};

function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLORS[action] || '#94a3b8';
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: color + '18', color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{action}</span>
  );
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ action: '', resource: '' });
  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      const d = await auditApi.myHistory({ page, limit, ...filter });
      setLogs(Array.isArray(d?.logs) ? d.logs : Array.isArray(d) ? d : []);
      setTotal(d?.total || 0);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const S: any = {
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 },
    select: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', outline: 'none', cursor: 'pointer' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#1e40af,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={18} color="#fff" /></div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>History</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Audit log of all actions performed in your account</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={13} color="var(--text3)" />
          <select value={filter.action} onChange={e => { setFilter(f => ({ ...f, action: e.target.value })); setPage(1); }} style={S.select}>
            <option value="">All Actions</option>
            {['login', 'logout', 'create', 'update', 'delete', 'replay', 'pause', 'resume', 'rotate'].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filter.resource} onChange={e => { setFilter(f => ({ ...f, resource: e.target.value })); setPage(1); }} style={S.select}>
            <option value="">All Resources</option>
            {['endpoint', 'event', 'project', 'apikey', 'webhook', 'user'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={load} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center' }}><RefreshCw size={13} /></button>
        </div>
      </div>

      <div style={S.card}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent2)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>Loading history...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <FileText size={32} color="var(--text3)" style={{ opacity: 0.3, marginBottom: 12 }} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)' }}>No activity recorded yet</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 4, opacity: 0.6 }}>Actions you take will appear here</div>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Time', 'Action', 'Resource', 'Details', 'IP'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any, i: number) => {
                  const ActionIcon = ACTION_ICONS[log.action] || Zap;
                  return (
                    <tr key={log._id || i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        <div>{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '--'}</div>
                        <div style={{ opacity: 0.7 }}>{log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}><ActionBadge action={log.action || 'unknown'} /></td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ActionIcon size={12} color="var(--text3)" />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{log.resource || '--'}</span>
                        </div>
                        {log.resourceId && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{log.resourceId}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.description || log.details || '--'}</div>
                        {log.changes && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{JSON.stringify(log.changes)}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{log.ipAddress || log.ip || '--'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>
                {total > 0 ? `${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}` : '0 results'}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', color: 'var(--text3)', opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}><ChevronLeft size={14} /></button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)} style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${p === page ? 'var(--accent2)' : 'var(--border)'}`, background: p === page ? 'rgba(99,102,241,0.15)' : 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, color: p === page ? 'var(--accent2)' : 'var(--text3)', minWidth: 32 }}>{p}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: 'var(--text3)', opacity: page === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center' }}><ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
