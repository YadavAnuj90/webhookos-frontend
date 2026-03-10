'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { Users, Shield, UserCheck, UserX, ChevronDown, Search, X, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  super_admin: { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444' },
  admin:       { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  developer:   { bg: 'rgba(129,140,248,0.12)', text: '#818cf8' },
  viewer:      { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active:    { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
  inactive:  { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' },
  suspended: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
  pending:   { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
};

function RoleBadge({ role }: { role: string }) {
  const s = ROLE_COLORS[role] || ROLE_COLORS.viewer;
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px', borderRadius: 6, background: s.bg, color: s.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {role.replace('_', ' ')}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.inactive;
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px', borderRadius: 6, background: s.bg, color: s.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {status}
    </span>
  );
}

function ChangeRoleModal({ user, onClose }: { user: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    setLoading(true);
    try {
      await usersApi.changeRole(user._id, role);
      toast.success('Role updated');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 800 }}>Change Role</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
          Changing role for <b style={{ color: 'var(--text)' }}>{user.firstName} {user.lastName}</b>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {['viewer', 'developer', 'admin', 'super_admin'].map(r => {
            const s = ROLE_COLORS[r];
            return (
              <button key={r} onClick={() => setRole(r)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: role === r ? `1px solid ${s.text}40` : '1px solid var(--border)',
                background: role === r ? `${s.bg}` : 'transparent', transition: 'all 0.15s',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.text }} />
                <span style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>{r.replace('_', ' ')}</span>
                {role === r && <span style={{ marginLeft: 'auto', fontSize: 10, color: s.text, fontFamily: 'var(--font-mono)' }}>Selected</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleChange} className="btn-primary" disabled={loading || role === user.role}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Shield size={13} />}
            Save Role
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleModal, setRoleModal] = useState<any>(null);

  const { data: statsData } = useQuery({ queryKey: ['admin-stats'], queryFn: () => usersApi.adminStats() });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, statusFilter],
    queryFn: () => usersApi.adminList({ page, limit: 15, search: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined }),
  });

  const suspend = useMutation({
    mutationFn: (id: string) => usersApi.suspend(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User suspended'); },
    onError: () => toast.error('Failed'),
  });
  const activate = useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User activated'); },
    onError: () => toast.error('Failed'),
  });

  const users: any[] = data?.users || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / 15);
  const stats = statsData || {};

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {roleModal && <ChangeRoleModal user={roleModal} onClose={() => setRoleModal(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Shield size={12} style={{ color: '#ef4444' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>User Management</h1>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>// {total} users · Admin access only</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: stats.total || total, color: '#818cf8', icon: Users },
          { label: 'Active', value: stats.active || '—', color: '#10b981', icon: UserCheck },
          { label: 'Suspended', value: stats.suspended || '—', color: '#ef4444', icon: UserX },
          { label: 'New (30d)', value: stats.newThisMonth || '—', color: '#f59e0b', icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase' }}>{label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}14`, border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, color }}>{String(value)}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input className="input" placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 34 }} />
        </div>
        {['', 'viewer', 'developer', 'admin', 'super_admin'].map(r => (
          <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s', background: roleFilter === r ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', border: roleFilter === r ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)', color: roleFilter === r ? 'var(--accent3)' : 'var(--text3)' }}>
            {r ? r.replace('_', ' ') : 'All Roles'}
          </button>
        ))}
        {['', 'active', 'suspended', 'inactive'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s', background: statusFilter === s ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', border: statusFilter === s ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--border)', color: statusFilter === s ? 'var(--accent3)' : 'var(--text3)' }}>
            {s || 'All Status'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j}><div className="skeleton" style={{ height: 13, borderRadius: 4, width: '70%' }} /></td>)}</tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                      <Users size={26} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                      <div style={{ fontSize: 13, fontFamily: 'var(--font-body)' }}>No users found</div>
                    </div>
                  </td>
                </tr>
              ) : users.map((u: any) => {
                const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();
                return (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><RoleBadge role={u.role} /></td>
                    <td><StatusBadge status={u.status} /></td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'capitalize' }}>{u.plan || 'free'}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => setRoleModal(u)}
                          style={{ padding: '6px 10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 7, cursor: 'pointer', color: 'var(--accent2)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-body)' }}>
                          <Shield size={11} /> Role
                        </button>
                        {u.status === 'active' ? (
                          <button onClick={() => { if (confirm('Suspend this user?')) suspend.mutate(u._id); }}
                            style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-body)' }}>
                            <UserX size={11} /> Suspend
                          </button>
                        ) : (
                          <button onClick={() => activate.mutate(u._id)}
                            style={{ padding: '6px 10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 7, cursor: 'pointer', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-body)' }}>
                            <UserCheck size={11} /> Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Page {page} of {pages} · {total} users</span>
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
