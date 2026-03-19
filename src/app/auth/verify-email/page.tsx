'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Activity, CheckCircle, XCircle, Mail, ArrowRight, RefreshCw, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const CSS = `
  @keyframes auth-orb { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-25px,20px) scale(.94)} }
  @keyframes auth-in  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes auth-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.35)} 50%{box-shadow:0 0 0 10px rgba(99,102,241,0)} }
  @keyframes auth-spin { to{transform:rotate(360deg)} }
  @keyframes auth-slide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes auth-pop { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
  @keyframes auth-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

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

  .auth-perks { display:flex; flex-direction:column; gap:12px; animation:auth-in .6s .2s ease both; }
  .auth-perk { display:flex; align-items:center; gap:12px; padding:14px 16px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:12px; }
  .auth-perk-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .auth-perk-text { font-size:12px; color:rgba(255,255,255,.5); line-height:1.5; }
  .auth-perk-text strong { color:rgba(255,255,255,.8); }

  .auth-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); border-radius:22px; padding:36px; backdrop-filter:blur(24px); box-shadow:0 24px 80px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08); animation:auth-slide .7s ease both; }

  .auth-btn { width:100%; padding:13px; border:none; border-radius:11px; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity .2s,transform .15s,box-shadow .2s; box-shadow:0 4px 20px rgba(79,70,229,.4); position:relative; overflow:hidden; }
  .auth-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent); transform:translateX(-100%); transition:transform .5s; }
  .auth-btn:hover::after { transform:translateX(100%); }
  .auth-btn:hover { opacity:.92; }
  .auth-btn:disabled { opacity:.6; cursor:not-allowed; }

  .auth-btn-outline { width:100%; padding:12px; border:1px solid rgba(255,255,255,.12); border-radius:11px; background:transparent; color:rgba(255,255,255,.6); font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:border-color .2s,color .2s,background .2s; }
  .auth-btn-outline:hover { border-color:rgba(99,102,241,.4); color:#818cf8; background:rgba(99,102,241,.06); }
  .auth-btn-outline:disabled { opacity:.5; cursor:not-allowed; }

  .auth-spin { width:14px; height:14px; border:2px solid rgba(255,255,255,.25); border-top-color:#fff; border-radius:50%; animation:auth-spin .7s linear infinite; flex-shrink:0; }
  .auth-divider { text-align:center; margin:18px 0 0; font-size:12px; color:rgba(255,255,255,.3); }
  .auth-divider a { color:rgba(99,102,241,.9); font-weight:600; text-decoration:none; }
  .auth-divider a:hover { color:#818cf8; }

  .auth-loading-icon { width:64px; height:64px; border-radius:50%; background:rgba(99,102,241,.1); border:2px solid rgba(99,102,241,.2); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }
  .auth-loading-spinner { width:32px; height:32px; border:3px solid rgba(99,102,241,.2); border-top-color:#818cf8; border-radius:50%; animation:auth-spin .8s linear infinite; }
  .auth-success-icon { width:64px; height:64px; border-radius:50%; background:rgba(74,222,128,.1); border:2px solid rgba(74,222,128,.25); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; animation:auth-bounce 2s ease infinite; }
  .auth-error-icon { width:64px; height:64px; border-radius:50%; background:rgba(248,113,113,.1); border:2px solid rgba(248,113,113,.25); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }

  @media(max-width:860px) { .auth-left { display:none; } .auth-right { width:100%; padding:32px 24px; } }
`;

type Status = 'verifying' | 'success' | 'error' | 'no_token';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus]       = useState<Status>(token ? 'verifying' : 'no_token');
  const [resending, setResending] = useState(false);
  const [resent, setResent]       = useState(false);
  const [errMsg, setErrMsg]       = useState('');

  // Auto-verify on mount if token present
  useEffect(() => {
    if (!token) return;
    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
        toast.success('Email verified! Welcome aboard.');
        setTimeout(() => router.push('/dashboard'), 3000);
      })
      .catch((err: any) => {
        setStatus('error');
        setErrMsg(err.response?.data?.message || 'Verification link is invalid or has expired.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification();
      setResent(true);
      toast.success('Verification email sent — check your inbox');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  // ── Verifying ─────────────────────────────────────────────────────────────
  if (status === 'verifying') return (
    <div className="auth-card" style={{ textAlign:'center' }}>
      <div className="auth-loading-icon">
        <div className="auth-loading-spinner" />
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:'#fff', letterSpacing:'-.5px', marginBottom:8 }}>Verifying your email…</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,.35)', lineHeight:1.6 }}>
        This only takes a moment. Please don't close this tab.
      </div>
    </div>
  );

  // ── Success ───────────────────────────────────────────────────────────────
  if (status === 'success') return (
    <div className="auth-card" style={{ textAlign:'center', animation:'auth-pop .4s ease both' }}>
      <div className="auth-success-icon">
        <CheckCircle size={28} color="#4ade80" />
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:'#fff', letterSpacing:'-.5px', marginBottom:8 }}>Email verified!</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,.4)', lineHeight:1.6, marginBottom:28 }}>
        Your account is now active. Redirecting to your dashboard in a moment…
      </div>
      <Link href="/dashboard"
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:13, borderRadius:11, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#fff', fontSize:13, fontWeight:700, textDecoration:'none', boxShadow:'0 4px 20px rgba(79,70,229,.4)' }}>
        Go to dashboard <ArrowRight size={14} />
      </Link>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (status === 'error') return (
    <div className="auth-card" style={{ textAlign:'center', animation:'auth-pop .4s ease both' }}>
      <div className="auth-error-icon">
        <XCircle size={28} color="#f87171" />
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:'#fff', letterSpacing:'-.5px', marginBottom:8 }}>Verification failed</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,.4)', lineHeight:1.6, marginBottom:8 }}>
        {errMsg}
      </div>
      <div style={{ fontSize:12, color:'rgba(255,255,255,.25)', marginBottom:28 }}>
        Verification links expire after 24 hours and can only be used once.
      </div>

      {resent ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:11, background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.2)', marginBottom:16 }}>
          <CheckCircle size={14} color="#4ade80" />
          <span style={{ fontSize:13, color:'#4ade80', fontWeight:600 }}>New verification email sent — check your inbox</span>
        </div>
      ) : (
        <button onClick={resend} disabled={resending} className="auth-btn" style={{ marginBottom:12 }}>
          {resending
            ? <><div className="auth-spin" />Sending new email…</>
            : <><RefreshCw size={14} />Resend verification email</>
          }
        </button>
      )}

      <div className="auth-divider">
        <Link href="/auth/login">← Back to sign in</Link>
      </div>
    </div>
  );

  // ── No token (direct navigation to /auth/verify-email with no ?token) ─────
  return (
    <div className="auth-card">
      <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:24 }}>
        <div style={{ width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#0891b2,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 14px rgba(6,182,212,.4)' }}>
          <MailCheck size={14} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.9)' }}>Email Verification</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', fontFamily:'Fira Code,monospace' }}>check your inbox</div>
        </div>
      </div>

      <div style={{ fontSize:22, fontWeight:800, color:'#fff', letterSpacing:'-.5px', marginBottom:4 }}>Verify your email</div>
      <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:24 }}>Confirm your address to activate your account</div>

      <div style={{ padding:'14px 16px', background:'rgba(99,102,241,.06)', border:'1px solid rgba(99,102,241,.18)', borderRadius:12, display:'flex', alignItems:'flex-start', gap:10, marginBottom:24 }}>
        <Mail size={14} color="rgba(99,102,241,.8)" style={{ flexShrink:0, marginTop:1 }} />
        <span style={{ fontSize:12, color:'rgba(255,255,255,.5)', lineHeight:1.65 }}>
          We sent a verification link to your email address. Click the link in the email to activate your account.
          <br /><span style={{ color:'rgba(255,255,255,.3)' }}>Don't see it? Check your spam folder.</span>
        </span>
      </div>

      {resent ? (
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'13px', borderRadius:11, background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.2)', marginBottom:16 }}>
          <CheckCircle size={14} color="#4ade80" />
          <span style={{ fontSize:13, color:'#4ade80', fontWeight:600 }}>Verification email resent</span>
        </div>
      ) : (
        <button onClick={resend} disabled={resending} className="auth-btn-outline" style={{ marginBottom:14 }}>
          {resending
            ? <><div style={{ width:13, height:13, border:'2px solid rgba(255,255,255,.2)', borderTopColor:'rgba(255,255,255,.7)', borderRadius:'50%', animation:'auth-spin .7s linear infinite' }} />Sending…</>
            : <><RefreshCw size={13} />Resend verification email</>
          }
        </button>
      )}

      <div className="auth-divider">
        Wrong account? <Link href="/auth/login">Sign in with a different email →</Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const perks = [
    { icon: CheckCircle, c: '#4ade80', bg: 'rgba(74,222,128,.12)',  text: <><strong>Secure your account</strong> — a verified email helps us protect your webhooks and recover access.</> },
    { icon: Mail,        c: '#818cf8', bg: 'rgba(129,140,248,.12)', text: <><strong>Delivery alerts</strong> — get notified immediately when endpoints fail or retry thresholds are hit.</> },
    { icon: RefreshCw,   c: '#22d3ee', bg: 'rgba(34,211,238,.12)',  text: <><strong>Account recovery</strong> — reset your password securely from a verified email address.</> },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="auth-wrap">
        <div className="auth-grid" />
        <div className="auth-orb1" />
        <div className="auth-orb2" />
        <div className="auth-orb3" />

        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-logo">
            <div className="auth-logo-icon"><Activity size={17} color="#fff" /></div>
            <span className="auth-logo-text">WebhookOS</span>
          </div>

          <h1 className="auth-headline">One last<br /><span>step.</span></h1>
          <p className="auth-sub">
            Verify your email to unlock your full WebhookOS account and start delivering webhooks at scale.
          </p>

          <div className="auth-perks">
            {perks.map(({ icon: Icon, c, bg, text }, i) => (
              <div key={i} className="auth-perk">
                <div className="auth-perk-icon" style={{ background: bg, border:`1px solid ${c}30` }}>
                  <Icon size={14} color={c} />
                </div>
                <div className="auth-perk-text">{text}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:32, display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'rgba(34,197,94,.05)', border:'1px solid rgba(34,197,94,.15)', borderRadius:12, animation:'auth-in .6s .3s ease both' }}>
            <Mail size={12} color="rgba(34,197,94,.7)" style={{ flexShrink:0 }} />
            <span style={{ fontSize:11, color:'rgba(255,255,255,.35)', fontFamily:'Fira Code,monospace' }}>
              Verification links expire after 24 hours
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <Suspense fallback={
            <div className="auth-card" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
              <div style={{ width:24, height:24, border:'2px solid rgba(255,255,255,.15)', borderTopColor:'#818cf8', borderRadius:'50%', animation:'auth-spin .7s linear infinite' }} />
            </div>
          }>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </div>
    </>
  );
}
