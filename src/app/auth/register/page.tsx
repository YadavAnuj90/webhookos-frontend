'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Activity, Eye, EyeOff, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password needs at least 8 characters'); return; }
    setLoading(true);
    try { login(await authApi.register(form)); router.push('/dashboard'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 400px', gap:36, width:'100%', maxWidth:840, alignItems:'center' }}>
        {/* Left */}
        <div style={{ padding:'0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:28 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#3a45d4,#5b6cf8)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 12px rgba(91,108,248,.4)' }}>
              <Activity size={15} color="#fff"/>
            </div>
            <span style={{ fontWeight:800, fontSize:15, color:'var(--t1)' }}>WebhookOS</span>
          </div>
          <h2 style={{ fontSize:30, fontWeight:800, color:'var(--t1)', letterSpacing:'-1px', lineHeight:1.1, marginBottom:10 }}>Start delivering webhooks reliably</h2>
          <p style={{ color:'var(--t2)', fontSize:12.5, lineHeight:1.75, marginBottom:26 }}>Join developers who've moved their webhook infrastructure to WebhookOS. Free to start, no card needed.</p>
          {['Free plan -- no credit card required','5 retry attempts with backoff on every event','HMAC-signed deliveries from day 1','Real-time delivery analytics included'].map(p => (
            <div key={p} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:9 }}>
              <div style={{ width:18,height:18,borderRadius:5,background:'var(--gbg)',border:'1px solid var(--gbd)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Check size={10} style={{ color:'var(--green)' }}/>
              </div>
              <span style={{ fontSize:12.5, color:'var(--t2)' }}>{p}</span>
            </div>
          ))}
        </div>
        {/* Right -- Form */}
        <div style={{ background:'var(--card)', border:'1px solid var(--b1)', borderRadius:'var(--r4)', padding:28 }}>
          <h1 style={{ fontSize:18, fontWeight:800, color:'var(--t1)', marginBottom:4 }}>Create your account</h1>
          <p style={{ color:'var(--t3)', fontSize:11.5, marginBottom:22 }}>Free forever . No credit card</p>
          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="field"><label className="label">First name</label><input className="input" placeholder="John" value={form.firstName} onChange={f('firstName')} required/></div>
              <div className="field"><label className="label">Last name</label><input className="input" placeholder="Doe" value={form.lastName} onChange={f('lastName')} required/></div>
            </div>
            <div className="field"><label className="label">Work email</label><input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={f('email')} required/></div>
            <div className="field">
              <label className="label">Password</label>
              <div style={{ position:'relative' }}>
                <input className="input" type={show?'text':'password'} placeholder="Min 8 characters" value={form.password} onChange={f('password')} required style={{ paddingRight:38 }}/>
                <button type="button" onClick={() => setShow(!show)} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--t3)',display:'flex',padding:2 }}>
                  {show ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', padding:11, fontSize:13 }}>
              {loading ? <><div className="spin" style={{width:13,height:13,borderColor:'rgba(255,255,255,.25)',borderTopColor:'#fff'}}/>&nbsp;Creating...</> : 'Create Account'}
            </button>
          </form>
          <p style={{ marginTop:18, textAlign:'center', fontSize:12.5, color:'var(--t3)' }}>
            Have an account?{' '}<Link href="/auth/login" style={{ color:'var(--a2)', fontWeight:600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
