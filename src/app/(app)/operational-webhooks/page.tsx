'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operationalWebhooksApi } from '@/lib/api';
import { OperationalWebhook, OPERATIONAL_EVENTS } from '@/lib/types';
import { Webhook, Plus, Edit2, Trash2, RotateCcw, Play, X, Copy, Check, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { SkeletonTable } from '@/components/ui/Skeleton';
import Empty from '@/components/ui/Empty';

const PID = 'default';

// ─── Event badge ────────────────────────────────────────────────────────────
const EVENT_COLOR: Record<string, string> = {
  'endpoint.disabled':    '#f87171',
  'endpoint.recovered':   '#4ade80',
  'dlq.event_added':      '#f59e0b',
  'dlq.threshold_reached':'#f97316',
  'circuit.opened':       '#fb923c',
  'circuit.closed':       '#34d399',
  'delivery.failure':     '#f87171',
  'billing.limit_reached':'#a78bfa',
  'billing.overage':      '#c084fc',
  'sla.breach':           '#e879f9',
};

function EventBadge({ ev }: { ev: string }) {
  const c = EVENT_COLOR[ev] || '#94a3b8';
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 6px', borderRadius: 5, background: c + '18', color: c, border: `1px solid ${c}30`, whiteSpace: 'nowrap' }}>
      {ev}
    </span>
  );
}

// ─── Secret Modal ────────────────────────────────────────────────────────────
function SecretModal({ secret, onClose }: { secret: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(secret); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">New Signing Secret</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
          Save this secret — it won't be shown again.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px' }}>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent2)', flex: 1, wordBreak: 'break-all' }}>{secret}</code>
          <button onClick={copy} className="btn-icon btn-sm">
            {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Create / Edit Modal ─────────────────────────────────────────────────────
function OpWebhookModal({ editing, onClose }: { editing: OperationalWebhook | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    url:         editing?.url         || '',
    description: editing?.description || '',
    secret:      editing?.secret      || '',
    isActive:    editing?.isActive    ?? true,
    events:      new Set<string>(editing?.events || []),
  });

  const toggleEvent = (ev: string) => {
    setForm(p => {
      const next = new Set(p.events);
      next.has(ev) ? next.delete(ev) : next.add(ev);
      return { ...p, events: next };
    });
  };
  const selectAll = () => setForm(p => ({ ...p, events: new Set(OPERATIONAL_EVENTS) }));
  const clearAll  = () => setForm(p => ({ ...p, events: new Set() }));

  const buildPayload = () => ({
    url: form.url,
    description: form.description || undefined,
    ...(form.secret && !editing ? { secret: form.secret } : {}),
    isActive: form.isActive,
    events: Array.from(form.events),
  });

  const create = useMutation({
    mutationFn: (d: any) => operationalWebhooksApi.create(PID, d),
    onSuccess: () => { toast.success('Operational webhook created'); qc.invalidateQueries({ queryKey: ['op-webhooks'] }); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Create failed'),
  });
  const update = useMutation({
    mutationFn: (d: any) => operationalWebhooksApi.update(PID, editing!._id, d),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['op-webhooks'] }); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.events.size === 0) { toast.error('Select at least one event'); return; }
    const d = buildPayload();
    editing ? update.mutate(d) : create.mutate(d);
  };

  const busy = create.isPending || update.isPending;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ width: 560, maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{editing ? 'Edit Operational Webhook' : 'New Operational Webhook'}</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Endpoint URL <span style={{ color: 'var(--red)' }}>*</span></label>
            <input className="input" type="url" placeholder="https://your-server.com/hooks/ops" value={form.url}
              onChange={e => setForm(p => ({ ...p, url: e.target.value }))} required />
          </div>
          <div className="field">
            <label className="label">Description</label>
            <input className="input" placeholder="Slack alerting channel" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          {!editing && (
            <div className="field">
              <label className="label">Signing Secret <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(optional — auto-generated if blank)</span></label>
              <input className="input" type="password" placeholder="whsec_..." value={form.secret}
                onChange={e => setForm(p => ({ ...p, secret: e.target.value }))} />
            </div>
          )}

          {/* Events */}
          <div className="field">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="label" style={{ margin: 0 }}>Subscribed Events <span style={{ color: 'var(--red)' }}>*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={selectAll} style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--accent2)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Select all</button>
                <button type="button" onClick={clearAll}  style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)',  background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Clear</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {OPERATIONAL_EVENTS.map(ev => {
                const checked = form.events.has(ev);
                const c = EVENT_COLOR[ev] || '#94a3b8';
                return (
                  <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, border: `1px solid ${checked ? c + '40' : 'var(--border)'}`, background: checked ? c + '0c' : 'transparent', cursor: 'pointer', transition: 'all .15s' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleEvent(ev)} style={{ accentColor: c }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: checked ? c : 'var(--text3)' }}>{ev}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Active</label>
            <div
              onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
              style={{ width: 36, height: 20, borderRadius: 10, background: form.isActive ? 'var(--accent2)' : 'var(--bg3)', border: '1px solid var(--border)', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}
            >
              <div style={{ position: 'absolute', top: 2, left: form.isActive ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save Changes' : 'Create Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function OperationalWebhooksPage() {
  const qc = useQueryClient();
  const [modal, setModal]       = useState<OperationalWebhook | null | 'new'>(null);
  const [secretModal, setSecretModal] = useState<string | null>(null);

  const { data: hooks = [], isLoading } = useQuery<OperationalWebhook[]>({
    queryKey: ['op-webhooks'],
    queryFn: () => operationalWebhooksApi.list(PID),
  });

  const del = useMutation({
    mutationFn: (id: string) => operationalWebhooksApi.delete(PID, id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['op-webhooks'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const rotate = useMutation({
    mutationFn: (id: string) => operationalWebhooksApi.rotateSecret(PID, id),
    onSuccess: (d: any) => setSecretModal(d.secret),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Rotate failed'),
  });

  const test = useMutation({
    mutationFn: (id: string) => operationalWebhooksApi.test(PID, id),
    onSuccess: (d: any) => {
      if (d.delivered) toast.success(`Test delivered ✓ (${d.statusCode})`);
      else toast.error(`Test failed — HTTP ${d.statusCode || 'N/A'}`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Test failed'),
  });

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left">
          <h1>Operational Webhooks</h1>
          <p>// Platform-level alerts sent to your own servers · {hooks.length} configured</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <Plus size={13} />Add Webhook
        </button>
      </div>

      {/* Info callout */}
      <div style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.18)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--accent2)' }}>Operational webhooks</strong> fire when platform-level events happen (circuit breakers, DLQ threshold, billing) — not individual user deliveries. Use them to route alerts to Slack, PagerDuty, or your own monitoring.
      </div>

      <div className="tbl-wrap">
        {isLoading ? (
          <table className="tbl">
            <thead><tr><th>URL</th><th>Events</th><th>Status</th><th>Fired</th><th>Last Fired</th><th>Actions</th></tr></thead>
            <SkeletonTable rows={4} cols={6} />
          </table>
        ) : hooks.length === 0 ? (
          <Empty
            type="generic"
            title="No operational webhooks"
            sub="Get notified when circuit breakers trip, DLQ thresholds are hit, or billing limits are reached."
            action={<button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={13} />Add Webhook</button>}
          />
        ) : (
          <table className="tbl">
            <thead><tr><th>URL</th><th>Events</th><th>Status</th><th>Fired</th><th>Last Fired</th><th>Actions</th></tr></thead>
            <tbody>
              {hooks.map(h => (
                <tr key={h._id} style={{ cursor: 'pointer' }} onClick={() => setModal(h)}>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.url}</div>
                    {h.description && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{h.description}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', maxWidth: 240 }}>
                      {h.events.slice(0, 3).map(ev => <EventBadge key={ev} ev={ev} />)}
                      {h.events.length > 3 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>+{h.events.length - 3}</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: h.isActive ? '#4ade80' : '#f87171' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: h.isActive ? '#4ade80' : '#f87171', display: 'inline-block' }} />
                      {h.isActive ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' }}>{h.totalFired?.toLocaleString() ?? 0}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
                    {h.lastFiredAt ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} />{new Date(h.lastFiredAt).toLocaleDateString()}
                      </span>
                    ) : '—'}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn-icon btn-sm" title="Test delivery" onClick={() => test.mutate(h._id)} disabled={test.isPending}><Play size={11} /></button>
                      <button className="btn-icon btn-sm" title="Rotate secret" onClick={() => rotate.mutate(h._id)} disabled={rotate.isPending}><RotateCcw size={11} /></button>
                      <button className="btn-icon btn-sm" title="Edit" onClick={() => setModal(h)}><Edit2 size={11} /></button>
                      <button
                        className="btn-icon btn-sm" title="Delete"
                        style={{ color: 'var(--red)', borderColor: 'var(--rbd)' }}
                        onClick={() => { if (confirm(`Delete this webhook?`)) del.mutate(h._id); }}
                      ><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <OpWebhookModal
          editing={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
      {secretModal && <SecretModal secret={secretModal} onClose={() => setSecretModal(null)} />}
    </div>
  );
}
