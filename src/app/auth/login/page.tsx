'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Activity, Eye, EyeOff, Zap, Shield, BarChart3, RefreshCw, ArrowRight, Lock, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

const CSS = `
  @keyframes auth-orb { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-25px,20px) scale(.94)} }
  @keyframes auth-in  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes auth-shimmer { from{background-position:-400px 0} to{background-position:400px 0} }
  @keyframes auth-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.35)} 50%{box-shadow:0 0 0 10px rgba(99,102,241,0)} }
  @keyframes auth-spin { to{transform:rotate(360deg)} }
  @keyframes auth-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes auth-slide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }

  .auth-wrap { min-height:100vh; background:#04060f; display:flex; font-family:'Inter',system-ui,sans-serif; overflow:hidden; position:relative; }
  .auth-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px); background-size:48px 48px; pointer-events:none; }
  .auth-orb1 { position:absolute; width:620px; height:620px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 70%); top:-180px; left:-120px; animation:auth-orb 14s ease-in-out infinite; pointer-events:none; }
  .auth-orb2 { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(139,92,246,.14) 0%,transparent 70%); bottom:-140px; right:60px; animation:auth-orb 18s ease-in-out infinite reverse; pointer-events:none; }
  .auth-orb3 { position:absolute; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(6,182,212,.09) 0%,transparent 70%); top:50%; right:30%; animation:auth-orb 22s ease-in-out infinite 4s; pointer-events:none; }

  .auth-left { flex:1; display:flex; flex-direction:column; justify-content:center; padding:60px 64px 60px 72px; position:relative; z-index:1; }
  .auth-right { width:460px; display:flex; flex-direction:column; justify-content:center; padding:40px 48px; position:relative; z-index:1; }

  .auth-logo { display:flex; align-items:center; gap:10px; margin-bottom:52px; animation:auth-in .6s ease both; }
  .auth-logo-icon { width:38px; height:38px; border-radius:11px; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; box-shadow:0 0 20px rgba(99,102,241,.45); animation:auth-pulse 3s ease infinite; }
  .auth-logo-text { font-size:16px; font-weight:800; color:#fff; letter-spacing:-.4px; }

  .auth-headline { font-size:42px; font-weight:800; line-height:1.08; letter-spacing:-1.5px; color:#fff; margin-bottom:14px; animation:auth-in .6s .1s ease both; }
  .auth-headline span { background:linear-gradient(135deg,#818cf8,#a78bfa,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .auth-sub { color:rgba(255,255,255,.45); font-size:14px; line-height:1.7; margin-bottom:44px; max-width:400px; animation:auth-in .6s .15s ease both; }

  .auth-feat-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:40px; animation:auth-in .6s .2s ease both; }
  .auth-feat { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:18px; transition:border-color .2s,background .2s; cursor:default; }
  .auth-feat:hover { border-color:rgba(99,102,241,.35); background:rgba(99,102,241,.05); }
  .auth-feat-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
  .auth-feat-title { font-size:12px; font-weight:700; color:#fff; margin-bottom:4px; }
  .auth-feat-desc { font-size:11px; color:rgba(255,255,255,.38); line-height:1.55; }

  .auth-stats { display:flex; gap:0; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:14px; overflow:hidden; animation:auth-in .6s .25s ease both; }
  .auth-stat { flex:1; padding:14px 10px; text-align:center; border-right:1px solid rgba(255,255,255,.06); }
  .auth-stat:last-child { border-right:none; }
  .auth-stat-val { font-size:18px; font-weight:800; background:linear-gradient(135deg,#818cf8,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; letter-spacing:-.5px; }
  .auth-stat-lbl { font-size:9px; color:rgba(255,255,255,.3); margin-top:2px; font-family:'Fira Code',monospace; }

  .auth-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); border-radius:22px; padding:36px; backdrop-filter:blur(24px); box-shadow:0 24px 80px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08); animation:auth-slide .7s ease both; }
  .auth-card-title { font-size:24px; font-weight:800; color:#fff; letter-spacing:-.6px; margin-bottom:4px; }
  .auth-card-sub { font-size:12px; color:rgba(255,255,255,.35); margin-bottom:28px; }

  .auth-field { margin-bottom:16px; }
  .auth-label { display:block; font-size:11px; font-weight:600; color:rgba(255,255,255,.5); margin-bottom:7px; letter-spacing:.03em; }
  .auth-input { width:100%; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:11px 14px; font-size:13px; color:#fff; outline:none; transition:border-color .2s,box-shadow .2s,background .2s; font-family:inherit; box-sizing:border-box; }
  .auth-input::placeholder { color:rgba(255,255,255,.2); }
  .auth-input:focus { border-color:rgba(99,102,241,.6); box-shadow:0 0 0 3px rgba(99,102,241,.12); background:rgba(255,255,255,.08); }
  .auth-input-wrap { position:relative; }
  .auth-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,.3); display:flex; padding:2px; transition:color .15s; }
  .auth-eye:hover { color:rgba(255,255,255,.6); }

  .auth-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; }
  .auth-forgot { font-size:11px; color:rgba(99,102,241,.8); text-decoration:none; transition:color .15s; font-family:'Fira Code',monospace; }
  .auth-forgot:hover { color:#818cf8; }

  .auth-btn { width:100%; padding:13px; border:none; border-radius:11px; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:6px; transition:opacity .2s,transform .15s,box-shadow .2s; box-shadow:0 4px 20px rgba(79,70,229,.4); letter-spacing:.01em; position:relative; overflow:hidden; }
  .auth-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent); transform:translateX(-100%); transition:transform .5s; }
  .auth-btn:hover::after { transform:translateX(100%); }
  .auth-btn:hover { opacity:.92; box-shadow:0 6px 28px rgba(79,70,229,.55); }
  .auth-btn:active { transform:scale(.98); }
  .auth-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .auth-spin { width:14px; height:14px; border:2px solid rgba(255,255,255,.25); border-top-color:#fff; border-radius:50%; animation:auth-spin .7s linear infinite; flex-shrink:0; }

  .auth-divider { text-align:center; margin:20px 0 0; font-size:12px; color:rgba(255,255,255,.3); }
  .auth-divider a { color:rgba(99,102,241,.9); font-weight:600; text-decoration:none; transition:color .15s; }
  .auth-divider a:hover { color:#818cf8; }

  .auth-or { display:flex; align-items:center; gap:12px; margin:18px 0; }
  .auth-or-line { flex:1; height:1px; background:rgba(255,255,255,.08); }
  .auth-or-text { font-size:11px; color:rgba(255,255,255,.25); white-space:nowrap; font-family:'Fira Code',monospace; }

  .auth-google-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; padding:11px 16px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); color:rgba(255,255,255,.8); font-size:13px; font-weight:600; cursor:pointer; transition:background .2s,border-color .2s,color .2s; font-family:'Inter',system-ui,sans-serif; }
  .auth-google-btn:hover { background:rgba(255,255,255,.09); border-color:rgba(255,255,255,.22); color:#fff; }

  .auth-trusted { display:flex; align-items:center; gap:8px; margin-top:20px; animation:auth-in .6s .3s ease both; }
  .auth-trusted-dot { width:8px; height:8px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px rgba(34,197,94,.6); flex-shrink:0; }
  .auth-trusted-text { font-size:11px; color:rgba(255,255,255,.3); }
  .auth-trusted-text strong { color:rgba(255,255,255,.55); }

  .auth-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.2); border-radius:20px; padding:5px 12px; font-size:10px; color:rgba(99,102,241,.9); margin-bottom:18px; animation:auth-in .6s .05s ease both; font-family:'Fira Code',monospace; }
  .auth-badge-dot { width:6px; height:6px; border-radius:50%; background:#818cf8; animation:auth-pulse 2s ease infinite; }

  @media(max-width:860px) {
    .auth-left { display:none; }
    .auth-right { width:100%; padding:32px 24px; }
  }
`;

const GOOGLE_AUTH_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/google`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // 2FA challenge state
  const [twoFaStep, setTwoFaStep] = useState(false);
  const [challengeToken, setChallengeToken] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await authApi.login({ email, password: pw });
      if (res.requiresTwoFactor) {
        setChallengeToken(res.challengeToken);
        setTwoFaStep(true);
        setLoading(false);
        return;
      }
      login(res); router.push('/dashboard');
    }
    catch (err: any) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const submit2fa = async (e: React.FormEvent) => {
    e.preventDefault(); setTwoFaLoading(true);
    try {
      const res = await authApi.twoFactorLogin({ challengeToken, code: totpCode });
      login(res); router.push('/dashboard');
    }
    catch (err: any) { toast.error(err.response?.data?.message || 'Invalid 2FA code'); setTotpCode(''); }
    finally { setTwoFaLoading(false); }
  };

  const features = [
    { icon: Zap,       c: '#facc15', bg: 'rgba(250,204,21,.12)',   title: 'Guaranteed Delivery',  d: '5-level retry with exponential backoff.' },
    { icon: Shield,    c: '#22c55e', bg: 'rgba(34,197,94,.12)',    title: 'HMAC-SHA256 Signing',  d: 'Every payload cryptographically signed.' },
    { icon: BarChart3, c: '#818cf8', bg: 'rgba(129,140,248,.12)',  title: 'Real-time Analytics',  d: 'Latency, rates, event-type breakdowns.' },
    { icon: RefreshCw, c: '#f87171', bg: 'rgba(248,113,113,.12)',  title: 'Dead Letter Queue',    d: 'One-click replay for any failed event.' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="auth-wrap">
        <div className="auth-grid" />
        <div className="auth-orb1" />
        <div className="auth-orb2" />
        <div className="auth-orb3" />

        {/* ── LEFT PANEL ─────────────────────────────── */}
        <div className="auth-left">
          <div className="auth-logo">
            <div className="auth-logo-icon"><Activity size={17} color="#fff" /></div>
            <span className="auth-logo-text">WebhookOS</span>
          </div>

          <div className="auth-badge">
            <div className="auth-badge-dot" />
            Enterprise webhook infrastructure
          </div>

          <h1 className="auth-headline">
            Never lose a<br /><span>webhook again.</span>
          </h1>
          <p className="auth-sub">
            Production-grade delivery infrastructure with guaranteed retries, HMAC signing, real-time analytics, and dead-letter queues — at a fraction of the cost.
          </p>

          <div className="auth-feat-grid">
            {features.map(({ icon: Icon, c, bg, title, d }) => (
              <div key={title} className="auth-feat">
                <div className="auth-feat-icon" style={{ background: bg, border: `1px solid ${c}30` }}>
                  <Icon size={15} color={c} />
                </div>
                <div className="auth-feat-title">{title}</div>
                <div className="auth-feat-desc">{d}</div>
              </div>
            ))}
          </div>

          <div className="auth-stats">
            {[['99.9%','Uptime'],['<80ms','Avg Latency'],['5×','Retry Logic'],['∞','Event Replay']].map(([v,l]) => (
              <div key={l} className="auth-stat">
                <div className="auth-stat-val">{v}</div>
                <div className="auth-stat-lbl">{l}</div>
              </div>
            ))}
          </div>

          <div className="auth-trusted">
            <div className="auth-trusted-dot" />
            <span className="auth-trusted-text">Trusted by <strong>1,200+</strong> developers shipping production webhooks</span>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────── */}
        <div className="auth-right">
          <div className="auth-card">
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:24 }}>
              <div style={{ width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 14px rgba(99,102,241,.4)' }}>
                <Lock size={14} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.9)', letterSpacing:.2 }}>Secure Sign In</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', fontFamily:'Fira Code,monospace' }}>256-bit encrypted session</div>
              </div>
            </div>

            {!twoFaStep ? (
              <>
                <div className="auth-card-title">Welcome back</div>
                <div className="auth-card-sub">Sign in to your delivery dashboard</div>

                <form onSubmit={submit}>
                  <div className="auth-field">
                    <label className="auth-label">Email address</label>
                    <input
                      className="auth-input" type="email" placeholder="you@company.com"
                      value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                    />
                  </div>

                  <div className="auth-field">
                    <div className="auth-row">
                      <label className="auth-label" style={{ margin:0 }}>Password</label>
                      <Link href="/auth/forgot-password" className="auth-forgot">Forgot password?</Link>
                    </div>
                    <div className="auth-input-wrap">
                      <input
                        className="auth-input" type={show ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={pw} onChange={e => setPw(e.target.value)} required
                        style={{ paddingRight:40 }}
                      />
                      <button type="button" className="auth-eye" onClick={() => setShow(!show)}>
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? (
                      <><div className="auth-spin" /> Signing in...</>
                    ) : (
                      <>Sign In <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>

                {/* ── OR separator ── */}
                <div className="auth-or">
                  <div className="auth-or-line" />
                  <span className="auth-or-text">or continue with</span>
                  <div className="auth-or-line" />
                </div>

                {/* ── Google button ── */}
                <button
                  type="button"
                  className="auth-google-btn"
                  onClick={() => { window.location.href = GOOGLE_AUTH_URL; }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="auth-divider">
                  No account?{' '}
                  <Link href="/auth/register">Create one free →</Link>
                </div>
              </>
            ) : (
              <>
                <div className="auth-card-title">Two-Factor Auth</div>
                <div className="auth-card-sub">Enter the 6-digit code from your authenticator app</div>

                <form onSubmit={submit2fa}>
                  <div className="auth-field">
                    <label className="auth-label">Verification Code</label>
                    <input
                      className="auth-input" type="text" inputMode="numeric" maxLength={6}
                      placeholder="000000" autoFocus autoComplete="one-time-code"
                      value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      style={{ textAlign:'center', letterSpacing:8, fontSize:22, fontWeight:700, fontFamily:'Fira Code,monospace' }}
                    />
                  </div>

                  <button type="submit" className="auth-btn" disabled={twoFaLoading || totpCode.length !== 6}>
                    {twoFaLoading ? (
                      <><div className="auth-spin" /> Verifying...</>
                    ) : (
                      <>Verify &amp; Sign In <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>

                <div style={{ marginTop:16, textAlign:'center' }}>
                  <button
                    type="button"
                    onClick={() => { setTwoFaStep(false); setChallengeToken(''); setTotpCode(''); }}
                    style={{ background:'none', border:'none', color:'rgba(99,102,241,.8)', fontSize:12, cursor:'pointer', fontFamily:'Fira Code,monospace' }}
                  >
                    ← Back to login
                  </button>
                </div>
              </>
            )}

            <div style={{ marginTop:22, display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'rgba(34,197,94,.06)', border:'1px solid rgba(34,197,94,.15)', borderRadius:10 }}>
              <Cpu size={12} color="#22c55e" style={{ flexShrink:0 }} />
              <span style={{ fontSize:10, color:'rgba(255,255,255,.35)', fontFamily:'Fira Code,monospace' }}>
                SOC2 compliant · GDPR ready · 99.9% SLA
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
