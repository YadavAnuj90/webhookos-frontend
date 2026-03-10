'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { User, Mail, Phone, Building2, Globe, Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const PLAN_COLORS: Record<string, string> = { free: '#6b7280', starter: '#818cf8', pro: '#10b981', enterprise: '#f59e0b' };
const ROLE_COLORS: Record<string, string> = { super_admin: '#ef4444', admin: '#f59e0b', developer: '#818cf8', viewer: '#6b7280' };

export default function ProfilePage() {
  const { user, setUser, fetchMe } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    company: user?.company || '',
    timezone: user?.timezone || 'Asia/Kolkata',
    language: user?.language || 'en',
  });
  const [saved, setSaved] = useState(false);

  const updateProfile = useMutation({
    mutationFn: (data: any) => usersApi.updateProfile(data),
    onSuccess: async () => {
      await fetchMe();
      toast.success('Profile updated');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update'),
  });

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?';
  const planColor = PLAN_COLORS[user?.plan || 'free'];
  const roleColor = ROLE_COLORS[user?.role || 'viewer'];

  const fields = [
    { key: 'firstName', label: 'First Name', icon: User, placeholder: 'John', half: true },
    { key: 'lastName',  label: 'Last Name',  icon: User, placeholder: 'Doe',  half: true },
    { key: 'phone',     label: 'Phone',       icon: Phone,    placeholder: '+91 98765 43210', half: false },
    { key: 'company',   label: 'Company',     icon: Building2, placeholder: 'Acme Inc.', half: false },
    { key: 'timezone',  label: 'Timezone',    icon: Globe,    placeholder: 'Asia/Kolkata', half: true },
    { key: 'language',  label: 'Language',    icon: Globe,    placeholder: 'en', half: true },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Profile</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>// Your account information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left Card - Avatar & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <div style={{
                width: 88, height: 88, borderRadius: 24, margin: '0 auto',
                background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color: '#fff',
                border: '3px solid rgba(99,102,241,0.3)',
              }}>
                {initials}
              </div>
              <button style={{
                position: 'absolute', bottom: -4, right: -4, width: 26, height: 26,
                borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <Camera size={11} color="#fff" />
              </button>
            </div>

            <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>{user?.email}</div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '4px 10px', borderRadius: 6, background: `${planColor}18`, color: planColor, border: `1px solid ${planColor}30`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {user?.plan || 'free'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '4px 10px', borderRadius: 6, background: `${roleColor}18`, color: roleColor, border: `1px solid ${roleColor}30`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {user?.role?.replace('_', ' ') || 'viewer'}
              </span>
            </div>
          </div>

          {/* Account Stats */}
          <div className="card">
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 16 }}>Account Info</div>
            {[
              { label: 'Email verified', value: user?.emailVerified ? '✓ Yes' : '✗ No', color: user?.emailVerified ? '#10b981' : '#ef4444' },
              { label: '2FA', value: user?.twoFactorEnabled ? 'Enabled' : 'Disabled', color: user?.twoFactorEnabled ? '#10b981' : '#6b7280' },
              { label: 'Last login', value: user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '—', color: 'var(--text2)' },
              { label: 'Login count', value: String(user?.loginCount || 0), color: 'var(--text2)' },
              { label: 'Status', value: user?.status || 'active', color: '#10b981' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-body)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color, textTransform: 'capitalize' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Edit Form */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>Edit Profile</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 22 }}>// Update your personal information</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {fields.map(f => (
              <div key={f.key} style={{ gridColumn: f.half ? 'span 1' : 'span 2' }}>
                <label className="label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <f.icon size={11} style={{ color: 'var(--accent2)' }} />{f.label}
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

          {/* Email (read-only) */}
          <div style={{ marginTop: 14 }}>
            <label className="label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Mail size={11} style={{ color: 'var(--accent2)' }} />Email
            </label>
            <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.55, cursor: 'not-allowed' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setForm({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', company: user?.company || '', timezone: user?.timezone || 'Asia/Kolkata', language: user?.language || 'en' })}
              className="btn-ghost"
            >
              Reset
            </button>
            <button
              onClick={() => updateProfile.mutate(form)}
              className="btn-primary"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : saved ? '✓ Saved' : <><Save size={13} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
