'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import { Lock, ExternalLink, BookOpen, Terminal } from 'lucide-react';

export default function ApiReferencePage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'checking' | 'anonymous' | 'authenticated'>('checking');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) { setAuthState('anonymous'); return; }
    setAuthState('authenticated');
  }, []);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1').replace(/\/api\/v1\/?$/, '');
  const swaggerUrl = `${apiBase}/api/docs`;

  if (authState === 'checking') {
    return (
      <MarketingShell>
        <section className="mk-hero">
          <div className="mk-wrap" style={{ textAlign: 'center', padding: '120px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#64748b' }}>Checking authentication...</div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{to{transform:rotate(360deg)}}` }} />
        </section>
      </MarketingShell>
    );
  }

  if (authState === 'anonymous') {
    return (
      <MarketingShell>
        <MarketingHero
          badge="// API REFERENCE"
          title={<>Sign in to view the <span className="mk-grad-text">full API reference.</span></>}
          subtitle="Our interactive Swagger explorer requires an account — it lets you hit real endpoints with your own API key."
        >
          <Link href={`/auth/login?redirect=${encodeURIComponent('/api-reference')}`} className="mk-btn-big">
            <Lock size={15} /> Sign In to Continue
          </Link>
          <Link href="/auth/register" className="mk-btn-out" style={{ padding: '13px 26px', fontSize: 14 }}>
            Create Free Account <ArrowRight size={14} />
          </Link>
        </MarketingHero>

        <section className="mk-sec">
          <div className="mk-wrap" style={{ maxWidth: 820 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
              <div className="mk-card">
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(129,140,248,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Terminal size={16} color="#a5b4fc" />
                </div>
                <div className="mk-card-title" style={{ fontSize: 15 }}>Interactive Swagger</div>
                <div className="mk-card-desc" style={{ fontSize: 13 }}>Every endpoint documented with request/response shapes and live "Try it out".</div>
              </div>
              <div className="mk-card">
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(74,222,128,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <BookOpen size={16} color="#4ade80" />
                </div>
                <div className="mk-card-title" style={{ fontSize: 15 }}>OpenAPI 3.0 spec</div>
                <div className="mk-card-desc" style={{ fontSize: 13 }}>Download the full JSON spec and generate clients in your language of choice.</div>
              </div>
              <div className="mk-card">
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(251,146,60,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <ExternalLink size={16} color="#fb923c" />
                </div>
                <div className="mk-card-title" style={{ fontSize: 15 }}>Auth baked in</div>
                <div className="mk-card-desc" style={{ fontSize: 13 }}>Once signed in, your JWT is pre-filled so every request works against your real workspace.</div>
              </div>
            </div>

            <div style={{ marginTop: 36, padding: '24px 28px', background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.18)', borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <Lock size={18} color="#a5b4fc" style={{ marginTop: 3, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Why login-gated?</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65 }}>The API reference is scoped to your workspace — it shows the exact projects, endpoints, and event types you own. It's faster to try real requests against your own data than a sandbox.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <section style={{ paddingTop: 90, paddingBottom: 20 }}>
        <div className="mk-wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="mk-sec-label">// API REFERENCE</span>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', letterSpacing: '-.6px' }}>Interactive API Explorer</h1>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href={swaggerUrl} target="_blank" rel="noreferrer" className="mk-btn-out" style={{ padding: '9px 18px', fontSize: 12.5 }}>
                Open in new tab <ExternalLink size={12} />
              </a>
              <Link href="/docs" className="mk-btn-out" style={{ padding: '9px 18px', fontSize: 12.5 }}>
                <BookOpen size={12} /> Docs
              </Link>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid rgba(99,102,241,.2)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }}>
            <iframe
              src={swaggerUrl}
              title="WebhookOS API Reference"
              style={{ width: '100%', height: 'calc(100vh - 260px)', minHeight: 640, border: 'none', display: 'block' }}
            />
          </div>

          <p style={{ fontSize: 12, color: '#64748b', marginTop: 14, fontFamily: 'JetBrains Mono,monospace' }}>
            Spec URL: <span style={{ color: '#a5b4fc' }}>{swaggerUrl}</span>
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
