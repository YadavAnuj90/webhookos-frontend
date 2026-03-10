'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Activity, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await authApi.forgotPassword(email); setSent(true); }
    catch { toast.error('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
          <div style={{ display:'flex',alignItems:'center',gap:9 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#3a45d4,#5b6cf8)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 12px rgba(91,108,248,.4)' }}>
              <Activity size={15} color="#fff"/>
            </div>
            <span style={{ fontWeight:800, fontSize:15, color:'var(--t1)' }}>WebhookOS</span>
          </div>
        </div>

        <div style={{ background:'var(--card)', border:'1px solid var(--b1)', borderRadius:'var(--r4)', padding:28 }}>
          {!sent ? (
            <>
              <div style={{ width:42,height:42,borderRadius:12,background:'var(--abg)',border:'1px solid var(--abd)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14 }}>
                <Mail size={18} style={{ color:'var(--a2)' }}/>
              </div>
              <h1 style={{ fontSize:19, fontWeight:800, color:'var(--t1)', marginBottom:5 }}>Forgot password?</h1>
              <p style={{ color:'var(--t3)', fontSize:12.5, marginBottom:22 }}>Enter your email and we'll send a reset link.</p>
              <form onSubmit={submit}>
                <div className="field"><label className="label">Email address</label>
                  <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus/>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', padding:11 }}>
                  {loading ? <><div className="spin" style={{width:13,height:13,borderColor:'rgba(255,255,255,.25)',borderTopColor:'#fff'}}/>&nbsp;Sending...</> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <div style={{ width:48,height:48,borderRadius:14,background:'var(--gbg)',border:'1px solid var(--gbd)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>
                <CheckCircle size={22} style={{ color:'var(--green)' }}/>
              </div>
              <h2 style={{ fontSize:17, fontWeight:800, color:'var(--t1)', marginBottom:7 }}>Check your inbox</h2>
              <p style={{ color:'var(--t3)', fontSize:12.5, lineHeight:1.65 }}>
                If <strong style={{ color:'var(--t2)' }}>{email}</strong> has an account, a reset link is on the way.
              </p>
            </div>
          )}
          <div style={{ marginTop:22, textAlign:'center' }}>
            <Link href="/auth/login" style={{ display:'inline-flex',alignItems:'center',gap:5,fontFamily:'var(--mono)',fontSize:9.5,color:'var(--a2)' }}>
              <ArrowLeft size={10}/>Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
