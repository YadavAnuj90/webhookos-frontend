'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Activity, ArrowLeft, ArrowRight, Check, Upload, Loader2,
  Linkedin, Globe, Phone, Mail, User, FileText, DollarSign, Clock,
  Building2, Zap, X, Briefcase,
} from 'lucide-react';
import { careersApi } from '@/lib/api';
import { SectionMascot } from '@/components/Mascots';

const CSS = `
  @keyframes ga-check { from{transform:scale(0)} to{transform:scale(1)} }
  .ga-page{min-height:100vh;background:#070d1a;color:#f0f4ff;font-family:'Inter',sans-serif}
  .ga-wrap{max-width:680px;margin:0 auto;padding:0 28px}
  .ga-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#8899bb;text-decoration:none;margin-bottom:28px;transition:color .2s}
  .ga-back:hover{color:#f0f4ff}
  .ga-card{background:rgba(15,29,48,.7);border:1px solid rgba(99,120,180,.12);border-radius:18px;padding:36px 32px;margin-bottom:60px}
  .ga-card h2{font-size:26px;font-weight:900;color:#f0f4ff;margin:0 0 6px;letter-spacing:-1px}
  .ga-sub{font-size:13.5px;color:#8899bb;margin-bottom:28px;line-height:1.6}
  .ga-form{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .ga-field{display:flex;flex-direction:column;gap:5px}
  .ga-field.full{grid-column:1/-1}
  .ga-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#8899bb;display:flex;align-items:center;gap:5px}
  .ga-label .req{color:#f43f5e}
  .ga-input{background:rgba(7,13,26,.8);border:1px solid rgba(99,120,180,.15);border-radius:10px;padding:11px 14px;color:#f0f4ff;font-size:13px;font-family:inherit;transition:border-color .2s;outline:none;width:100%;box-sizing:border-box}
  .ga-input:focus{border-color:rgba(91,108,248,.5)}
  .ga-input::placeholder{color:#475670}
  textarea.ga-input{min-height:120px;resize:vertical}
  select.ga-input{appearance:none;cursor:pointer}
  .ga-upload{border:2px dashed rgba(99,120,180,.2);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all .2s}
  .ga-upload:hover{border-color:rgba(91,108,248,.4);background:rgba(91,108,248,.03)}
  .ga-upload.has-file{border-color:rgba(34,197,94,.3);background:rgba(34,197,94,.03)}
  .ga-upload-file{display:flex;align-items:center;gap:8px;justify-content:center;font-size:13px;color:#22c55e}
  .ga-submit{grid-column:1/-1;display:flex;justify-content:flex-end;gap:12px;margin-top:8px}
  .ga-btn{padding:13px 32px;border-radius:10px;border:none;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .22s;display:inline-flex;align-items:center;gap:8px}
  .ga-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(79,70,229,.5)}
  .ga-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
  .ga-success{text-align:center;padding:48px 24px}
  .ga-success-icon{width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,.1);border:2px solid rgba(34,197,94,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:ga-check .4s ease}
  .ga-success h3{font-size:22px;font-weight:900;color:#f0f4ff;margin-bottom:10px}
  .ga-success p{font-size:14px;color:#8899bb;max-width:400px;margin:0 auto}
  @media(max-width:640px){.ga-form{grid-template-columns:1fr}}
`;

const DEPT_OPTIONS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'product',     label: 'Product' },
  { value: 'design',      label: 'Design' },
  { value: 'marketing',   label: 'Marketing' },
  { value: 'sales',       label: 'Sales' },
  { value: 'support',     label: 'Support' },
  { value: 'operations',  label: 'Operations' },
  { value: 'hr',          label: 'Human Resources' },
];

const NOTICE_OPTIONS = [
  { value: 'immediate', label: 'Immediate' },
  { value: '15_days',   label: '15 Days' },
  { value: '30_days',   label: '30 Days' },
  { value: '60_days',   label: '60 Days' },
  { value: '90_days',   label: '90 Days' },
];

export default function GeneralApplicationPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', linkedinUrl: '', portfolioUrl: '',
    coverLetter: '', currentCtc: '', expectedCtc: '', noticePeriod: '30_days',
    currentCompany: '', yearsOfExperience: '', preferredDepartment: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('jobId', 'general');
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (resume) fd.append('resume', resume);
      await careersApi.apply(fd);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ga-page">
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

        <div style={{ paddingTop: 100 }}>
          <div className="ga-wrap">
            <Link href="/careers" className="ga-back"><ArrowLeft size={14} /> Back to careers</Link>

            <div className="ga-card">
              {submitted ? (
                <div className="ga-success">
                  <div className="ga-success-icon"><Check size={28} color="#22c55e" /></div>
                  <h3>Application Received!</h3>
                  <p>Thanks for your interest in WebhookOS. We&apos;ll review your profile and reach out when we have a role that matches your skills.</p>
                  <Link href="/careers" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, color: '#818cf8', fontSize: 13, textDecoration: 'none' }}>
                    <ArrowLeft size={14} /> Back to Careers
                  </Link>
                </div>
              ) : (
                <>
                  <SectionMascot type="duck" scale={1.4} />
                  <h2>General Application</h2>
                  <p className="ga-sub">
                    Don&apos;t see a role that fits? No worries — tell us about yourself and we&apos;ll keep you in mind for future openings.
                  </p>

                  {error && (
                    <div style={{ background: 'rgba(244,63,94,.08)', border: '1px solid rgba(244,63,94,.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 18, fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <X size={14} /> {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="ga-form">
                      <div className="ga-field">
                        <label className="ga-label"><User size={12} /> Full Name <span className="req">*</span></label>
                        <input className="ga-input" placeholder="John Doe" value={form.fullName} onChange={e => u('fullName', e.target.value)} required />
                      </div>
                      <div className="ga-field">
                        <label className="ga-label"><Mail size={12} /> Email <span className="req">*</span></label>
                        <input className="ga-input" type="email" placeholder="john@example.com" value={form.email} onChange={e => u('email', e.target.value)} required />
                      </div>
                      <div className="ga-field">
                        <label className="ga-label"><Phone size={12} /> Phone <span className="req">*</span></label>
                        <input className="ga-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => u('phone', e.target.value)} required />
                      </div>
                      <div className="ga-field">
                        <label className="ga-label"><Briefcase size={12} /> Preferred Department</label>
                        <select className="ga-input" value={form.preferredDepartment} onChange={e => u('preferredDepartment', e.target.value)}>
                          <option value="">Any / Open to all</option>
                          {DEPT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="ga-field">
                        <label className="ga-label"><Building2 size={12} /> Current Company</label>
                        <input className="ga-input" placeholder="Acme Corp" value={form.currentCompany} onChange={e => u('currentCompany', e.target.value)} />
                      </div>
                      <div className="ga-field">
                        <label className="ga-label"><Zap size={12} /> Years of Experience</label>
                        <input className="ga-input" placeholder="e.g. 3 years" value={form.yearsOfExperience} onChange={e => u('yearsOfExperience', e.target.value)} />
                      </div>
                      <div className="ga-field">
                        <label className="ga-label"><Linkedin size={12} /> LinkedIn</label>
                        <input className="ga-input" placeholder="https://linkedin.com/in/..." value={form.linkedinUrl} onChange={e => u('linkedinUrl', e.target.value)} />
                      </div>
                      <div className="ga-field">
                        <label className="ga-label"><Globe size={12} /> Portfolio / GitHub</label>
                        <input className="ga-input" placeholder="https://..." value={form.portfolioUrl} onChange={e => u('portfolioUrl', e.target.value)} />
                      </div>
                      <div className="ga-field">
                        <label className="ga-label"><DollarSign size={12} /> Current CTC</label>
                        <input className="ga-input" placeholder="e.g. ₹8L" value={form.currentCtc} onChange={e => u('currentCtc', e.target.value)} />
                      </div>
                      <div className="ga-field">
                        <label className="ga-label"><DollarSign size={12} /> Expected CTC</label>
                        <input className="ga-input" placeholder="e.g. ₹12L" value={form.expectedCtc} onChange={e => u('expectedCtc', e.target.value)} />
                      </div>
                      <div className="ga-field">
                        <label className="ga-label"><Clock size={12} /> Notice Period</label>
                        <select className="ga-input" value={form.noticePeriod} onChange={e => u('noticePeriod', e.target.value)}>
                          {NOTICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>

                      {/* Resume */}
                      <div className="ga-field full">
                        <label className="ga-label"><FileText size={12} /> Resume (PDF / DOCX, max 5MB)</label>
                        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setResume(e.target.files?.[0] || null)} />
                        <div className={`ga-upload ${resume ? 'has-file' : ''}`} onClick={() => fileRef.current?.click()}>
                          {resume ? (
                            <div className="ga-upload-file"><FileText size={16} /> {resume.name} ({(resume.size / 1024 / 1024).toFixed(1)} MB)</div>
                          ) : (
                            <>
                              <Upload size={20} color="#475670" />
                              <div style={{ fontSize: 12.5, color: '#8899bb', marginTop: 8 }}>Click to upload your resume</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Cover letter */}
                      <div className="ga-field full">
                        <label className="ga-label"><FileText size={12} /> Tell us about yourself</label>
                        <textarea className="ga-input" placeholder="What excites you about WebhookOS? What kind of role are you looking for?" value={form.coverLetter} onChange={e => u('coverLetter', e.target.value)} />
                      </div>

                      <div className="ga-submit">
                        <button type="submit" className="ga-btn" disabled={submitting}>
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
      </div>
    </>
  );
}
