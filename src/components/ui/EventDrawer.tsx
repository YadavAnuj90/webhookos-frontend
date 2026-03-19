'use client';
import { useEffect, useRef } from 'react';
import {
  X, RefreshCw, Copy, CheckCircle2, XCircle, Clock,
  AlertTriangle, Zap, ChevronRight, ExternalLink,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import StatusBadge from './StatusBadge';
import { SkeletonDetailPanel } from './Skeleton';

const PID = 'default';

function JSONView({ data }: { data: any }) {
  const str = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return (
    <pre style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)',
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '12px 14px', overflowX: 'auto',
      maxHeight: 220, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
    }}>
      {str}
    </pre>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)',
        textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: any; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', flexShrink: 0, marginRight: 12 }}>{label}</span>
      <span style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
        fontSize: 11, color: 'var(--text)', textAlign: 'right', wordBreak: 'break-all',
      }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'delivered') return <CheckCircle2 size={14} color="var(--green)" />;
  if (status === 'failed' || status === 'dead') return <XCircle size={14} color="var(--red)" />;
  if (status === 'pending') return <Clock size={14} color="var(--yellow)" />;
  return <AlertTriangle size={14} color="var(--orange)" />;
}

interface EventDrawerProps {
  event: any;
  onClose: () => void;
  loading?: boolean;
}

export default function EventDrawer({ event, onClose, loading = false }: EventDrawerProps) {
  const qc = useQueryClient();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const replay = useMutation({
    mutationFn: () => eventsApi.replay(PID, event._id),
    onSuccess: () => {
      toast.success('Event queued for replay');
      qc.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Replay failed'),
  });

  const copyId = () => {
    navigator.clipboard.writeText(event._id);
    toast.success('Event ID copied');
  };

  const attempts: any[] = event?.deliveryAttempts || event?.attempts || [];
  const lastResponse = event?.lastResponse || attempts[attempts.length - 1]?.response || null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 500, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 460, background: 'var(--bg2)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
          zIndex: 501, display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Zap size={14} color="var(--accent2)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event?.eventType || 'Event Detail'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                {event?._id?.slice(-12)}
              </span>
              <button onClick={copyId} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text3)' }}>
                <Copy size={10} />
              </button>
            </div>
          </div>
          {event && <StatusBadge status={event.status} />}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 7, color: 'var(--text3)', display: 'flex', alignItems: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
          {loading ? (
            <SkeletonDetailPanel />
          ) : (
            <>
              {/* Meta */}
              <Section title="Event Info">
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 14px' }}>
                  <InfoRow label="Status" value={<StatusBadge status={event?.status} />} />
                  <InfoRow label="Event Type" value={event?.eventType} mono />
                  <InfoRow label="Endpoint ID" value={event?.endpointId} mono />
                  <InfoRow label="Retry Count" value={event?.retryCount ?? 0} mono />
                  <InfoRow label="Idempotency Key" value={event?.idempotencyKey} mono />
                  <InfoRow label="Created" value={event?.createdAt ? new Date(event.createdAt).toLocaleString() : '—'} />
                  <InfoRow label="Updated" value={event?.updatedAt ? new Date(event.updatedAt).toLocaleString() : '—'} />
                </div>
              </Section>

              {/* Payload */}
              {event?.payload && (
                <Section title="Payload">
                  <JSONView data={event.payload} />
                </Section>
              )}

              {/* Last Response */}
              {lastResponse && (
                <Section title="Last Response">
                  <div style={{ marginBottom: 8 }}>
                    <InfoRow
                      label="HTTP Status"
                      value={
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                          color: lastResponse.statusCode >= 200 && lastResponse.statusCode < 300 ? 'var(--green)' : 'var(--red)',
                        }}>
                          {lastResponse.statusCode || '—'}
                        </span>
                      }
                    />
                    <InfoRow label="Duration" value={lastResponse.durationMs ? `${lastResponse.durationMs}ms` : '—'} mono />
                  </div>
                  {lastResponse.body && (
                    <>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginBottom: 5 }}>Response Body</div>
                      <JSONView data={lastResponse.body} />
                    </>
                  )}
                  {lastResponse.headers && (
                    <>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', margin: '8px 0 5px' }}>Response Headers</div>
                      <JSONView data={lastResponse.headers} />
                    </>
                  )}
                </Section>
              )}

              {/* Delivery Attempts Timeline */}
              {attempts.length > 0 && (
                <Section title={`Delivery Attempts (${attempts.length})`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {attempts.map((att: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          background: 'var(--bg3)', border: '1px solid var(--border)',
                          borderRadius: 8, padding: '10px 12px',
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                        }}
                      >
                        <StatusIcon status={att.status || (att.statusCode >= 200 && att.statusCode < 300 ? 'delivered' : 'failed')} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)', fontWeight: 600 }}>
                              Attempt #{i + 1}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                              color: att.statusCode >= 200 && att.statusCode < 300 ? 'var(--green)' : 'var(--red)',
                            }}>
                              {att.statusCode}
                            </span>
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                            {att.createdAt ? new Date(att.createdAt).toLocaleString() : ''}
                            {att.durationMs ? ` · ${att.durationMs}ms` : ''}
                          </div>
                          {att.error && (
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--red)', marginTop: 4 }}>
                              {att.error}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && event && (
          <div style={{
            padding: '14px 20px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 8, flexShrink: 0,
          }}>
            {['failed', 'dead'].includes(event?.status) && (
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => replay.mutate()}
                disabled={replay.isPending}
              >
                {replay.isPending ? (
                  <><div className="spin" style={{ width: 11, height: 11 }} />Replaying...</>
                ) : (
                  <><RefreshCw size={12} />Retry Delivery</>
                )}
              </button>
            )}
            {event?.endpointId && (
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => window.open(`/endpoints/${event.endpointId}`, '_self')}
              >
                <ExternalLink size={12} />View Endpoint
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
