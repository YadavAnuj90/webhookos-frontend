'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpointsApi, eventsApi } from '@/lib/api';
import {
  Globe, ArrowLeft, Pause, Play, Trash2, RotateCcw,
  Copy, Check, Settings, Zap, BarChart3, Edit2,
  ChevronRight, RefreshCw, X, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '@/components/ui/StatusBadge';
import Empty from '@/components/ui/Empty';
import { SkeletonCard, SkeletonTable, SkeletonText } from '@/components/ui/Skeleton';
import EventDrawer from '@/components/ui/EventDrawer';

const PID = 'default';

type Tab = 'overview' | 'events' | 'settings';

function StatCard({ label, value, color = 'var(--accent2)' }: { label: string; value: any; color?: string }) {
  return (
    <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color }}>{value ?? '—'}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false, copy = false }: { label: string; value: any; mono?: boolean; copy?: boolean }) {
  const doCopy = () => { navigator.clipboard.writeText(String(value)); toast.success('Copied!'); };
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', flexShrink: 0, marginRight: 16 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)', fontSize: 12, color: 'var(--text)', wordBreak: 'break-all', textAlign: 'right' }}>
          {value ?? '—'}
        </span>
        {copy && value && (
          <button onClick={doCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 2 }}>
            <Copy size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function EndpointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [evPage, setEvPage] = useState(1);
  const [showSecret, setShowSecret] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [copied, setCopied] = useState('');

  const { data: ep, isLoading } = useQuery({
    queryKey: ['endpoint', id],
    queryFn: () => endpointsApi.get(PID, id),
    enabled: !!id,
  });

  const { data: eventsData, isLoading: evLoading } = useQuery({
    queryKey: ['ep-events', id, evPage],
    queryFn: () => eventsApi.list(PID, { endpointId: id, page: evPage, limit: 15 }),
    enabled: tab === 'events' && !!id,
  });

  const pause   = useMutation({ mutationFn: () => endpointsApi.pause(PID, id),   onSuccess: () => { toast.success('Paused');  qc.invalidateQueries({ queryKey: ['endpoint', id] }); } });
  const resume  = useMutation({ mutationFn: () => endpointsApi.resume(PID, id),  onSuccess: () => { toast.success('Active');  qc.invalidateQueries({ queryKey: ['endpoint', id] }); } });
  const del     = useMutation({ mutationFn: () => endpointsApi.delete(PID, id),  onSuccess: () => { toast.success('Deleted'); router.push('/endpoints'); } });
  const rotate  = useMutation({ mutationFn: () => endpointsApi.rotateSecret(PID, id), onSuccess: (d) => { toast.success('Secret rotated!'); qc.invalidateQueries({ queryKey: ['endpoint', id] }); } });
  const update  = useMutation({
    mutationFn: (d: any) => endpointsApi.update(PID, id, d),
    onSuccess: () => { toast.success('Endpoint updated'); qc.invalidateQueries({ queryKey: ['endpoint', id] }); setEditForm(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
    toast.success('Copied!');
  };

  if (isLoading) {
    return (
      <div className="page">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <SkeletonText width="100%" height={400} style={{ borderRadius: 12 }} />
      </div>
    );
  }

  if (!ep) {
    return (
      <div className="page">
        <Empty type="endpoints" title="Endpoint not found" sub="This endpoint may have been deleted or doesn't exist." />
      </div>
    );
  }

  const startEdit = () => setEditForm({
    name: ep.name, url: ep.url,
    eventTypes: (ep.eventTypes || []).join(', '),
    timeoutMs: ep.timeoutMs || 30000,
  });

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => router.push('/endpoints')}
          style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <ArrowLeft size={12} />Back to Endpoints
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(79,70,229,.12)', border: '1px solid rgba(79,70,229,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Globe size={20} color="var(--accent2)" strokeWidth={1.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                {ep.name}
              </h1>
              <StatusBadge status={ep.status} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              {ep.url}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
            {ep.status === 'active'
              ? <button className="btn btn-ghost btn-sm" onClick={() => pause.mutate()}><Pause size={12} />Pause</button>
              : <button className="btn btn-ghost btn-sm" onClick={() => resume.mutate()}><Play size={12} />Resume</button>
            }
            <button className="btn btn-ghost btn-sm" onClick={startEdit}><Edit2 size={12} />Edit</button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--red)', borderColor: 'var(--rbd)' }}
              onClick={() => { if (confirm(`Delete "${ep.name}"?`)) del.mutate(); }}
            >
              <Trash2 size={12} />Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Delivered" value={ep.totalDelivered || 0} color="var(--green)" />
        <StatCard label="Failed" value={ep.totalFailed || 0} color="var(--red)" />
        <StatCard label="Success Rate" value={
          ep.totalDelivered || ep.totalFailed
            ? `${Math.round((ep.totalDelivered || 0) / ((ep.totalDelivered || 0) + (ep.totalFailed || 0)) * 100)}%`
            : '—'
        } />
        <StatCard label="Timeout" value={ep.timeoutMs ? `${ep.timeoutMs}ms` : '30000ms'} color="var(--blue)" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {([
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'events',   label: 'Events',   icon: Zap },
          { key: 'settings', label: 'Settings', icon: Settings },
        ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: tab === key ? 600 : 400,
              color: tab === key ? 'var(--accent2)' : 'var(--text3)',
              borderBottom: tab === key ? '2px solid var(--accent2)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Configuration</div>
            <InfoRow label="Name" value={ep.name} />
            <InfoRow label="URL" value={ep.url} mono copy />
            <InfoRow label="Status" value={<StatusBadge status={ep.status} />} />
            <InfoRow label="Event Types" value={ep.eventTypes?.length ? ep.eventTypes.join(', ') : 'All events'} mono />
            <InfoRow label="Timeout" value={`${ep.timeoutMs || 30000}ms`} mono />
            <InfoRow label="Retry Limit" value={ep.maxRetries || 3} />
            <InfoRow label="Created" value={ep.createdAt ? new Date(ep.createdAt).toLocaleString() : '—'} />
            <InfoRow label="Last Updated" value={ep.updatedAt ? new Date(ep.updatedAt).toLocaleString() : '—'} />
          </div>

          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Signing Secret</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
                Use this secret to verify webhook signatures on your server.
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code style={{
                  flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 7, padding: '8px 12px', fontFamily: 'var(--font-mono)',
                  fontSize: 11, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {showSecret ? (ep.secret || 'No secret') : '•'.repeat(32)}
                </code>
                <button onClick={() => setShowSecret(!showSecret)} className="btn-icon btn-sm" title={showSecret ? 'Hide' : 'Show'}>
                  {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                {ep.secret && (
                  <button
                    onClick={() => copyText(ep.secret, 'secret')}
                    className="btn-icon btn-sm"
                    title="Copy secret"
                  >
                    {copied === 'secret' ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { if (confirm('Rotate signing secret? This will invalidate the current secret immediately.')) rotate.mutate(); }}
              disabled={rotate.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RotateCcw size={12} />Rotate Secret
            </button>

            {ep.headers && Object.keys(ep.headers).length > 0 && (
              <>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '20px 0 10px' }}>Custom Headers</div>
                {Object.entries(ep.headers).map(([k, v]: any) => (
                  <InfoRow key={k} label={k} value={v} mono />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab: Events */}
      {tab === 'events' && (
        <div className="tbl-wrap">
          {evLoading ? (
            <table className="tbl">
              <thead><tr><th>Event Type</th><th>Status</th><th>Retries</th><th>Created</th><th></th></tr></thead>
              <SkeletonTable rows={8} cols={5} />
            </table>
          ) : !eventsData?.events?.length ? (
            <Empty type="events" title="No events for this endpoint" sub="Events delivered to this endpoint will appear here." />
          ) : (
            <table className="tbl">
              <thead><tr><th>Event Type</th><th>Status</th><th>Retries</th><th>Created</th><th></th></tr></thead>
              <tbody>
                {eventsData.events.map((e: any) => (
                  <tr key={e._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedEvent(e)}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>{e.eventType}</span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{e._id?.slice(-10)}</div>
                    </td>
                    <td><StatusBadge status={e.status} /></td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: e.retryCount > 0 ? 'var(--yellow)' : 'var(--text3)' }}>
                        {e.retryCount > 0 ? `×${e.retryCount}` : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                        {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
                      </span>
                    </td>
                    <td><ChevronRight size={13} color="var(--text3)" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {eventsData && eventsData.total > 15 && (
            <div className="pg">
              <span className="pg-info">{(evPage - 1) * 15 + 1}–{Math.min(evPage * 15, eventsData.total)} of {eventsData.total}</span>
              <button className="btn btn-ghost btn-sm" disabled={evPage === 1} onClick={() => setEvPage(p => p - 1)}>Prev</button>
              <button className="btn btn-ghost btn-sm" disabled={evPage * 15 >= eventsData.total} onClick={() => setEvPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Settings (Edit form) */}
      {tab === 'settings' && (
        <div className="card" style={{ maxWidth: 560, padding: '24px 28px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>Edit Endpoint</div>
          <form onSubmit={e => { e.preventDefault(); if (editForm) update.mutate({ ...editForm, eventTypes: editForm.eventTypes ? editForm.eventTypes.split(',').map((s: string) => s.trim()) : [] }); }}>
            {!editForm && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <button type="button" className="btn btn-primary" onClick={startEdit}><Edit2 size={13} />Edit Endpoint</button>
              </div>
            )}
            {editForm && (
              <>
                <div className="field"><label className="label">Name</label><input className="input" value={editForm.name} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} required /></div>
                <div className="field"><label className="label">URL</label><input className="input" type="url" value={editForm.url} onChange={e => setEditForm((f: any) => ({ ...f, url: e.target.value }))} required /></div>
                <div className="field"><label className="label">Event Types (comma-separated)</label><input className="input" placeholder="payment.success, order.created" value={editForm.eventTypes} onChange={e => setEditForm((f: any) => ({ ...f, eventTypes: e.target.value }))} /></div>
                <div className="field"><label className="label">Timeout (ms)</label><input className="input" type="number" value={editForm.timeoutMs} onChange={e => setEditForm((f: any) => ({ ...f, timeoutMs: +e.target.value }))} /></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditForm(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={update.isPending}>
                    {update.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Danger Zone</div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--red)', borderColor: 'var(--rbd)' }}
              onClick={() => { if (confirm(`Permanently delete "${ep.name}"? This cannot be undone.`)) del.mutate(); }}
            >
              <Trash2 size={12} />Delete Endpoint
            </button>
          </div>
        </div>
      )}

      {selectedEvent && <EventDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
