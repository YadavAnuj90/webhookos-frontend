'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import { FileText, Clock, RefreshCw, ChevronDown, X, Filter } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  'auth.login': '#10b981',
  'auth.logout': '#6b7280',
  'auth.register': '#818cf8',
  'auth.api_key_created': '#f59e0b',
  'auth.api_key_revoked': '#ef4444',
  'endpoint.created': '#10b981',
  'endpoint.updated': '#818cf8',
  'endpoint.deleted': '#ef4444',
  'endpoint.paused': '#f59e0b',
  'endpoint.resumed': '#10b981',
  'endpoint.secret_rotated': '#f59e0b',
  'event.sent': '#818cf8',
  'event.replayed': '#38bdf8',
  'billing.payment_success': '#10b981',
  'billing.payment_failed': '#ef4444',
};

function ActionBadge({ action }: { action: string }) {
  const color = ACTION_COLORS[action] || '#6b7280';
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px', borderRadius: 6, background: `${color}14`, color, border: `1px solid ${color}25`, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
      {action.split('.').pop()?.replace(/_/g, ' ')}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const isSuccess = outcome === 'success';
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px', borderRadius: 6, background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isSuccess ? '#10b981' : '#ef4444', border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
      {outcome}
    </span>
  );
}

function DetailModal({ log, onClose }: { log: any; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 800 }}>Audit Entry</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Action', value: log.action },
              { label: 'Outcome', value: <OutcomeBadge outcome={log.outcome} /> },
              { label: 'Timestamp', value: new Date(log.createdAt).toLocaleString() },
              { label: 'IP Address', value: log.ipAddress || '—' },
              { label: 'Resource', value: log.resourceType || '—' },
              { label: 'Resource ID', value: log.resourceId?.slice(-12) || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--card2)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{value}</div>
              </div>
            ))}
          </div>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Metadata</div>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent3)', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', overflow: 'auto', maxHeight: 160 }}>
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
          {log.errorMessage && (
            <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>Error</div>
              <div style={{ fontSize: 11, color: '#ef4444', fontFamily: 'var(--font-body)' }}>{log.errorMessage}</div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['history', page],
    queryFn: () => auditApi.myHistory({ page, limit: 20 }),
    refetchInterval: 60_000,
  });

  const logs: any[] = data?.logs || data?.history || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / 20);

  // Group by date
  const grouped = logs.reduce((acc: Record<string, any[]>, log: any) => {
    const date = new Date(log.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {selectedLog && <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Activity History</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>// Your personal audit trail · {total} entries</p>
        </div>
        <button onClick={() => refetch()} className="btn-ghost"><RefreshCw size={13} /> Refresh</button>
      </div>

      {/* Log List */}
      {isLoading ? (
        <div className="card">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}><div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 6, borderRadius: 4 }} /><div className="skeleton" style={{ height: 10, width: '30%', borderRadius: 4 }} /></div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 0' }}>
          <FileText size={28} style={{ color: 'var(--text3)', opacity: 0.4, display: 'block', margin: '0 auto 12px' }} />
          <div style={{ fontSize: 14, color: 'var(--text3)', fontFamily: 'var(--font-body)' }}>No activity recorded yet</div>
        </div>
      ) : (
        Object.entries(grouped).map(([date, dayLogs]) => (
          <div key={date} style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              {date}
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {dayLogs.map((log: any, i: number) => {
                const color = ACTION_COLORS[log.action] || '#6b7280';
                return (
                  <div key={log._id} onClick={() => setSelectedLog(log)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < dayLogs.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}14`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ActionBadge action={log.action} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                          {log.action.split('.')[0].toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 4, alignItems: 'center' }}>
                        {log.ipAddress && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{log.ipAddress}</span>}
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                          <Clock size={9} style={{ display: 'inline', marginRight: 3 }} />
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <OutcomeBadge outcome={log.outcome} />
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost" style={{ padding: '7px 16px' }}>Prev</button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>Page {page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-ghost" style={{ padding: '7px 16px' }}>Next</button>
        </div>
      )}
    </div>
  );
}
