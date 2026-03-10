'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import { Shield, RefreshCw, X, Clock, Filter, ChevronRight, Search } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  'auth.login': '#10b981', 'auth.logout': '#6b7280', 'auth.register': '#818cf8',
  'auth.api_key_created': '#f59e0b', 'auth.api_key_revoked': '#ef4444',
  'endpoint.created': '#10b981', 'endpoint.updated': '#818cf8', 'endpoint.deleted': '#ef4444',
  'endpoint.paused': '#f59e0b', 'endpoint.resumed': '#10b981', 'endpoint.secret_rotated': '#f59e0b',
  'event.sent': '#818cf8', 'event.replayed': '#38bdf8', 'event.broadcast': '#a5b4fc',
  'user.role_changed': '#f59e0b', 'user.suspended': '#ef4444', 'user.profile_updated': '#818cf8',
  'billing.payment_success': '#10b981', 'billing.payment_failed': '#ef4444',
  'billing.subscription_created': '#10b981', 'billing.subscription_cancelled': '#ef4444',
};

function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLORS[action] || '#6b7280';
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '3px 7px', borderRadius: 5, background: `${color}14`, color, border: `1px solid ${color}22`, textTransform: 'uppercase' as const }}>
      {action.split('.').pop()?.replace(/_/g, ' ')}
    </span>
  );
}

function DetailModal({ log, onClose }: { log: any; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 800 }}>Audit Log Entry</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{log._id}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'User', value: log.userEmail || log.userId },
            { label: 'Action', value: log.action },
            { label: 'Outcome', value: log.outcome },
            { label: 'IP Address', value: log.ipAddress || '—' },
            { label: 'Resource Type', value: log.resourceType || '—' },
            { label: 'Resource ID', value: log.resourceId?.slice(-12) || '—' },
            { label: 'Timestamp', value: new Date(log.createdAt).toLocaleString() },
            { label: 'User Agent', value: log.userAgent ? log.userAgent.slice(0, 30) + '…' : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--card2)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{String(value)}</div>
            </div>
          ))}
        </div>
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Metadata</div>
            <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent3)', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', overflow: 'auto', maxHeight: 150 }}>
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        )}
        {log.errorMessage && (
          <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>Error</div>
            <div style={{ fontSize: 11, color: '#ef4444', fontFamily: 'var(--font-body)' }}>{log.errorMessage}</div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
}

const AUDIT_ACTIONS = [
  '', 'auth.login', 'auth.register', 'auth.api_key_created', 'auth.api_key_revoked',
  'endpoint.created', 'endpoint.updated', 'endpoint.deleted', 'endpoint.paused',
  'event.sent', 'event.replayed', 'user.role_changed', 'user.suspended',
  'billing.payment_success', 'billing.payment_failed',
];

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [userId, setUserId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-audit', page, actionFilter, userId, fromDate, toDate],
    queryFn: () => auditApi.systemHistory({
      page, limit: 20,
      action: actionFilter || undefined,
      userId: userId || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    }),
    refetchInterval: 30_000,
  });

  const logs: any[] = data?.logs || data?.history || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / 20);

  const hasFilters = !!(actionFilter || userId || fromDate || toDate);

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {selectedLog && <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Shield size={12} style={{ color: '#ef4444' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>System Audit Log</h1>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>// {total} audit entries · Admin access required</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost" style={{ position: 'relative' }}>
            <Filter size={13} /> Filters
            {hasFilters && <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
          </button>
          <button onClick={() => refetch()} className="btn-ghost"><RefreshCw size={13} /> Refresh</button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label className="label" style={{ marginBottom: 6, display: 'block' }}>Action</label>
              <select className="input" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}>
                <option value="">All actions</option>
                {AUDIT_ACTIONS.filter(a => a).map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="label" style={{ marginBottom: 6, display: 'block' }}>User ID</label>
              <input className="input" placeholder="Filter by user ID…" value={userId} onChange={e => { setUserId(e.target.value); setPage(1); }} />
            </div>
            <div>
              <label className="label" style={{ marginBottom: 6, display: 'block' }}>From Date</label>
              <input className="input" type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} />
            </div>
            <div>
              <label className="label" style={{ marginBottom: 6, display: 'block' }}>To Date</label>
              <input className="input" type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} />
            </div>
          </div>
          {hasFilters && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => { setActionFilter(''); setUserId(''); setFromDate(''); setToDate(''); setPage(1); }} className="btn-ghost" style={{ fontSize: 11 }}>
                <X size={11} /> Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Outcome</th>
                <th>IP</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 12, borderRadius: 4, width: '70%' }} /></td>)}</tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                      <Shield size={26} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                      <div style={{ fontSize: 13 }}>No audit entries found</div>
                    </div>
                  </td>
                </tr>
              ) : logs.map((log: any) => {
                const isSuccess = log.outcome === 'success';
                return (
                  <tr key={log._id} onClick={() => setSelectedLog(log)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{log.userEmail || '—'}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{log.userId?.slice(-8)}</div>
                    </td>
                    <td><ActionBadge action={log.action} /></td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                        {log.resourceType || '—'}
                        {log.resourceId && <span style={{ opacity: 0.6 }}> #{log.resourceId.slice(-6)}</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 7px', borderRadius: 5, background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isSuccess ? '#10b981' : '#ef4444' }}>
                        {log.outcome}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{log.ipAddress || '—'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={9} style={{ color: 'var(--text3)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <ChevronRight size={13} style={{ color: 'var(--text3)' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Page {page} of {pages} · {total} entries</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }}>Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
