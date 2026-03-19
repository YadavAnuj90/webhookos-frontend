'use client';
import { useState, useEffect } from 'react';
import { workspacesApi } from '@/lib/api';
import { Building2, Plus, Users, Mail, Trash2, Crown, Shield, Code, Eye, Send, Copy, Check } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/Skeleton';

const ROLE_ICONS: any = { owner: Crown, admin: Shield, developer: Code, viewer: Eye };
const ROLE_COLORS: any = { owner: '#f59e0b', admin: '#f87171', developer: '#60a5fa', viewer: '#94a3b8' };

export default function WorkspacePage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [invites, setInvites] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [inviteResult, setInviteResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'developer' });

  const load = async () => {
    try { const d = await workspacesApi.list(); const arr = Array.isArray(d) ? d : []; setWorkspaces(arr); if (arr[0] && !selected) { setSelected(arr[0]); loadInvites(arr[0]._id); } } catch {}
    finally { setFetching(false); }
  };
  const loadInvites = async (id: string) => { try { const d = await workspacesApi.listInvites(id); setInvites(Array.isArray(d) ? d : []); } catch {} };
  useEffect(() => { load(); }, []);

  const createWs = async () => {
    setLoading(true);
    try { await workspacesApi.create(createForm); setShowCreate(false); setCreateForm({ name: '', description: '' }); await load(); } catch {}
    finally { setLoading(false); }
  };

  const invite = async () => {
    setLoading(true);
    try { const r = await workspacesApi.invite(selected._id, inviteForm); setInviteResult(r); setInviteForm({ email: '', role: 'developer' }); await loadInvites(selected._id); } catch {}
    finally { setLoading(false); }
  };

  const removeMember = async (uid: string) => { if (!confirm('Remove this member?')) return; try { await workspacesApi.removeMember(selected._id, uid); await load(); } catch {} };
  const updateRole = async (uid: string, role: string) => { try { await workspacesApi.updateRole(selected._id, uid, role); await load(); } catch {} };
  const copyInvite = (url: string) => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const S: any = {
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 },
    input: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as any },
    label: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' },
    select: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', cursor: 'pointer' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={18} color="#fff" /></div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Workspace</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Manage your organizations, members, and invitations</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} />New Workspace
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
        {/* Workspace list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fetching ? (
            <><SkeletonCard /><SkeletonCard /></>
          ) : workspaces.length === 0 ? (
            <div style={{ ...S.card, padding: 24, textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 13 }}>No workspaces yet</div>
          ) : workspaces.map(ws => (
            <div key={ws._id} onClick={() => { setSelected(ws); loadInvites(ws._id); }} style={{ ...S.card, padding: '14px 16px', cursor: 'pointer', border: selected?._id === ws._id ? '1px solid var(--accent2)' : '1px solid var(--border)', background: selected?._id === ws._id ? 'rgba(99,102,241,0.08)' : 'var(--bg2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{ws.name?.[0]?.toUpperCase()}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{ws.members?.length || 0} members</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workspace detail */}
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ ...S.card, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{selected.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{selected.name}</div>
                {selected.description && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{selected.description}</div>}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>ID: {selected._id}</div>
              </div>
              <button onClick={() => setShowInvite(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: 'var(--accent2)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <Mail size={13} />Invite Member
              </button>
            </div>

            {/* Members */}
            <div style={S.card}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={15} color="var(--accent2)" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Members ({selected.members?.length || 0})</span>
              </div>
              {(selected.members || []).map((m: any) => {
                const RoleIcon = ROLE_ICONS[m.role] || Eye;
                return (
                  <div key={m.userId} style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: ROLE_COLORS[m.role] + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: ROLE_COLORS[m.role] }}>{m.userId?.toString?.()?.slice?.(-2)?.toUpperCase()}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{m.userId}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Joined {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '--'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: ROLE_COLORS[m.role] + '18' }}>
                        <RoleIcon size={11} color={ROLE_COLORS[m.role]} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: ROLE_COLORS[m.role], textTransform: 'capitalize' }}>{m.role}</span>
                      </div>
                      {m.role !== 'owner' && (
                        <>
                          <select value={m.role} onChange={e => updateRole(m.userId, e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', cursor: 'pointer', outline: 'none' }}>
                            <option value="admin">admin</option><option value="developer">developer</option><option value="viewer">viewer</option>
                          </select>
                          <button onClick={() => removeMember(m.userId)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f87171' }}><Trash2 size={13} /></button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pending invites */}
            {invites.length > 0 && (
              <div style={S.card}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Pending Invites ({invites.length})</span>
                </div>
                {invites.map((inv: any) => (
                  <div key={inv._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Mail size={14} color="var(--text3)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)' }}>{inv.email}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Invited as {inv.role} . Expires {new Date(inv.expiresAt).toLocaleDateString()}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, padding: '2px 7px', borderRadius: 5, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 600 }}>Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ ...S.card, padding: 48, textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 13 }}>Select a workspace</div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...S.card, width: 440, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20, marginTop: 0 }}>New Workspace</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>Workspace Name *</label>
              <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="My Company" style={S.input} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>Description</label>
              <input value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" style={S.input} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '9px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={createWs} disabled={loading || !createForm.name} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: !createForm.name ? 0.6 : 1 }}>{loading ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...S.card, width: 440, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20, marginTop: 0 }}>Invite Member</h2>
            {!inviteResult ? (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Email Address *</label>
                  <input value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} placeholder="colleague@company.com" type="email" style={S.input} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={S.label}>Role</label>
                  <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))} style={S.select}>
                    <option value="admin">Admin -- can manage everything</option>
                    <option value="developer">Developer -- can create/edit</option>
                    <option value="viewer">Viewer -- read-only</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowInvite(false)} style={{ padding: '9px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={invite} disabled={loading || !inviteForm.email} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: !inviteForm.email ? 0.6 : 1 }}>{loading ? 'Sending...' : 'Send Invite'}</button>
                </div>
              </>
            ) : (
              <div>
                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', marginBottom: 14 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#4ade80', marginBottom: 6 }}>  Invite link created</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Share this link with your teammate:</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <code style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inviteResult.inviteUrl}</code>
                    <button onClick={() => copyInvite(inviteResult.inviteUrl)} style={{ padding: '7px 12px', borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>
                      {copied ? <><Check size={11} color="#4ade80" />Copied</> : <><Copy size={11} />Copy</>}
                    </button>
                  </div>
                </div>
                <button onClick={() => { setShowInvite(false); setInviteResult(null); }} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
