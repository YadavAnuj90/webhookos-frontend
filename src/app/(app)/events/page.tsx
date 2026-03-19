'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, endpointsApi } from '@/lib/api';
import { PRIORITY_CONFIG, EventPriority } from '@/lib/types';
import { Zap, RefreshCw, Send, X, ChevronRight, Clock, Sparkles } from 'lucide-react';
import AiDebuggerModal from '@/components/ai/AiDebuggerModal';
import toast from 'react-hot-toast';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import StatusBadge from '@/components/ui/StatusBadge';
import Empty from '@/components/ui/Empty';
import { SkeletonTable } from '@/components/ui/Skeleton';
import EventDrawer from '@/components/ui/EventDrawer';

const PID = 'default';

const STATUS_OPTS = ['', 'pending', 'delivered', 'failed', 'dead', 'filtered', 'rate_limited'];
const PRIORITY_OPTS: Array<{ val: string; label: string }> = [
  { val: '', label: 'All Priorities' },
  { val: 'p0', label: '🔴 P0 Critical' },
  { val: 'p1', label: '🟠 P1 High' },
  { val: 'p2', label: '🟡 P2 Normal' },
  { val: 'p3', label: '🟢 P3 Low' },
];

function PriorityBadge({ p }: { p: EventPriority }) {
  const cfg = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.p2;
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
      padding: '2px 6px', borderRadius: 5,
      background: cfg.color + '1a', color: cfg.color,
      border: `1px solid ${cfg.color}30`,
    }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function ExpiryCountdown({ expiresAt }: { expiresAt: string }) {
  const secsLeft = differenceInSeconds(new Date(expiresAt), new Date());
  if (secsLeft <= 0) return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#f87171' }}>Expired</span>;
  const h = Math.floor(secsLeft / 3600);
  const m = Math.floor((secsLeft % 3600) / 60);
  const s = secsLeft % 60;
  const str = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  const isUrgent = secsLeft < 3600;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-mono)', fontSize: 9, color: isUrgent ? '#f59e0b' : 'var(--text3)' }}>
      <Clock size={9} />Expires in {str}
    </span>
  );
}

function SendModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    endpointId: '', eventType: 'payment.success',
    payload: '{\n  "amount": 9900,\n  "currency": "INR"\n}',
    idempotencyKey: '',
    priority: 'p2' as EventPriority,
  });
  const { data: eps } = useQuery({ queryKey: ['eps-list'], queryFn: () => endpointsApi.list(PID, { limit: 50 }) });
  const mut = useMutation({
    mutationFn: (d: any) => eventsApi.send(PID, d),
    onSuccess: () => { toast.success('Event queued for delivery'); qc.invalidateQueries({ queryKey: ['events'] }); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to send event'),
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let payload: any;
    try { payload = JSON.parse(form.payload); } catch { toast.error('Invalid JSON payload'); return; }
    mut.mutate({ ...form, payload, idempotencyKey: form.idempotencyKey || undefined });
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal modal-lg" onClick={ev => ev.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Send Webhook Event</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Endpoint</label>
            <select className="input" value={form.endpointId} onChange={e => setForm(p => ({ ...p, endpointId: e.target.value }))} required>
              <option value="">-- Select endpoint --</option>
              {eps?.endpoints?.map((ep: any) => <option key={ep._id} value={ep._id}>{ep.name} ({ep.url})</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Event Type</label>
            <input className="input" placeholder="payment.success" value={form.eventType} onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))} required />
          </div>

          {/* Priority picker */}
          <div className="field">
            <label className="label">Priority</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {(['p0','p1','p2','p3'] as EventPriority[]).map(p => {
                const cfg = PRIORITY_CONFIG[p];
                const sel = form.priority === p;
                return (
                  <button key={p} type="button"
                    onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                    style={{ padding: '6px 4px', borderRadius: 8, border: `1px solid ${sel ? cfg.color : 'var(--border)'}`, background: sel ? cfg.color + '15' : 'var(--bg3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                  >
                    <span style={{ fontSize: 13 }}>{cfg.emoji}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: sel ? cfg.color : 'var(--text3)' }}>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field">
            <label className="label">Payload (JSON)</label>
            <textarea className="input" style={{ minHeight: 90, fontFamily: 'var(--font-mono)', fontSize: 11, resize: 'vertical' }} value={form.payload} onChange={e => setForm(p => ({ ...p, payload: e.target.value }))} required />
          </div>
          <div className="field">
            <label className="label">Idempotency Key (optional)</label>
            <input className="input" placeholder="Leave blank to auto-generate" value={form.idempotencyKey} onChange={e => setForm(p => ({ ...p, idempotencyKey: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={mut.isPending}>
              {mut.isPending ? 'Sending...' : <><Send size={12} />Send Event</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [showSend, setShowSend] = useState(false);
  const [showAiDebug, setShowAiDebug] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['events', page, status, priority],
    queryFn: () => eventsApi.list(PID, { page, limit: 20, status: status || undefined, priority: priority || undefined }),
    refetchInterval: 15000,
  });

  const replay = useMutation({
    mutationFn: (id: string) => eventsApi.replay(PID, id),
    onSuccess: () => { toast.success('Queued for replay'); qc.invalidateQueries({ queryKey: ['events'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Replay failed'),
  });

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left">
          <h1>Events</h1>
          <p>// Webhook event log · {data?.total || 0} total</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="input" style={{ width: 135 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
          <select className="input" style={{ width: 145 }} value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }}>
            {PRIORITY_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
          <button className="btn btn-ghost" onClick={() => qc.invalidateQueries({ queryKey: ['events'] })} title="Refresh">
            <RefreshCw size={12} />
          </button>
          <button
            className="btn"
            onClick={() => setShowAiDebug(true)}
            style={{ background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', border: 'none', fontWeight: 600 }}
          >
            <Sparkles size={12} />✨ AI Debug
          </button>
          <button className="btn btn-primary" onClick={() => setShowSend(true)}>
            <Zap size={12} />Send Event
          </button>
        </div>
      </div>

      <div className="tbl-wrap">
        {isLoading ? (
          <table className="tbl">
            <thead><tr>
              <th>Event Type</th><th>Priority</th><th>Endpoint</th><th>Status</th>
              <th>Retries</th><th>Created</th><th></th>
            </tr></thead>
            <SkeletonTable rows={8} cols={7} />
          </table>
        ) : !data?.events?.length ? (
          <Empty
            type="events"
            title="No events yet"
            sub={status ? `No events with status "${status}".` : 'Send your first webhook event to see it here.'}
          />
        ) : (
          <table className="tbl">
            <thead><tr>
              <th>Event Type</th><th>Priority</th><th>Endpoint</th><th>Status</th>
              <th>Retries</th><th>Created</th><th></th>
            </tr></thead>
            <tbody>
              {data.events.map((e: any) => (
                <tr key={e._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedEvent(e)}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>{e.eventType}</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{e._id?.slice(-10)}</div>
                    {e.expiresAt && (
                      <div style={{ marginTop: 3 }}>
                        <ExpiryCountdown expiresAt={e.expiresAt} />
                      </div>
                    )}
                  </td>
                  <td>
                    <PriorityBadge p={e.priority || 'p2'} />
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{e.endpointId?.slice(-10)}</span>
                  </td>
                  <td><StatusBadge status={e.status} /></td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      color: e.retryCount > 0 ? 'var(--yellow)' : 'var(--text3)',
                      fontWeight: e.retryCount > 0 ? 600 : 400,
                    }}>
                      {e.retryCount > 0 ? `×${e.retryCount}` : '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                      {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
                    </span>
                  </td>
                  <td onClick={ev => ev.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {['failed', 'dead'].includes(e.status) && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => replay.mutate(e._id)}
                          disabled={replay.isPending}
                          title="Retry delivery"
                        >
                          <RefreshCw size={10} />Retry
                        </button>
                      )}
                      <button className="btn-icon btn-sm" title="View details">
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.total > 20 && (
          <div className="pg">
            <span className="pg-info">{(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total}</span>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <button className="btn btn-ghost btn-sm" disabled={page * 20 >= data.total} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {showSend && <SendModal onClose={() => setShowSend(false)} />}
      {showAiDebug && <AiDebuggerModal onClose={() => setShowAiDebug(false)} />}
      {selectedEvent && <EventDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
