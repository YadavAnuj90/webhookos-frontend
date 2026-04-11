'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase, Plus, Eye, Edit3, Trash2, Send, X, Check,
  ChevronDown, Users, FileText, Zap, Clock, MapPin, Building2,
  Loader2, Search, Filter, ExternalLink, Download, Star,
  AlertTriangle, Archive, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { careersApi } from '@/lib/api';

// ─── Constants ───────────────────────────────────────────────────────────────

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
const TYPE_OPTIONS = [
  { value: 'full_time',   label: 'Full-time' },
  { value: 'part_time',   label: 'Part-time' },
  { value: 'contract',    label: 'Contract' },
  { value: 'internship',  label: 'Internship' },
];
const EXP_OPTIONS = [
  { value: 'fresher', label: 'Fresher' },
  { value: 'junior',  label: 'Junior' },
  { value: 'mid',     label: 'Mid-level' },
  { value: 'senior',  label: 'Senior' },
  { value: 'lead',    label: 'Lead' },
  { value: 'staff',   label: 'Staff' },
];
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  draft:       { bg: 'var(--ybg)', text: 'var(--yellow)', border: 'var(--ybd)' },
  open:        { bg: 'var(--gbg)', text: 'var(--green)',  border: 'var(--gbd)' },
  closed:      { bg: 'var(--rbg)', text: 'var(--red)',    border: 'var(--rbd)' },
  on_hold:     { bg: 'var(--obg)', text: 'var(--orange)', border: 'var(--obd)' },
  // Application statuses
  new:         { bg: 'var(--bbg)', text: 'var(--blue)',   border: 'var(--bbd)' },
  reviewed:    { bg: 'var(--ybg)', text: 'var(--yellow)', border: 'var(--ybd)' },
  shortlisted: { bg: 'var(--abg)', text: 'var(--a)',      border: 'var(--abd)' },
  interview:   { bg: 'rgba(168,85,247,.1)', text: '#a855f7', border: 'rgba(168,85,247,.22)' },
  offered:     { bg: 'rgba(34,197,94,.15)', text: '#22c55e', border: 'rgba(34,197,94,.3)' },
  hired:       { bg: 'var(--gbg)', text: 'var(--green)',  border: 'var(--gbd)' },
  rejected:    { bg: 'var(--rbg)', text: 'var(--red)',    border: 'var(--rbd)' },
  withdrawn:   { bg: 'var(--t4)',  text: 'var(--t3)',     border: 'var(--b2)' },
};
const APP_STATUSES = ['new', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected', 'withdrawn'];

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: c.bg, border: `1px solid ${c.border}`, color: c.text, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--mono)' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.text }} /> {status.replace('_', ' ')}
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminCareersPage() {
  const [tab, setTab] = useState<'jobs' | 'applications'>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [viewApp, setViewApp] = useState<any>(null);
  const [appFilters, setAppFilters] = useState({ jobId: '', status: '', page: 1 });
  const qc = useQueryClient();

  // ── Queries ──
  const { data: stats } = useQuery({ queryKey: ['careers-stats'], queryFn: careersApi.adminStats });
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({ queryKey: ['careers-jobs'], queryFn: () => careersApi.adminListJobs() });
  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['careers-apps', appFilters],
    queryFn: () => careersApi.adminListApps(appFilters),
    enabled: tab === 'applications',
  });

  // ── Mutations ──
  const createJob = useMutation({ mutationFn: careersApi.adminCreateJob, onSuccess: () => { qc.invalidateQueries({ queryKey: ['careers-jobs'] }); qc.invalidateQueries({ queryKey: ['careers-stats'] }); setShowJobForm(false); } });
  const updateJob = useMutation({ mutationFn: ({ id, data }: any) => careersApi.adminUpdateJob(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['careers-jobs'] }); setEditingJob(null); } });
  const publishJob = useMutation({ mutationFn: careersApi.adminPublishJob, onSuccess: () => { qc.invalidateQueries({ queryKey: ['careers-jobs'] }); qc.invalidateQueries({ queryKey: ['careers-stats'] }); } });
  const closeJob = useMutation({ mutationFn: careersApi.adminCloseJob, onSuccess: () => { qc.invalidateQueries({ queryKey: ['careers-jobs'] }); qc.invalidateQueries({ queryKey: ['careers-stats'] }); } });
  const deleteJob = useMutation({ mutationFn: careersApi.adminDeleteJob, onSuccess: () => { qc.invalidateQueries({ queryKey: ['careers-jobs'] }); qc.invalidateQueries({ queryKey: ['careers-stats'] }); } });
  const updateAppStatus = useMutation({ mutationFn: ({ id, data }: any) => careersApi.adminUpdateApp(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['careers-apps'] }); qc.invalidateQueries({ queryKey: ['careers-stats'] }); } });

  const apps = appsData?.items || [];
  const totalPages = appsData?.pages || 1;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--t1)', letterSpacing: '-1px', margin: 0 }}>Careers Management</h1>
          <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4 }}>Post jobs, review applications, manage your hiring pipeline.</p>
        </div>
        <button onClick={() => { setEditingJob(null); setShowJobForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--a), #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Plus size={15} /> Post New Job
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Open Jobs', val: stats.openJobs, icon: Briefcase, color: 'var(--green)' },
            { label: 'Total Applications', val: stats.totalApplications, icon: Users, color: 'var(--blue)' },
            { label: 'New (Unreviewed)', val: stats.newApplications, icon: AlertTriangle, color: 'var(--yellow)' },
            { label: 'Shortlisted', val: stats.shortlisted, icon: Star, color: 'var(--a)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r3)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${s.color}14`, border: `1px solid ${s.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={15} color={s.color} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--t1)', fontFamily: 'var(--mono)' }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid var(--b1)' }}>
        {(['jobs', 'applications'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--a)' : '2px solid transparent',
            color: tab === t ? 'var(--t1)' : 'var(--t3)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
          }}>
            {t === 'jobs' ? <><Briefcase size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />Jobs ({jobs.length})</> : <><Users size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />Applications ({appsData?.total || 0})</>}
          </button>
        ))}
      </div>

      {/* ── JOBS TAB ── */}
      {tab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobsLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3)' }}><Loader2 size={20} style={{ animation: 'spin .7s linear infinite' }} /></div>
          ) : jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--t3)', fontSize: 14 }}>No jobs posted yet. Click &quot;Post New Job&quot; to create your first listing.</div>
          ) : jobs.map((job: any) => (
            <div key={job._id} style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r2)', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>{job.title}</span>
                  <StatusBadge status={job.status} />
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--t3)', flexWrap: 'wrap' }}>
                  <span><Building2 size={11} style={{ verticalAlign: '-1px' }} /> {DEPT_OPTIONS.find(d => d.value === job.department)?.label || job.department}</span>
                  <span><MapPin size={11} style={{ verticalAlign: '-1px' }} /> {job.location}</span>
                  <span><Users size={11} style={{ verticalAlign: '-1px' }} /> {job.applicationCount || 0} applications</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {job.status === 'draft' && (
                  <button onClick={() => publishJob.mutate(job._id)} title="Publish" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--gbd)', background: 'var(--gbg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Send size={13} color="var(--green)" />
                  </button>
                )}
                {job.status === 'open' && (
                  <button onClick={() => closeJob.mutate(job._id)} title="Close" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--rbd)', background: 'var(--rbg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Archive size={13} color="var(--red)" />
                  </button>
                )}
                <button onClick={() => { setEditingJob(job); setShowJobForm(true); }} title="Edit" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--b2)', background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Edit3 size={13} color="var(--t2)" />
                </button>
                <a href={`/careers/${job.slug}`} target="_blank" title="Preview" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--b2)', background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ExternalLink size={13} color="var(--t2)" />
                </a>
                {job.applicationCount === 0 && (
                  <button onClick={() => { if (confirm('Delete this job?')) deleteJob.mutate(job._id); }} title="Delete" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--rbd)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Trash2 size={13} color="var(--red)" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── APPLICATIONS TAB ── */}
      {tab === 'applications' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <select value={appFilters.jobId} onChange={e => setAppFilters(f => ({ ...f, jobId: e.target.value, page: 1 }))} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--b2)', background: 'var(--card)', color: 'var(--t1)', fontSize: 12, fontFamily: 'inherit' }}>
              <option value="">All Jobs</option>
              {jobs.map((j: any) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
            <select value={appFilters.status} onChange={e => setAppFilters(f => ({ ...f, status: e.target.value, page: 1 }))} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--b2)', background: 'var(--card)', color: 'var(--t1)', fontSize: 12, fontFamily: 'inherit' }}>
              <option value="">All Statuses</option>
              {APP_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r3)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--b1)' }}>
                  {['Candidate', 'Job', 'Status', 'Applied', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appsLoading ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--t3)' }}><Loader2 size={18} style={{ animation: 'spin .7s linear infinite' }} /></td></tr>
                ) : apps.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--t3)' }}>No applications found.</td></tr>
                ) : apps.map((app: any) => (
                  <tr key={app._id} style={{ borderBottom: '1px solid var(--b1)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--t1)' }}>{app.fullName}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>{app.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--t2)', fontSize: 12 }}>{app.jobTitle}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={app.status} /></td>
                    <td style={{ padding: '12px 16px', color: 'var(--t3)', fontSize: 11, fontFamily: 'var(--mono)' }}>{new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setViewApp(app)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--b2)', background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Eye size={12} color="var(--t2)" />
                        </button>
                        {app.resumeUrl && (
                          <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${app.resumeUrl}`} target="_blank" style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--b2)', background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Download size={12} color="var(--t2)" />
                          </a>
                        )}
                        <select
                          value={app.status}
                          onChange={e => updateAppStatus.mutate({ id: app._id, data: { status: e.target.value } })}
                          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--b2)', background: 'var(--card2)', color: 'var(--t2)', fontSize: 10, fontFamily: 'var(--mono)', cursor: 'pointer' }}
                        >
                          {APP_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 18 }}>
              <button disabled={appFilters.page <= 1} onClick={() => setAppFilters(f => ({ ...f, page: f.page - 1 }))} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--b2)', background: 'var(--card)', color: 'var(--t2)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronLeft size={13} /> Prev
              </button>
              <span style={{ padding: '6px 12px', fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{appFilters.page} / {totalPages}</span>
              <button disabled={appFilters.page >= totalPages} onClick={() => setAppFilters(f => ({ ...f, page: f.page + 1 }))} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--b2)', background: 'var(--card)', color: 'var(--t2)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Next <ChevronRight size={13} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── JOB FORM MODAL ── */}
      {showJobForm && <JobFormModal job={editingJob} onClose={() => { setShowJobForm(false); setEditingJob(null); }} onSave={(data: any) => {
        if (editingJob) updateJob.mutate({ id: editingJob._id, data });
        else createJob.mutate(data);
      }} saving={createJob.isPending || updateJob.isPending} />}

      {/* ── APPLICATION DETAIL MODAL ── */}
      {viewApp && <AppDetailModal app={viewApp} onClose={() => setViewApp(null)} onStatusChange={(status: string, notes: string) => {
        updateAppStatus.mutate({ id: viewApp._id, data: { status, adminNotes: notes } });
        setViewApp(null);
      }} />}
    </div>
  );
}

// ─── Job Form Modal ──────────────────────────────────────────────────────────

function JobFormModal({ job, onClose, onSave, saving }: { job: any; onClose: () => void; onSave: (d: any) => void; saving: boolean }) {
  const [form, setForm] = useState({
    title: job?.title || '', department: job?.department || 'engineering', location: job?.location || 'Remote',
    type: job?.type || 'full_time', experience: job?.experience || 'mid', salaryRange: job?.salaryRange || '',
    shortDescription: job?.shortDescription || '', description: job?.description || '',
    requirements: job?.requirements?.join('\n') || '', niceToHave: job?.niceToHave?.join('\n') || '',
    perks: job?.perks?.join('\n') || '',
  });
  const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inp = { style: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--b2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const } };
  const lbl = { style: { fontSize: 11, fontWeight: 700 as const, color: 'var(--t3)', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: 4 } };

  const submit = () => {
    onSave({
      ...form,
      requirements: form.requirements.split('\n').map(s => s.trim()).filter(Boolean),
      niceToHave: form.niceToHave.split('\n').map(s => s.trim()).filter(Boolean),
      perks: form.perks.split('\n').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--r4)', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--t1)', margin: 0 }}>{job ? 'Edit Job' : 'Post New Job'}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--b2)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} color="var(--t3)" /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ gridColumn: '1/-1' }}><div {...lbl}>Job Title *</div><input {...inp} placeholder="Senior Backend Engineer" value={form.title} onChange={e => u('title', e.target.value)} /></div>
          <div><div {...lbl}>Department</div><select {...inp} value={form.department} onChange={e => u('department', e.target.value)}>{DEPT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div><div {...lbl}>Location</div><input {...inp} placeholder="Remote / Bangalore / Hybrid" value={form.location} onChange={e => u('location', e.target.value)} /></div>
          <div><div {...lbl}>Job Type</div><select {...inp} value={form.type} onChange={e => u('type', e.target.value)}>{TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div><div {...lbl}>Experience</div><select {...inp} value={form.experience} onChange={e => u('experience', e.target.value)}>{EXP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
          <div style={{ gridColumn: '1/-1' }}><div {...lbl}>Salary Range (optional)</div><input {...inp} placeholder="₹8L – ₹15L per annum" value={form.salaryRange} onChange={e => u('salaryRange', e.target.value)} /></div>
          <div style={{ gridColumn: '1/-1' }}><div {...lbl}>Short Description (for cards)</div><input {...inp} placeholder="One-line teaser shown in job listings" value={form.shortDescription} onChange={e => u('shortDescription', e.target.value)} /></div>
          <div style={{ gridColumn: '1/-1' }}><div {...lbl}>Full Description</div><textarea {...inp} style={{ ...inp.style, minHeight: 120 }} placeholder="About the role, team, projects..." value={form.description} onChange={e => u('description', e.target.value)} /></div>
          <div style={{ gridColumn: '1/-1' }}><div {...lbl}>Requirements (one per line)</div><textarea {...inp} style={{ ...inp.style, minHeight: 80 }} placeholder="3+ years Node.js experience&#10;Strong understanding of databases..." value={form.requirements} onChange={e => u('requirements', e.target.value)} /></div>
          <div style={{ gridColumn: '1/-1' }}><div {...lbl}>Nice to Have (one per line)</div><textarea {...inp} style={{ ...inp.style, minHeight: 60 }} placeholder="Experience with WebSockets&#10;Open-source contributions..." value={form.niceToHave} onChange={e => u('niceToHave', e.target.value)} /></div>
          <div style={{ gridColumn: '1/-1' }}><div {...lbl}>Perks (one per line)</div><textarea {...inp} style={{ ...inp.style, minHeight: 60 }} placeholder="Remote-first culture&#10;₹50K learning budget..." value={form.perks} onChange={e => u('perks', e.target.value)} /></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--b2)', background: 'none', color: 'var(--t2)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={submit} disabled={saving || !form.title} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, var(--a), #7c3aed)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? .6 : 1 }}>
            {saving ? <><Loader2 size={13} style={{ animation: 'spin .7s linear infinite' }} /> Saving...</> : <><Check size={14} /> {job ? 'Update Job' : 'Create as Draft'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Application Detail Modal ────────────────────────────────────────────────

function AppDetailModal({ app, onClose, onStatusChange }: { app: any; onClose: () => void; onStatusChange: (s: string, n: string) => void }) {
  const [status, setStatus] = useState(app.status);
  const [notes, setNotes] = useState(app.adminNotes || '');
  const f = (l: string, v: string) => v ? <div style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13, color: 'var(--t1)' }}>{v}</div></div> : null;
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || '';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--r4)', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--t1)', margin: 0 }}>{app.fullName}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--b2)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} color="var(--t3)" /></button>
        </div>

        <div style={{ marginBottom: 16 }}><StatusBadge status={app.status} /> <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 8 }}>Applied for: <strong style={{ color: 'var(--t2)' }}>{app.jobTitle}</strong></span></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {f('Email', app.email)}
          {f('Phone', app.phone)}
          {f('Current Company', app.currentCompany)}
          {f('Experience', app.yearsOfExperience)}
          {f('Current CTC', app.currentCtc)}
          {f('Expected CTC', app.expectedCtc)}
          {f('Notice Period', app.noticePeriod?.replace('_', ' '))}
          {f('LinkedIn', app.linkedinUrl)}
          {f('Portfolio', app.portfolioUrl)}
        </div>

        {app.resumeUrl && (
          <div style={{ marginBottom: 16 }}>
            <a href={`${apiBase}${app.resumeUrl}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'var(--abg)', border: '1px solid var(--abd)', color: 'var(--a)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              <Download size={13} /> Download Resume {app.resumeFilename && `(${app.resumeFilename})`}
            </a>
          </div>
        )}

        {app.coverLetter && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Cover Letter</div>
            <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.65, background: 'var(--bg)', borderRadius: 10, padding: 16, border: '1px solid var(--b1)', whiteSpace: 'pre-line' }}>{app.coverLetter}</div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--b1)', paddingTop: 18, marginTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Update Status</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--b2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 12, fontFamily: 'inherit' }}>
              {APP_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <button onClick={() => onStatusChange(status, notes)} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, var(--a), #7c3aed)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal notes..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--b2)', background: 'var(--bg)', color: 'var(--t1)', fontSize: 12, fontFamily: 'inherit', minHeight: 60, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>
    </div>
  );
}
