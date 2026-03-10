'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Key, Plus, Trash2, Eye, EyeOff, Copy, Shield, Bell, Palette, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{title}</div>
        {subtitle && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function CreateApiKeyModal({ onClose, onCreated }: { onClose: () => void; onCreated: (key: string) => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      const res = await authApi.createApiKey({ name });
      onCreated(res.rawKey || res.key);
      toast.success('API key created');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to create key'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800 }}>Create API Key</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={16} /></button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="label" style={{ marginBottom: 6, display: 'block' }}>Key Name <span style={{ color: 'var(--error)' }}>*</span></label>
          <input className="input" placeholder="e.g., Production CI/CD" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleCreate} className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Plus size={14} />}
            Create Key
          </button>
        </div>
      </div>
    </div>
  );
}

function ShowKeyModal({ rawKey, onClose }: { rawKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(rawKey); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>API Key Created</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--warning)', marginTop: 6 }}>
            ⚠️ Copy this key now. It will not be shown again.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent3)', flex: 1, overflow: 'hidden', wordBreak: 'break-all' }}>{rawKey}</code>
          <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : 'var(--text3)', flexShrink: 0 }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <button onClick={onClose} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          I've saved my key
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);

  // Password Change
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Notification Preferences
  const [notifPending, setNotifPending] = useState(false);

  const { data: keys, isLoading: keysLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => authApi.listApiKeys(),
  });
  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => authApi.getSessions(),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => authApi.revokeApiKey(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['api-keys'] }); toast.success('Key revoked'); },
    onError: () => toast.error('Failed to revoke key'),
  });

  const handlePwChange = async () => {
    if (!pwForm.oldPassword || !pwForm.newPassword) return toast.error('All fields required');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setPwLoading(true);
    try {
      await authApi.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to change password'); }
    finally { setPwLoading(false); }
  };

  const handleSaveNotif = async (prefs: any) => {
    setNotifPending(true);
    try {
      await usersApi.updatePreferences(prefs);
      toast.success('Preferences saved');
    } catch { toast.error('Failed to save'); }
    finally { setNotifPending(false); }
  };

  const apiKeys: any[] = keys?.keys || keys || [];

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {showCreate && (
        <CreateApiKeyModal
          onClose={() => setShowCreate(false)}
          onCreated={(k) => { setRawKey(k); setShowCreate(false); qc.invalidateQueries({ queryKey: ['api-keys'] }); }}
        />
      )}
      {rawKey && <ShowKeyModal rawKey={rawKey} onClose={() => setRawKey(null)} />}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>// Security, API keys, and preferences</p>
      </div>

      {/* API Keys */}
      <Section title="API Keys" subtitle="// Programmatic access credentials">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ fontSize: 12 }}>
            <Plus size={13} /> Create Key
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {keysLoading ? (
            Array(2).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />)
          ) : apiKeys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 12 }}>
              <Key size={20} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.3 }} />
              No API keys yet
            </div>
          ) : apiKeys.map((k: any) => (
            <div key={k._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={13} style={{ color: 'var(--accent2)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{k.name}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                  <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{k.prefix}••••••••••••</code>
                  {k.expiresAt && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: new Date(k.expiresAt) < new Date() ? 'var(--error)' : 'var(--text3)' }}>
                    Expires {new Date(k.expiresAt).toLocaleDateString()}
                  </span>}
                </div>
              </div>
              <button onClick={() => { if (confirm('Revoke this key?')) revoke.mutate(k._id); }} className="btn-danger" style={{ padding: '6px 10px', fontSize: 11 }}>
                <Trash2 size={12} /> Revoke
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Password */}
      <Section title="Security" subtitle="// Change your login password">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
          {[
            { key: 'oldPassword', label: 'Current Password', placeholder: '••••••••' },
            { key: 'newPassword', label: 'New Password', placeholder: 'Min. 8 characters' },
            { key: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label className="label" style={{ marginBottom: 6, display: 'block' }}>{f.label}</label>
              <input className="input" type="password" placeholder={f.placeholder}
                value={(pwForm as any)[f.key]} onChange={e => setPwForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div style={{ marginTop: 6 }}>
            <button onClick={handlePwChange} className="btn-primary" disabled={pwLoading} style={{ fontSize: 13 }}>
              {pwLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Shield size={13} />}
              Update Password
            </button>
          </div>
        </div>
      </Section>

      {/* Sessions */}
      <Section title="Active Sessions" subtitle="// Devices currently logged in">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(sessions?.sessions || []).length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--font-body)' }}>No session data available</div>
          ) : (sessions?.sessions || []).map((s: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{s.device || 'Unknown device'}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 3 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{s.ip || '—'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>Last used: {s.lastUsed ? new Date(s.lastUsed).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <button onClick={async () => { try { await authApi.logoutAll(); toast.success('All sessions terminated'); } catch { toast.error('Failed'); } }}
            className="btn-danger" style={{ fontSize: 12 }}>
            Terminate All Sessions
          </button>
        </div>
      </Section>

      {/* Notifications Prefs */}
      <Section title="Notification Preferences" subtitle="// Configure alerts and notifications">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive delivery failure alerts via email' },
            { key: 'slackNotifications', label: 'Slack Notifications', desc: 'Send alerts to your Slack workspace' },
          ].map(({ key, label, desc }) => {
            const val = user?.preferences?.[key] ?? false;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-body)', marginTop: 3 }}>{desc}</div>
                </div>
                <button
                  onClick={() => handleSaveNotif({ [key]: !val })}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                    background: val ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ position: 'absolute', top: 3, left: val ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
