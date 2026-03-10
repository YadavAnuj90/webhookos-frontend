'use client';
import { useState, useEffect } from 'react';
import { portalApi } from '@/lib/api';
import { ExternalLink, Plus, Trash2, Ban, Copy, Check, Eye, Link2, Clock } from 'lucide-react';

export default function PortalPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ projectId: '', customerName: '', customerEmail: '', expiresAt: '', brandColor: '#6366f1', logoUrl: '' });

  const load = async () => { try { const d = await portalApi.listTokens(); setTokens(Array.isArray(d) ? d : []); } catch {} };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setLoading(true);
    try { await portalApi.createToken(form); setShowCreate(false); setForm({ projectId: '', customerName: '', customerEmail: '', expiresAt: '', brandColor: '#6366f1', logoUrl: '' }); await load(); } catch {}
    finally { setLoading(false); }
  };

  const revoke = async (id: string) => { try { await portalApi.revokeToken(id); await load(); } catch {} };
  const del = async (id: string) => { if (!confirm('Delete this portal token?')) return; try { await portalApi.deleteToken(id); await load(); } catch {} };

  const portalUrl = (token: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${token}`;
  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 2000); };

  const isExpired = (t: any) => t.expiresAt && new Date(t.expiresAt) < new Date();

  const S: any = {
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 },
    input: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' },
    label: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#0f766e,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ExternalLink size={18} color="#fff" /></div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Customer Portal</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Give customers a read-only view of their webhook delivery status</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} />New Portal Link
        </button>
      </div>

      {/* How it works */}
      <div style={{ ...S.card, padding: '18px 22px', marginBottom: 24, background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--accent2)', marginBottom: 8 }}>How it works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { n: '1', text: 'Create a portal link for a customer -- give it their name and optionally your brand colors' },
            { n: '2', text: 'Share the unique URL with your customer -- they see their webhook delivery history, no login required' },
            { n: '3', text: 'Revoke access at any time -- the portal link stops working instantly' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--accent2)' }}>{s.n}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Portal tokens */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tokens.length === 0 ? (
          <div style={{ ...S.card, padding: 48, textAlign: 'center' }}>
            <ExternalLink size={32} color="var(--text3)" style={{ opacity: 0.3, marginBottom: 12 }} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)' }}>No portal links yet</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 4, opacity: 0.6 }}>Create a link to share with your customers</div>
          </div>
        ) : tokens.map(t => (
          <div key={t._id} style={{ ...S.card, padding: '18px 22px', opacity: !t.isActive || isExpired(t) ? 0.55 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: (t.brandColor || '#6366f1') + '25', border: `2px solid ${t.brandColor || '#6366f1'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 800, color: t.brandColor || '#6366f1' }}>{t.customerName?.[0]?.toUpperCase()}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{t.customerName}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, padding: '2px 7px', borderRadius: 5, background: t.isActive && !isExpired(t) ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: t.isActive && !isExpired(t) ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                    {!t.isActive ? 'Revoked' : isExpired(t) ? 'Expired' : 'Active'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                  {t.customerEmail && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{t.customerEmail}</span>}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={10} />{t.accessCount || 0} views</span>
                  {t.lastAccessedAt && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />Last: {new Date(t.lastAccessedAt).toLocaleDateString()}</span>}
                  {t.expiresAt && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: isExpired(t) ? '#f87171' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />Expires: {new Date(t.expiresAt).toLocaleDateString()}</span>}
                </div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent2)', background: 'rgba(99,102,241,0.08)', padding: '3px 8px', borderRadius: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>
                    {typeof window !== 'undefined' ? portalUrl(t.token) : '/portal/' + t.token}
                  </code>
                  <button onClick={() => { if (typeof window !== 'undefined') copy(portalUrl(t.token), t._id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {copied === t._id ? <><Check size={12} color="#4ade80" /></> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={typeof window !== 'undefined' ? portalUrl(t.token) : '#'} target="_blank" rel="noopener" style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', textDecoration: 'none' }}>
                  <Link2 size={11} />Open
                </a>
                {t.isActive && !isExpired(t) && <button onClick={() => revoke(t._id)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: '#f59e0b' }}><Ban size={11} />Revoke</button>}
                <button onClick={() => del(t._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f87171' }}><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...S.card, width: 480, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20, marginTop: 0 }}>New Portal Link</h2>
            {[['Customer Name *', 'customerName', 'Acme Corp', 'text'], ['Customer Email', 'customerEmail', 'ops@acme.com', 'email'], ['Project ID', 'projectId', 'your-project-id', 'text'], ['Expires At', 'expiresAt', '', 'date'], ['Logo URL', 'logoUrl', 'https://...', 'url']].map(([lbl, field, ph, type]) => (
              <div key={field as string} style={{ marginBottom: 13 }}>
                <label style={S.label}>{lbl as string}</label>
                <input type={type as string} value={(form as any)[field as string]} onChange={e => setForm(f => ({ ...f, [field as string]: e.target.value }))} placeholder={ph as string} style={S.input} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>Brand Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={form.brandColor} onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))} style={{ width: 44, height: 36, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg3)', cursor: 'pointer', padding: 2 }} />
                <input value={form.brandColor} onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))} style={{ ...S.input, flex: 1 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '9px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={create} disabled={loading || !form.customerName} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: !form.customerName ? 0.6 : 1 }}>{loading ? 'Creating...' : 'Create Portal Link'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
