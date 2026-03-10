'use client';
import { useState, useEffect } from 'react';
import { transformationsApi } from '@/lib/api';
import { Shuffle, Plus, Trash2, Play, ChevronDown, GripVertical, Eye } from 'lucide-react';

const TYPE_LABELS: any = { remove_fields: 'Remove Fields', rename_keys: 'Rename Keys', add_fields: 'Add Fields', filter: 'Filter Events', custom_js: 'Template Substitution' };
const TYPE_COLORS: any = { remove_fields: '#f87171', rename_keys: '#fbbf24', add_fields: '#4ade80', filter: '#60a5fa', custom_js: '#a78bfa' };

export default function TransformationsPage() {
  const [transforms, setTransforms] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editT, setEditT] = useState<any>(null);
  const [previewInput, setPreviewInput] = useState('{\n  "event": "user.created",\n  "userId": "123",\n  "email": "user@example.com",\n  "password": "secret",\n  "internalId": "int_456"\n}');
  const [previewOutput, setPreviewOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'remove_fields', config: {} as any });
  const [configStr, setConfigStr] = useState('{\n  "fields": ["password", "internalId"]\n}');

  const load = async () => { try { const d = await transformationsApi.list(); setTransforms(Array.isArray(d) ? d : []); } catch {} };
  useEffect(() => { load(); }, []);

  const preview = async (t: any) => {
    try {
      let input: any; try { input = JSON.parse(previewInput); } catch { input = previewInput; }
      const r = await transformationsApi.preview({ transformation: t, payload: input });
      setPreviewOutput(r);
    } catch {}
  };

  const save = async () => {
    setLoading(true);
    try {
      let cfg: any; try { cfg = JSON.parse(configStr); } catch { cfg = {}; }
      const data = { ...form, config: cfg };
      if (editT) { await transformationsApi.update(editT._id, data); } else { await transformationsApi.create(data); }
      setShowCreate(false); setEditT(null); setForm({ name: '', description: '', type: 'remove_fields', config: {} }); setConfigStr('{}');
      await load();
    } catch {} finally { setLoading(false); }
  };

  const del = async (id: string) => { if (!confirm('Delete this transformation?')) return; try { await transformationsApi.delete(id); await load(); } catch {} };

  const CONFIG_TEMPLATES: any = {
    remove_fields: '{\n  "fields": ["password", "secret", "internalId"]\n}',
    rename_keys: '{\n  "mappings": {\n    "userId": "user_id",\n    "createdAt": "created_at"\n  }\n}',
    add_fields: '{\n  "additions": {\n    "source": "webhookos",\n    "version": "1.0"\n  }\n}',
    filter: '{\n  "filterField": "event",\n  "filterValue": "payment.completed"\n}',
    custom_js: '{\n  "template": {\n    "user_id": "{{userId}}",\n    "user_email": "{{email}}"\n  }\n}',
  };

  const S: any = {
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 },
    input: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' },
    label: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shuffle size={18} color="#fff" /></div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Transformations</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Modify webhook payloads before delivery -- remove, rename, filter or template</p>
          </div>
        </div>
        <button onClick={() => { setEditT(null); setShowCreate(true); }} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} />New Transformation
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Transformations list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {transforms.length === 0 ? (
            <div style={{ ...S.card, padding: 48, textAlign: 'center' }}>
              <Shuffle size={32} color="var(--text3)" style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)' }}>No transformations yet</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 4, opacity: 0.6 }}>Create one to modify payloads before delivery</div>
            </div>
          ) : transforms.map(t => (
            <div key={t._id} style={{ ...S.card, padding: '16px 20px', opacity: t.isActive ? 1 : 0.55 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <GripVertical size={14} color="var(--text3)" style={{ cursor: 'grab', flexShrink: 0 }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[t.type] || 'var(--accent2)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{t.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 7px', borderRadius: 5, background: (TYPE_COLORS[t.type] || '#6366f1') + '20', color: TYPE_COLORS[t.type] || 'var(--accent2)' }}>{TYPE_LABELS[t.type]}</span>
                  </div>
                  {t.description && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{t.description}</div>}
                  <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', margin: '6px 0 0', overflow: 'hidden', maxHeight: 40, textOverflow: 'ellipsis' }}>{JSON.stringify(t.config)}</pre>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { preview(t); }} style={{ padding: '5px 11px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}><Eye size={11} />Preview</button>
                  <button onClick={() => del(t._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f87171' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ ...S.card, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={14} color="var(--accent2)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Live Preview</span>
            </div>
            <div style={{ padding: 14 }}>
              <label style={S.label}>Input Payload</label>
              <textarea value={previewInput} onChange={e => setPreviewInput(e.target.value)} rows={8} style={S.textarea} />
              {previewOutput && (
                <div style={{ marginTop: 12 }}>
                  <label style={S.label}>Output</label>
                  {previewOutput.dropped ? (
                    <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: 10, fontFamily: 'var(--font-body)', fontSize: 12, color: '#f87171' }}>Event dropped by filter</div>
                  ) : (
                    <pre style={{ ...S.textarea, minHeight: 120, resize: 'none', color: '#4ade80' }}>{JSON.stringify(previewOutput.output, null, 2)}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Type legend */}
          <div style={{ ...S.card, padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Transformation Types</div>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[k], flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)' }}>{v as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...S.card, width: 520, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20, marginTop: 0 }}>New Transformation</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Remove sensitive fields" style={S.input} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <button key={k} onClick={() => { setForm(f => ({ ...f, type: k })); setConfigStr(CONFIG_TEMPLATES[k] || '{}'); }} style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${form.type === k ? TYPE_COLORS[k] : 'var(--border)'}`, background: form.type === k ? (TYPE_COLORS[k] + '20') : 'transparent', fontFamily: 'var(--font-body)', fontSize: 12, color: form.type === k ? TYPE_COLORS[k] : 'var(--text3)', cursor: 'pointer' }}>{v as string}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>Configuration (JSON)</label>
              <textarea value={configStr} onChange={e => setConfigStr(e.target.value)} rows={7} style={S.textarea} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '9px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={loading || !form.name} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: !form.name ? 0.6 : 1 }}>{loading ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
