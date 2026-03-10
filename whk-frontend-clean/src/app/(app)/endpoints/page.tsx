'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpointsApi } from '@/lib/api';
import { Globe, Plus, Pause, Play, Trash2, RefreshCw, Copy, Eye, EyeOff, ChevronDown, X, Check, Key, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const PID = 'default';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active:   { bg: 'rgba(16,185,129,0.12)', text: '#10b981', dot: '#10b981' },
  paused:   { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', dot: '#f59e0b' },
  disabled: { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', dot: '#ef4444' },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusColors[status] || statusColors.disabled;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '4px 9px', borderRadius: 6, background: s.bg, color: s.text, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />{status}
    </span>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', url: '', description: '', eventTypes: '', rateLimit: '' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.url.trim()) return toast.error('Name and URL are required');
    setLoading(true);
    try {
      await endpointsApi.create(PID, {
        name: form.name,
        url: form.url,
        description: form.description,
        eventTypes: form.eventTypes ? form.eventTypes.split(',').map(s => s.trim()) : [],
        rateLimit: form.rateLimit ? parseInt(form.rateLimit) : undefined,
      });
      toast.success('Endpoint created');
      qc.invalidateQueries({ queryKey: ['endpoints', PID] });
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create endpoint');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Name', placeholder: 'My Webhook Endpoint', required: true },
    { key: 'url', label: 'Target URL', placeholder: 'https://api.yourapp.com/webhooks', required: true },
    { key: 'description', label: 'Description', placeholder: 'Optional description' },
    { key: 'eventTypes', label: 'Event Types (comma-separated)', placeholder: 'payment.success, order.created' },
    { key: 'rateLimit', label: 'Rate Limit (req/min)', placeholder: '100' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>Create Endpoint</h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Configure a new webhook destination</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label className="label" style={{ marginBottom: 6, display: 'block' }}>
                {f.label}{f.required && <span style={{ color: 'var(--error)', marginLeft: 4 }}>*</span>}
              </label>
              <input
                className="input"
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleCreate} className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Plus size={14} />}
            Create Endpoint
          </button>
        </div>
      </div>
    </div>
  );
}

function SecretModal({ endpoint, onClose }: { endpoint: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const doRotate = async () => {
    setRotating(true);
    try {
      const res = await endpointsApi.rotateSecret(PID, endpoint._id);
      setNewSecret(res.signingSecret);
      qc.invalidateQueries({ queryKey: ['endpoints', PID] });
      toast.success('Secret rotated');
    } catch { toast.error('Failed to rotate secret'); }
    finally { setRotating(false); }
  };

  const secret = newSecret || endpoint.signingSecret || 'whksec_••••••••••••••••';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 800 }}>Signing Secret</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4 }}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-body)', marginBottom: 16, lineHeight: 1.6 }}>
          Use this secret to verify webhook signatures. Keep it secure and never expose it publicly.
        </p>
        <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Key size={13} style={{ color: 'var(--accent2)', flexShrink: 0 }} />
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {show ? secret : secret.slice(0, 10) + '••••••••••••••••'}
          </code>
          <button onClick={() => setShow(!show)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 2 }}>
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button onClick={() => { navigator.clipboard.writeText(secret); toast.success('Copied!'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 2 }}>
            <Copy size={13} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost">Close</button>
          <button onClick={doRotate} className="btn-ghost" disabled={rotating}>
            <RefreshCw size={13} style={{ animation: rotating ? 'spin 1s linear infinite' : 'none' }} />
            Rotate Secret
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EndpointsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [secretEp, setSecretEp] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['endpoints', PID, page, statusFilter],
    queryFn: () => endpointsApi.list(PID, { page, limit: 12, status: statusFilter || undefined }),
  });

  const pause = useMutation({
    mutationFn: (id: string) => endpointsApi.pause(PID, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['endpoints'] }); toast.success('Endpoint paused'); },
    onError: () => toast.error('Failed to pause'),
  });
  const resume = useMutation({
    mutationFn: (id: string) => endpointsApi.resume(PID, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['endpoints'] }); toast.success('Endpoint resumed'); },
    onError: () => toast.error('Failed to resume'),
  });
  const del = useMutation({
    mutationFn: (id: string) => endpointsApi.delete(PID, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['endpoints'] }); toast.success('Endpoint deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  const endpoints: any[] = data?.endpoints || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / 12);

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      {secretEp && <SecretModal endpoint={secretEp} onClose={() => setSecretEp(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Endpoints</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>// {total} webhook destinations registered</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={14} /> New Endpoint
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'active', 'paused', 'disabled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
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
                <th>Name</th>
                <th>URL</th>
                <th>Status</th>
                <th>Events</th>
                <th>Rate Limit</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 4, width: j === 1 ? '80%' : '60%' }} /></td>
                    ))}
                  </tr>
                ))
              ) : endpoints.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                      <Globe size={28} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                      <div style={{ fontSize: 14, fontFamily: 'var(--font-body)' }}>No endpoints found</div>
                      <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ marginTop: 14, fontSize: 12 }}>
                        <Plus size={12} /> Create first endpoint
                      </button>
                    </div>
                  </td>
                </tr>
              ) : endpoints.map((ep: any) => (
                <tr key={ep._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{ep.name}</div>
                    {ep.description && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{ep.description}</div>}
                  </td>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent3)' }}>
                      {ep.url.length > 45 ? ep.url.slice(0, 45) + '…' : ep.url}
                    </code>
                  </td>
                  <td><StatusBadge status={ep.status} /></td>
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                      {ep.eventTypes?.length ? ep.eventTypes.slice(0, 2).join(', ') + (ep.eventTypes.length > 2 ? ` +${ep.eventTypes.length - 2}` : '') : '—'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                      {ep.rateLimit ? `${ep.rateLimit}/min` : '∞'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => setSecretEp(ep)} title="View secret" style={{ padding: '6px 8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 7, cursor: 'pointer', color: 'var(--accent2)' }}>
                        <Key size={12} />
                      </button>
                      {ep.status === 'active' ? (
                        <button onClick={() => pause.mutate(ep._id)} title="Pause" style={{ padding: '6px 8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 7, cursor: 'pointer', color: '#f59e0b' }}>
                          <Pause size={12} />
                        </button>
                      ) : ep.status === 'paused' ? (
                        <button onClick={() => resume.mutate(ep._id)} title="Resume" style={{ padding: '6px 8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 7, cursor: 'pointer', color: '#10b981' }}>
                          <Play size={12} />
                        </button>
                      ) : null}
                      <button onClick={() => { if (confirm('Delete this endpoint?')) del.mutate(ep._id); }} title="Delete" style={{ padding: '6px 8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, cursor: 'pointer', color: '#ef4444' }}>
                        <Trash2 size={12} />
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
