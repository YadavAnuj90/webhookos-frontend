'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, endpointsApi } from '@/lib/api';
import { Zap, RefreshCw, RotateCcw, ChevronDown, X, Clock, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const PID = 'default';

const statusColors: Record<string, { bg: string; text: string }> = {
  delivered:    { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
  failed:       { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444' },
  dead:         { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  pending:      { bg: 'rgba(129,140,248,0.12)', text: '#818cf8' },
  filtered:     { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' },
  rate_limited: { bg: 'rgba(56,189,248,0.12)',  text: '#38bdf8' },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusColors[status] || { bg: 'rgba(107,114,128,0.1)', text: '#6b7280' };
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px', borderRadius: 6, background: s.bg, color: s.text, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

function SendEventModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ endpointId: '', eventType: '', payload: '{\n  "key": "value"\n}', idempotencyKey: '' });
  const [loading, setLoading] = useState(false);
  const [payloadError, setPayloadError] = useState('');

  const { data: epData } = useQuery({ queryKey: ['endpoints-modal', PID], queryFn: () => endpointsApi.list(PID, { limit: 100, status: 'active' }) });
  const endpoints = epData?.endpoints || [];

  const handleSend = async () => {
    if (!form.endpointId || !form.eventType) return toast.error('Endpoint and event type required');
    let parsedPayload;
    try { parsedPayload = JSON.parse(form.payload); setPayloadError(''); }
    catch { setPayloadError('Invalid JSON'); return; }
    setLoading(true);
    try {
      await eventsApi.send(PID, { endpointId: form.endpointId, eventType: form.eventType, payload: parsedPayload, idempotencyKey: form.idempotencyKey || undefined });
      toast.success('Event sent!');
      qc.invalidateQueries({ queryKey: ['events'] });
      onClose();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to send event'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Send Event</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Dispatch a webhook event to an endpoint</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label" style={{ marginBottom: 6, display: 'block' }}>Endpoint <span style={{ color: 'var(--error)' }}>*</span></label>
            <select className="input" value={form.endpointId} onChange={e => setForm(p => ({ ...p, endpointId: e.target.value }))}>
              <option value="">Select endpoint…</option>
              {endpoints.map((ep: any) => <option key={ep._id} value={ep._id}>{ep.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" style={{ marginBottom: 6, display: 'block' }}>Event Type <span style={{ color: 'var(--error)' }}>*</span></label>
            <input className="input" placeholder="payment.success" value={form.eventType} onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))} />
          </div>
          <div>
            <label className="label" style={{ marginBottom: 6, display: 'block' }}>Payload (JSON)</label>
            <textarea
              className="input"
              rows={5}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, resize: 'vertical', borderColor: payloadError ? 'var(--error)' : undefined }}
              value={form.payload}
              onChange={e => { setForm(p => ({ ...p, payload: e.target.value })); setPayloadError(''); }}
            />
            {payloadError && <p style={{ color: 'var(--error)', fontSize: 11, marginTop: 4 }}>{payloadError}</p>}
          </div>
          <div>
            <label className="label" style={{ marginBottom: 6, display: 'block' }}>Idempotency Key <span style={{ color: 'var(--text3)' }}>(optional)</span></label>
            <input className="input" placeholder="unique-key-123" value={form.idempotencyKey} onChange={e => setForm(p => ({ ...p, idempotencyKey: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSend} className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={13} />}
            Send Event
          </button>
        </div>
      </div>
    </div>
  );
}

function EventLogsModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { data: event } = useQuery({ queryKey: ['event', eventId, PID], queryFn: () => eventsApi.get(PID, eventId) });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 800 }}>Event Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={16} /></button>
        </div>
        {event ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Event Type', value: event.eventType },
                { label: 'Status', value: <StatusBadge status={event.status} /> },
                { label: 'Created', value: new Date(event.createdAt).toLocaleString() },
                { label: 'Retry Count', value: event.retryCount ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--card2)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase' }}>Payload</div>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent3)', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', overflow: 'auto', maxHeight: 200 }}>
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 30 }}><div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }} /></div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const qc = useQueryClient();
  const [showSend, setShowSend] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['events', PID, page, statusFilter],
    queryFn: () => eventsApi.list(PID, { page, limit: 15, status: statusFilter || undefined }),
    refetchInterval: 30_000,
  });

  const replay = useMutation({
    mutationFn: (id: string) => eventsApi.replay(PID, id),
    onSuccess: () => { toast.success('Event queued for replay'); qc.invalidateQueries({ queryKey: ['events'] }); },
    onError: () => toast.error('Failed to replay'),
  });

  const events: any[] = data?.events || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / 15);

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {showSend && <SendEventModal onClose={() => setShowSend(false)} />}
      {selectedEvent && <EventLogsModal eventId={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Events</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>// {total} total events</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => refetch()} className="btn-ghost">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => setShowSend(true)} className="btn-primary">
            <Zap size={13} /> Send Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'delivered', 'failed', 'dead', 'pending'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.15s',
              background: statusFilter === s ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
              border: statusFilter === s ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)',
              color: statusFilter === s ? 'var(--accent3)' : 'var(--text3)',
            }}>{s || 'All'}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Status</th>
                <th>Endpoint</th>
                <th>Retries</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(6).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 13, borderRadius: 4, width: '70%' }} /></td>)}</tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                      <Zap size={26} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                      <div style={{ fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 14 }}>No events found</div>
                      <button onClick={() => setShowSend(true)} className="btn-primary" style={{ fontSize: 12 }}>
                        <Zap size={12} /> Send first event
                      </button>
                    </div>
                  </td>
                </tr>
              ) : events.map((ev: any) => (
                <tr key={ev._id} onClick={() => setSelectedEvent(ev._id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent3)' }}>{ev.eventType}</code>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{ev._id.slice(-8)}</div>
                  </td>
                  <td onClick={e => e.stopPropagation()}><StatusBadge status={ev.status} /></td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                      {ev.endpointId?.slice(-8) || '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: ev.retryCount > 0 ? 'var(--warning)' : 'var(--text3)' }}>
                      {ev.retryCount ?? 0}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={10} style={{ color: 'var(--text3)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                        {new Date(ev.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {['failed', 'dead'].includes(ev.status) && (
                        <button
                          onClick={() => replay.mutate(ev._id)}
                          title="Replay"
                          style={{ padding: '6px 10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 7, cursor: 'pointer', color: 'var(--accent2)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-body)' }}
                        >
                          <RotateCcw size={11} /> Replay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Page {page} of {pages} · {total} total</span>
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
