'use client';

import MarketingShell, { MarketingHero } from '@/components/layout/MarketingShell';

export default function TermsPage() {
  return (
    <MarketingShell>
      <MarketingHero
        badge="// LEGAL · TERMS"
        title={<>Terms of <span className="mk-grad-text">Service.</span></>}
        subtitle="The rules of the road for using WebhookOS. We've tried to keep these readable — a plain-English summary sits at the top of each section."
      />

      <section className="mk-sec" style={{ paddingTop: 10 }}>
        <div className="mk-wrap" style={{ maxWidth: 780 }}>
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#64748b', marginBottom: 32 }}>
            Last updated: April 15, 2026 · Effective: April 15, 2026
          </div>

          <div className="mk-prose">
            <p>These Terms of Service ("Terms") govern your use of WebhookOS (the "Service"), operated by <strong>Anujali Technologies Pvt. Ltd.</strong> ("we", "us"). By creating an account or using the Service, you agree to these Terms.</p>

            <h2>1. The Service</h2>
            <p>WebhookOS is a webhook delivery and observability platform. We accept events from you and deliver them to the HTTP endpoints you configure, with retries, signing, and logging as described on our <a href="/features">features page</a>.</p>

            <h2>2. Your account</h2>
            <ul>
              <li>You must be at least 16 years old and legally capable of entering into a contract.</li>
              <li>You're responsible for keeping your credentials secure. Tell us immediately at <a href="mailto:anujy5706@gmail.com">anujy5706@gmail.com</a> if you suspect unauthorized access.</li>
              <li>One person or entity per account unless we explicitly agree otherwise.</li>
            </ul>

            <h2>3. Acceptable use</h2>
            <p>You may not use the Service to:</p>
            <ul>
              <li>Send illegal content or facilitate illegal activity.</li>
              <li>Deliver spam, phishing, or malicious payloads.</li>
              <li>Attack, probe, or reverse-engineer the Service or other users.</li>
              <li>Bypass rate limits, quotas, or security controls.</li>
              <li>Relay traffic for someone else in a way that conceals the origin.</li>
            </ul>
            <p>We may suspend accounts that put the Service or other users at risk. We'll notify you and give you a reasonable chance to cure the issue unless immediate action is necessary to protect the platform.</p>

            <h2>4. Your data</h2>
            <p>You own the webhook payloads and configuration you send to us. By using the Service you grant us a limited, non-exclusive license to host, process, and transmit that data solely as needed to operate the Service for you. See our <a href="/privacy">Privacy Policy</a> for details.</p>

            <h2>5. Fees and billing</h2>
            <ul>
              <li>Paid plans are billed in advance (monthly or annually).</li>
              <li>Usage overages are billed in arrears at the rates shown on our <a href="/pricing">pricing page</a>.</li>
              <li>All fees are exclusive of applicable taxes (GST, VAT, etc.) unless stated otherwise.</li>
              <li>Fees are non-refundable except as required by law.</li>
              <li>We may change pricing with 30 days' notice to your account email.</li>
            </ul>

            <h2>6. SLA and credits</h2>
            <p>Growth and above plans include a 99.95%+ uptime SLA. If we miss our target in a billing month, you can claim service credits per our SLA terms — contact us within 30 days.</p>

            <h2>7. Confidentiality</h2>
            <p>Non-public information you share with us (payloads, config, business data) is confidential. We share it only with employees and vendors bound by equivalent confidentiality obligations.</p>

            <h2>8. Intellectual property</h2>
            <p>The Service, the WebhookOS brand, and our code are ours. Feedback you send may be used by us without restriction. Open-source components are licensed under their respective terms.</p>

            <h2>9. Termination</h2>
            <ul>
              <li>You can cancel any time from your billing dashboard. Access continues until the end of the current billing period.</li>
              <li>We can terminate for material breach of these Terms or non-payment with reasonable notice.</li>
              <li>On termination, we delete your data per the retention timelines in our Privacy Policy.</li>
            </ul>

            <h2>10. Disclaimers</h2>
            <p>The Service is provided "as is" to the maximum extent permitted by law. We disclaim implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be error-free or uninterrupted.</p>

            <h2>11. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, neither party is liable for indirect, incidental, consequential, or punitive damages. Our aggregate liability for any claim is capped at the amounts you paid us in the 12 months before the claim, or <strong>USD 100</strong>, whichever is greater.</p>

            <h2>12. Indemnity</h2>
            <p>You agree to indemnify us against third-party claims arising from your misuse of the Service or your violation of these Terms.</p>

            <h2>13. Governing law and venue</h2>
            <p>These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts at Jaunpur, Uttar Pradesh.</p>

            <h2>14. Changes</h2>
            <p>We may update these Terms. Material changes are emailed to account owners at least 30 days before they take effect. Continued use after the effective date is acceptance.</p>

            <h2>15. Contact</h2>
            <p>Questions? <a href="mailto:anujy5706@gmail.com">anujy5706@gmail.com</a>. Mail: Anujali Technologies Pvt. Ltd., Devkipur, Jaunpur, Uttar Pradesh 222204, India.</p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
