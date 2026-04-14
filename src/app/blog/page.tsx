'use client';

import Link from 'next/link';
import MarketingShell, { MarketingHero, ArrowRight } from '@/components/layout/MarketingShell';
import { Clock, Rss, Sparkles } from 'lucide-react';

type Post = { slug: string; title: string; excerpt: string; date: string; category: string; author: string; readTime: string; featured?: boolean };

const POSTS: Post[] = [
  { slug: 'why-we-rewrote-the-delivery-pipeline', title: 'Why we rewrote the delivery pipeline in NestJS 10', excerpt: 'Three years of lessons, baked into a cleaner worker topology. Here\'s what changed and why it matters for your p99.', date: 'April 12, 2026', category: 'Engineering', author: 'Anuj Yadav', readTime: '9 min', featured: true },
  { slug: 'zero-downtime-key-rotation', title: 'Zero-downtime AES-256-GCM key rotation in production', excerpt: 'Envelope encryption + versioned ciphertext + a background re-encryption worker. How we rotate keys without a maintenance window.', date: 'April 3, 2026', category: 'Security', author: 'Anuj Yadav', readTime: '7 min' },
  { slug: 'request-id-correlation', title: 'Tracing a single webhook through 6 services with one header', excerpt: 'Request-ID correlation end-to-end changed how our on-call handles incidents. The implementation is smaller than you\'d think.', date: 'March 22, 2026', category: 'Observability', author: 'Anuj Yadav', readTime: '6 min' },
  { slug: 'building-a-circuit-breaker-that-actually-works', title: 'Building a circuit breaker that actually works in a distributed worker fleet', excerpt: 'Opossum is great locally. But across 40 workers, you need shared state. Here\'s the hybrid breaker we ship with WebhookOS.', date: 'March 10, 2026', category: 'Engineering', author: 'Anuj Yadav', readTime: '11 min' },
  { slug: 'retries-done-right', title: 'Retries done right: backoff, jitter, and the consumer contract', excerpt: 'A thoughtful retry policy can reduce consumer load by 4×. A naive one can take them down. Pick well.', date: 'February 26, 2026', category: 'Architecture', author: 'Anuj Yadav', readTime: '8 min' },
  { slug: 'webhookos-v5-launch', title: 'WebhookOS v5: the biggest release yet', excerpt: 'A full rewrite, new dashboard, AI anomaly detection, and a pricing model that scales with you.', date: 'January 15, 2026', category: 'Launch', author: 'Anuj Yadav', readTime: '5 min' },
];

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured);

  return (
    <MarketingShell>
      <MarketingHero
        badge="// BLOG"
        title={<>Notes from the <span className="mk-grad-text">delivery pipeline.</span></>}
        subtitle="Engineering deep-dives, architecture decisions, and the occasional war story. Written by the team that built WebhookOS."
      >
        <a href="/blog.rss" className="mk-btn-out" style={{ padding: '11px 22px', fontSize: 13 }}><Rss size={14} /> RSS</a>
      </MarketingHero>

      {featured && (
        <section className="mk-sec" style={{ paddingTop: 20 }}>
          <div className="mk-wrap">
            <Link href={`/blog/${featured.slug}`} className="mk-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: '32px 34px', background: 'linear-gradient(135deg,rgba(79,70,229,.08),rgba(124,58,237,.04))', border: '1px solid rgba(129,140,248,.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Sparkles size={14} color="#fbbf24" />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '.08em' }}>Featured</span>
                <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: '#64748b' }}>· {featured.category} · {featured.date}</span>
              </div>
              <h2 style={{ fontSize: 30, fontWeight: 900, color: '#f8fafc', marginBottom: 14, letterSpacing: '-.8px', lineHeight: 1.15 }}>{featured.title}</h2>
              <p style={{ fontSize: 15.5, color: '#94a3b8', lineHeight: 1.65, marginBottom: 18, maxWidth: 680 }}>{featured.excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#64748b' }}>
                <span>{featured.author}</span>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{featured.readTime}</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="mk-sec">
        <div className="mk-wrap">
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>All posts</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {rest.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="mk-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ padding: '3px 9px', borderRadius: 100, background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.2)', fontSize: 10, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '.08em' }}>{post.category}</span>
                  <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 10.5, color: '#64748b' }}>{post.date}</span>
                </div>
                <div className="mk-card-title" style={{ fontSize: 16, lineHeight: 1.35 }}>{post.title}</div>
                <div className="mk-card-desc" style={{ fontSize: 13, marginBottom: 14 }}>{post.excerpt}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#64748b' }}>
                  <span>{post.author}</span>
                  <span>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={10} />{post.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-sec" style={{ textAlign: 'center' }}>
        <div className="mk-wrap" style={{ maxWidth: 560 }}>
          <h2 className="mk-sec-title">Get new posts in your inbox</h2>
          <p className="mk-sec-sub" style={{ margin: '0 auto 22px' }}>One email, once a month. No spam, no tracking.</p>
          <Link href="/contact?reason=newsletter" className="mk-btn-big">Subscribe <ArrowRight size={15} /></Link>
        </div>
      </section>
    </MarketingShell>
  );
}
