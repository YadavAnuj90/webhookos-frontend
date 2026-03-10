'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Activity, Eye, EyeOff, Zap, Shield, BarChart3, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      login(data);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const features = [
    { icon: Zap, title: 'Reliable Delivery', desc: '5-level retry with exponential backoff' },
    { icon: Shield, title: 'HMAC Signatures', desc: 'Every payload cryptographically signed' },
    { icon: BarChart3, title: 'Real-time Analytics', desc: 'Time-series dashboards and alerting' },
    { icon: RefreshCw, title: 'One-click Replay', desc: 'Replay any event from the DLQ' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Left — Form */}
      <div style={{ width: '100%', maxWidth: 480, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={17} color="#fff" /></div>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>WebhookOS</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 30, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.8px', marginBottom: 6 }}>Welcome back</h1>
        <p style={{ color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 14, marginBottom: 32 }}>Sign in to your dashboard</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex' }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Link href="/auth/forgot-password" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent2)', textDecoration: 'none' }}>Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 14 }}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>
          No account? <Link href="/auth/register" style={{ color: 'var(--accent2)', textDecoration: 'none', fontWeight: 600 }}>Create one free</Link>
        </p>
      </div>

      {/* Right — Feature showcase */}
      <div style={{ flex: 1, background: 'var(--bg2)', borderLeft: '1px solid var(--border)', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>// Enterprise webhook delivery</p>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16 }}>Never lose a webhook again.</h2>
          <p style={{ color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.7 }}>WebhookOS handles delivery, retries, signature verification, and analytics — so your team can focus on building.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon size={15} style={{ color: 'var(--accent2)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 24, marginTop: 32, padding: '16px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
          {[['99.9%', 'Uptime'], ['<100ms', 'Avg Latency'], ['5 levels', 'Retry Logic'], ['∞', 'Replay History']].map(([v, l]) => (
            <div key={l} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: 'var(--accent2)' }}>{v}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
