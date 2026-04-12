'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpointsApi } from '@/lib/api';
import { useProjectStore } from '@/lib/store';
import { MaintenanceWindow } from '@/lib/types';
import { Globe, Plus, Pause, Play, Trash2, RotateCcw, Copy, ChevronRight, X, Check, ChevronDown, AlertCircle, Shield, Database, Cloud, GitBranch, Lock, Layers, FlaskConical, Settings2, Sparkles, CheckSquare, Square, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';
import Empty from '@/components/ui/Empty';
import { SkeletonTable } from '@/components/ui/Skeleton';
import AiDebuggerModal from '@/components/ai/AiDebuggerModal';
import PiiDetectorModal from '@/components/ai/PiiDetectorModal';

// ─── Shared helpers ──────────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '18px 0 12px' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

function PemTextarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      <textarea
        className="input" rows={4} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'}
        style={{ fontFamily: 'var(--font-mono)', fontSize: 10, resize: 'vertical', lineHeight: 1.5 }}
      />
    </div>
  );
}

// ─── Ed25519 Public Key reveal ────────────────────────────────────────────────
function PublicKeyModal({ publicKey, onClose }: { publicKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(publicKey); setCopied(true); toast.success('Public key copied'); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Ed25519 Public Key</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 9, marginBottom: 14 }}>
          <AlertCircle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>
            Save this public key. It's used to verify webhook signatures on your server. You can retrieve it from the endpoint detail page later.
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <textarea
            readOnly value={publicKey} rows={8}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent2)', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
          />
          <button onClick={copy} className="btn-icon btn-sm" style={{ position: 'absolute', top: 8, right: 8 }} title="Copy">
            {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Modal (extended with Groups 7 fields) ────────────────────────────
function CreateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();

  // Accordion open states
  const [openSections, setOpenSections] = useState<Record<string,boolean>>({});
  const toggleSection = (k: string) => setOpenSections(p => ({ ...p, [k]: !p[k] }));
  const [showPiiDetector, setShowPiiDetector] = useState(false);

  const [form, setForm] = useState({
    // Existing
    name: '', url: '', eventTypes: '', timeoutMs: 30000,
    // Group 7 new
    signatureScheme: 'hmac-sha256' as 'hmac-sha256' | 'ed25519',
    endpointType:    'http'         as 'http' | 's3' | 'gcs',
    authType:        'none'         as 'none' | 'bearer_token' | 'oauth2' | 'mtls',
    deduplicationWindowSecs: 0,
    // Bearer
    bearerToken: '',
    // OAuth2
    oauth2TokenUrl: '', oauth2ClientId: '', oauth2ClientSecret: '', oauth2Scope: '', oauth2Audience: '',
    // mTLS
    mtlsCert: '', mtlsKey: '', mtlsCaCert: '',
    // Storage
    storageBucket: '', storageRegion: '', storagePrefix: '',
    storageAccessKeyId: '', storageSecretAccessKey: '',
    storageServiceAccountKey: '',
    // NEW: Delivery Reliability
    maxRetries: 0,
    retryStrategy: 'exponential' as 'exponential' | 'linear' | 'fixed',
    retryFixedDelaySeconds: 60,
    // NEW: Batching
    batchingEnabled: false,
    batchWindowSeconds: 5,
    batchMaxSize: 100,
    maxPayloadBytes: 0,
    // NEW: Privacy
    piiFieldsInput: '', // current tag input
    piiFields: [] as string[],
    allowedIpsInput: '',
    allowedIps: [] as string[],
    // NEW: Shadow
    shadowUrl: '',
    // NEW: Canary
    canaryEnabled: false,
    canaryUrl: '',
    canaryPercent: 0,
  });

  // Maintenance windows list
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([]);
  const [mwForm, setMwForm] = useState({ dayOfWeek: 0, startHour: 0, endHour: 1 });

  const addWindow = () => {
    setMaintenanceWindows(p => [...p, { ...mwForm }]);
    setMwForm({ dayOfWeek: 0, startHour: 0, endHour: 1 });
  };
  const removeWindow = (i: number) => setMaintenanceWindows(p => p.filter((_, idx) => idx !== i));

  const addTag = (field: 'piiFields' | 'allowedIps', inputField: 'piiFieldsInput' | 'allowedIpsInput') => {
    const val = form[inputField].trim();
    if (val && !form[field].includes(val)) {
      setForm(p => ({ ...p, [field]: [...p[field], val], [inputField]: '' }));
    } else {
      setForm(p => ({ ...p, [inputField]: '' }));
    }
  };
  const removeTag = (field: 'piiFields' | 'allowedIps', tag: string) =>
    setForm(p => ({ ...p, [field]: p[field].filter(t => t !== tag) }));

  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));
  const fNum = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: +e.target.value }));

  const [publicKey, setPublicKey] = useState<string | null>(null);

  const buildPayload = () => {
    const base: any = {
      name: form.name,
      eventTypes: form.eventTypes ? form.eventTypes.split(',').map(s => s.trim()).filter(Boolean) : [],
      timeoutMs: form.timeoutMs,
      signatureScheme: form.signatureScheme,
      endpointType:    form.endpointType,
      authType:        form.authType,
    };
    if (form.endpointType === 'http') base.url = form.url;
    if (form.deduplicationWindowSecs > 0) base.deduplicationWindowSecs = form.deduplicationWindowSecs;

    if (form.authType === 'bearer_token') {
      base.bearerToken = form.bearerToken;
    } else if (form.authType === 'oauth2') {
      base.oauth2Config = { tokenUrl: form.oauth2TokenUrl, clientId: form.oauth2ClientId, clientSecret: form.oauth2ClientSecret, scope: form.oauth2Scope || undefined, audience: form.oauth2Audience || undefined };
    } else if (form.authType === 'mtls') {
      base.mtlsConfig = { certificate: form.mtlsCert, privateKey: form.mtlsKey, ...(form.mtlsCaCert ? { caCertificate: form.mtlsCaCert } : {}) };
    }

    if (form.endpointType === 's3') {
      base.storageConfig = { bucket: form.storageBucket, region: form.storageRegion || undefined, prefix: form.storagePrefix || undefined, accessKeyId: form.storageAccessKeyId || undefined, secretAccessKey: form.storageSecretAccessKey || undefined };
    } else if (form.endpointType === 'gcs') {
      base.storageConfig = { bucket: form.storageBucket, prefix: form.storagePrefix || undefined, serviceAccountKey: form.storageServiceAccountKey || undefined };
    }

    // NEW: Delivery reliability
    if (form.maxRetries > 0) { base.maxRetries = form.maxRetries; base.retryStrategy = form.retryStrategy; }
    if (form.retryStrategy === 'fixed') base.retryFixedDelaySeconds = form.retryFixedDelaySeconds;
    if (maintenanceWindows.length > 0) base.maintenanceWindows = maintenanceWindows;

    // NEW: Batching
    if (form.batchingEnabled) { base.batchingEnabled = true; base.batchWindowSeconds = form.batchWindowSeconds; base.batchMaxSize = form.batchMaxSize; }
    if (form.maxPayloadBytes > 0) base.maxPayloadBytes = form.maxPayloadBytes;

    // NEW: Privacy
    if (form.piiFields.length > 0) base.piiFields = form.piiFields;
    if (form.allowedIps.length > 0) base.allowedIps = form.allowedIps;

    // NEW: Shadow / canary
    if (form.shadowUrl) base.shadowUrl = form.shadowUrl;
    if (form.canaryEnabled && form.canaryUrl) { base.canaryUrl = form.canaryUrl; base.canaryPercent = form.canaryPercent; }

    return base;
  };

  const mut = useMutation({
    mutationFn: (d: any) => endpointsApi.create(PID, d),
    onSuccess: (data: any) => {
      toast.success('Endpoint created');
      qc.invalidateQueries({ queryKey: ['endpoints'] });
      if (data?.ed25519PublicKey) { setPublicKey(data.ed25519PublicKey); }
      else { onClose(); }
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const submit = (e: React.FormEvent) => { e.preventDefault(); mut.mutate(buildPayload()); };

  // Scheme toggle pill
  const SchemePill = ({ val, label }: { val: 'hmac-sha256' | 'ed25519'; label: string }) => (
    <button type="button" onClick={() => setForm(p => ({ ...p, signatureScheme: val }))}
      style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', background: form.signatureScheme === val ? 'var(--bg2)' : 'transparent', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: form.signatureScheme === val ? 700 : 400, color: form.signatureScheme === val ? 'var(--text)' : 'var(--text3)', cursor: 'pointer' }}
    >{label}</button>
  );

  // Show public key reveal if returned
  if (publicKey) return <PublicKeyModal publicKey={publicKey} onClose={onClose} />;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ width: 600, maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create Endpoint</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        <form onSubmit={submit}>
          {/* ── Basic ──────────────────────────────────── */}
          <SectionDivider label="Basic Info" />
          <div className="field"><label className="label">Name <span style={{ color: 'var(--red)' }}>*</span></label>
            <input className="input" placeholder="My API Server" value={form.name} onChange={f('name')} required />
          </div>
          {form.endpointType === 'http' && (
            <div className="field"><label className="label">URL <span style={{ color: 'var(--red)' }}>*</span></label>
              <input className="input" type="url" placeholder="https://api.example.com/webhooks" value={form.url} onChange={f('url')} required />
            </div>
          )}
          <div className="field"><label className="label">Event Types <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(comma-separated, blank = all)</span></label>
            <input className="input" placeholder="payment.success, order.created" value={form.eventTypes} onChange={f('eventTypes')} />
          </div>
          <div className="field"><label className="label">Timeout (ms)</label>
            <input className="input" type="number" value={form.timeoutMs} onChange={fNum('timeoutMs')} />
          </div>

          {/* ── Delivery ──────────────────────────────── */}
          <SectionDivider label="Delivery Configuration" />

          {/* Endpoint Type */}
          <div className="field">
            <label className="label">Endpoint Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {([
                { val: 'http', icon: Globe,    label: 'HTTP',        sub: 'Any HTTPS URL' },
                { val: 's3',   icon: Database, label: 'Amazon S3',   sub: 'S3 bucket' },
                { val: 'gcs',  icon: Cloud,    label: 'Google GCS',  sub: 'GCS bucket' },
              ] as const).map(({ val, icon: Icon, label, sub }) => (
                <button key={val} type="button"
                  onClick={() => setForm(p => ({ ...p, endpointType: val }))}
                  style={{ padding: '10px 8px', borderRadius: 9, border: `1px solid ${form.endpointType === val ? 'var(--accent2)' : 'var(--border)'}`, background: form.endpointType === val ? 'rgba(99,102,241,.08)' : 'var(--bg3)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  <Icon size={15} color={form.endpointType === val ? 'var(--accent2)' : 'var(--text3)'} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: form.endpointType === val ? 'var(--text)' : 'var(--text3)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* S3 fields */}
          {form.endpointType === 's3' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field"><label className="label">Bucket <span style={{ color: 'var(--red)' }}>*</span></label><input className="input" placeholder="my-webhooks-bucket" value={form.storageBucket} onChange={f('storageBucket')} required /></div>
                <div className="field"><label className="label">Region</label><input className="input" placeholder="us-east-1" value={form.storageRegion} onChange={f('storageRegion')} /></div>
              </div>
              <div className="field"><label className="label">Key Prefix</label><input className="input" placeholder="webhooks/" value={form.storagePrefix} onChange={f('storagePrefix')} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field"><label className="label">Access Key ID</label><input className="input" placeholder="AKIA…" value={form.storageAccessKeyId} onChange={f('storageAccessKeyId')} /></div>
                <div className="field"><label className="label">Secret Access Key</label><input className="input" type="password" placeholder="••••••••" value={form.storageSecretAccessKey} onChange={f('storageSecretAccessKey')} /></div>
              </div>
            </>
          )}

          {/* GCS fields */}
          {form.endpointType === 'gcs' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field"><label className="label">Bucket <span style={{ color: 'var(--red)' }}>*</span></label><input className="input" placeholder="my-gcs-bucket" value={form.storageBucket} onChange={f('storageBucket')} required /></div>
                <div className="field"><label className="label">Key Prefix</label><input className="input" placeholder="webhooks/" value={form.storagePrefix} onChange={f('storagePrefix')} /></div>
              </div>
              <div className="field">
                <label className="label">Service Account Key <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(JSON string)</span></label>
                <textarea className="input" rows={4} placeholder='{"type":"service_account","project_id":"…"}' value={form.storageServiceAccountKey} onChange={f('storageServiceAccountKey')} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, resize: 'vertical' }} />
              </div>
            </>
          )}

          {/* ── Security ──────────────────────────────── */}
          <SectionDivider label="Security" />

          {/* Signature Scheme */}
          <div className="field">
            <label className="label">Signature Scheme</label>
            <div style={{ display: 'flex', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: 3 }}>
              <SchemePill val="hmac-sha256" label="HMAC-SHA256" />
              <SchemePill val="ed25519"    label="Ed25519" />
            </div>
            {form.signatureScheme === 'ed25519' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8, padding: '8px 10px', background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.18)', borderRadius: 8 }}>
                <Shield size={12} color="var(--accent2)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>Ed25519 uses asymmetric signing. After creation, the public key will be displayed — save it to verify signatures on your server.</span>
              </div>
            )}
          </div>

          {/* Deduplication */}
          <div className="field">
            <label className="label">Deduplication Window <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(seconds · 0 = disabled)</span></label>
            <input className="input" type="number" min={0} placeholder="0" value={form.deduplicationWindowSecs} onChange={fNum('deduplicationWindowSecs')} />
          </div>

          {/* ── Outbound Auth ─────────────────────────── */}
          <SectionDivider label="Outbound Authentication" />
          <div className="field">
            <label className="label">Auth Type</label>
            <select className="input" value={form.authType} onChange={e => setForm(p => ({ ...p, authType: e.target.value as any }))}>
              <option value="none">None</option>
              <option value="bearer_token">Bearer Token</option>
              <option value="oauth2">OAuth2</option>
              <option value="mtls">mTLS</option>
            </select>
          </div>

          {/* Bearer Token fields */}
          {form.authType === 'bearer_token' && (
            <div className="field"><label className="label">Bearer Token <span style={{ color: 'var(--red)' }}>*</span></label>
              <input className="input" type="password" placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9…" value={form.bearerToken} onChange={f('bearerToken')} required />
            </div>
          )}

          {/* OAuth2 fields */}
          {form.authType === 'oauth2' && (
            <>
              <div className="field"><label className="label">Token URL <span style={{ color: 'var(--red)' }}>*</span></label><input className="input" type="url" placeholder="https://auth.example.com/oauth/token" value={form.oauth2TokenUrl} onChange={f('oauth2TokenUrl')} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field"><label className="label">Client ID <span style={{ color: 'var(--red)' }}>*</span></label><input className="input" placeholder="client_id" value={form.oauth2ClientId} onChange={f('oauth2ClientId')} required /></div>
                <div className="field"><label className="label">Client Secret <span style={{ color: 'var(--red)' }}>*</span></label><input className="input" type="password" placeholder="••••••••" value={form.oauth2ClientSecret} onChange={f('oauth2ClientSecret')} required /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field"><label className="label">Scope</label><input className="input" placeholder="webhook:write" value={form.oauth2Scope} onChange={f('oauth2Scope')} /></div>
                <div className="field"><label className="label">Audience</label><input className="input" placeholder="https://api.example.com" value={form.oauth2Audience} onChange={f('oauth2Audience')} /></div>
              </div>
            </>
          )}

          {/* mTLS fields */}
          {form.authType === 'mtls' && (
            <>
              <PemTextarea label="Client Certificate (PEM) *" value={form.mtlsCert} onChange={v => setForm(p => ({ ...p, mtlsCert: v }))} placeholder="-----BEGIN CERTIFICATE-----&#10;…&#10;-----END CERTIFICATE-----" />
              <PemTextarea label="Private Key (PEM) *" value={form.mtlsKey} onChange={v => setForm(p => ({ ...p, mtlsKey: v }))} placeholder="-----BEGIN PRIVATE KEY-----&#10;…&#10;-----END PRIVATE KEY-----" />
              <PemTextarea label="CA Certificate (PEM, optional)" value={form.mtlsCaCert} onChange={v => setForm(p => ({ ...p, mtlsCaCert: v }))} />
            </>
          )}

          {/* ── Advanced: Delivery Reliability ────────── */}
          <button type="button" onClick={() => toggleSection('reliability')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', margin: '12px 0 0', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Settings2 size={13} color="var(--accent2)" />Delivery Reliability</span>
            <ChevronDown size={13} style={{ transform: openSections.reliability ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
          </button>
          {openSections.reliability && (
            <div style={{ padding: '14px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 9px 9px', marginBottom: 4 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field">
                  <label className="label">Max Retries <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(0 = global default 5)</span></label>
                  <input className="input" type="number" min={0} max={25} value={form.maxRetries} onChange={e => setForm(p => ({ ...p, maxRetries: +e.target.value }))} />
                </div>
                <div className="field">
                  <label className="label">Retry Strategy</label>
                  <select className="input" value={form.retryStrategy} onChange={e => setForm(p => ({ ...p, retryStrategy: e.target.value as any }))}>
                    <option value="exponential">Exponential backoff (recommended)</option>
                    <option value="linear">Linear (every N minutes)</option>
                    <option value="fixed">Fixed interval</option>
                  </select>
                </div>
              </div>
              {form.retryStrategy === 'fixed' && (
                <div className="field">
                  <label className="label">Fixed Delay (seconds)</label>
                  <input className="input" type="number" min={1} value={form.retryFixedDelaySeconds} onChange={e => setForm(p => ({ ...p, retryFixedDelaySeconds: +e.target.value }))} />
                </div>
              )}
              {/* Maintenance windows */}
              <div style={{ marginTop: 10 }}>
                <label className="label">Maintenance Windows (UTC) — delivery auto-paused during window</label>
                {maintenanceWindows.map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '6px 10px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', flex: 1 }}>
                      {DAY_NAMES[w.dayOfWeek]} {w.startHour}:00 – {w.endHour}:00 UTC
                    </span>
                    <button type="button" className="btn-icon btn-sm" style={{ color: 'var(--red)' }} onClick={() => removeWindow(i)}>×</button>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px auto', gap: 6, alignItems: 'end', marginTop: 6 }}>
                  <div>
                    <label className="label" style={{ fontSize: 10 }}>Day</label>
                    <select className="input" value={mwForm.dayOfWeek} onChange={e => setMwForm(p => ({ ...p, dayOfWeek: +e.target.value }))}>
                      {DAY_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: 10 }}>Start</label>
                    <input className="input" type="number" min={0} max={23} value={mwForm.startHour} onChange={e => setMwForm(p => ({ ...p, startHour: +e.target.value }))} />
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: 10 }}>End</label>
                    <input className="input" type="number" min={0} max={23} value={mwForm.endHour} onChange={e => setMwForm(p => ({ ...p, endHour: +e.target.value }))} />
                  </div>
                  <button type="button" onClick={addWindow}
                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--accent2)', background: 'rgba(99,102,241,.1)', color: 'var(--accent2)', fontFamily: 'var(--font-body)', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    + Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Advanced: Batching & Performance ──────── */}
          <button type="button" onClick={() => toggleSection('batching')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', margin: '6px 0 0', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Layers size={13} color="var(--accent2)" />Batching &amp; Performance</span>
            <ChevronDown size={13} style={{ transform: openSections.batching ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
          </button>
          {openSections.batching && (
            <div style={{ padding: '14px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 9px 9px', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Enable Event Batching</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Deliver events as a single POST with {'{ events: [...], batchSize: N }'}</div>
                </div>
                <button type="button" onClick={() => setForm(p => ({ ...p, batchingEnabled: !p.batchingEnabled }))}
                  style={{ width: 44, height: 24, borderRadius: 12, background: form.batchingEnabled ? 'var(--accent2)' : 'var(--bg)', border: `1px solid ${form.batchingEnabled ? 'var(--accent2)' : 'var(--border)'}`, cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: form.batchingEnabled ? 22 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
                </button>
              </div>
              {form.batchingEnabled && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="field">
                    <label className="label">Flush every (seconds)</label>
                    <input className="input" type="number" min={1} max={60} value={form.batchWindowSeconds} onChange={e => setForm(p => ({ ...p, batchWindowSeconds: +e.target.value }))} />
                  </div>
                  <div className="field">
                    <label className="label">Max events per batch</label>
                    <input className="input" type="number" min={1} max={500} value={form.batchMaxSize} onChange={e => setForm(p => ({ ...p, batchMaxSize: +e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="field" style={{ marginTop: 8 }}>
                <label className="label">Max Payload Size (bytes · 0 = unlimited)</label>
                <input className="input" type="number" min={0} value={form.maxPayloadBytes} onChange={e => setForm(p => ({ ...p, maxPayloadBytes: +e.target.value }))} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 4, display: 'block' }}>1 KB = 1024 · 1 MB = 1048576 — oversized events go to DLQ</span>
              </div>
            </div>
          )}

          {/* ── Advanced: Privacy & Security ──────────── */}
          <button type="button" onClick={() => toggleSection('privacy')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', margin: '6px 0 0', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Lock size={13} color="var(--accent2)" />Privacy &amp; Security</span>
            <ChevronDown size={13} style={{ transform: openSections.privacy ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
          </button>
          {openSections.privacy && (
            <div style={{ padding: '14px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 9px 9px', marginBottom: 4 }}>
              {/* PII Fields */}
              <div className="field">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="label" style={{ marginBottom: 0 }}>PII Fields to Scrub <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(dot-notation paths)</span></label>
                  <button type="button"
                    onClick={() => setShowPiiDetector(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 7, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', border: 'none', color: '#fff', fontFamily: 'var(--sans)', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Sparkles size={10} />✨ AI Detect
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
                  {form.piiFields.map(tag => (
                    <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 5, background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.2)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent2)' }}>
                      {tag}
                      <button type="button" onClick={() => removeTag('piiFields', tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="input" placeholder="user.email · press Enter to add" value={form.piiFieldsInput}
                    onChange={e => setForm(p => ({ ...p, piiFieldsInput: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('piiFields', 'piiFieldsInput'); } }} />
                  <button type="button" onClick={() => addTag('piiFields', 'piiFieldsInput')}
                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--accent2)', background: 'rgba(99,102,241,.1)', color: 'var(--accent2)', fontFamily: 'var(--font-body)', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>Add</button>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 4, display: 'block' }}>Scrubbed fields replaced with [REDACTED] before delivery and logging</span>
              </div>
              {/* Allowed IPs */}
              <div className="field" style={{ marginTop: 8 }}>
                <label className="label">Allowed IP Addresses <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(Allowlist — leave empty to allow all)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
                  {form.allowedIps.map(ip => (
                    <span key={ip} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 5, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4ade80' }}>
                      {ip}
                      <button type="button" onClick={() => removeTag('allowedIps', ip)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="input" placeholder="192.168.1.1 · press Enter to add" value={form.allowedIpsInput}
                    onChange={e => setForm(p => ({ ...p, allowedIpsInput: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('allowedIps', 'allowedIpsInput'); } }} />
                  <button type="button" onClick={() => addTag('allowedIps', 'allowedIpsInput')}
                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(34,197,94,.3)', background: 'rgba(34,197,94,.08)', color: '#4ade80', fontFamily: 'var(--font-body)', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>Add</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Advanced: Testing & Staging ───────────── */}
          <button type="button" onClick={() => toggleSection('testing')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', margin: '6px 0 0', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><FlaskConical size={13} color="var(--accent2)" />Testing &amp; Staging</span>
            <ChevronDown size={13} style={{ transform: openSections.testing ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
          </button>
          {openSections.testing && (
            <div style={{ padding: '14px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 9px 9px', marginBottom: 4 }}>
              <div className="field">
                <label className="label">Shadow URL <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(Mirror to Staging, optional)</span></label>
                <input className="input" type="url" placeholder="https://staging.example.com/webhooks" value={form.shadowUrl} onChange={e => setForm(p => ({ ...p, shadowUrl: e.target.value }))} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 4, display: 'block' }}>Every delivery is silently mirrored here. Failures ignored. Never retried or logged.</span>
              </div>
            </div>
          )}

          {/* ── Advanced: A/B Testing ─────────────────── */}
          <button type="button" onClick={() => toggleSection('canary')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', margin: '6px 0 0', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg3)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><GitBranch size={13} color="var(--accent2)" />A/B Testing &amp; Canary</span>
            <ChevronDown size={13} style={{ transform: openSections.canary ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
          </button>
          {openSections.canary && (
            <div style={{ padding: '14px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 9px 9px', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Enable Canary Routing</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Split traffic between main URL and a canary endpoint</div>
                </div>
                <button type="button" onClick={() => setForm(p => ({ ...p, canaryEnabled: !p.canaryEnabled }))}
                  style={{ width: 44, height: 24, borderRadius: 12, background: form.canaryEnabled ? '#f59e0b' : 'var(--bg)', border: `1px solid ${form.canaryEnabled ? '#f59e0b' : 'var(--border)'}`, cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: form.canaryEnabled ? 22 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
                </button>
              </div>
              {form.canaryEnabled && (
                <>
                  <div className="field">
                    <label className="label">Canary Endpoint URL</label>
                    <input className="input" type="url" placeholder="https://canary.example.com/webhooks" value={form.canaryUrl} onChange={e => setForm(p => ({ ...p, canaryUrl: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label className="label">% Traffic to Canary: <strong style={{ color: '#f59e0b' }}>{form.canaryPercent}%</strong></label>
                    <input type="range" min={0} max={100} step={5} value={form.canaryPercent}
                      onChange={e => setForm(p => ({ ...p, canaryPercent: +e.target.value }))}
                      style={{ width: '100%', accentColor: '#f59e0b' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>
                      <span>0% (off)</span><span>50%</span><span>100%</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Submit ────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={mut.isPending}>
              {mut.isPending ? 'Creating…' : 'Create Endpoint'}
            </button>
          </div>
        </form>
      </div>
      {showPiiDetector && (
        <PiiDetectorModal
          onClose={() => setShowPiiDetector(false)}
          onApplied={(paths) => {
            setForm(p => ({ ...p, piiFields: Array.from(new Set([...p.piiFields, ...paths])) }));
          }}
        />
      )}
    </div>
  );
}

// ─── Endpoint Bulk Bar ────────────────────────────────────────────────────────
function EndpointBulkBar({
  count, onPause, onResume, onDelete, onClear, loading,
}: { count: number; onPause: () => void; onResume: () => void; onDelete: () => void; onClear: () => void; loading: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '10px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)', zIndex: 300, backdropFilter: 'blur(12px)',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', fontWeight: 600 }}>{count} selected</span>
      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
      <button className="btn btn-ghost btn-sm" onClick={onPause} disabled={loading}><Pause size={12} />Pause All</button>
      <button className="btn btn-ghost btn-sm" onClick={onResume} disabled={loading}><Play size={12} />Resume All</button>
      <button className="btn btn-ghost btn-sm" onClick={onDelete} disabled={loading} style={{ color: 'var(--red)' }}><Trash2 size={12} />Delete All</button>
      <button className="btn btn-ghost btn-sm" onClick={onClear} style={{ color: 'var(--text3)' }}><X size={12} />Deselect</button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EndpointsPage() {
  const { projectId: PID } = useProjectStore();
  const qc = useQueryClient();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showAiDebug, setShowAiDebug] = useState(false);
  const [aiDebugEndpointId, setAiDebugEndpointId] = useState<string|undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('');
  const [rotateResult, setRotateResult] = useState<{ secret: string; publicKey?: string } | null>(null);

  // Bulk select state
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['endpoints', page, statusFilter],
    queryFn: () => endpointsApi.list(PID, { page, limit: 15, status: statusFilter || undefined }),
  });

  const pause  = useMutation({ mutationFn: (id: string) => endpointsApi.pause(PID, id),  onSuccess: () => { toast.success('Paused');  qc.invalidateQueries({ queryKey: ['endpoints'] }); } });
  const resume = useMutation({ mutationFn: (id: string) => endpointsApi.resume(PID, id), onSuccess: () => { toast.success('Resumed'); qc.invalidateQueries({ queryKey: ['endpoints'] }); } });
  const del    = useMutation({ mutationFn: (id: string) => endpointsApi.delete(PID, id), onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['endpoints'] }); } });

  const bulkPause  = useMutation({ mutationFn: async (ids: string[]) => Promise.all(ids.map(id => endpointsApi.pause(PID, id))),  onSuccess: () => { toast.success(`${selected.size} paused`);  setSelected(new Set()); qc.invalidateQueries({ queryKey: ['endpoints'] }); } });
  const bulkResume = useMutation({ mutationFn: async (ids: string[]) => Promise.all(ids.map(id => endpointsApi.resume(PID, id))), onSuccess: () => { toast.success(`${selected.size} resumed`); setSelected(new Set()); qc.invalidateQueries({ queryKey: ['endpoints'] }); } });
  const bulkDelete = useMutation({ mutationFn: async (ids: string[]) => Promise.all(ids.map(id => endpointsApi.delete(PID, id))), onSuccess: () => { toast.success(`${selected.size} deleted`); setSelected(new Set()); qc.invalidateQueries({ queryKey: ['endpoints'] }); } });

  const rotate = useMutation({
    mutationFn: (id: string) => endpointsApi.rotateSecret(PID, id),
    onSuccess: (d: any) => {
      if (d?.publicKey) { setRotateResult(d); }
      else { navigator.clipboard.writeText(d.secret); toast.success('New secret copied to clipboard'); }
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Rotate failed'),
  });

  const copySecret = (secret: string) => { navigator.clipboard.writeText(secret); toast.success('Secret copied'); };

  const endpoints: any[] = data?.endpoints || [];
  const allIds = endpoints.map((ep: any) => ep._id);
  const allSelected = allIds.length > 0 && allIds.every((id: string) => selected.has(id));

  const toggleAll = useCallback(() => {
    allSelected ? setSelected(new Set()) : setSelected(new Set(allIds));
  }, [allSelected, allIds]);

  const toggleOne = useCallback((id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const bulkLoading = bulkPause.isPending || bulkResume.isPending || bulkDelete.isPending;
  const selectedArr = Array.from(selected);

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left"><h1>Endpoints</h1><p>// Webhook delivery targets · {data?.total || 0} total</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="input" style={{ width: 130 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setSelected(new Set()); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="disabled">Disabled</option>
          </select>
          <button
            className="btn"
            onClick={() => { setAiDebugEndpointId(undefined); setShowAiDebug(true); }}
            style={{ background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', border: 'none', fontWeight: 600 }}
          >
            <Sparkles size={12} />✨ AI Debug
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={13} />Add Endpoint</button>
        </div>
      </div>

      <div className="tbl-wrap">
        {isLoading ? (
          <table className="tbl">
            <thead><tr><th style={{width:36}}></th><th>Name</th><th>URL / Dest</th><th>Status</th><th>Event Types</th><th>Success / Fail</th><th>Actions</th></tr></thead>
            <SkeletonTable rows={6} cols={7} />
          </table>
        ) : !data?.endpoints?.length ? (
          <Empty type="endpoints" title="No endpoints yet" sub="Create your first endpoint to start receiving webhooks."
            action={<button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={13} />Create Endpoint</button>}
          />
        ) : (
          <table className="tbl">
            <thead><tr>
              <th style={{ width: 36 }}>
                <button onClick={toggleAll} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text3)' }}>
                  {allSelected ? <CheckSquare size={14} color="var(--accent2)" /> : <Square size={14} />}
                </button>
              </th>
              <th>Name</th><th>URL / Dest</th><th>Status</th><th>Event Types</th><th>Success / Fail</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {data.endpoints.map((ep: any) => {
                const isSelected = selected.has(ep._id);
                return (
                  <tr key={ep._id} style={{ cursor: 'pointer', background: isSelected ? 'rgba(99,102,241,0.06)' : undefined }} onClick={() => router.push(`/endpoints/${ep._id}`)}>
                    <td onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleOne(ep._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--text3)' }}>
                        {isSelected ? <CheckSquare size={14} color="var(--accent2)" /> : <Square size={14} />}
                      </button>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 12.5 }}>{ep.name}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>ID: {ep._id?.slice(-8)}</span>
                        {ep.signatureScheme === 'ed25519' && <span className="badge b-accent" style={{ fontSize: 8 }}>Ed25519</span>}
                        {ep.endpointType && ep.endpointType !== 'http' && <span className="badge b-gray" style={{ fontSize: 8 }}>{ep.endpointType.toUpperCase()}</span>}
                        {ep.batchingEnabled && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '1px 5px', borderRadius: 4, background: 'rgba(99,102,241,.12)', color: 'var(--accent2)', border: '1px solid rgba(99,102,241,.2)' }}>BATCHING</span>}
                        {ep.canaryPercent > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '1px 5px', borderRadius: 4, background: 'rgba(245,158,11,.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,.2)' }}>CANARY {ep.canaryPercent}%</span>}
                        {ep.piiFields?.length > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '1px 5px', borderRadius: 4, background: 'rgba(168,85,247,.12)', color: '#a78bfa', border: '1px solid rgba(168,85,247,.2)' }}>PII</span>}
                        {ep.shadowUrl && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '1px 5px', borderRadius: 4, background: 'rgba(34,211,238,.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,.2)' }}>SHADOW</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ep.url || ep.storageConfig?.bucket || '—'}
                      </div>
                    </td>
                    <td><StatusBadge status={ep.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {ep.eventTypes?.length ? ep.eventTypes.slice(0, 3).map((t: string) => <span key={t} className="badge b-accent">{t}</span>) : <span className="badge b-gray">all</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                        <span style={{ color: 'var(--green)' }}>{ep.totalDelivered || 0}</span>
                        {' / '}
                        <span style={{ color: 'var(--red)' }}>{ep.totalFailed || 0}</span>
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {ep.status === 'active'
                          ? <button className="btn-icon btn-sm" title="Pause"  onClick={() => pause.mutate(ep._id)}><Pause size={11} /></button>
                          : <button className="btn-icon btn-sm" title="Resume" onClick={() => resume.mutate(ep._id)}><Play size={11} /></button>}
                        <button className="btn-icon btn-sm" title="Rotate secret" onClick={() => rotate.mutate(ep._id)}><RotateCcw size={11} /></button>
                        {ep.secret && <button className="btn-icon btn-sm" title="Copy secret" onClick={() => copySecret(ep.secret)}><Copy size={11} /></button>}
                        <button className="btn-icon btn-sm" style={{ color: '#a855f7', borderColor: 'rgba(168,85,247,.3)' }} title="AI Debug this endpoint" onClick={() => { setAiDebugEndpointId(ep._id); setShowAiDebug(true); }}><Sparkles size={11} /></button>
                        <button className="btn-icon btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--rbd)' }} title="Delete" onClick={() => { if (confirm(`Delete "${ep.name}"?`)) del.mutate(ep._id); }}><Trash2 size={11} /></button>
                        <button className="btn-icon btn-sm" title="Health" onClick={() => router.push(`/endpoints/${ep._id}/health`)} style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,.3)' }}><Activity size={11} /></button>
                        <button className="btn-icon btn-sm" title="View detail" onClick={() => router.push(`/endpoints/${ep._id}`)}><ChevronRight size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {data && data.total > 15 && (
          <div className="pg">
            <span className="pg-info">Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, data.total)} of {data.total}</span>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <button className="btn btn-ghost btn-sm" disabled={page * 15 >= data.total} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* Bulk Bar */}
      {selected.size > 0 && (
        <EndpointBulkBar
          count={selected.size}
          loading={bulkLoading}
          onPause={() => bulkPause.mutate(selectedArr)}
          onResume={() => bulkResume.mutate(selectedArr)}
          onDelete={() => { if (confirm(`Delete ${selected.size} endpoint(s)?`)) bulkDelete.mutate(selectedArr); }}
          onClear={() => setSelected(new Set())}
        />
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      {showAiDebug && <AiDebuggerModal onClose={() => setShowAiDebug(false)} prefilledEndpointId={aiDebugEndpointId} />}

      {/* Rotate secret result modal (shows publicKey when Ed25519) */}
      {rotateResult && (
        <div className="modal-bg" onClick={() => setRotateResult(null)}>
          <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Secret Rotated</span>
              <button className="btn-icon" onClick={() => setRotateResult(null)}><X size={14} /></button>
            </div>
            <div className="field">
              <label className="label">New Secret</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 12px' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent2)', flex: 1, wordBreak: 'break-all' }}>{rotateResult.secret}</code>
                <button className="btn-icon btn-sm" onClick={() => { navigator.clipboard.writeText(rotateResult!.secret); toast.success('Copied'); }}><Copy size={12} /></button>
              </div>
            </div>
            {rotateResult.publicKey && (
              <div className="field">
                <label className="label">Ed25519 Public Key</label>
                <textarea readOnly value={rotateResult.publicKey} rows={6}
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent2)', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
                <button onClick={() => { navigator.clipboard.writeText(rotateResult!.publicKey!); toast.success('Public key copied'); }}
                  style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.2)', color: 'var(--accent2)', fontFamily: 'var(--font-body)', fontSize: 11, cursor: 'pointer' }}>
                  <Copy size={11} />Copy Public Key
                </button>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-primary" onClick={() => setRotateResult(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
