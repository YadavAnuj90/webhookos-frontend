'use client';
import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import { Users, Shield, Ban, CheckCircle, ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react';

const ROLE_COLORS: any = { super_admin: '#f87171', admin: '#f59e0b', user: '#4ade80' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([
        usersApi.adminList({ page, limit, search: search || undefined }),
        usersApi.adminStats(),
      ]);
      setUsers(Array.isArray(u?.users) ? u.users : Array.isArray(u) ? u : []);
      setTotal(u?.total || 0);
      setStats(s);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search]);

  const changeRole = async (id: string, role: string) => {
    try { await usersApi.changeRole(id, role); await load(); } catch {}
  };
  const suspend = async (id: string) => {
    if (!confirm('Suspend this user?')) return;
    try { await usersApi.suspend(id); await load(); } catch {}
  };
  const activate = async (id: string) => {
    try { await usersApi.activate(id); await load(); } catch {}
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const S: any = {
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 },
    input: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#991b1b,#f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} color="#fff" /></div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>User Management</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Admin panel — manage all users</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Users', val: stats.total || 0, color: '#6366f1' },
            { label: 'Active', val: stats.active || 0, color: '#4ade80' },
            { label: 'Suspended', val: stats.suspended || 0, color: '#f87171' },
            { label: 'Admins', val: stats.admins || 0, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ ...S.card, padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search + refresh */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: '7px 12px', flex: 1, maxWidth: 360 }}>
          <Search size={13} color="var(--text3)" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..." style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', width: '100%' }} />
        </div>
        <button onClick={load} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12 }}>
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      <div style={S.card}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: '#f87171', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>Loading users...</div>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Email', 'Role', 'Plan', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>No users found</td></tr>
                ) : users.map((u: any) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{(u.firstName || u.email || 'U')[0].toUpperCase()}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select value={u.role} onChange={e => changeRole(u._id, e.target.value)} style={{ background: 'var(--bg3)', border: `1px solid ${ROLE_COLORS[u.role] || 'var(--border)'}40`, borderRadius: 6, padding: '3px 8px', fontFamily: 'var(--font-mono)', fontSize: 11, color: ROLE_COLORS[u.role] || 'var(--text2)', cursor: 'pointer', outline: 'none', fontWeight: 600 }}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="super_admin">super_admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{u.plan || 'free'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: u.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: u.status === 'active' ? '#4ade80' : '#f87171' }}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '--'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {u.status === 'active'
                          ? <button onClick={() => suspend(u._id)} title="Suspend" style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#f87171', fontFamily: 'var(--font-body)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><Ban size={11} />Suspend</button>
                          : <button onClick={() => activate(u._id)} title="Activate" style={{ background: 'none', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#4ade80', fontFamily: 'var(--font-body)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={11} />Activate</button>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{total} total users</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: page === 1 ? 'not-allowed' : 'pointer', color: 'var(--text3)', opacity: page === 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}><ChevronLeft size={14} /></button>
                <span style={{ padding: '5px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>Page {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: 'var(--text3)', opacity: page === totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center' }}><ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
