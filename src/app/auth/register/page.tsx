'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Activity, Eye, EyeOff, Check, ArrowRight, Sparkles, Zap, Shield, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const CSS = `
  @keyframes reg-orb    { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-25px,20px) scale(.94)} }
  @keyframes reg-in     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes reg-spin   { to{transform:rotate(360deg)} }
  @keyframes reg-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.35)} 50%{box-shadow:0 0 0 10px rgba(99,102,241,0)} }
  @keyframes reg-slide  { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes reg-check  { from{transform:scale(0) rotate(-45deg)} to{transform:scale(1) rotate(0)} }
  @keyframes reg-glow   { 0%,100%{opacity:.6} 50%{opacity:1} }

  .reg-wrap { min-height:100vh; background:#04060f; display:flex; font-family:'Inter',system-ui,sans-serif; overflow:hidden; position:relative; }
  .reg-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px); background-size:48px 48px; pointer-events:none; }
  .reg-orb1 { position:absolute; width:700px; height:700px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,.16) 0%,transparent 70%); top:-250px; right:-200px; animation:reg-orb 16s ease-in-out infinite; pointer-events:none; }
  .reg-orb2 { position:absolute; width:550px; height:550px; border-radius:50%; background:radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%); bottom:-180px; left:-100px; animation:reg-orb 20s ease-in-out infinite reverse; pointer-events:none; }
  .reg-orb3 { position:absolute; width:280px; height:280px; border-radius:50%; background:radial-gradient(circle,rgba(6,182,212,.08) 0%,transparent 70%); top:40%; left:35%; animation:reg-orb 24s ease-in-out infinite 5s; pointer-events:none; }

  .reg-left { flex:1; display:flex; flex-direction:column; justify-content:center; padding:60px 60px 60px 72px; position:relative; z-index:1; }
  .reg-right { width:480px; display:flex; flex-direction:column; justify-content:center; padding:40px 48px; position:relative; z-index:1; }

  .reg-logo { display:flex; align-items:center; gap:10px; margin-bottom:44px; animation:reg-in .5s ease both; }
  .reg-logo-icon { width:38px; height:38px; border-radius:11px; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; box-shadow:0 0 20px rgba(99,102,241,.45); animation:reg-pulse 3s ease infinite; }
  .reg-logo-text { font-size:16px; font-weight:800; color:#fff; letter-spacing:-.4px; }

  .reg-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(139,92,246,.12); border:1px solid rgba(139,92,246,.2); border-radius:20px; padding:5px 12px; font-size:10px; color:rgba(167,139,250,.9); margin-bottom:16px; animation:reg-in .5s .05s ease both; font-family:'Fira Code',monospace; }
  .reg-badge-dot { width:6px; height:6px; border-radius:50%; background:#a78bfa; animation:reg-glow 2s ease infinite; }

  .reg-headline { font-size:38px; font-weight:800; line-height:1.1; letter-spacing:-1.4px; color:#fff; margin-bottom:12px; animation:reg-in .5s .1s ease both; }
  .reg-headline span { background:linear-gradient(135deg,#818cf8,#a78bfa,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .reg-sub { color:rgba(255,255,255,.42); font-size:13.5px; line-height:1.7; margin-bottom:36px; animation:reg-in .5s .15s ease both; }

  .reg-perks { display:flex; flex-direction:column; gap:12px; margin-bottom:36px; animation:reg-in .5s .2s ease both; }
  .reg-perk { display:flex; align-items:flex-start; gap:12px; }
  .reg-perk-check { width:20px; height:20px; border-radius:6px; background:rgba(34,197,94,.12); border:1px solid rgba(34,197,94,.25); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
  .reg-perk-text { font-size:13px; color:rgba(255,255,255,.6); line-height:1.5; }
  .reg-perk-text strong { color:rgba(255,255,255,.85); }

  .reg-mini-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; animation:reg-in .5s .25s ease both; }
  .reg-mini-stat { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:12px; padding:14px 12px; text-align:center; }
  .reg-mini-stat-val { font-size:20px; font-weight:800; background:linear-gradient(135deg,#818cf8,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; letter-spacing:-.5px; }
  .reg-mini-stat-lbl { font-size:9px; color:rgba(255,255,255,.28); font-family:'Fira Code',monospace; margin-top:2px; }

  .reg-testimonial { margin-top:24px; padding:16px 18px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06); border-radius:14px; animation:reg-in .5s .3s ease both; }
  .reg-testi-stars { display:flex; gap:2px; margin-bottom:8px; }
  .reg-testi-text { font-size:12px; color:rgba(255,255,255,.45); line-height:1.6; font-style:italic; margin-bottom:10px; }
  .reg-testi-author { display:flex; align-items:center; gap:8px; }
  .reg-testi-avatar { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#fff; }
  .reg-testi-name { font-size:11px; font-weight:600; color:rgba(255,255,255,.55); }
  .reg-testi-role { font-size:10px; color:rgba(255,255,255,.25); font-family:'Fira Code',monospace; }

  .reg-card { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); border-radius:22px; padding:32px; backdrop-filter:blur(24px); box-shadow:0 24px 80px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08); animation:reg-slide .7s ease both; }
  .reg-card-header { margin-bottom:24px; }
  .reg-card-title { font-size:22px; font-weight:800; color:#fff; letter-spacing:-.5px; margin-bottom:4px; }
  .reg-card-sub { font-size:11.5px; color:rgba(255,255,255,.3); }

  .reg-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .reg-field { margin-bottom:14px; }
  .reg-label { display:block; font-size:11px; font-weight:600; color:rgba(255,255,255,.45); margin-bottom:6px; letter-spacing:.03em; }
  .reg-input { width:100%; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:10px; padding:10px 14px; font-size:13px; color:#fff; outline:none; transition:border-color .2s,box-shadow .2s,background .2s; font-family:inherit; box-sizing:border-box; }
  .reg-input::placeholder { color:rgba(255,255,255,.18); }
  .reg-input:focus { border-color:rgba(99,102,241,.6); box-shadow:0 0 0 3px rgba(99,102,241,.12); background:rgba(255,255,255,.08); }
  .reg-input-wrap { position:relative; }
  .reg-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,.28); display:flex; padding:2px; transition:color .15s; }
  .reg-eye:hover { color:rgba(255,255,255,.55); }

  .reg-pw-hint { display:flex; gap:5px; margin-top:6px; }
  .reg-pw-bar { height:3px; flex:1; border-radius:2px; transition:background .3s; }

  .reg-btn { width:100%; padding:13px; border:none; border-radius:11px; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:4px; transition:opacity .2s,transform .15s,box-shadow .2s; box-shadow:0 4px 20px rgba(79,70,229,.4); letter-spacing:.01em; position:relative; overflow:hidden; }
  .reg-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent); transform:translateX(-100%); transition:transform .5s; }
  .reg-btn:hover::after { transform:translateX(100%); }
  .reg-btn:hover { opacity:.92; box-shadow:0 6px 28px rgba(79,70,229,.55); }
  .reg-btn:active { transform:scale(.98); }
  .reg-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .reg-spin { width:14px; height:14px; border:2px solid rgba(255,255,255,.25); border-top-color:#fff; border-radius:50%; animation:reg-spin .7s linear infinite; flex-shrink:0; }
  .reg-divider { text-align:center; margin:16px 0 0; font-size:12px; color:rgba(255,255,255,.28); }
  .reg-divider a { color:rgba(99,102,241,.9); font-weight:600; text-decoration:none; transition:color .15s; }
  .reg-divider a:hover { color:#818cf8; }

  .reg-or { display:flex; align-items:center; gap:12px; margin:18px 0 14px; }
  .reg-or-line { flex:1; height:1px; background:rgba(255,255,255,.08); }
  .reg-or-text { font-size:11px; color:rgba(255,255,255,.25); white-space:nowrap; font-family:'Fira Code',monospace; }

  .reg-google-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; padding:11px 16px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.05); color:rgba(255,255,255,.8); font-size:13px; font-weight:600; cursor:pointer; transition:background .2s,border-color .2s,color .2s; font-family:'Inter',system-ui,sans-serif; }
  .reg-google-btn:hover { background:rgba(255,255,255,.09); border-color:rgba(255,255,255,.22); color:#fff; }

  .reg-terms { text-align:center; margin-top:12px; font-size:10px; color:rgba(255,255,255,.2); line-height:1.6; }
  .reg-terms a { color:rgba(99,102,241,.6); text-decoration:none; }
  .reg-terms a:hover { color:#818cf8; }

  @media(max-width:860px) {
    .reg-left { display:none; }
    .reg-right { width:100%; padding:32px 24px; }
  }
`;

const GOOGLE_AUTH_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/auth/google`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function PwStrength({ pw }: { pw: string }) {
  const score = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 4 : 3;
  const colors = ['rgba(255,255,255,.08)', '#ef4444', '#f97316', '#facc15', '#22c55e'];
  return (
    <div className="reg-pw-hint">
      {[1,2,3,4].map(i => (
        <div key={i} className="reg-pw-bar" style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,.08)' }} />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password needs at least 8 characters'); return; }
    setLoading(true);
    try {
      const data = await authApi.register(form);
      login(data);
      // Show trial start confirmation
      const trialEnd = data.trialEndAt
        ? new Date(data.trialEndAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;
      toast.success(
        trialEnd
          ? `✅ Account created! Your 10-day free trial started. Trial ends: ${trialEnd}`
          : '✅ Account created! Your 10-day free trial has started.',
        { duration: 6000 }
      );
      router.push('/dashboard');
    }
    catch (err: any) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const perks = [
    { text: <><strong>10-day free trial</strong> — all Pro features, no credit card required</> },
    { text: <><strong>5 retry attempts</strong> with exponential backoff on every event</> },
    { text: <><strong>HMAC-SHA256 signed</strong> deliveries from day one</> },
    { text: <><strong>Real-time analytics</strong> dashboard included on all plans</> },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="reg-wrap">
        <div className="reg-grid" />
        <div className="reg-orb1" />
        <div className="reg-orb2" />
        <div className="reg-orb3" />

        {/* ── LEFT PANEL ─────────────────────────────── */}
        <div className="reg-left">
          <div className="reg-logo">
            <div className="reg-logo-icon"><Activity size={17} color="#fff" /></div>
            <span className="reg-logo-text">WebhookOS</span>
          </div>

          <div className="reg-badge">
            <div className="reg-badge-dot" />
            <Sparkles size={10} />
            Free to start · No card required
          </div>

          <h1 className="reg-headline">
            Start delivering<br /><span>webhooks reliably</span>
          </h1>
          <p className="reg-sub">
            Join 1,200+ developers who've moved their webhook infrastructure to WebhookOS. Go from signup to first delivery in under 5 minutes.
          </p>

          <div className="reg-perks">
            {perks.map((p, i) => (
              <div key={i} className="reg-perk">
                <div className="reg-perk-check">
                  <Check size={11} color="#22c55e" />
                </div>
                <span className="reg-perk-text">{p.text}</span>
              </div>
            ))}
          </div>

          <div className="reg-mini-stats">
            {[['99.9%','Uptime SLA'],['<80ms','Avg Latency'],['5×','Auto Retry']].map(([v,l]) => (
              <div key={l} className="reg-mini-stat">
                <div className="reg-mini-stat-val">{v}</div>
                <div className="reg-mini-stat-lbl">{l}</div>
              </div>
            ))}
          </div>

          <div className="reg-testimonial">
            <div className="reg-testi-stars">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#facc15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ))}
            </div>
            <div className="reg-testi-text">
              "Migrated from Svix in 2 days. The retry logic and DLQ alone saved us hours of on-call pain. WebhookOS just works."
            </div>
            <div className="reg-testi-author">
              <div className="reg-testi-avatar">AK</div>
              <div>
                <div className="reg-testi-name">Arjun K.</div>
                <div className="reg-testi-role">CTO @ Fintech Startup</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────── */}
        <div className="reg-right">
          <div className="reg-card">
            <div className="reg-card-header">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <div style={{ width:30,height:30,borderRadius:8,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 12px rgba(99,102,241,.4)' }}>
                  <Sparkles size={13} color="#fff" />
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', fontFamily:'Fira Code,monospace' }}>Free forever · No card needed</div>
              </div>
              <div className="reg-card-title">Create your account</div>
              <div className="reg-card-sub">Start shipping in minutes</div>
            </div>

            <form onSubmit={submit}>
              <div className="reg-grid2">
                <div className="reg-field">
                  <label className="reg-label">First name</label>
                  <input className="reg-input" placeholder="John" value={form.firstName} onChange={f('firstName')} required />
                </div>
                <div className="reg-field">
                  <label className="reg-label">Last name</label>
                  <input className="reg-input" placeholder="Doe" value={form.lastName} onChange={f('lastName')} required />
                </div>
              </div>

              <div className="reg-field">
                <label className="reg-label">Work email</label>
                <input className="reg-input" type="email" placeholder="you@company.com" value={form.email} onChange={f('email')} required />
              </div>

              <div className="reg-field">
                <label className="reg-label">Password</label>
                <div className="reg-input-wrap">
                  <input
                    className="reg-input" type={show ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    value={form.password} onChange={f('password')} required
                    style={{ paddingRight:40 }}
                  />
                  <button type="button" className="reg-eye" onClick={() => setShow(!show)}>
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.password.length > 0 && <PwStrength pw={form.password} />}
              </div>

              <button type="submit" className="reg-btn" disabled={loading}>
                {loading ? (
                  <><div className="reg-spin" /> Creating account...</>
                ) : (
                  <>Create Free Account <ArrowRight size={14} /></>
                )}
              </button>

              {/* Trial info strip */}
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 9, padding: '10px 14px', borderRadius: 9, background: 'rgba(99,102,241,.07)', border: '1px solid rgba(99,102,241,.18)' }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>✅</span>
                <div style={{ fontFamily: 'var(--font-body, Inter, sans-serif)', fontSize: 12, color: '#a5b4fc', lineHeight: 1.55 }}>
                  <strong style={{ color: '#c7d2fe' }}>10-day free trial starts immediately.</strong>{' '}
                  Access all features — no credit card required. Trial ends after 10 days; upgrade anytime to continue.
                </div>
              </div>
            </form>

            <div className="reg-or">
              <div className="reg-or-line" />
              <span className="reg-or-text">or continue with</span>
              <div className="reg-or-line" />
            </div>
            <button
              type="button"
              className="reg-google-btn"
              onClick={() => { window.location.href = GOOGLE_AUTH_URL; }}
            >
              <GoogleIcon />
              Sign up with Google
            </button>

            <div className="reg-divider">
              Already have an account?{' '}
              <Link href="/auth/login">Sign in →</Link>
            </div>

            <div className="reg-terms">
              By creating an account you agree to our{' '}
              <Link href="/terms">Terms of Service</Link> and{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </div>

            <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {[
                { icon: Zap,       c:'#facc15', label:'Retry Logic'  },
                { icon: Shield,    c:'#22c55e', label:'HMAC Signing' },
                { icon: BarChart3, c:'#818cf8', label:'Analytics'    },
              ].map(({ icon: Icon, c, label }) => (
                <div key={label} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 6px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderRadius:10 }}>
                  <Icon size={13} color={c} />
                  <span style={{ fontSize:9, color:'rgba(255,255,255,.3)', fontFamily:'Fira Code,monospace' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
