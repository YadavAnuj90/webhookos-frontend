'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Activity, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await authApi.forgotPassword(email); setSent(true); }
    catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={17} color="#fff" /></div>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>WebhookOS</span>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '36px' }}>
          {!sent ? (
            <>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Forgot password?</h1>
              <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 28 }}>Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px' }}>
                  {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} />Sending...</> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Check your inbox</h2>
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>If that email is registered, a reset link has been sent.</p>
            </div>
          )}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link href="/auth/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--accent2)', textDecoration: 'none' }}>
              <ArrowLeft size={12} />Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
