'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity, ArrowRight, Briefcase, MapPin, Clock, Filter,
  Search, Building2, Sparkles, Users, Heart, Zap, Globe,
  Coffee, Rocket, ChevronDown, X,
} from 'lucide-react';
import { careersApi } from '@/lib/api';
import { SectionMascot } from '@/components/Mascots';

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cr-in { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes cr-orb { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-25px,20px) scale(.94)} }
  @keyframes cr-shimmer { from{background-position:-400px 0} to{background-position:400px 0} }
  @keyframes cr-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes cr-pulse { 0%,100%{opacity:.6} 50%{opacity:1} }

  .cr-page{min-height:100vh;background:#070d1a;color:#f0f4ff;font-family:'Inter',sans-serif;overflow-x:hidden}

  /* Orbs */
  .cr-orb{position:absolute;border-radius:50%;pointer-events:none;animation:cr-orb 12s ease-in-out infinite;filter:blur(80px)}
  .cr-orb1{width:600px;height:600px;background:radial-gradient(circle,rgba(91,108,248,.12),transparent 65%);top:-180px;left:-120px}
  .cr-orb2{width:400px;height:400px;background:radial-gradient(circle,rgba(139,92,246,.1),transparent 65%);bottom:-100px;right:-80px;animation-delay:3s}

  /* Hero */
  .cr-hero{position:relative;padding:120px 0 80px;text-align:center;overflow:hidden}
  .cr-hero-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 16px;border-radius:100px;background:rgba(91,108,248,.08);border:1px solid rgba(91,108,248,.25);margin-bottom:24px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#a5b0fa}
  .cr-hero h1{font-size:clamp(36px,5.5vw,64px);font-weight:900;letter-spacing:-2.5px;color:#f8fafc;margin:0 0 18px;line-height:1.08}
  .cr-hero h1 span{background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .cr-hero-sub{font-size:clamp(15px,1.8vw,18px);color:#8899bb;max-width:580px;margin:0 auto 40px;line-height:1.6}

  /* Wrap */
  .cr-wrap{max-width:1100px;margin:0 auto;padding:0 28px}

  /* Stats */
  .cr-stats{display:flex;justify-content:center;gap:40px;margin-bottom:64px;flex-wrap:wrap}
  .cr-stat{text-align:center}
  .cr-stat-val{font-size:28px;font-weight:900;color:#f8fafc;font-family:'JetBrains Mono',monospace}
  .cr-stat-lbl{font-size:11px;color:#475670;text-transform:uppercase;letter-spacing:.1em;margin-top:4px}

  /* Perks */
  .cr-perks{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:72px}
  .cr-perk{background:rgba(15,29,48,.7);border:1px solid rgba(99,120,180,.1);border-radius:14px;padding:24px 22px;transition:border-color .25s,transform .25s}
  .cr-perk:hover{border-color:rgba(91,108,248,.3);transform:translateY(-3px)}
  .cr-perk-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
  .cr-perk-title{font-weight:700;font-size:14px;color:#f0f4ff;margin-bottom:6px}
  .cr-perk-desc{font-size:12.5px;color:#8899bb;line-height:1.55}

  /* Filters */
  .cr-filter-bar{display:flex;align-items:center;gap:12px;margin-bottom:32px;flex-wrap:wrap}
  .cr-search{display:flex;align-items:center;gap:8px;background:rgba(15,29,48,.8);border:1px solid rgba(99,120,180,.15);border-radius:10px;padding:10px 16px;flex:1;min-width:200px;transition:border-color .2s}
  .cr-search:focus-within{border-color:rgba(91,108,248,.5)}
  .cr-search input{background:none;border:none;outline:none;color:#f0f4ff;font-size:13px;width:100%;font-family:inherit}
  .cr-search input::placeholder{color:#475670}
  .cr-filter-btn{display:flex;align-items:center;gap:6px;padding:10px 16px;border-radius:10px;border:1px solid rgba(99,120,180,.15);background:rgba(15,29,48,.8);color:#8899bb;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
  .cr-filter-btn:hover{border-color:rgba(91,108,248,.4);color:#f0f4ff}
  .cr-filter-btn.active{border-color:rgba(91,108,248,.5);background:rgba(91,108,248,.08);color:#a5b0fa}
  .cr-filter-tag{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:100px;background:rgba(91,108,248,.1);border:1px solid rgba(91,108,248,.25);color:#a5b0fa;font-size:11px;font-weight:600;cursor:pointer}
  .cr-filter-tag:hover{background:rgba(244,63,94,.1);border-color:rgba(244,63,94,.3);color:#fca5a5}

  /* Section label */
  .cr-sec-label{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;color:#475670;text-transform:uppercase;letter-spacing:.14em;margin-bottom:14px;display:block}

  /* Job cards */
  .cr-jobs{display:flex;flex-direction:column;gap:14px;margin-bottom:80px}
  .cr-job{background:rgba(15,29,48,.7);border:1px solid rgba(99,120,180,.1);border-radius:14px;padding:26px 28px;display:flex;align-items:center;gap:20px;transition:all .25s;cursor:pointer;text-decoration:none;color:inherit}
  .cr-job:hover{border-color:rgba(91,108,248,.35);transform:translateX(4px);box-shadow:0 8px 32px rgba(0,0,0,.3)}
  .cr-job-icon{width:48px;height:48px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .cr-job-body{flex:1;min-width:0}
  .cr-job-title{font-weight:700;font-size:16px;color:#f0f4ff;margin-bottom:6px}
  .cr-job-meta{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
  .cr-job-tag{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#8899bb}
  .cr-job-arrow{width:36px;height:36px;border-radius:10px;background:rgba(91,108,248,.08);border:1px solid rgba(91,108,248,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
  .cr-job:hover .cr-job-arrow{background:rgba(91,108,248,.15);border-color:rgba(91,108,248,.4)}

  /* Empty */
  .cr-empty{text-align:center;padding:64px 0;color:#475670;font-size:15px}

  /* CTA */
  .cr-cta{text-align:center;padding:80px 0 120px}
  .cr-cta h2{font-size:clamp(24px,3.5vw,40px);font-weight:900;letter-spacing:-1.5px;color:#f8fafc;margin-bottom:14px}
  .cr-cta p{font-size:15px;color:#8899bb;margin-bottom:32px;max-width:440px;margin-left:auto;margin-right:auto}
  .cr-btn{padding:13px 32px;border-radius:10px;border:none;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;font-family:inherit;transition:all .22s;position:relative;overflow:hidden}
  .cr-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(79,70,229,.5);color:#fff;text-decoration:none}
  .cr-btn-out{padding:13px 32px;border-radius:10px;border:1px solid rgba(99,102,241,.3);background:rgba(99,102,241,.06);color:#c7d2fe;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;font-family:inherit;transition:all .22s}
  .cr-btn-out:hover{border-color:rgba(99,102,241,.6);color:#fff;background:rgba(99,102,241,.1);text-decoration:none}

  /* Responsive */
  @media(max-width:768px){
    .cr-perks{grid-template-columns:1fr}
    .cr-stats{gap:24px}
    .cr-filter-bar{flex-direction:column;align-items:stretch}
    .cr-job{flex-direction:column;align-items:flex-start;gap:14px}
    .cr-job-arrow{align-self:flex-end}
  }
`;

// ─── Constants ───────────────────────────────────────────────────────────────

const DEPT_LABELS: Record<string, string> = {
  engineering: 'Engineering', product: 'Product', design: 'Design',
  marketing: 'Marketing', sales: 'Sales', support: 'Support',
  operations: 'Operations', hr: 'Human Resources',
};

const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time',
  contract: 'Contract', internship: 'Internship',
};

const EXP_LABELS: Record<string, string> = {
  fresher: 'Fresher', junior: 'Junior', mid: 'Mid-level',
  senior: 'Senior', lead: 'Lead', staff: 'Staff',
};

const DEPT_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  engineering: { bg: 'rgba(91,108,248,.1)', border: 'rgba(91,108,248,.25)', color: '#818cf8' },
  product:     { bg: 'rgba(168,85,247,.1)', border: 'rgba(168,85,247,.25)', color: '#a855f7' },
  design:      { bg: 'rgba(236,72,153,.1)', border: 'rgba(236,72,153,.25)', color: '#ec4899' },
  marketing:   { bg: 'rgba(249,115,22,.1)', border: 'rgba(249,115,22,.25)', color: '#f97316' },
  sales:       { bg: 'rgba(34,197,94,.1)',  border: 'rgba(34,197,94,.25)',  color: '#22c55e' },
  support:     { bg: 'rgba(56,189,248,.1)', border: 'rgba(56,189,248,.25)', color: '#38bdf8' },
  operations:  { bg: 'rgba(234,179,8,.1)',  border: 'rgba(234,179,8,.25)',  color: '#eab308' },
  hr:          { bg: 'rgba(244,63,94,.1)',  border: 'rgba(244,63,94,.25)',  color: '#f43f5e' },
};

const PERKS = [
  { icon: Rocket, color: '#818cf8', bg: 'rgba(91,108,248,.1)', title: 'Ship Fast', desc: 'Work on real products used by thousands of developers. Your code goes live, not into a backlog.' },
  { icon: Globe,  color: '#22c55e', bg: 'rgba(34,197,94,.1)',  title: 'Remote-First', desc: 'Work from anywhere in India. We\'re async-first with flexible hours and no micromanagement.' },
  { icon: Heart,  color: '#f43f5e', bg: 'rgba(244,63,94,.1)',  title: 'Health & Wellness', desc: 'Comprehensive health insurance, mental health support, and wellness reimbursements.' },
  { icon: Coffee, color: '#f97316', bg: 'rgba(249,115,22,.1)', title: 'Learning Budget', desc: '₹50K/year learning budget for courses, conferences, books — whatever helps you grow.' },
  { icon: Zap,    color: '#eab308', bg: 'rgba(234,179,8,.1)',  title: 'Stock Options', desc: 'Every team member gets ESOPs. We succeed together, we benefit together.' },
  { icon: Users,  color: '#38bdf8', bg: 'rgba(56,189,248,.1)', title: 'Small Team Energy', desc: 'No bureaucracy. Direct access to founders. Your ideas shape the product roadmap.' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    careersApi.listJobs({ department: deptFilter || undefined, type: typeFilter || undefined })
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [deptFilter, typeFilter]);

  const filtered = jobs.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase())
      || j.department?.toLowerCase().includes(search.toLowerCase())
      || j.location?.toLowerCase().includes(search.toLowerCase())
  );

  const activeFilters = [
    ...(deptFilter ? [{ label: DEPT_LABELS[deptFilter] || deptFilter, clear: () => setDeptFilter('') }] : []),
    ...(typeFilter ? [{ label: TYPE_LABELS[typeFilter] || typeFilter, clear: () => setTypeFilter('') }] : []),
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="cr-page">
        <div className="cr-orb cr-orb1" />
        <div className="cr-orb cr-orb2" />

        {/* ── NAVBAR ── */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(7,13,26,.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(99,120,180,.08)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#f0f4ff' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>WebhookOS</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/" style={{ fontSize: 13, color: '#8899bb', textDecoration: 'none' }}>Home</Link>
            <Link href="/#features" style={{ fontSize: 13, color: '#8899bb', textDecoration: 'none' }}>Features</Link>
            <Link href="/#pricing" style={{ fontSize: 13, color: '#8899bb', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/auth/register" className="cr-btn" style={{ padding: '8px 18px', fontSize: 12 }}>Get Started</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="cr-hero">
          <div className="cr-wrap">
            <SectionMascot type="astronaut" scale={2} />
            <div className="cr-hero-badge">
              <Sparkles size={12} /> We&apos;re hiring
            </div>
            <h1>Build the future of<br /><span>webhook infrastructure</span></h1>
            <p className="cr-hero-sub">
              Join a small, fast-moving team solving real infrastructure problems for thousands of developers. Remote-first, async culture, zero BS.
            </p>
            <div className="cr-stats">
              {[
                ['1,200+', 'Developers'],
                ['99.9%', 'Uptime'],
                ['< 80ms', 'Latency'],
                ['∞', 'Ambition'],
              ].map(([v, l]) => (
                <div key={l} className="cr-stat">
                  <div className="cr-stat-val">{v}</div>
                  <div className="cr-stat-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PERKS ── */}
        <section style={{ padding: '0 0 80px' }}>
          <div className="cr-wrap">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <SectionMascot type="cat" scale={1.4} />
              <span className="cr-sec-label">// WHY WEBHOOKOS</span>
              <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#f8fafc', margin: '0 0 10px' }}>More than just a job</h2>
              <p style={{ fontSize: 14.5, color: '#8899bb', maxWidth: 460, margin: '0 auto' }}>We believe great products come from happy, empowered teams.</p>
            </div>
            <div className="cr-perks">
              {PERKS.map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="cr-perk" style={{ animationDelay: '0.1s' }}>
                  <div className="cr-perk-icon" style={{ background: bg, border: `1px solid ${color}25` }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div className="cr-perk-title">{title}</div>
                  <div className="cr-perk-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OPEN POSITIONS ── */}
        <section style={{ padding: '0 0 40px' }}>
          <div className="cr-wrap">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <SectionMascot type="fox" scale={1.4} />
              <span className="cr-sec-label">// OPEN POSITIONS</span>
              <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, letterSpacing: '-1.5px', color: '#f8fafc', margin: '0 0 10px' }}>
                Find your role
              </h2>
              <p style={{ fontSize: 14.5, color: '#8899bb', maxWidth: 460, margin: '0 auto' }}>
                {filtered.length} open position{filtered.length !== 1 ? 's' : ''} across the team
              </p>
            </div>

            {/* Filters */}
            <div className="cr-filter-bar">
              <div className="cr-search">
                <Search size={15} color="#475670" />
                <input
                  placeholder="Search roles, departments, locations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                className="cr-filter-btn"
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                style={{ appearance: 'none', paddingRight: 28 }}
              >
                <option value="">All Departments</option>
                {Object.entries(DEPT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                className="cr-filter-btn"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={{ appearance: 'none', paddingRight: 28 }}
              >
                <option value="">All Types</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Active filter tags */}
            {activeFilters.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                {activeFilters.map(f => (
                  <span key={f.label} className="cr-filter-tag" onClick={f.clear}>
                    {f.label} <X size={11} />
                  </span>
                ))}
              </div>
            )}

            {/* Job list */}
            <div className="cr-jobs">
              {loading ? (
                <div className="cr-empty">Loading positions...</div>
              ) : filtered.length === 0 ? (
                <div className="cr-empty">
                  {jobs.length === 0
                    ? 'No open positions right now. Check back soon or send us your resume anyway!'
                    : 'No positions match your filters. Try broadening your search.'}
                </div>
              ) : (
                filtered.map((job: any) => {
                  const dc = DEPT_COLORS[job.department] || DEPT_COLORS.engineering;
                  return (
                    <Link key={job._id} href={`/careers/${job.slug}`} className="cr-job">
                      <div className="cr-job-icon" style={{ background: dc.bg, border: `1px solid ${dc.border}` }}>
                        <Briefcase size={20} color={dc.color} />
                      </div>
                      <div className="cr-job-body">
                        <div className="cr-job-title">{job.title}</div>
                        <div className="cr-job-meta">
                          <span className="cr-job-tag"><Building2 size={13} /> {DEPT_LABELS[job.department] || job.department}</span>
                          <span className="cr-job-tag"><MapPin size={13} /> {job.location}</span>
                          <span className="cr-job-tag"><Clock size={13} /> {TYPE_LABELS[job.type] || job.type}</span>
                          {job.experience && <span className="cr-job-tag"><Zap size={13} /> {EXP_LABELS[job.experience] || job.experience}</span>}
                          {job.salaryRange && <span className="cr-job-tag" style={{ color: '#22c55e' }}>💰 {job.salaryRange}</span>}
                        </div>
                        {job.shortDescription && (
                          <p style={{ fontSize: 12.5, color: '#475670', marginTop: 8, lineHeight: 1.5 }}>{job.shortDescription}</p>
                        )}
                      </div>
                      <div className="cr-job-arrow">
                        <ArrowRight size={16} color="#818cf8" />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cr-cta">
          <div className="cr-wrap">
            <SectionMascot type="owl" scale={1.5} />
            <h2>Don&apos;t see your role?</h2>
            <p>We&apos;re always looking for talented people. Send us your resume and we&apos;ll reach out when something fits.</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/careers/general-application" className="cr-btn">
                Send Your Resume <ArrowRight size={16} />
              </Link>
              <Link href="/" className="cr-btn-out">
                Back to Home
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(99,120,180,.08)', padding: '32px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#475670' }}>
            © {new Date().getFullYear()} WebhookOS · Built with ❤️ in India
          </p>
        </footer>
      </div>
    </>
  );
}
