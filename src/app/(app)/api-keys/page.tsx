'use client';
import { useState, useEffect } from 'react';
import { apiKeysApi } from '@/lib/api';
import { Key, Plus, Copy, Check, Trash2, Ban, Clock, Activity, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<any>(null);
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', expiresAt: '', scopes: ['read', 'write'] });

  const load = async () => {
    try { const [k, s] = await Promise.all([apiKeysApi.list(), apiKeysApi.stats()]); setKeys(Array.isArray(k) ? k : []); setStats(s); } catch {}
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name) return; setLoading(true);
    try { const k = await apiKeysApi.create(form); setNewKey(k); setShowCreate(false); setForm({ name: '', description: '', expiresAt: '', scopes: ['read', 'write'] }); await load(); } catch {}
    finally { setLoading(false); }
  };

  const revoke = async (id: string) => { try { await apiKeysApi.revoke(id); await load(); } catch {} };
  const del = async (id: string) => { if (!confirm('Delete this API key?')) return; try { await apiKeysApi.delete(id); await load(); } catch {} };

  const copyText = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 2000); };

  const S: any = {
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 },
    input: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' },
    label: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' },
  };

  const SCOPES = ['read', 'write', 'admin', 'webhooks:send', 'endpoints:manage'];
  const toggleScope = (s: string) => setForm(f => ({ ...f, scopes: f.scopes.includes(s) ? f.scopes.filter(x => x !== s) : [...f.scopes, s] }));

  const isExpired = (key: any) => key.expiresAt && new Date(key.expiresAt) < new Date();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#0f766e,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Key size={18} color="#fff" /></div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>API Keys</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Create and manage API keys for programmatic access</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} />New Key
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Keys', val: stats.total, icon: Key, color: '#4f46e5' },
            { label: 'Active', val: stats.active, icon: ShieldCheck, color: '#4ade80' },
            { label: 'Expired', val: stats.expired, icon: Clock, color: '#f59e0b' },
            { label: 'Total Requests', val: stats.totalUsage?.toLocaleString?.() || '0', icon: Activity, color: '#22d3ee' },
          ].map(s => (
            <div key={s.label} style={{ ...S.card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: s.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><s.icon size={16} color={s.color} /></div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{s.val}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New key revealed */}
      {newKey && (
        <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#4ade80', marginBottom: 8 }}>API Key created — copy it now, it won't be shown again</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <code style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#4ade80', overflow: 'hidden', textOverflow: 'ellipsis' }}>{newKey.key}</code>
            <button onClick={() => copyText(newKey.key, 'newkey')} style={{ padding: '8px 14px', borderRadius: 7, background: copied === 'newkey' ? 'rgba(74,222,128,0.2)' : 'var(--bg3)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 12 }}>
              {copied === 'newkey' ? <><Check size={13} color="#4ade80" />Copied!</> : <><Copy size={13} />Copy</>}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} style={{ marginTop: 8, background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', cursor: 'pointer' }}>Dismiss</button>
        </div>
      )}

      {/* Keys table */}
      <div style={S.card}>
        {keys.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Key size={32} color="var(--text3)" style={{ opacity: 0.3, marginBottom: 12 }} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)' }}>No API keys yet</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 4, opacity: 0.6 }}>Create your first key to get started</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Name', 'Key', 'Scopes', 'Last Used', 'Expires', 'Usage', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k._id} style={{ borderBottom: '1px solid var(--border)', opacity: !k.isActive ? 0.5 : 1 }}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{k.name}</div>
                    {k.description && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{k.description}</div>}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)', background: 'var(--bg3)', padding: '2px 8px', borderRadius: 5 }}>{k.keyPrefix}</code>
                      <button onClick={() => copyText(k.keyPrefix, k._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text3)' }}>{copied === k._id ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}</button>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(k.scopes || []).map((s: string) => <span key={s} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent2)', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: 4 }}>{s}</span>)}
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                  <td style={{ padding: '13px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: isExpired(k) ? '#f87171' : 'var(--text3)' }}>{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : 'Never'}</td>
                  <td style={{ padding: '13px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)' }}>{(k.usageCount || 0).toLocaleString()}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: k.isActive && !isExpired(k) ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: k.isActive && !isExpired(k) ? '#4ade80' : '#f87171' }}>
                      {!k.isActive ? 'Revoked' : isExpired(k) ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {k.isActive && !isExpired(k) && <button onClick={() => revoke(k._id)} title="Revoke" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6, color: '#f59e0b' }}><Ban size={14} /></button>}
                      <button onClick={() => del(k._id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6, color: '#f87171' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...S.card, width: 480, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20, marginTop: 0 }}>Create API Key</h2>
            {[['Name *', 'name', 'My Integration Key'], ['Description', 'description', 'Optional description'], ['Expires At', 'expiresAt', '']].map(([lbl, field, ph]) => (
              <div key={field as string} style={{ marginBottom: 14 }}>
                <label style={S.label}>{lbl as string}</label>
                <input type={field === 'expiresAt' ? 'date' : 'text'} value={(form as any)[field as string]} onChange={e => setForm(f => ({ ...f, [field as string]: e.target.value }))} placeholder={ph as string} style={S.input} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>Scopes</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SCOPES.map(s => (
                  <button key={s} onClick={() => toggleScope(s)} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${form.scopes.includes(s) ? 'var(--accent2)' : 'var(--border)'}`, background: form.scopes.includes(s) ? 'rgba(99,102,241,0.15)' : 'transparent', fontFamily: 'var(--font-mono)', fontSize: 11, color: form.scopes.includes(s) ? 'var(--accent2)' : 'var(--text3)', cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '9px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={create} disabled={loading || !form.name} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: !form.name ? 0.6 : 1 }}>{loading ? 'Creating...' : 'Create Key'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
