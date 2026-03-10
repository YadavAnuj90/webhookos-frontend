'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Activity, Eye, EyeOff, Zap, Shield, BarChart3, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { login(await authApi.login({ email, password: pw })); router.push('/dashboard'); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const features = [
    { icon: Zap,      c: 'var(--yellow)', title: 'Guaranteed Delivery',  d: '5-level retry with exponential backoff. Zero dropped webhooks.' },
    { icon: Shield,   c: 'var(--green)',  title: 'HMAC-SHA256 Signing',  d: 'Every payload signed. Verify authenticity on your end instantly.' },
    { icon: BarChart3,c: 'var(--a2)',     title: 'Real-time Analytics',  d: 'Delivery rates, latency histograms, event type breakdown.' },
    { icon: RefreshCw,c: 'var(--red)',    title: 'Dead Letter Queue',     d: 'One-click replay for any failed event. Full audit trail.' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', fontFamily:'var(--sans)' }}>
      {/* LEFT -- Form */}
      <div style={{ width:440, padding:'48px 44px', display:'flex', flexDirection:'column', justifyContent:'center', borderRight:'1px solid var(--b1)', background:'var(--bg2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:40 }}>
          <div style={{ width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#3a45d4,#5b6cf8)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 12px rgba(91,108,248,.4)' }}>
            <Activity size={15} color="#fff"/>
          </div>
          <span style={{ fontWeight:800, fontSize:15, color:'var(--t1)', letterSpacing:'-.3px' }}>WebhookOS</span>
        </div>

        <h1 style={{ fontSize:26, fontWeight:800, color:'var(--t1)', letterSpacing:'-.6px', lineHeight:1.15, marginBottom:5 }}>Welcome back</h1>
        <p style={{ color:'var(--t2)', fontSize:12.5, marginBottom:28 }}>Sign in to your delivery dashboard</p>

        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Email address</label>
            <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus/>
          </div>
          <div className="field">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <label className="label" style={{ margin:0 }}>Password</label>
              <Link href="/auth/forgot-password" style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--a2)' }}>Forgot?</Link>
            </div>
            <div style={{ position:'relative' }}>
              <input className="input" type={show?'text':'password'} placeholder="        " value={pw} onChange={e=>setPw(e.target.value)} required style={{ paddingRight:38 }}/>
              <button type="button" onClick={() => setShow(!show)} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--t3)',display:'flex',padding:2 }}>
                {show ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', padding:'11px', fontSize:13, marginTop:8 }}>
            {loading ? <><div className="spin" style={{width:13,height:13,borderColor:'rgba(255,255,255,.25)',borderTopColor:'#fff'}}/>&nbsp;Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop:22, textAlign:'center', fontSize:12.5, color:'var(--t3)' }}>
          No account?{' '}<Link href="/auth/register" style={{ color:'var(--a2)', fontWeight:600 }}>Create one free →</Link>
        </p>
      </div>

      {/* RIGHT -- Pitch */}
      <div style={{ flex:1, padding:'48px 52px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div style={{ maxWidth:460 }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--a2)', textTransform:'uppercase', letterSpacing:'.15em', marginBottom:8 }}>// Enterprise webhook infrastructure</div>
          <h2 style={{ fontSize:32, fontWeight:800, color:'var(--t1)', letterSpacing:'-1px', lineHeight:1.1, marginBottom:12 }}>Never lose a<br/>webhook again.</h2>
          <p style={{ color:'var(--t2)', fontSize:12.5, lineHeight:1.75, marginBottom:32 }}>WebhookOS handles retry logic, HMAC signing, circuit breakers, and real-time analytics -- production-grade delivery infrastructure at a fraction of Svix's cost.</p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:28 }}>
            {features.map(({ icon:Icon, c, title, d }) => (
              <div key={title} style={{ background:'var(--card)', border:'1px solid var(--b1)', borderRadius:'var(--r3)', padding:15, transition:'border-color .18s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor='var(--b2)')} onMouseLeave={e => (e.currentTarget.style.borderColor='var(--b1)')}>
                <div style={{ width:28,height:28,borderRadius:7,background:`${c}15`,border:`1px solid ${c}30`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:9 }}>
                  <Icon size={13} style={{ color:c }}/>
                </div>
                <div style={{ fontWeight:700, fontSize:11.5, color:'var(--t1)', marginBottom:3 }}>{title}</div>
                <div style={{ fontSize:11, color:'var(--t3)', lineHeight:1.5 }}>{d}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:0, background:'var(--card)', border:'1px solid var(--b1)', borderRadius:'var(--r3)', overflow:'hidden' }}>
            {[['99.9%','Uptime'],['<80ms','Avg Latency'],['5x','Retry Logic'],['Infinity','Replay']].map(([v,l],i) => (
              <div key={l} style={{ flex:1, padding:'14px 10px', textAlign:'center', borderLeft:i>0?'1px solid var(--b1)':'none' }}>
                <div style={{ fontWeight:800, fontSize:17, color:'var(--a2)', letterSpacing:'-.4px' }}>{v}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:8.5, color:'var(--t3)', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
