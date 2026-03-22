'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Activity, Eye, EyeOff, Lock, ArrowRight, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

const CSS = `
  @keyframes auth-orb { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-25px,20px) scale(.94)} }
  @keyframes auth-in  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes auth-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.35)} 50%{box-shadow:0 0 0 10px rgba(99,102,241,0)} }
  @keyframes auth-spin { to{transform:rotate(360deg)} }
  @keyframes auth-slide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes auth-pop { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }

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

  .auth-steps { display:flex; flex-direction:column; gap:14px; animation:auth-in .6s .2s ease both; }
  .auth-step { display:flex; align-items:flex-start; gap:14px; padding:16px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:14px; }
  .auth-step-num { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:#fff; flex-shrink:0; }
  .auth-step-title { font-size:12px; font-weight:700; color:#fff; margin-bottom:3px; }
  .auth-step-desc { font-size:11px; color:rgba(255,255,255,.38); line-height:1.55; }

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

  .auth-btn { width:100%; padding:13px; border:none; border-radius:11px; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:6px; transition:opacity .2s,transform .15s,box-shadow .2s; box-shadow:0 4px 20px rgba(79,70,229,.4); position:relative; overflow:hidden; }
  .auth-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent); transform:translateX(-100%); transition:transform .5s; }
  .auth-btn:hover::after { transform:translateX(100%); }
  .auth-btn:hover { opacity:.92; box-shadow:0 6px 28px rgba(79,70,229,.55); }
  .auth-btn:active { transform:scale(.98); }
  .auth-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .auth-spin { width:14px; height:14px; border:2px solid rgba(255,255,255,.25); border-top-color:#fff; border-radius:50%; animation:auth-spin .7s linear infinite; flex-shrink:0; }
  .auth-divider { text-align:center; margin:20px 0 0; font-size:12px; color:rgba(255,255,255,.3); }
  .auth-divider a { color:rgba(99,102,241,.9); font-weight:600; text-decoration:none; transition:color .15s; }
  .auth-divider a:hover { color:#818cf8; }

  .auth-strength { display:flex; gap:4px; margin-top:6px; }
  .auth-strength-bar { flex:1; height:3px; border-radius:2px; background:rgba(255,255,255,.1); transition:background .3s; }

  .auth-success-card { text-align:center; animation:auth-pop .4s ease both; }
  .auth-error-banner { display:flex; align-items:flex-start; gap:10px; padding:14px; background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.2); border-radius:12px; margin-bottom:20px; }

  @media(max-width:860px) { .auth-left { display:none; } .auth-right { width:100%; padding:32px 24px; } }
`;

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#f87171' };
  if (score <= 2) return { score, label: 'Fair', color: '#fb923c' };
  if (score <= 3) return { score, label: 'Good', color: '#facc15' };
  return { score, label: 'Strong', color: '#4ade80' };
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);

  const strength = getStrength(password);
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = token && password.length >= 8 && password === confirm && !loading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      toast.success('Password reset successfully');
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {/* No token */}
      {!token && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:24 }}>
            <div style={{ width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#dc2626,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <AlertTriangle size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.9)' }}>Invalid Link</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', fontFamily:'Fira Code,monospace' }}>missing reset token</div>
            </div>
          </div>
          <div className="auth-card-title">Link expired</div>
          <div className="auth-card-sub" style={{ marginBottom:24 }}>This reset link is invalid or has already been used.</div>
          <div className="auth-error-banner">
            <AlertTriangle size={14} color="#f87171" style={{ flexShrink:0, marginTop:1 }} />
            <span style={{ fontSize:12, color:'rgba(255,255,255,.55)', lineHeight:1.6 }}>
              Reset links are single-use and expire after 1 hour. Request a new one from the forgot password page.
            </span>
          </div>
          <Link href="/auth/forgot-password" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:13, borderRadius:11, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#fff', fontSize:13, fontWeight:700, textDecoration:'none', boxShadow:'0 4px 20px rgba(79,70,229,.4)' }}>
            Request new link <ArrowRight size={14} />
          </Link>
          <div className="auth-divider"><Link href="/auth/login">← Back to sign in</Link></div>
        </div>
      )}

      {/* Success state */}
      {token && done && (
        <div className="auth-success-card">
          <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(74,222,128,.12)', border:'2px solid rgba(74,222,128,.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <CheckCircle size={28} color="#4ade80" />
          </div>
          <div className="auth-card-title" style={{ textAlign:'center' }}>Password updated!</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.4)', textAlign:'center', margin:'8px 0 24px', lineHeight:1.6 }}>
            Your password has been reset successfully.<br />Redirecting you to sign in…
          </div>
          <Link href="/auth/login" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:13, borderRadius:11, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#fff', fontSize:13, fontWeight:700, textDecoration:'none' }}>
            Sign in now <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Reset form */}
      {token && !done && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:24 }}>
            <div style={{ width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 14px rgba(99,102,241,.4)' }}>
              <KeyRound size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.9)' }}>Secure Reset</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,.3)', fontFamily:'Fira Code,monospace' }}>one-time link · expires in 1h</div>
            </div>
          </div>

          <div className="auth-card-title">Set new password</div>
          <div className="auth-card-sub">Choose a strong password for your account</div>

          <form onSubmit={submit}>
            {/* New password */}
            <div className="auth-field">
              <label className="auth-label">New password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input" type={showPw ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required autoFocus style={{ paddingRight:40 }}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength meter */}
              {password.length > 0 && (
                <div style={{ marginTop:8 }}>
                  <div className="auth-strength">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="auth-strength-bar" style={{ background: i <= strength.score ? strength.color : undefined }} />
                    ))}
                  </div>
                  <div style={{ fontSize:10, color:strength.color, marginTop:4, fontFamily:'Fira Code,monospace' }}>{strength.label}</div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label className="auth-label">Confirm password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input" type={showCf ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  required
                  style={{ paddingRight:40, borderColor: mismatch ? 'rgba(248,113,113,.5)' : undefined }}
                />
                <button type="button" className="auth-eye" onClick={() => setShowCf(!showCf)}>
                  {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {mismatch && (
                <div style={{ fontSize:11, color:'#f87171', marginTop:5, fontFamily:'Fira Code,monospace' }}>Passwords do not match</div>
              )}
            </div>

            <button type="submit" className="auth-btn" disabled={!canSubmit}>
              {loading
                ? <><div className="auth-spin" />Resetting password…</>
                : <>Reset password <ArrowRight size={14} /></>
              }
            </button>
          </form>

          <div className="auth-divider">
            Remembered it? <Link href="/auth/login">Sign in →</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  const steps = [
    { title: 'Request sent',     desc: 'You clicked the reset link from your email inbox.' },
    { title: 'Set new password', desc: 'Enter and confirm a strong new password below.' },
    { title: 'Sign back in',     desc: 'Use your new password to access your dashboard.' },
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

          <h1 className="auth-headline">Reset your<br /><span>password.</span></h1>
          <p className="auth-sub">
            Choose a strong password to keep your webhook delivery infrastructure secure. We recommend using a password manager.
          </p>

          <div className="auth-steps">
            {steps.map((s, i) => (
              <div key={i} className="auth-step">
                <div className="auth-step-num">{i + 1}</div>
                <div>
                  <div className="auth-step-title">{s.title}</div>
                  <div className="auth-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:32, display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:'rgba(99,102,241,.06)', border:'1px solid rgba(99,102,241,.15)', borderRadius:12, animation:'auth-in .6s .3s ease both' }}>
            <Lock size={12} color="rgba(99,102,241,.8)" style={{ flexShrink:0 }} />
            <span style={{ fontSize:11, color:'rgba(255,255,255,.35)', fontFamily:'Fira Code,monospace' }}>
              Reset links are single-use and expire after 1 hour
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
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </>
  );
}
