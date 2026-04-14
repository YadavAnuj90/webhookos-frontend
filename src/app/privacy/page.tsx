'use client';

import MarketingShell, { MarketingHero } from '@/components/layout/MarketingShell';

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <MarketingHero
        badge="// LEGAL · PRIVACY"
        title={<>Privacy <span className="mk-grad-text">Policy.</span></>}
        subtitle="How Anujali Technologies Pvt. Ltd. collects, uses, and protects your data when you use WebhookOS."
      />

      <section className="mk-sec" style={{ paddingTop: 10 }}>
        <div className="mk-wrap" style={{ maxWidth: 780 }}>
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#64748b', marginBottom: 32 }}>
            Last updated: April 15, 2026 · Effective: April 15, 2026
          </div>

          <div className="mk-prose">
            <p>This Privacy Policy describes how <strong>Anujali Technologies Pvt. Ltd.</strong> ("WebhookOS", "we", "us") collects, uses, and discloses information when you use our website, dashboard, and APIs (together, the "Service").</p>

            <h2>1. Who we are</h2>
            <p>WebhookOS is operated by Anujali Technologies Private Limited, a company incorporated in India, with its registered office at Devkipur, Jaunpur, Uttar Pradesh 222204. You can reach us at <a href="mailto:anujy5706@gmail.com">anujy5706@gmail.com</a>.</p>

            <h2>2. Information we collect</h2>
            <h3>Information you give us</h3>
            <ul>
              <li><strong>Account data</strong> — name, email, password hash, company (optional).</li>
              <li><strong>Billing data</strong> — plan tier, billing address, invoice history. Card details are processed by Razorpay; we never store raw card numbers.</li>
              <li><strong>Content you send</strong> — webhook payloads you submit, endpoints you register, and event types you define.</li>
              <li><strong>Support messages</strong> — anything you send via contact forms or email.</li>
            </ul>
            <h3>Information we collect automatically</h3>
            <ul>
              <li><strong>Usage data</strong> — request metadata (IP, user agent, timestamps, endpoints hit) used for security and analytics.</li>
              <li><strong>Cookies & local storage</strong> — essential session tokens and analytics (see our <a href="/cookies">Cookie Policy</a>).</li>
              <li><strong>Delivery logs</strong> — attempt status codes, latency, and error messages per webhook delivery.</li>
            </ul>

            <h2>3. How we use your information</h2>
            <ul>
              <li>Provide, operate, and improve the Service.</li>
              <li>Process webhook events on your behalf — this is the product.</li>
              <li>Authenticate users and prevent abuse.</li>
              <li>Send operational emails (password resets, billing, incident notifications).</li>
              <li>Respond to support requests.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>We do not sell your personal data. We do not use your webhook payload contents to train models. Ever.</p>

            <h2>4. Legal bases (GDPR)</h2>
            <p>Where GDPR applies, we rely on: <strong>contract</strong> (to deliver the Service), <strong>legitimate interests</strong> (security, fraud prevention, product analytics), <strong>consent</strong> (where required, e.g. marketing emails), and <strong>legal obligation</strong> (tax, compliance).</p>

            <h2>5. How long we keep your data</h2>
            <ul>
              <li>Account data — for as long as your account is active, plus 90 days after deletion.</li>
              <li>Billing data — 7 years (Indian tax retention rules).</li>
              <li>Webhook payloads — based on your plan (24h / 30d / 90d) or your configured TTL.</li>
              <li>Delivery logs — 90 days by default; configurable per workspace.</li>
            </ul>

            <h2>6. Sharing your data</h2>
            <p>We share limited data with vetted vendors strictly to operate the Service:</p>
            <ul>
              <li><strong>Cloud infrastructure</strong> — AWS (compute, storage, networking).</li>
              <li><strong>Payment processing</strong> — Razorpay.</li>
              <li><strong>Email delivery</strong> — Postmark or similar transactional providers.</li>
              <li><strong>Analytics</strong> — privacy-first tools (Plausible-style, no cross-site tracking).</li>
            </ul>
            <p>We never sell your data to advertisers. We disclose data to law enforcement only when compelled by valid legal process.</p>

            <h2>7. International transfers</h2>
            <p>Data may be processed in India and the regions where your chosen deployment is located. We rely on Standard Contractual Clauses for cross-border transfers where required.</p>

            <h2>8. Security</h2>
            <p>We take security seriously. Highlights: AES-256-GCM encryption at rest with versioned keys, TLS 1.3 in transit, HMAC-signed webhook delivery, principle-of-least-privilege IAM, and quarterly third-party penetration tests. See our <a href="/security">Security page</a> for details.</p>

            <h2>9. Your rights</h2>
            <p>You have the right to <strong>access, correct, export, and delete</strong> your personal data. EU/UK residents also have the right to <strong>object</strong> and <strong>restrict processing</strong>. California residents have the rights granted by the CCPA. Email <a href="mailto:anujy5706@gmail.com">anujy5706@gmail.com</a> to exercise any right — we reply within 30 days.</p>

            <h2>10. GDPR: erasing customer data</h2>
            <p>If you need to delete events containing a specific customer ID (right-to-erasure), use <code>DELETE /projects/:id/events/erase?customerId=…</code> in our API. This deletes the events and their delivery logs permanently.</p>

            <h2>11. Children</h2>
            <p>The Service is not directed at anyone under 16. We do not knowingly collect data from children.</p>

            <h2>12. Changes</h2>
            <p>We may update this policy. Material changes trigger an email to account owners at least 30 days before they take effect.</p>

            <h2>13. Contact</h2>
            <p>Questions about this policy? Email <a href="mailto:anujy5706@gmail.com">anujy5706@gmail.com</a> or write to Anujali Technologies Pvt. Ltd., Devkipur, Jaunpur, Uttar Pradesh 222204, India.</p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
