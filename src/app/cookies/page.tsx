'use client';

import MarketingShell, { MarketingHero } from '@/components/layout/MarketingShell';

type Cookie = { name: string; purpose: string; duration: string; type: 'essential' | 'analytics' | 'preference' };

const COOKIES: Cookie[] = [
  { name: 'accessToken', purpose: 'Authenticates you when logged into the dashboard.', duration: 'Session', type: 'essential' },
  { name: 'refreshToken', purpose: 'Issues a new access token without re-prompting for credentials.', duration: '30 days', type: 'essential' },
  { name: 'ws-theme', purpose: 'Remembers dark/light theme preference.', duration: '1 year', type: 'preference' },
  { name: 'ws-consent', purpose: 'Records your cookie consent choice so we don\'t ask again.', duration: '6 months', type: 'essential' },
  { name: '_plausible_*', purpose: 'Privacy-first analytics (no cross-site tracking, no PII).', duration: '24 hours', type: 'analytics' },
  { name: 'ws-locale', purpose: 'Stores language preference.', duration: '1 year', type: 'preference' },
];

const TYPE_META = {
  essential: { label: 'Essential', color: '#4ade80', bg: 'rgba(74,222,128,.1)' },
  analytics: { label: 'Analytics', color: '#60a5fa', bg: 'rgba(96,165,250,.1)' },
  preference: { label: 'Preference', color: '#c084fc', bg: 'rgba(192,132,252,.1)' },
};

export default function CookiesPage() {
  return (
    <MarketingShell>
      <MarketingHero
        badge="// LEGAL · COOKIES"
        title={<>Cookie <span className="mk-grad-text">Policy.</span></>}
        subtitle="Exactly what we store in your browser, why, and how long for. Short list. No dark patterns."
      />

      <section className="mk-sec" style={{ paddingTop: 10 }}>
        <div className="mk-wrap" style={{ maxWidth: 820 }}>
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#64748b', marginBottom: 32 }}>
            Last updated: April 15, 2026
          </div>

          <div className="mk-prose">
            <p>WebhookOS (operated by Anujali Technologies Pvt. Ltd.) uses a small number of cookies and similar technologies. This page lists every one of them.</p>

            <h2>1. What's a cookie?</h2>
            <p>A cookie is a small text file that a site stores in your browser. We also use <code>localStorage</code> for the same purpose — the legal framework treats them equivalently, so this policy covers both.</p>

            <h2>2. Categories we use</h2>
            <ul>
              <li><strong>Essential</strong> — strictly necessary to make the Service work (logging you in, remembering consent).</li>
              <li><strong>Analytics</strong> — privacy-first page-view counting. No cross-site tracking, no advertising networks, no PII.</li>
              <li><strong>Preference</strong> — remembers your choices (theme, language) so you don't have to set them every visit.</li>
            </ul>
            <p>We do <strong>not</strong> use advertising cookies. We do <strong>not</strong> share cookie data with third-party ad networks.</p>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: '40px 0 16px', letterSpacing: '-.5px' }}>3. Full cookie list</h2>
          <div className="mk-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr', gap: 0, padding: '14px 22px', background: 'rgba(99,102,241,.06)', borderBottom: '1px solid rgba(99,102,241,.12)', fontSize: 11, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              <div>Name</div><div>Purpose</div><div>Duration</div><div>Type</div>
            </div>
            {COOKIES.map((c, i) => {
              const meta = TYPE_META[c.type];
              return (
                <div key={c.name} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr', gap: 0, padding: '14px 22px', alignItems: 'center', borderTop: i === 0 ? 'none' : '1px solid rgba(99,102,241,.08)' }}>
                  <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 12.5, color: '#c7d2fe' }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.55 }}>{c.purpose}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{c.duration}</div>
                  <div><span style={{ padding: '3px 9px', borderRadius: 100, background: meta.bg, color: meta.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{meta.label}</span></div>
                </div>
              );
            })}
          </div>

          <div className="mk-prose" style={{ marginTop: 36 }}>
            <h2>4. How to manage cookies</h2>
            <p>You can clear cookies and localStorage at any time from your browser settings. Essential cookies are required for the dashboard to function — blocking them will log you out.</p>

            <h2>5. Third-party services</h2>
            <p>A handful of vendors set cookies on our behalf when you use specific features:</p>
            <ul>
              <li><strong>Razorpay</strong> — when processing payments in our billing pages.</li>
              <li><strong>Plausible / privacy-first analytics</strong> — aggregate page views. No cookies in the strict sense (uses localStorage).</li>
            </ul>

            <h2>6. Changes</h2>
            <p>If we add or remove a cookie, we update this page and note the date at the top.</p>

            <h2>7. Questions</h2>
            <p>Email <a href="mailto:anujy5706@gmail.com">anujy5706@gmail.com</a>.</p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
