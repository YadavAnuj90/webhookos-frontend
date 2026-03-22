'use client';
import { useState, useEffect } from 'react';
import { portalApi, portalBrandingApi, eventTypesApi, portalSubscriptionsApi } from '@/lib/api';
import { PortalBranding, PORTAL_FONTS } from '@/lib/types';
import {
  ExternalLink, Plus, Trash2, Ban, Copy, Check, Eye, Link2,
  Clock, Palette, X, Globe, Twitter, Github, Mail, Code2,
  Sun, Moon, AlertCircle, Tag,
} from 'lucide-react';
import { SkeletonCard } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

// ─── Live Preview ────────────────────────────────────────────────────────────
function BrandingPreview({ b }: { b: Partial<PortalBranding> }) {
  const dark    = b.darkMode ?? false;
  const bg      = dark ? '#0f1117' : '#f8fafc';
  const bg2     = dark ? '#161b22' : '#ffffff';
  const txt     = dark ? '#e2e8f0' : '#1e293b';
  const txt3    = dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.35)';
  const border  = dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)';
  const primary = b.primaryColor || '#6366f1';
  const font    = b.fontFamily   || 'Inter';

  return (
    <div style={{ background: bg, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', fontFamily: `${font}, system-ui, sans-serif`, fontSize: 11 }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', background: primary, display: 'flex', alignItems: 'center', gap: 8 }}>
        {b.logoUrl
          ? <img src={b.logoUrl} style={{ height: 20, objectFit: 'contain' }} alt="" onError={e => (e.currentTarget.style.display = 'none')} />
          : <div style={{ width: 20, height: 20, borderRadius: 5, background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: 9, fontWeight: 800 }}>{(b.companyName || 'W')[0]}</span></div>}
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{b.companyName || 'Your Company'}</span>
        {dark ? <Moon size={10} color="rgba(255,255,255,.5)" style={{ marginLeft: 'auto' }} /> : <Sun size={10} color="rgba(255,255,255,.5)" style={{ marginLeft: 'auto' }} />}
      </div>
      {/* Title */}
      <div style={{ padding: '8px 14px', borderBottom: `1px solid ${border}`, background: bg2 }}>
        <div style={{ color: txt, fontWeight: 700, fontSize: 11 }}>{b.portalTitle || 'Webhook Status Portal'}</div>
        <div style={{ color: txt3, fontSize: 9, marginTop: 1 }}>Real-time delivery status</div>
      </div>
      {/* Rows */}
      {[
        { event: 'payment.success', status: 'delivered', ms: '42ms' },
        { event: 'order.created',   status: 'delivered', ms: '67ms' },
        { event: 'user.signup',     status: 'retrying',  ms: '503ms' },
      ].map((r, i) => (
        <div key={i} style={{ padding: '7px 14px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: i % 2 === 0 ? bg2 : bg }}>
          <span style={{ color: txt, fontFamily: 'monospace', fontSize: 10 }}>{r.event}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: r.status === 'delivered' ? '#22c55e20' : '#f59e0b20', color: r.status === 'delivered' ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{r.status}</span>
            <span style={{ color: txt3, fontSize: 9 }}>{r.ms}</span>
          </div>
        </div>
      ))}
      {/* Footer */}
      <div style={{ padding: '7px 14px', textAlign: 'center', background: bg2, borderTop: `1px solid ${border}` }}>
        <span style={{ color: txt3, fontSize: 9 }}>Powered by WebhookOS</span>
        {b.supportEmail && <span style={{ color: txt3, fontSize: 9 }}> · {b.supportEmail}</span>}
      </div>
    </div>
  );
}

// ─── Branding Modal ──────────────────────────────────────────────────────────
function BrandingModal({ tokenId, onClose }: { tokenId: string; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [b, setB] = useState<Partial<PortalBranding>>({
    primaryColor: '#6366f1', secondaryColor: '#a78bfa',
    fontFamily: 'Inter', darkMode: false,
    portalTitle: 'Webhook Status Portal',
  });
  const set = (k: keyof PortalBranding, v: any) => setB(p => ({ ...p, [k]: v }));
  const setSocial = (k: string, v: string) => setB(p => ({ ...p, socialLinks: { ...p.socialLinks, [k]: v } }));

  const save = async () => {
    setSaving(true);
    try {
      await portalBrandingApi.updateBranding(tokenId, b);
      toast.success('Branding saved');
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const S: any = {
    label: { fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 5, display: 'block' },
    input: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 11px', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const },
    section: { fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' as const, letterSpacing: '.1em', padding: '12px 0 8px', borderTop: '1px solid var(--border)', marginTop: 4 },
    field: { marginBottom: 12 },
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, width: 860, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,.5)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0f766e,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Palette size={15} color="#fff" /></div>
            <span style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Portal Branding</span>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Body: 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 0, flex: 1, overflow: 'hidden' }}>
          {/* Left: form */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
            {/* Brand Identity */}
            <div style={S.section}>Brand Identity</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={S.field}><label style={S.label}>Company Name</label><input style={S.input} placeholder="Acme Corp" value={b.companyName || ''} onChange={e => set('companyName', e.target.value)} /></div>
              <div style={S.field}><label style={S.label}>Portal Title</label><input style={S.input} placeholder="Webhook Status Portal" value={b.portalTitle || ''} onChange={e => set('portalTitle', e.target.value)} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={S.field}><label style={S.label}>Logo URL</label><input style={S.input} type="url" placeholder="https://cdn.example.com/logo.png" value={b.logoUrl || ''} onChange={e => set('logoUrl', e.target.value)} /></div>
              <div style={S.field}><label style={S.label}>Favicon URL</label><input style={S.input} type="url" placeholder="https://cdn.example.com/favicon.ico" value={b.faviconUrl || ''} onChange={e => set('faviconUrl', e.target.value)} /></div>
            </div>

            {/* Colors & Typography */}
            <div style={S.section}>Colors &amp; Typography</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={S.field}>
                <label style={S.label}>Primary Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={b.primaryColor || '#6366f1'} onChange={e => set('primaryColor', e.target.value)} style={{ width: 40, height: 34, border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg3)', cursor: 'pointer', padding: 2 }} />
                  <input style={{ ...S.input, flex: 1 }} placeholder="#6366f1" value={b.primaryColor || ''} onChange={e => set('primaryColor', e.target.value)} />
                </div>
              </div>
              <div style={S.field}>
                <label style={S.label}>Secondary Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={b.secondaryColor || '#a78bfa'} onChange={e => set('secondaryColor', e.target.value)} style={{ width: 40, height: 34, border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg3)', cursor: 'pointer', padding: 2 }} />
                  <input style={{ ...S.input, flex: 1 }} placeholder="#a78bfa" value={b.secondaryColor || ''} onChange={e => set('secondaryColor', e.target.value)} />
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={S.field}>
                <label style={S.label}>Font Family</label>
                <select style={S.input} value={b.fontFamily || 'Inter'} onChange={e => set('fontFamily', e.target.value)}>
                  {PORTAL_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16 }}>
                <label style={{ ...S.label, margin: 0 }}>Dark Mode</label>
                <div onClick={() => set('darkMode', !b.darkMode)} style={{ width: 38, height: 21, borderRadius: 11, background: b.darkMode ? 'var(--accent2)' : 'var(--bg3)', border: '1px solid var(--border)', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                  <div style={{ position: 'absolute', top: 2, left: b.darkMode ? 19 : 2, width: 15, height: 15, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
                </div>
                {b.darkMode ? <Moon size={13} color="var(--accent2)" /> : <Sun size={13} color="var(--text3)" />}
              </div>
            </div>

            {/* Custom Domain */}
            <div style={S.section}>Custom Domain</div>
            <div style={S.field}>
              <label style={S.label}>Custom Domain</label>
              <input style={S.input} placeholder="webhooks.yourcompany.com" value={b.customDomain || ''} onChange={e => set('customDomain', e.target.value)} />
            </div>
            {b.customDomain && (
              <div style={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.18)', borderRadius: 9, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--accent2)', marginBottom: 8 }}>CNAME Setup Instructions</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>Add the following DNS record at your domain registrar:</div>
                <div style={{ background: '#0d1117', borderRadius: 7, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                  <span style={{ color: '#79c0ff' }}>CNAME</span>
                  <span style={{ color: '#e6edf3' }}>  {b.customDomain}  </span>
                  <span style={{ color: '#ff7b72' }}>→</span>
                  <span style={{ color: '#a5d6ff' }}>  {typeof window !== 'undefined' ? window.location.hostname : 'your-api-domain.com'}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <AlertCircle size={10} />DNS propagation may take up to 48 hours.
                </div>
              </div>
            )}

            {/* Support */}
            <div style={S.section}>Support &amp; Social</div>
            <div style={S.field}><label style={S.label}>Support Email</label><input style={S.input} type="email" placeholder="support@yourcompany.com" value={b.supportEmail || ''} onChange={e => set('supportEmail', e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
              <div style={S.field}><label style={S.label}>Twitter / X</label><input style={S.input} placeholder="@handle" value={b.socialLinks?.['twitter'] || ''} onChange={e => setSocial('twitter', e.target.value)} /></div>
              <div style={S.field}><label style={S.label}>GitHub</label><input style={S.input} placeholder="org/user" value={b.socialLinks?.['github'] || ''} onChange={e => setSocial('github', e.target.value)} /></div>
              <div style={S.field}><label style={S.label}>Website</label><input style={S.input} type="url" placeholder="https://…" value={b.socialLinks?.['website'] || ''} onChange={e => setSocial('website', e.target.value)} /></div>
            </div>

            {/* Custom CSS */}
            <div style={S.section}>Custom CSS</div>
            <div style={S.field}>
              <label style={S.label}>Custom CSS <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(injected into portal head)</span></label>
              <textarea
                rows={5} value={b.customCss || ''} onChange={e => set('customCss', e.target.value)}
                placeholder=".portal-header { border-radius: 0; }"
                style={{ ...S.input, fontFamily: 'var(--font-mono)', fontSize: 11, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Right: live preview */}
          <div style={{ padding: '20px 18px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 2 }}>Live Preview</div>
            <BrandingPreview b={b} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)', lineHeight: 1.6 }}>
              Updates in real-time as you edit. The actual portal renders at your public token URL.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '14px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding: '9px 24px', borderRadius: 8, background: 'linear-gradient(135deg,#0f766e,#059669)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save Branding'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Subscriptions Modal ─────────────────────────────────────────────────────
function SubscriptionsModal({ token, onClose }: { token: any; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string[]>(token.subscribedEventTypes || []);
  const [ets, setEts] = useState<any[]>([]);

  useEffect(() => {
    eventTypesApi.list(token.projectId || 'default')
      .then((r: any) => setEts(Array.isArray(r) ? r : (r?.eventTypes || [])))
      .catch(() => {});
  }, [token.projectId]);

  const toggle = (name: string) =>
    setSelected(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);

  const save = async () => {
    setSaving(true);
    try {
      await portalSubscriptionsApi.update(token._id, selected);
      toast.success('Subscriptions saved');
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Event Subscriptions — {token.customerName}</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6, marginBottom: 16 }}>
          Your customer will only receive events for the selected types. Leave all unchecked to receive all events.
        </p>
        {ets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
            No event types defined yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto', marginBottom: 16 }}>
            {ets.map((et: any) => {
              const checked = selected.includes(et.name);
              return (
                <label key={et._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: `1px solid ${checked ? 'rgba(99,102,241,.3)' : 'var(--border)'}`, background: checked ? 'rgba(99,102,241,.06)' : 'var(--bg3)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(et.name)} style={{ accentColor: 'var(--accent2)' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: checked ? 'var(--accent2)' : 'var(--text)', fontWeight: checked ? 600 : 400 }}>{et.name}</div>
                    {et.description && <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{et.description}</div>}
                  </div>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>v{et.version}</span>
                </label>
              );
            })}
          </div>
        )}
        <div style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 7, background: selected.length === 0 ? 'rgba(74,222,128,.07)' : 'rgba(99,102,241,.07)', border: '1px solid ' + (selected.length === 0 ? 'rgba(74,222,128,.2)' : 'rgba(99,102,241,.2)') }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: selected.length === 0 ? '#4ade80' : 'var(--accent2)' }}>
            {selected.length === 0 ? '✓ All events (no filter)' : `${selected.length} event type${selected.length !== 1 ? 's' : ''} selected`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Subscriptions'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PortalPage() {
  const [tokens, setTokens]           = useState<any[]>([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [brandingToken, setBrandingToken] = useState<string | null>(null);
  const [subsToken, setSubsToken]     = useState<any | null>(null);
  const [copied, setCopied]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(true);
  const [form, setForm]               = useState({ projectId: '', customerName: '', customerEmail: '', expiresAt: '', brandColor: '#6366f1', logoUrl: '' });
  // newToken: holds the one-time token string returned on creation (pt_xxxx)
  const [newToken, setNewToken]       = useState<{ token: string; customerName: string } | null>(null);

  const load = async () => { try { const d = await portalApi.listTokens(); setTokens(Array.isArray(d) ? d : []); } catch {} finally { setFetching(false); } };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setLoading(true);
    try {
      const created = await portalApi.createToken(form);
      setShowCreate(false);
      setForm({ projectId: '', customerName: '', customerEmail: '', expiresAt: '', brandColor: '#6366f1', logoUrl: '' });
      await load();
      // Show the one-time token reveal if backend returned a token value
      if (created?.token) setNewToken({ token: created.token, customerName: created.customerName || form.customerName });
    }
    catch {}
    finally { setLoading(false); }
  };

  const revoke = async (id: string) => { try { await portalApi.revokeToken(id); await load(); } catch {} };
  const del    = async (id: string) => { if (!confirm('Delete this portal token?')) return; try { await portalApi.deleteToken(id); await load(); } catch {} };

  const portalUrl = (token: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${token}`;
  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 2000); };
  const isExpired = (t: any) => t.expiresAt && new Date(t.expiresAt) < new Date();

  const S: any = {
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 },
    input: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as const },
    label: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' },
  };

  return (
    <div>
      {/* Header */}
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
            { n: '1', text: 'Create a portal link for a customer — give it their name and optionally your brand colors.' },
            { n: '2', text: 'Share the unique URL. They see their delivery history with no login required.' },
            { n: '3', text: 'Customize branding per-token — logo, colors, font, custom domain.' },
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

      {/* Token list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {fetching ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:12 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : tokens.length === 0 ? (
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
                    {copied === t._id ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {/* Subscriptions button */}
                <button
                  onClick={() => setSubsToken(t)}
                  style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(34,197,94,.3)', background: 'rgba(34,197,94,.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: '#4ade80' }}
                >
                  <Tag size={11} />{t.subscribedEventTypes?.length > 0 ? `${t.subscribedEventTypes.length} events` : 'All events'}
                </button>
                {/* Branding button */}
                <button
                  onClick={() => setBrandingToken(t._id)}
                  style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(99,102,241,.3)', background: 'rgba(99,102,241,.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--accent2)' }}
                >
                  <Palette size={11} />Branding
                </button>
                <a href={typeof window !== 'undefined' ? portalUrl(t.token) : '#'} target="_blank" rel="noopener" style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', textDecoration: 'none' }}>
                  <Link2 size={11} />Open
                </a>
                {t.isActive && !isExpired(t) && (
                  <button onClick={() => revoke(t._id)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: '#f59e0b' }}><Ban size={11} />Revoke</button>
                )}
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

      {/* One-time token reveal modal — shown once after creation */}
      {newToken && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...S.card, width: 500, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <AlertCircle size={20} color="#f59e0b" />
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 800, color: '#f59e0b', margin: 0 }}>Save this token now</h2>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', marginBottom: 18, lineHeight: 1.6 }}>
              The portal token for <strong>{newToken.customerName}</strong> is shown <strong>only once</strong> and cannot be retrieved again. Copy it now and store it securely.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 9, padding: '10px 14px', marginBottom: 20 }}>
              <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 13, color: '#f59e0b', wordBreak: 'break-all' }}>{newToken.token}</code>
              <button onClick={() => { navigator.clipboard.writeText(newToken.token); setCopied('newtoken'); setTimeout(() => setCopied(''), 2000); }}
                style={{ flexShrink: 0, background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>
                {copied === 'newtoken' ? <><Check size={12} color="#4ade80" />Copied!</> : <><Copy size={12} />Copy</>}
              </button>
            </div>
            <button onClick={() => setNewToken(null)}
              style={{ width: '100%', padding: '10px', borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              I've saved the token
            </button>
          </div>
        </div>
      )}

      {/* Branding modal */}
      {brandingToken && (
        <BrandingModal tokenId={brandingToken} onClose={() => setBrandingToken(null)} />
      )}

      {/* Subscriptions modal */}
      {subsToken && (
        <SubscriptionsModal token={subsToken} onClose={() => { setSubsToken(null); load(); }} />
      )}
    </div>
  );
}
