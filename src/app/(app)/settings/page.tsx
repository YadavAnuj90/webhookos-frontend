'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { gdprApi, endpointsApi } from '@/lib/api';
import { Settings, Globe, Lock, Bell, Code, Trash2, Save, Check, ShieldCheck, X, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import PiiDetectorModal from '@/components/ai/PiiDetectorModal';

const TABS = [
  { id: 'general',    label: 'General',        icon: Globe },
  { id: 'security',   label: 'Security',        icon: Lock },
  { id: 'compliance', label: 'Compliance',      icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'developer',  label: 'Developer',       icon: Code },
  { id: 'danger',     label: 'Danger Zone',     icon: Trash2 },
];

const PID = 'default';

const S: any = {
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 28px', marginBottom: 16 },
  input: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' as any },
  label: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' },
  sectionTitle: { fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4, marginTop: 0 },
  sectionDesc: { fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 20, marginTop: 0 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 12, background: checked ? 'var(--accent2)' : 'var(--bg3)', border: `1px solid ${checked ? 'var(--accent2)' : 'var(--border)'}`, cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: checked ? 22 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({ projectName: 'My Project', timezone: 'Asia/Kolkata', dateFormat: 'DD/MM/YYYY' });
  const [notifs, setNotifs] = useState({ emailOnFailure: true, emailOnRecovery: true, slackOnFailure: false, weeklyDigest: true, browserNotifications: false });
  const [dev, setDev] = useState({ logLevel: 'info', retentionDays: '30', signatureHeader: 'X-Webhook-Signature', maxPayloadKb: '256' });

  // GDPR
  const [customerId, setCustomerId] = useState('');
  const [eraseConfirm, setEraseConfirm] = useState(false);
  const [eraseResult, setEraseResult] = useState<{ deletedEvents: number; deletedLogs: number } | null>(null);
  const [piiEndpoints, setPiiEndpoints] = useState<any[]>([]);
  const [showPiiDetector, setShowPiiDetector] = useState(false);

  const eraseMut = useMutation({
    mutationFn: (id: string) => gdprApi.erase(PID, id),
    onSuccess: (d: any) => {
      setEraseResult(d);
      setEraseConfirm(false);
      toast.success(`Erased ${d.deletedEvents} events and ${d.deletedLogs} delivery logs`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Erasure failed'),
  });

  // Load PII endpoints for summary
  const loadPiiEndpoints = async () => {
    try {
      const r = await endpointsApi.list(PID, { limit: 100 });
      setPiiEndpoints((r?.endpoints || []).filter((ep: any) => ep.piiFields?.length > 0));
    } catch {}
  };

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#374151,#6b7280)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={18} color="#fff" /></div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Settings</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Configure your WebhookOS preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Sidebar tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 9, border: 'none', background: tab === id ? 'rgba(99,102,241,0.12)' : 'transparent', color: tab === id ? 'var(--accent2)' : 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: tab === id ? 600 : 400, cursor: 'pointer', textAlign: 'left', borderLeft: tab === id ? '2px solid var(--accent2)' : '2px solid transparent' }}>
              <Icon size={14} style={{ flexShrink: 0 }} />{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === 'general' && (
            <div style={S.card}>
              <h2 style={S.sectionTitle}>General Settings</h2>
              <p style={S.sectionDesc}>Manage your project name, timezone and display preferences</p>
              {[['Project Name', 'projectName', 'My Project'], ['Timezone', 'timezone', 'Asia/Kolkata'], ['Date Format', 'dateFormat', 'DD/MM/YYYY']].map(([lbl, field, ph]) => (
                <div key={field} style={{ marginBottom: 16 }}>
                  <label style={S.label}>{lbl}</label>
                  <input value={(general as any)[field]} onChange={e => setGeneral(g => ({ ...g, [field]: e.target.value }))} placeholder={ph} style={S.input} />
                </div>
              ))}
              <button onClick={save} style={S.saveBtn}>{saved ? <><Check size={14} />Saved!</> : <><Save size={14} />Save Changes</>}</button>
            </div>
          )}

          {tab === 'security' && (
            <div style={S.card}>
              <h2 style={S.sectionTitle}>Security</h2>
              <p style={S.sectionDesc}>Manage signing secrets and webhook verification settings</p>
              {[
                { label: 'Verify Signatures', desc: 'Reject webhooks with invalid HMAC signatures' },
                { label: 'Enforce HTTPS', desc: 'Only allow delivery to HTTPS endpoints' },
                { label: 'IP Allowlist', desc: 'Restrict deliveries to specific IP ranges' },
              ].map((item, i) => (
                <div key={i} style={{ ...S.row, borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <Toggle checked={i === 0} onChange={() => {}} />
                </div>
              ))}
            </div>
          )}

          {tab === 'notifications' && (
            <div style={S.card}>
              <h2 style={S.sectionTitle}>Notification Preferences</h2>
              <p style={S.sectionDesc}>Choose when and how you want to be notified</p>
              {[
                { key: 'emailOnFailure', label: 'Email on delivery failure', desc: 'Get emailed when an endpoint fails repeatedly' },
                { key: 'emailOnRecovery', label: 'Email on recovery', desc: 'Get emailed when a failing endpoint recovers' },
                { key: 'slackOnFailure', label: 'Slack on failure', desc: 'Send a Slack message when failures occur' },
                { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Receive a weekly summary of your delivery stats' },
                { key: 'browserNotifications', label: 'Browser notifications', desc: 'Show desktop notifications in the browser' },
              ].map((item, i, arr) => (
                <div key={item.key} style={{ ...S.row, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <Toggle checked={(notifs as any)[item.key]} onChange={v => setNotifs(n => ({ ...n, [item.key]: v }))} />
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <button onClick={save} style={S.saveBtn}>{saved ? <><Check size={14} />Saved!</> : <><Save size={14} />Save Preferences</>}</button>
              </div>
            </div>
          )}

          {tab === 'developer' && (
            <div style={S.card}>
              <h2 style={S.sectionTitle}>Developer Settings</h2>
              <p style={S.sectionDesc}>Advanced configuration for webhook delivery behavior</p>
              {[
                ['Log Level', 'logLevel', 'info', ['debug', 'info', 'warn', 'error'], true],
                ['Log Retention (days)', 'retentionDays', '30', null, false],
                ['Signature Header Name', 'signatureHeader', 'X-Webhook-Signature', null, false],
                ['Max Payload Size (KB)', 'maxPayloadKb', '256', null, false],
              ].map(([lbl, field, ph, opts, isSelect]) => (
                <div key={field as string} style={{ marginBottom: 16 }}>
                  <label style={S.label}>{lbl as string}</label>
                  {isSelect ? (
                    <select value={(dev as any)[field as string]} onChange={e => setDev(d => ({ ...d, [field as string]: e.target.value }))} style={{ ...S.input, cursor: 'pointer' }}>
                      {(opts as string[]).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={(dev as any)[field as string]} onChange={e => setDev(d => ({ ...d, [field as string]: e.target.value }))} placeholder={ph as string} style={S.input} />
                  )}
                </div>
              ))}
              <button onClick={save} style={S.saveBtn}>{saved ? <><Check size={14} />Saved!</> : <><Save size={14} />Save Settings</>}</button>
            </div>
          )}

          {tab === 'compliance' && (
            <div>
              {/* Payload Encryption */}
              <div style={{ ...S.card, marginBottom: 16 }}>
                <h2 style={S.sectionTitle}>Payload Encryption at Rest</h2>
                <p style={S.sectionDesc}>AES-256-GCM encryption for all stored webhook payloads</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 9, background: 'rgba(74,222,128,.05)', border: '1px solid rgba(74,222,128,.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text3)' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text3)' }}>Status: Disabled</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', padding: '2px 8px', borderRadius: 5, background: 'var(--bg3)', border: '1px solid var(--border)' }}>Env-var driven</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 12, lineHeight: 1.6 }}>
                  When enabled, all webhook payloads are encrypted in the database using AES-256-GCM. Contact your admin to set <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'rgba(99,102,241,.1)', padding: '1px 5px', borderRadius: 4, color: 'var(--accent2)' }}>PAYLOAD_ENCRYPTION_KEY</code> environment variable.
                </p>
              </div>

              {/* GDPR Erasure */}
              <div style={{ ...S.card, marginBottom: 16 }}>
                <h2 style={S.sectionTitle}>GDPR Right-to-Erasure</h2>
                <p style={S.sectionDesc}>Permanently delete all events and delivery logs containing a specific customer ID</p>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Customer ID</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={customerId} onChange={e => { setCustomerId(e.target.value); setEraseResult(null); }}
                      placeholder="cus_abc123" style={{ ...S.input, flex: 1 }} />
                    <button
                      onClick={() => { if (!customerId.trim()) { toast.error('Enter a customer ID'); return; } setEraseConfirm(true); }}
                      disabled={!customerId.trim() || eraseMut.isPending}
                      style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(248,113,113,.4)', background: 'rgba(248,113,113,.1)', color: '#f87171', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', opacity: !customerId.trim() ? 0.5 : 1 }}>
                      Erase Data
                    </button>
                  </div>
                </div>
                {eraseResult && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(74,222,128,.07)', border: '1px solid rgba(74,222,128,.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={14} color="#4ade80" />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#4ade80' }}>Erasure complete</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                      {eraseResult.deletedEvents} events · {eraseResult.deletedLogs} delivery logs deleted
                    </div>
                  </div>
                )}
              </div>

              {/* AI PII Detector */}
              <div style={{ ...S.card, marginBottom: 16, background: 'rgba(168,85,247,.05)', border: '1px solid rgba(168,85,247,.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={14} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ ...S.sectionTitle, marginBottom: 1, color: '#c084fc' }}>AI PII Auto-Detector</h2>
                    <p style={{ ...S.sectionDesc, marginBottom: 0 }}>Scan any payload to automatically discover personally identifiable information fields</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPiiDetector(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  <Sparkles size={13} />✨ Open PII Scanner
                </button>
              </div>

              {/* PII Scrubbing Summary */}
              <div style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <h2 style={{ ...S.sectionTitle, marginBottom: 2 }}>PII Scrubbing Summary</h2>
                    <p style={{ ...S.sectionDesc, marginBottom: 0 }}>Endpoints configured to redact PII fields before delivery</p>
                  </div>
                  <button onClick={loadPiiEndpoints} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 12, cursor: 'pointer' }}>Refresh</button>
                </div>
                {piiEndpoints.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                    Click Refresh to load — or no endpoints have PII scrubbing configured.
                  </div>
                ) : piiEndpoints.map((ep: any) => (
                  <div key={ep._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{ep.name}</div>
                      <div style={{ display: 'flex', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
                        {ep.piiFields.map((f: string) => (
                          <code key={f} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(168,85,247,.1)', color: '#a78bfa', border: '1px solid rgba(168,85,247,.2)' }}>{f}</code>
                        ))}
                      </div>
                    </div>
                    <a href={`/endpoints/${ep._id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--accent2)', textDecoration: 'none' }}>
                      <ExternalLink size={12} />Edit
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'danger' && (
            <div style={{ ...S.card, borderColor: 'rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.03)' }}>
              <h2 style={{ ...S.sectionTitle, color: '#f87171' }}>Danger Zone</h2>
              <p style={S.sectionDesc}>These actions are irreversible. Please proceed with caution.</p>
              {[
                { label: 'Clear All Logs', desc: 'Permanently delete all delivery logs and history. This cannot be undone.', btn: 'Clear Logs', color: '#f59e0b' },
                { label: 'Reset All Endpoints', desc: 'Delete all endpoints and their configurations. Events will stop being delivered.', btn: 'Reset Endpoints', color: '#f87171' },
                { label: 'Delete Account', desc: 'Permanently delete your account and all associated data. No recovery possible.', btn: 'Delete Account', color: '#f87171' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < 2 ? '1px solid rgba(248,113,113,0.15)' : 'none' }}>
                  <div style={{ flex: 1, paddingRight: 20 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>{item.desc}</div>
                  </div>
                  <button onClick={() => confirm(`Are you sure you want to ${item.btn.toLowerCase()}? This cannot be undone.`)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${item.color}40`, background: `${item.color}12`, color: item.color, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{item.btn}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    {/* GDPR erasure confirmation modal */}
    {eraseConfirm && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid rgba(248,113,113,.3)', borderRadius: 14, width: 460, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <AlertTriangle size={20} color="#f87171" />
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700, color: '#f87171', margin: 0 }}>Confirm Data Erasure</h2>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 20 }}>
            This will permanently delete <strong>all events and delivery logs</strong> containing customer ID <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'rgba(248,113,113,.1)', padding: '1px 6px', borderRadius: 4, color: '#f87171' }}>{customerId}</code>. This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setEraseConfirm(false)} style={{ padding: '9px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => eraseMut.mutate(customerId)} disabled={eraseMut.isPending}
              style={{ padding: '9px 20px', borderRadius: 8, background: '#f87171', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: eraseMut.isPending ? 0.7 : 1 }}>
              {eraseMut.isPending ? 'Erasing…' : 'Yes, Erase All Data'}
            </button>
          </div>
        </div>
      </div>
    )}
    {showPiiDetector && <PiiDetectorModal onClose={() => setShowPiiDetector(false)} />}
    </>
  );
}
