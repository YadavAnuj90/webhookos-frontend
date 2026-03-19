'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Activity, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const CSS = `
  @keyframes cb-spin  { to { transform: rotate(360deg); } }
  @keyframes cb-in    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cb-pop   { from { opacity:0; transform:scale(.88); } to { opacity:1; transform:scale(1); } }
  @keyframes cb-orb   { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.06)} }
  @keyframes cb-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4)} 50%{box-shadow:0 0 0 14px rgba(99,102,241,0)} }

  .cb-wrap  { min-height:100vh; background:#04060f; display:flex; align-items:center; justify-content:center; font-family:'Inter',system-ui,sans-serif; position:relative; overflow:hidden; }
  .cb-grid  { position:absolute; inset:0; background-image:linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px); background-size:48px 48px; pointer-events:none; }
  .cb-orb1  { position:absolute; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(99,102,241,.15) 0%,transparent 70%); top:-200px; left:-150px; animation:cb-orb 14s ease-in-out infinite; pointer-events:none; }
  .cb-orb2  { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%); bottom:-160px; right:-100px; animation:cb-orb 18s ease-in-out infinite reverse; pointer-events:none; }

  .cb-card  { position:relative; z-index:1; width:100%; max-width:400px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); border-radius:22px; padding:44px 40px; backdrop-filter:blur(24px); box-shadow:0 24px 80px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.08); text-align:center; animation:cb-in .5s ease both; }

  .cb-logo  { display:flex; align-items:center; justify-content:center; gap:9px; margin-bottom:32px; }
  .cb-logo-icon { width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg,#4f46e5,#7c3aed); display:flex; align-items:center; justify-content:center; box-shadow:0 0 18px rgba(99,102,241,.45); animation:cb-pulse 3s ease infinite; }
  .cb-logo-text { font-size:15px; font-weight:800; color:#fff; letter-spacing:-.3px; }

  .cb-spinner-ring { width:56px; height:56px; border-radius:50%; border:3px solid rgba(99,102,241,.15); border-top-color:#818cf8; animation:cb-spin .85s linear infinite; margin:0 auto 24px; }
  .cb-success-ring { width:56px; height:56px; border-radius:50%; background:rgba(74,222,128,.1); border:2px solid rgba(74,222,128,.3); display:flex; align-items:center; justify-content:center; margin:0 auto 24px; animation:cb-pop .4s ease both; }
  .cb-error-ring   { width:56px; height:56px; border-radius:50%; background:rgba(248,113,113,.1); border:2px solid rgba(248,113,113,.3); display:flex; align-items:center; justify-content:center; margin:0 auto 24px; animation:cb-pop .4s ease both; }

  .cb-title { font-size:20px; font-weight:800; color:#fff; letter-spacing:-.5px; margin-bottom:6px; }
  .cb-sub   { font-size:13px; color:rgba(255,255,255,.38); line-height:1.6; margin-bottom:24px; }

  .cb-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:12px; border:none; border-radius:10px; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; font-size:13px; font-weight:700; cursor:pointer; text-decoration:none; box-shadow:0 4px 18px rgba(79,70,229,.4); transition:opacity .2s; }
  .cb-btn:hover { opacity:.88; }

  .cb-new-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(139,92,246,.12); border:1px solid rgba(139,92,246,.22); border-radius:20px; padding:5px 12px; font-size:10px; color:rgba(167,139,250,.9); margin-bottom:14px; font-family:'Fira Code',monospace; }
`;

type Status = 'loading' | 'success' | 'error';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const [status, setStatus] = useState<Status>('loading');
  const [isNew, setIsNew]   = useState(false);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const accessToken  = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const newUser      = searchParams.get('isNew') === 'true';

    if (!accessToken || !refreshToken) {
      setStatus('error');
      setErrMsg('No tokens received from Google. Please try again.');
      return;
    }

    // Store tokens in localStorage immediately so axios interceptor works
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }

    // Clear query params from URL right away (tokens should not sit in history)
    window.history.replaceState({}, '', '/auth/google/callback');

    // Fetch the user object using the new tokens
    authApi.getMe()
      .then((user) => {
        login({ accessToken, refreshToken, user });
        setIsNew(newUser);
        setStatus('success');

        if (newUser) {
          toast.success('🎉 Welcome to WebhookOS! Your 10-day trial has started.', { duration: 6000 });
        } else {
          toast.success('Signed in with Google');
        }

        // Redirect to dashboard after brief success display
        setTimeout(() => router.replace('/dashboard'), 1800);
      })
      .catch((err: any) => {
        setStatus('error');
        setErrMsg(err.response?.data?.message || 'Failed to load your account. Please try again.');
        // Clear the tokens we just stored since auth failed
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cb-card">
      {/* Logo */}
      <div className="cb-logo">
        <div className="cb-logo-icon"><Activity size={15} color="#fff" /></div>
        <span className="cb-logo-text">WebhookOS</span>
      </div>

      {/* Loading */}
      {status === 'loading' && (
        <>
          <div className="cb-spinner-ring" />
          <div className="cb-title">Signing you in…</div>
          <div className="cb-sub">Verifying your Google account.<br />This only takes a moment.</div>
        </>
      )}

      {/* Success */}
      {status === 'success' && (
        <div style={{ animation:'cb-pop .4s ease both' }}>
          {isNew && (
            <div style={{ marginBottom:12 }}>
              <span className="cb-new-badge"><Sparkles size={10} />New account created</span>
            </div>
          )}
          <div className="cb-success-ring">
            <CheckCircle size={24} color="#4ade80" />
          </div>
          <div className="cb-title">{isNew ? 'Welcome aboard!' : 'Signed in!'}</div>
          <div className="cb-sub">
            {isNew
              ? 'Your account is ready. Your 10-day free trial starts now.'
              : 'Google authentication successful. Redirecting to your dashboard…'}
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{ animation:'cb-pop .4s ease both' }}>
          <div className="cb-error-ring">
            <XCircle size={24} color="#f87171" />
          </div>
          <div className="cb-title">Authentication failed</div>
          <div className="cb-sub">{errMsg}</div>
          <a href="/auth/login" className="cb-btn">Back to sign in</a>
        </div>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cb-wrap">
        <div className="cb-grid" />
        <div className="cb-orb1" />
        <div className="cb-orb2" />
        <Suspense fallback={
          <div className="cb-card">
            <div className="cb-logo">
              <div className="cb-logo-icon"><Activity size={15} color="#fff" /></div>
              <span className="cb-logo-text">WebhookOS</span>
            </div>
            <div className="cb-spinner-ring" />
            <div className="cb-title">Loading…</div>
          </div>
        }>
          <CallbackContent />
        </Suspense>
      </div>
    </>
  );
}
