'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, usersApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { User, Lock, Monitor, Key, Plus, Trash2, X, Eye, EyeOff, Copy } from 'lucide-react';
import { SkeletonText } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
  const [tab, setTab] = useState('profile');
  const { user, setUser } = useAuth();
  const qc = useQueryClient();

  // Profile form
  const [profile, setProfile] = useState({ firstName: user?.firstName||'', lastName: user?.lastName||'', company: user?.company||'' });
  const updateProfile = useMutation({
    mutationFn: (d:any) => usersApi.updateProfile(d),
    onSuccess: (u) => { toast.success('Profile updated'); setUser(u); },
    onError: (e:any) => toast.error(e.response?.data?.message||'Failed'),
  });

  // Password form
  const [pwForm, setPwForm] = useState({ oldPassword:'', newPassword:'', confirm:'' });
  const [showPw, setShowPw] = useState(false);
  const changePw = useMutation({
    mutationFn: (d:any) => authApi.changePassword(d),
    onSuccess: () => { toast.success('Password changed. Please log in again.'); setPwForm({ oldPassword:'',newPassword:'',confirm:'' }); },
    onError: (e:any) => toast.error(e.response?.data?.message||'Failed'),
  });
  const submitPw = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 8) { toast.error('Min 8 characters'); return; }
    changePw.mutate({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
  };

  // Sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({ queryKey:['sessions'], queryFn:()=>authApi.getSessions(), enabled:tab==='sessions' });
  const logoutAll = useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => { toast.success('All sessions ended'); qc.invalidateQueries({queryKey:['sessions']}); },
  });

  // API Keys
  const { data: apiKeys, isLoading: keysLoading, refetch: refetchKeys } = useQuery({ queryKey:['apikeys'], queryFn:()=>authApi.listApiKeys(), enabled:tab==='apikeys' });
  const [newKey, setNewKey] = useState<any>(null);
  const [keyForm, setKeyForm] = useState({ name:'', scopes:'read,write' });
  const [showKeyForm, setShowKeyForm] = useState(false);
  const createKey = useMutation({
    mutationFn: (d:any) => authApi.createApiKey(d),
    onSuccess: (d) => { setNewKey(d); setShowKeyForm(false); refetchKeys(); toast.success('API key created'); },
    onError: (e:any) => toast.error(e.response?.data?.message||'Failed'),
  });
  const revokeKey = useMutation({
    mutationFn: (id:string) => authApi.revokeApiKey(id),
    onSuccess: () => { toast.success('Key revoked'); refetchKeys(); },
  });

  const tabs = [
    { id:'profile',  icon:User,    label:'Profile' },
    { id:'security', icon:Lock,    label:'Security' },
    { id:'sessions', icon:Monitor, label:'Sessions' },
    { id:'apikeys',  icon:Key,     label:'API Keys' },
  ];

  return (
    <div className="page">
      <div className="ph"><div className="ph-left"><h1>Profile</h1><p>// Account settings and security</p></div></div>

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:20 }}>
        {/* Sidebar tabs */}
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {tabs.map(({ id, icon:Icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{ display:'flex',alignItems:'center',gap:9,padding:'9px 12px',borderRadius:'var(--r2)',background:tab===id?'var(--abg)':'transparent',border:`1px solid ${tab===id?'var(--abd)':'transparent'}`,color:tab===id?'var(--a3)':'var(--t2)',fontSize:12.5,fontWeight:tab===id?600:400,cursor:'pointer',textAlign:'left',fontFamily:'var(--sans)',transition:'all .13s' }}>
              <Icon size={13}/>{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {/* Profile Tab */}
          {tab==='profile' && (
            <div className="card">
              <div style={{ fontWeight:700,fontSize:14,marginBottom:18 }}>Personal Information</div>
              <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:24,padding:16,background:'var(--card2)',borderRadius:'var(--r3)',border:'1px solid var(--b1)' }}>
                <div style={{ width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#3a45d4,#5b6cf8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#fff',flexShrink:0 }}>
                  {(user?.firstName?.[0]||'')+(user?.lastName?.[0]||'')}
                </div>
                <div>
                  <div style={{ fontWeight:700,fontSize:14 }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t3)',marginTop:2 }}>{user?.email}</div>
                  <div style={{ marginTop:5 }}><span className="badge b-accent" style={{ textTransform:'capitalize' }}>{user?.role}</span></div>
                </div>
              </div>
              <form onSubmit={e=>{ e.preventDefault(); updateProfile.mutate(profile); }}>
                <div className="grid-2">
                  <div className="field"><label className="label">First Name</label><input className="input" value={profile.firstName} onChange={e=>setProfile(p=>({...p,firstName:e.target.value}))}/></div>
                  <div className="field"><label className="label">Last Name</label><input className="input" value={profile.lastName} onChange={e=>setProfile(p=>({...p,lastName:e.target.value}))}/></div>
                </div>
                <div className="field"><label className="label">Company</label><input className="input" placeholder="Your company name" value={profile.company} onChange={e=>setProfile(p=>({...p,company:e.target.value}))}/></div>
                <div className="field"><label className="label">Email (read-only)</label><input className="input" value={user?.email||''} disabled/></div>
                <button type="submit" className="btn btn-primary" disabled={updateProfile.isPending}>{updateProfile.isPending?'Saving...':'Save Changes'}</button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {tab==='security' && (
            <div className="card">
              <div style={{ fontWeight:700,fontSize:14,marginBottom:18 }}>Change Password</div>
              <form onSubmit={submitPw}>
                <div className="field"><label className="label">Current Password</label>
                  <div style={{ position:'relative' }}>
                    <input className="input" type={showPw?'text':'password'} placeholder="        " value={pwForm.oldPassword} onChange={e=>setPwForm(p=>({...p,oldPassword:e.target.value}))} required style={{ paddingRight:38 }}/>
                    <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--t3)',display:'flex',padding:2 }}>
                      {showPw?<EyeOff size={13}/>:<Eye size={13}/>}
                    </button>
                  </div>
                </div>
                <div className="field"><label className="label">New Password</label><input className="input" type="password" placeholder="Min 8 characters" value={pwForm.newPassword} onChange={e=>setPwForm(p=>({...p,newPassword:e.target.value}))} required/></div>
                <div className="field"><label className="label">Confirm New Password</label><input className="input" type="password" placeholder="Repeat new password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} required/></div>
                <button type="submit" className="btn btn-primary" disabled={changePw.isPending}>{changePw.isPending?'Changing...':'Change Password'}</button>
              </form>
              <div className="div"/>
              <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>
                Changing your password will end all active sessions on all devices.
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {tab==='sessions' && (
            <div className="card">
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
                <div style={{ fontWeight:700,fontSize:14 }}>Active Sessions</div>
                <button className="btn btn-danger btn-sm" onClick={()=>logoutAll.mutate()} disabled={logoutAll.isPending}>End All Sessions</button>
              </div>
              {sessionsLoading ? (
                <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                  {[0,1,2].map(i => <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px',background:'var(--card2)',borderRadius:'var(--r2)',border:'1px solid var(--b1)' }}><SkeletonText width={36} height={36} style={{ borderRadius:8,flexShrink:0 }}/><div style={{ flex:1 }}><SkeletonText width="55%" height={12} style={{ marginBottom:6 }}/><SkeletonText width="70%" height={9} /></div></div>)}
                </div>
              ) : sessions?.length ? sessions.map((s:any,i:number) => (
                <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px',background:'var(--card2)',borderRadius:'var(--r2)',border:'1px solid var(--b1)',marginBottom:8 }}>
                  <Monitor size={16} style={{ color:'var(--a2)',flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12.5,fontWeight:600 }}>{s.device||'Unknown Device'}</div>
                    <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',marginTop:2 }}>
                      IP: {s.ip||'--'} . Last used: {s.lastUsed ? formatDistanceToNow(new Date(s.lastUsed),{addSuffix:true}) : '--'}
                    </div>
                  </div>
                  <span className="badge b-green">Active</span>
                </div>
              )) : <div style={{ color:'var(--t3)',fontSize:12,textAlign:'center',padding:20 }}>No active sessions found.</div>}
            </div>
          )}

          {/* API Keys Tab */}
          {tab==='apikeys' && (
            <div className="card">
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
                <div style={{ fontWeight:700,fontSize:14 }}>API Keys</div>
                <button className="btn btn-primary btn-sm" onClick={()=>setShowKeyForm(!showKeyForm)}><Plus size={11}/>New Key</button>
              </div>

              {newKey && (
                <div style={{ background:'var(--gbg)',border:'1px solid var(--gbd)',borderRadius:'var(--r2)',padding:14,marginBottom:16 }}>
                  <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--green)',marginBottom:6,fontWeight:600 }}>  Key created -- copy it now, it won't be shown again</div>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <code style={{ flex:1,fontFamily:'var(--mono)',fontSize:11,color:'var(--t1)',wordBreak:'break-all' }}>{newKey.rawKey}</code>
                    <button className="btn-icon" onClick={()=>{ navigator.clipboard.writeText(newKey.rawKey); toast.success('Copied'); }}><Copy size={12}/></button>
                    <button className="btn-icon" onClick={()=>setNewKey(null)}><X size={12}/></button>
                  </div>
                </div>
              )}

              {showKeyForm && (
                <div style={{ background:'var(--card2)',border:'1px solid var(--b2)',borderRadius:'var(--r2)',padding:16,marginBottom:16 }}>
                  <div className="field"><label className="label">Key Name</label><input className="input" placeholder="e.g. Production Server" value={keyForm.name} onChange={e=>setKeyForm(p=>({...p,name:e.target.value}))}/></div>
                  <div className="field"><label className="label">Scopes (comma-separated)</label><input className="input" placeholder="read,write" value={keyForm.scopes} onChange={e=>setKeyForm(p=>({...p,scopes:e.target.value}))}/></div>
                  <div style={{ display:'flex',gap:8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setShowKeyForm(false)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={()=>createKey.mutate({ name:keyForm.name, scopes:keyForm.scopes.split(',').map((s:string)=>s.trim()) })} disabled={createKey.isPending||!keyForm.name}>Create</button>
                  </div>
                </div>
              )}

              {keysLoading ? (
                <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                  {[0,1,2].map(i => <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 14px',background:'var(--card2)',borderRadius:'var(--r2)',border:'1px solid var(--b1)' }}><SkeletonText width={36} height={36} style={{ borderRadius:8,flexShrink:0 }}/><div style={{ flex:1 }}><SkeletonText width="40%" height={12} style={{ marginBottom:6 }}/><SkeletonText width="65%" height={9} /></div></div>)}
                </div>
              ) : apiKeys?.length ? apiKeys.map((k:any) => (
                <div key={k._id} style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 14px',background:'var(--card2)',borderRadius:'var(--r2)',border:'1px solid var(--b1)',marginBottom:8 }}>
                  <Key size={14} style={{ color:'var(--a2)',flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12.5,fontWeight:600 }}>{k.name}</div>
                    <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',marginTop:1 }}>
                      {k.prefix}     . Scopes: {k.scopes?.join(', ')} . Used {k.usageCount||0}x
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={()=>revokeKey.mutate(k._id)} disabled={revokeKey.isPending}>
                    <Trash2 size={10}/>Revoke
                  </button>
                </div>
              )) : <div style={{ color:'var(--t3)',fontSize:12,textAlign:'center',padding:20 }}>No API keys yet.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
