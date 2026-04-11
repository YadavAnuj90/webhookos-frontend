'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Activity, ArrowLeft, ArrowRight, Briefcase, MapPin, Clock,
  Building2, Zap, Check, Upload, Loader2, Sparkles, CalendarDays,
  Linkedin, Globe, Phone, Mail, User, FileText, DollarSign, X,
} from 'lucide-react';
import { careersApi } from '@/lib/api';
import { SectionMascot } from '@/components/Mascots';

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes jd-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes jd-check { from{transform:scale(0)} to{transform:scale(1)} }

  .jd-page{min-height:100vh;background:#070d1a;color:#f0f4ff;font-family:'Inter',sans-serif}
  .jd-wrap{max-width:800px;margin:0 auto;padding:0 28px}
  .jd-wide{max-width:1100px;margin:0 auto;padding:0 28px}

  /* Back */
  .jd-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#8899bb;text-decoration:none;margin-bottom:28px;transition:color .2s}
  .jd-back:hover{color:#f0f4ff}

  /* Header */
  .jd-header{margin-bottom:48px;padding-top:100px}
  .jd-dept-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:100px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px}
  .jd-title{font-size:clamp(28px,4.5vw,48px);font-weight:900;letter-spacing:-2px;color:#f8fafc;margin:0 0 16px;line-height:1.1}
  .jd-meta{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-bottom:8px}
  .jd-meta-tag{display:inline-flex;align-items:center;gap:5px;font-size:13px;color:#8899bb}

  /* Content */
  .jd-section{margin-bottom:40px}
  .jd-section h3{font-size:18px;font-weight:800;color:#f0f4ff;margin-bottom:16px;letter-spacing:-0.5px}
  .jd-section p,.jd-section li{font-size:14px;color:#8899bb;line-height:1.7}
  .jd-section ul{padding-left:0;list-style:none;display:flex;flex-direction:column;gap:10px}
  .jd-section li{display:flex;align-items:flex-start;gap:10px}
  .jd-check{width:18px;height:18px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}

  /* Apply Form */
  .jd-apply{background:rgba(15,29,48,.7);border:1px solid rgba(99,120,180,.12);border-radius:18px;padding:36px 32px;margin-bottom:60px}
  .jd-apply h3{font-size:22px;font-weight:900;color:#f0f4ff;margin-bottom:6px;letter-spacing:-0.5px}
  .jd-apply-sub{font-size:13px;color:#8899bb;margin-bottom:28px}
  .jd-form{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .jd-field{display:flex;flex-direction:column;gap:5px}
  .jd-field.full{grid-column:1/-1}
  .jd-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#8899bb;display:flex;align-items:center;gap:5px}
  .jd-label .req{color:#f43f5e}
  .jd-input{background:rgba(7,13,26,.8);border:1px solid rgba(99,120,180,.15);border-radius:10px;padding:11px 14px;color:#f0f4ff;font-size:13px;font-family:inherit;transition:border-color .2s;outline:none;width:100%;box-sizing:border-box}
  .jd-input:focus{border-color:rgba(91,108,248,.5)}
  .jd-input::placeholder{color:#475670}
  textarea.jd-input{min-height:120px;resize:vertical}
  select.jd-input{appearance:none;cursor:pointer}

  /* File upload */
  .jd-upload{border:2px dashed rgba(99,120,180,.2);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all .2s}
  .jd-upload:hover{border-color:rgba(91,108,248,.4);background:rgba(91,108,248,.03)}
  .jd-upload.has-file{border-color:rgba(34,197,94,.3);background:rgba(34,197,94,.03)}
  .jd-upload-text{font-size:12.5px;color:#8899bb;margin-top:8px}
  .jd-upload-file{display:flex;align-items:center;gap:8px;justify-content:center;font-size:13px;color:#22c55e}

  /* Submit */
  .jd-submit{grid-column:1/-1;display:flex;justify-content:flex-end;gap:12px;margin-top:8px}
  .jd-btn{padding:13px 32px;border-radius:10px;border:none;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .22s;display:inline-flex;align-items:center;gap:8px}
  .jd-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(79,70,229,.5)}
  .jd-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}

  /* Success */
  .jd-success{text-align:center;padding:48px 24px}
  .jd-success-icon{width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,.1);border:2px solid rgba(34,197,94,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:jd-check .4s ease}
  .jd-success h3{font-size:22px;font-weight:900;color:#f0f4ff;margin-bottom:10px}
  .jd-success p{font-size:14px;color:#8899bb;max-width:400px;margin:0 auto}

  @media(max-width:640px){
    .jd-form{grid-template-columns:1fr}
    .jd-meta{flex-direction:column;align-items:flex-start;gap:8px}
  }
`;

const DEPT_LABELS: Record<string, string> = {
  engineering: 'Engineering', product: 'Product', design: 'Design',
  marketing: 'Marketing', sales: 'Sales', support: 'Support',
  operations: 'Operations', hr: 'Human Resources',
};
const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship',
};
const EXP_LABELS: Record<string, string> = {
  fresher: 'Fresher', junior: 'Junior', mid: 'Mid-level', senior: 'Senior', lead: 'Lead', staff: 'Staff',
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

const NOTICE_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '15_days',   label: '15 Days' },
  { value: '30_days',   label: '30 Days' },
  { value: '60_days',   label: '60 Days' },
  { value: '90_days',   label: '90 Days' },
];

export default function JobDetailPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', linkedinUrl: '', portfolioUrl: '',
    coverLetter: '', currentCtc: '', expectedCtc: '', noticePeriod: '30_days',
    currentCompany: '', yearsOfExperience: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!slug) return;
    careersApi.getJob(slug)
      .then(setJob)
      .catch(() => setError('Position not found or no longer open.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const updateField = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone) {
      setSubmitError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');

    try {
      const fd = new FormData();
      fd.append('jobId', job._id);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (resume) fd.append('resume', resume);

      await careersApi.apply(fd);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="jd-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Loader2 size={28} color="#818cf8" style={{ animation: 'spin .7s linear infinite' }} />
    </div>
  );

  if (error || !job) return (
    <div className="jd-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <p style={{ color: '#8899bb', fontSize: 16 }}>{error || 'Job not found'}</p>
      <Link href="/careers" className="jd-back"><ArrowLeft size={14} /> Back to Careers</Link>
    </div>
  );

  const dc = DEPT_COLORS[job.department] || DEPT_COLORS.engineering;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="jd-page">
        {/* Navbar */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(7,13,26,.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(99,120,180,.08)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#f0f4ff' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>WebhookOS</span>
          </Link>
          <Link href="/careers" style={{ fontSize: 13, color: '#8899bb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> All Positions
          </Link>
        </nav>

        {/* Header */}
        <div className="jd-header">
          <div className="jd-wrap">
            <Link href="/careers" className="jd-back"><ArrowLeft size={14} /> Back to all positions</Link>
            <div className="jd-dept-badge" style={{ background: dc.bg, border: `1px solid ${dc.border}`, color: dc.color }}>
              <Building2 size={12} /> {DEPT_LABELS[job.department] || job.department}
            </div>
            <h1 className="jd-title">{job.title}</h1>
            <div className="jd-meta">
              <span className="jd-meta-tag"><MapPin size={14} /> {job.location}</span>
              <span className="jd-meta-tag"><Clock size={14} /> {TYPE_LABELS[job.type] || job.type}</span>
              <span className="jd-meta-tag"><Zap size={14} /> {EXP_LABELS[job.experience] || job.experience}</span>
              {job.salaryRange && <span className="jd-meta-tag" style={{ color: '#22c55e' }}>💰 {job.salaryRange}</span>}
              {job.publishedAt && <span className="jd-meta-tag"><CalendarDays size={14} /> Posted {new Date(job.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="jd-wrap">
          {/* Description */}
          {job.description && (
            <div className="jd-section">
              <h3>About the Role</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements?.length > 0 && (
            <div className="jd-section">
              <h3>Requirements</h3>
              <ul>
                {job.requirements.map((r: string, i: number) => (
                  <li key={i}>
                    <div className="jd-check" style={{ background: dc.bg, border: `1px solid ${dc.border}` }}>
                      <Check size={10} color={dc.color} />
                    </div>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nice to have */}
          {job.niceToHave?.length > 0 && (
            <div className="jd-section">
              <h3>Nice to Have</h3>
              <ul>
                {job.niceToHave.map((r: string, i: number) => (
                  <li key={i}>
                    <div className="jd-check" style={{ background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.2)' }}>
                      <Sparkles size={10} color="#eab308" />
                    </div>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Perks */}
          {job.perks?.length > 0 && (
            <div className="jd-section">
              <h3>What We Offer</h3>
              <ul>
                {job.perks.map((r: string, i: number) => (
                  <li key={i}>
                    <div className="jd-check" style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)' }}>
                      <Check size={10} color="#22c55e" />
                    </div>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── APPLY FORM ── */}
          <div id="apply" className="jd-apply">
            {submitted ? (
              <div className="jd-success">
                <div className="jd-success-icon">
                  <Check size={28} color="#22c55e" />
                </div>
                <h3>Application Submitted!</h3>
                <p>Thanks for applying to <strong>{job.title}</strong>. We&apos;ll review your application and get back to you within 5 business days.</p>
              </div>
            ) : (
              <>
                <SectionMascot type="robot" scale={1.3} />
                <h3>Apply for this position</h3>
                <p className="jd-apply-sub">Fill in your details below. Fields marked with * are required.</p>

                {submitError && (
                  <div style={{ background: 'rgba(244,63,94,.08)', border: '1px solid rgba(244,63,94,.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 18, fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <X size={14} /> {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="jd-form">
                    <div className="jd-field">
                      <label className="jd-label"><User size={12} /> Full Name <span className="req">*</span></label>
                      <input className="jd-input" placeholder="John Doe" value={form.fullName} onChange={e => updateField('fullName', e.target.value)} required />
                    </div>
                    <div className="jd-field">
                      <label className="jd-label"><Mail size={12} /> Email <span className="req">*</span></label>
                      <input className="jd-input" type="email" placeholder="john@example.com" value={form.email} onChange={e => updateField('email', e.target.value)} required />
                    </div>
                    <div className="jd-field">
                      <label className="jd-label"><Phone size={12} /> Phone <span className="req">*</span></label>
                      <input className="jd-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => updateField('phone', e.target.value)} required />
                    </div>
                    <div className="jd-field">
                      <label className="jd-label"><Building2 size={12} /> Current Company</label>
                      <input className="jd-input" placeholder="Acme Corp" value={form.currentCompany} onChange={e => updateField('currentCompany', e.target.value)} />
                    </div>
                    <div className="jd-field">
                      <label className="jd-label"><Linkedin size={12} /> LinkedIn</label>
                      <input className="jd-input" placeholder="https://linkedin.com/in/..." value={form.linkedinUrl} onChange={e => updateField('linkedinUrl', e.target.value)} />
                    </div>
                    <div className="jd-field">
                      <label className="jd-label"><Globe size={12} /> Portfolio / GitHub</label>
                      <input className="jd-input" placeholder="https://..." value={form.portfolioUrl} onChange={e => updateField('portfolioUrl', e.target.value)} />
                    </div>
                    <div className="jd-field">
                      <label className="jd-label"><Zap size={12} /> Years of Experience</label>
                      <input className="jd-input" placeholder="e.g. 3 years" value={form.yearsOfExperience} onChange={e => updateField('yearsOfExperience', e.target.value)} />
                    </div>
                    <div className="jd-field">
                      <label className="jd-label"><Clock size={12} /> Notice Period</label>
                      <select className="jd-input" value={form.noticePeriod} onChange={e => updateField('noticePeriod', e.target.value)}>
                        {NOTICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="jd-field">
                      <label className="jd-label"><DollarSign size={12} /> Current CTC</label>
                      <input className="jd-input" placeholder="e.g. ₹8L" value={form.currentCtc} onChange={e => updateField('currentCtc', e.target.value)} />
                    </div>
                    <div className="jd-field">
                      <label className="jd-label"><DollarSign size={12} /> Expected CTC</label>
                      <input className="jd-input" placeholder="e.g. ₹12L" value={form.expectedCtc} onChange={e => updateField('expectedCtc', e.target.value)} />
                    </div>

                    {/* Resume upload */}
                    <div className="jd-field full">
                      <label className="jd-label"><FileText size={12} /> Resume (PDF / DOCX, max 5MB)</label>
                      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setResume(e.target.files?.[0] || null)} />
                      <div className={`jd-upload ${resume ? 'has-file' : ''}`} onClick={() => fileRef.current?.click()}>
                        {resume ? (
                          <div className="jd-upload-file">
                            <FileText size={16} /> {resume.name} ({(resume.size / 1024 / 1024).toFixed(1)} MB)
                          </div>
                        ) : (
                          <>
                            <Upload size={20} color="#475670" />
                            <div className="jd-upload-text">Click to upload your resume</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Cover letter */}
                    <div className="jd-field full">
                      <label className="jd-label"><FileText size={12} /> Cover Letter</label>
                      <textarea className="jd-input" placeholder="Tell us why you're excited about this role..." value={form.coverLetter} onChange={e => updateField('coverLetter', e.target.value)} />
                    </div>

                    {/* Submit */}
                    <div className="jd-submit">
                      <button type="submit" className="jd-btn" disabled={submitting}>
                        {submitting ? <><Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} /> Submitting...</> : <>Submit Application <ArrowRight size={15} /></>}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
