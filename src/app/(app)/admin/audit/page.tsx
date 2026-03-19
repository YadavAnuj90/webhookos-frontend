'use client';
import { useState, useEffect } from 'react';
import { auditApi, auditExportApi } from '@/lib/api';
import { Shield, RefreshCw, Filter, ChevronLeft, ChevronRight, User, Download, Calendar } from 'lucide-react';
import { SkeletonTable } from '@/components/ui/Skeleton';

const ACTION_COLORS: any = {
  create: '#4ade80', delete: '#f87171', update: '#fbbf24',
  login: '#60a5fa', logout: '#94a3b8', replay: '#a78bfa',
  pause: '#f59e0b', resume: '#4ade80', rotate: '#22d3ee', suspend: '#f87171',
};

// ── Date helpers ─────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ action: '', resource: '' });
  const [exportFrom, setExportFrom] = useState(daysAgoStr(30));
  const [exportTo, setExportTo] = useState(todayStr());
  const [exporting, setExporting] = useState(false);
  const limit = 25;

  const load = async () => {
    setLoading(true);
    try {
      const d = await auditApi.systemHistory({ page, limit, ...filter });
      setLogs(Array.isArray(d?.logs) ? d.logs : Array.isArray(d) ? d : []);
      setTotal(d?.total || 0);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleExport = async () => {
    if (!exportFrom || !exportTo) return;
    setExporting(true);
    try {
      // Attempt blob download via authenticated API call
      const blob = await auditExportApi.exportBlob(exportFrom, exportTo);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-${exportFrom}_${exportTo}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open URL directly (browser will handle auth via cookie/header)
      window.open(auditExportApi.getUrl(exportFrom, exportTo), '_blank');
    } finally {
      setExporting(false);
    }
  };

  const S: any = {
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 },
    select: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', outline: 'none', cursor: 'pointer' },
    dateInput: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', outline: 'none', colorScheme: 'dark', width: 130 },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#991b1b,#f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={18} color="#fff" /></div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>System Audit Log</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Admin panel — all user actions across the platform</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Filter size={13} color="var(--text3)" />
          <select value={filter.action} onChange={e => { setFilter(f => ({ ...f, action: e.target.value })); setPage(1); }} style={S.select}>
            <option value="">All Actions</option>
            {['login','logout','create','update','delete','replay','pause','resume','rotate','suspend','activate'].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filter.resource} onChange={e => { setFilter(f => ({ ...f, resource: e.target.value })); setPage(1); }} style={S.select}>
            <option value="">All Resources</option>
            {['endpoint','event','project','apikey','webhook','user','workspace'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={load} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12 }}>
            <RefreshCw size={13} />Refresh
          </button>
        </div>
      </div>

      {/* ── CSV Export Bar ─────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Calendar size={14} color="var(--text3)" />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginRight: 4 }}>Export CSV:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>From</label>
          <input type="date" value={exportFrom} onChange={e => setExportFrom(e.target.value)} style={S.dateInput} max={exportTo} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>To</label>
          <input type="date" value={exportTo} onChange={e => setExportTo(e.target.value)} style={S.dateInput} min={exportFrom} max={todayStr()} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
          {/* Quick presets */}
          {[['7d', 7], ['30d', 30], ['90d', 90]].map(([label, days]) => (
            <button key={label} onClick={() => { setExportFrom(daysAgoStr(days as number)); setExportTo(todayStr()); }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text3)', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
          <button
            onClick={handleExport}
            disabled={exporting || !exportFrom || !exportTo}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: exporting ? 'var(--bg3)' : 'linear-gradient(135deg,#991b1b,#f87171)', color: exporting ? 'var(--text3)' : '#fff', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: exporting ? 'not-allowed' : 'pointer', opacity: (!exportFrom || !exportTo) ? 0.5 : 1, transition: 'opacity .15s' }}
          >
            {exporting
              ? <><div style={{ width: 12, height: 12, border: '2px solid var(--border)', borderTopColor: 'var(--text3)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Exporting…</>
              : <><Download size={13} />Export CSV</>
            }
          </button>
        </div>
      </div>

      <div style={S.card}>
        {loading ? (
          <table className="tbl">
            <thead><tr>{['Time','User','Action','Resource','Details','IP'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <SkeletonTable rows={8} cols={6} />
          </table>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Time', 'User', 'Action', 'Resource', 'Details', 'IP'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>No audit logs found</td></tr>
                ) : logs.map((log: any, i: number) => (
                  <tr key={log._id || i} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      <div>{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '--'}</div>
                      <div style={{ opacity: 0.7 }}>{log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={11} color="#fff" />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{log.userEmail || log.userId || '--'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: (ACTION_COLORS[log.action] || '#94a3b8') + '18', color: ACTION_COLORS[log.action] || '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{log.action || 'unknown'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{log.resource || '--'}</div>
                      {log.resourceId && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{String(log.resourceId).slice(0, 20)}...</div>}
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: 260 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.description || log.details || '--'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{log.ipAddress || log.ip || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{total} total entries</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', color: 'var(--text3)', opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}><ChevronLeft size={14} /></button>
                <span style={{ padding: '5px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>Page {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: 'var(--text3)', opacity: page === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center' }}><ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
