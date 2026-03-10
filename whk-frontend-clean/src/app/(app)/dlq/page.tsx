'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { AlertTriangle, RotateCcw, RefreshCw, Skull, Clock, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PID = 'default';

function EventDetailModal({ event, onClose, onReplay }: { event: any; onClose: () => void; onReplay: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 580 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Dead Event</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--error)', marginTop: 2 }}>// Exhausted all retry attempts</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Event Type', value: event.eventType },
              { label: 'Retry Count', value: event.retryCount ?? 5 },
              { label: 'Failed At', value: new Date(event.updatedAt || event.createdAt).toLocaleString() },
              { label: 'Event ID', value: event._id?.slice(-12) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--card2)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{String(value)}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Payload</div>
            <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent3)', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', overflow: 'auto', maxHeight: 180 }}>
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost">Close</button>
          <button onClick={() => { onReplay(); onClose(); }} className="btn-primary">
            <RotateCcw size={13} /> Replay Event
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DlqPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dlq', PID, page],
    queryFn: () => eventsApi.getDlq(PID, { page, limit: 15 }),
    refetchInterval: 30_000,
  });

  const replay = useMutation({
    mutationFn: (id: string) => eventsApi.replay(PID, id),
    onSuccess: () => { toast.success('Event queued for replay'); qc.invalidateQueries({ queryKey: ['dlq'] }); },
    onError: () => toast.error('Replay failed'),
  });

  const replayAll = useMutation({
    mutationFn: () => eventsApi.replayDlq(PID),
    onSuccess: () => { toast.success('All DLQ events queued for replay'); qc.invalidateQueries({ queryKey: ['dlq'] }); },
    onError: () => toast.error('Failed to replay all'),
  });

  const events: any[] = data?.events || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / 15);

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onReplay={() => replay.mutate(selectedEvent._id)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Dead Letter Queue</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>// Events that exhausted all retry attempts</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => refetch()} className="btn-ghost"><RefreshCw size={13} /> Refresh</button>
          {total > 0 && (
            <button onClick={() => { if (confirm(`Replay all ${total} dead events?`)) replayAll.mutate(); }} className="btn-primary" disabled={replayAll.isPending}>
              {replayAll.isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <RotateCcw size={13} />}
              Replay All ({total})
            </button>
          )}
        </div>
      </div>

      {/* Warning Banner */}
      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, marginBottom: 20 }}>
          <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', fontFamily: 'var(--font-body)' }}>
              {total} dead event{total !== 1 ? 's' : ''} require attention
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-body)', marginTop: 2 }}>
              These events failed after 5 retry attempts. Investigate the cause before replaying.
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Endpoint</th>
                <th>Retries</th>
                <th>Last Attempt</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>{Array(5).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 13, borderRadius: 4, width: '70%' }} /></td>)}</tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <Skull size={22} style={{ color: '#10b981' }} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)', marginBottom: 6 }}>DLQ is empty</div>
                      <div style={{ fontSize: 12, fontFamily: 'var(--font-body)' }}>All events delivered successfully</div>
                    </div>
                  </td>
                </tr>
              ) : events.map((ev: any) => (
                <tr key={ev._id} onClick={() => setSelectedEvent(ev)} style={{ cursor: 'pointer' }}>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--error)' }}>{ev.eventType}</code>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>#{ev._id?.slice(-8)}</div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                      {ev.endpointId?.slice(-12) || '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                      {ev.retryCount ?? 5}/5
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={10} style={{ color: 'var(--text3)' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                        {new Date(ev.updatedAt || ev.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => setSelectedEvent(ev)}
                        style={{ padding: '6px 10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 7, cursor: 'pointer', color: 'var(--accent2)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                        <ChevronRight size={11} />
                      </button>
                      <button
                        onClick={() => replay.mutate(ev._id)}
                        disabled={replay.isPending}
                        style={{ padding: '6px 10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 7, cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-body)' }}>
                        <RotateCcw size={11} /> Replay
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Page {page} of {pages} · {total} dead events</span>
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
