'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventTypesApi, contractTestApi, simulateApi, endpointsApi } from '@/lib/api';
import { EventType, ContractTestResult, SimulateResult } from '@/lib/types';
import { Tag, Plus, Edit2, Trash2, CheckCircle, XCircle, X, ChevronRight, Code, Play, Copy, Check, Zap, FlaskConical, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { SkeletonTable } from '@/components/ui/Skeleton';
import Empty from '@/components/ui/Empty';
import AiSchemaGeneratorModal from '@/components/ai/AiSchemaGeneratorModal';

const PID = 'default';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

function safeJson(str: string): object | null {
  try { return JSON.parse(str); } catch { return null; }
}
function prettyJson(obj: any): string { return JSON.stringify(obj, null, 2); }

// ─── Validate panel ──────────────────────────────────────────────────────────
function ValidatePanel({ eventTypeId }: { eventTypeId: string }) {
  const [payload, setPayload] = useState('{\n  \n}');
  const [result, setResult] = useState<{ valid: boolean; errors?: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    const parsed = safeJson(payload);
    if (!parsed) { toast.error('Invalid JSON payload'); return; }
    setLoading(true);
    try {
      const r = await eventTypesApi.validate(PID, { eventTypeId, payload: parsed });
      setResult(r);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Validation failed');
    } finally { setLoading(false); }
  };
  return (
    <div style={{ marginTop: 18, padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Validate Payload</div>
      <textarea value={payload} onChange={e => { setPayload(e.target.value); setResult(null); }} rows={5}
        style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 11px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
        placeholder='{ "amount": 99.99 }' />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button onClick={run} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          <Play size={11} />{loading ? 'Validating…' : 'Validate'}
        </button>
        {result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: 12 }}>
            {result.valid
              ? <><CheckCircle size={14} color="#4ade80" /><span style={{ color: '#4ade80', fontWeight: 600 }}>Valid payload</span></>
              : <><XCircle size={14} color="#f87171" /><span style={{ color: '#f87171', fontWeight: 600 }}>Invalid — {result.errors?.join(', ')}</span></>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contract Test panel ─────────────────────────────────────────────────────
function ContractTestPanel({ eventTypeName }: { eventTypeName: string }) {
  const [payload, setPayload] = useState('{\n  \n}');
  const [result, setResult] = useState<(ContractTestResult & { status: number }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);
  const [yamlCopied, setYamlCopied] = useState(false);

  const run = async () => {
    const parsed = safeJson(payload);
    if (!parsed) { toast.error('Invalid JSON payload'); return; }
    setLoading(true);
    try {
      const r = await contractTestApi.run(PID, eventTypeName, { payload: parsed });
      setResult(r);
    } catch (e: any) {
      toast.error(e.message || 'Contract test failed');
    } finally { setLoading(false); }
  };

  const curlCmd = `curl -X POST ${BASE_URL}/projects/${PID}/event-types/${eventTypeName}/contract-test \\\n  -H "Content-Type: application/json" \\\n  -d '{"payload": ${payload.replace(/\n/g,'').replace(/  /g,' ')}}'`;

  const ghYaml = `- name: Contract Test ${eventTypeName}
  run: |
    RESULT=$(curl -s -o /dev/null -w "%{http_code}" \\
      -X POST \${{ secrets.WEBHOOK_API_URL }}/projects/\${{ vars.PROJECT_ID }}/event-types/${eventTypeName}/contract-test \\
      -H "Content-Type: application/json" \\
      -d '{"payload": ${payload.replace(/\n/g,'').replace(/  /g,' ')}}')
    [ "$RESULT" = "200" ] || exit 1`;

  const copy = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true); toast.success('Copied');
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div>
      <div style={{ padding: '10px 12px', background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.18)', borderRadius: 9, marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
          This endpoint requires <strong style={{ color: 'var(--text2)' }}>no authentication</strong> — safe for CI/CD pipelines.
          Returns <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'rgba(99,102,241,.1)', padding: '1px 5px', borderRadius: 4, color: 'var(--accent2)' }}>200</code> on pass,
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'rgba(248,113,113,.1)', padding: '1px 5px', borderRadius: 4, color: '#f87171', marginLeft: 4 }}>422</code> on schema mismatch.
        </div>
      </div>

      <div className="field">
        <label className="label">Payload to test</label>
        <textarea value={payload} onChange={e => { setPayload(e.target.value); setResult(null); }} rows={7}
          style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 11px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
      </div>

      <button onClick={run} disabled={loading}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 14 }}>
        <FlaskConical size={13} />{loading ? 'Running…' : 'Run Test'}
      </button>

      {result && (
        <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: result.valid ? 'rgba(74,222,128,.07)' : 'rgba(248,113,113,.07)', border: `1px solid ${result.valid ? 'rgba(74,222,128,.25)' : 'rgba(248,113,113,.25)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: result.valid ? 0 : 10 }}>
            {result.valid
              ? <><CheckCircle size={15} color="#4ade80" /><span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: '#4ade80' }}>✓ Payload is valid</span></>
              : <><XCircle size={15} color="#f87171" /><span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: '#f87171' }}>✗ Payload invalid ({result.errors.length} error{result.errors.length !== 1 ? 's' : ''})</span></>}
          </div>
          {!result.valid && result.errors.map((err, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#f59e0b', background: 'rgba(245,158,11,.1)', padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>{err.path || 'root'}</code>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#f87171' }}>{err.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* cURL snippet */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>cURL Command</span>
          <button onClick={() => copy(curlCmd, setCurlCopied)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 11, cursor: 'pointer' }}>
            {curlCopied ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}Copy
          </button>
        </div>
        <pre style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#e6edf3', overflow: 'auto', margin: 0, lineHeight: 1.7 }}>{curlCmd}</pre>
      </div>

      {/* GitHub Actions YAML */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>GitHub Actions Step</span>
          <button onClick={() => copy(ghYaml, setYamlCopied)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 11, cursor: 'pointer' }}>
            {yamlCopied ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}Copy
          </button>
        </div>
        <pre style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#a5d6ff', overflow: 'auto', margin: 0, lineHeight: 1.7 }}>{ghYaml}</pre>
      </div>
    </div>
  );
}

// ─── Simulator Modal ─────────────────────────────────────────────────────────
function SimulatorModal({ eventType, onClose }: { eventType: EventType; onClose: () => void }) {
  const [payload, setPayload] = useState(eventType.samplePayload ? prettyJson(eventType.samplePayload) : '{\n  \n}');
  const [endpointId, setEndpointId] = useState('');
  const [result, setResult] = useState<SimulateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: eps } = useQuery({ queryKey: ['eps-list'], queryFn: () => endpointsApi.list(PID, { limit: 50 }) });

  const run = async () => {
    const overrides = safeJson(payload) || {};
    setLoading(true);
    try {
      const r = await simulateApi.run(PID, eventType._id, { overrides: overrides as any, endpointId: endpointId || undefined });
      setResult(r);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Simulation failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ width: 640, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Simulate — {eventType.name}</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.18)', borderRadius: 9, marginBottom: 14 }}>
          <AlertCircle size={13} color="var(--accent2)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.55 }}>
            Shows the payload that <em>would</em> be sent — does not actually deliver to the endpoint.
          </span>
        </div>
        <div className="field">
          <label className="label">Target Endpoint (optional)</label>
          <select className="input" value={endpointId} onChange={e => setEndpointId(e.target.value)}>
            <option value="">— No specific endpoint —</option>
            {eps?.endpoints?.map((ep: any) => <option key={ep._id} value={ep._id}>{ep.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">Payload Overrides (edit fields to override)</label>
          <textarea className="input" rows={10} value={payload} onChange={e => { setPayload(e.target.value); setResult(null); }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, resize: 'vertical' }} />
        </div>
        <button onClick={run} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, background: 'linear-gradient(135deg,#0891b2,#06b6d4)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 14 }}>
          <Zap size={14} />{loading ? 'Simulating…' : 'Fire Simulation'}
        </button>
        {result && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Simulated Payload — {result.eventType} v{result.version}
            </div>
            <pre style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#4ade80', overflow: 'auto', margin: 0, lineHeight: 1.7 }}>
              {prettyJson(result.simulatedPayload)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Create / Edit Modal ─────────────────────────────────────────────────────
function EventTypeModal({ editing, onClose }: { editing: EventType | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name:                editing?.name              || '',
    version:             editing?.version           || '1.0.0',
    description:         editing?.description       || '',
    tags:                editing?.tags?.join(', ')  || '',
    schema:              editing?.schema            ? prettyJson(editing.schema)        : '{\n  "type": "object",\n  "properties": {}\n}',
    samplePayload:       editing?.samplePayload     ? prettyJson(editing.samplePayload) : '{}',
    maxDeliverySeconds:  editing?.maxDeliverySeconds ?? 0,
    defaultTtlSeconds:   editing?.defaultTtlSeconds  ?? 0,
  });
  const [tab, setTab] = useState<'schema' | 'sample' | 'validate' | 'contract'>('schema');

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));
  const fNum = (k: string) => (v: number) => setForm(p => ({ ...p, [k]: v }));

  const build = () => {
    const schema = safeJson(form.schema);
    if (!schema) { toast.error('Schema is not valid JSON'); return null; }
    const samplePayload = safeJson(form.samplePayload);
    if (form.samplePayload.trim() && !samplePayload) { toast.error('Sample payload is not valid JSON'); return null; }
    return {
      name: form.name, version: form.version,
      description: form.description || undefined,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      schema, samplePayload: samplePayload || undefined,
      maxDeliverySeconds: form.maxDeliverySeconds || undefined,
      defaultTtlSeconds:  form.defaultTtlSeconds  || undefined,
    };
  };

  const create = useMutation({
    mutationFn: (d: any) => eventTypesApi.create(PID, d),
    onSuccess: () => { toast.success('Event type created'); qc.invalidateQueries({ queryKey: ['event-types'] }); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Create failed'),
  });
  const update = useMutation({
    mutationFn: (d: any) => eventTypesApi.update(PID, editing!._id, d),
    onSuccess: () => { toast.success('Event type updated'); qc.invalidateQueries({ queryKey: ['event-types'] }); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const submit = (e: React.FormEvent) => { e.preventDefault(); const d = build(); if (!d) return; editing ? update.mutate(d) : create.mutate(d); };
  const busy = create.isPending || update.isPending;

  const TABS = [
    { id: 'schema',   label: 'JSON Schema' },
    { id: 'sample',   label: 'Sample Payload' },
    { id: 'validate', label: 'Validate',      disabled: !editing },
    { id: 'contract', label: 'Contract Test', disabled: !editing },
  ] as const;

  // SLA / TTL preset helpers
  const SLA_PRESETS = [['30s', 30], ['60s', 60], ['5min', 300], ['1hr', 3600]] as [string, number][];
  const TTL_PRESETS = [['1hr', 3600], ['24hr', 86400], ['7 days', 604800], ['30 days', 2592000]] as [string, number][];

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ width: 640, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{editing ? 'Edit Event Type' : 'New Event Type'}</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
            <div className="field">
              <label className="label">Name <span style={{ color: 'var(--red)' }}>*</span></label>
              <input className="input" placeholder="payment.success" value={form.name} onChange={f('name')} required />
            </div>
            <div className="field">
              <label className="label">Version</label>
              <input className="input" placeholder="1.0.0" value={form.version} onChange={f('version')} />
            </div>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <input className="input" placeholder="Fired when a payment succeeds" value={form.description} onChange={f('description')} />
          </div>
          <div className="field">
            <label className="label">Tags <span style={{ fontWeight: 400, color: 'var(--text3)' }}>(comma-separated)</span></label>
            <input className="input" placeholder="payments, billing, stripe" value={form.tags} onChange={f('tags')} />
          </div>

          {/* SLA + TTL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="label">SLA — Max Delivery Time (sec · 0 = no SLA)</label>
              <input className="input" type="number" min={0} value={form.maxDeliverySeconds} onChange={e => fNum('maxDeliverySeconds')(+e.target.value)} />
              <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                {SLA_PRESETS.map(([lbl, val]) => (
                  <button key={lbl} type="button" onClick={() => fNum('maxDeliverySeconds')(val)}
                    style={{ padding: '3px 8px', borderRadius: 5, border: `1px solid ${form.maxDeliverySeconds === val ? 'var(--accent2)' : 'var(--border)'}`, background: form.maxDeliverySeconds === val ? 'rgba(99,102,241,.1)' : 'var(--bg3)', color: form.maxDeliverySeconds === val ? 'var(--accent2)' : 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer' }}
                  >{lbl}</button>
                ))}
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)', marginTop: 3, display: 'block' }}>Fires sla.breach op-webhook if exceeded</span>
            </div>
            <div className="field">
              <label className="label">Event TTL (sec · 0 = never expire)</label>
              <input className="input" type="number" min={0} value={form.defaultTtlSeconds} onChange={e => fNum('defaultTtlSeconds')(+e.target.value)} />
              <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                {TTL_PRESETS.map(([lbl, val]) => (
                  <button key={lbl} type="button" onClick={() => fNum('defaultTtlSeconds')(val)}
                    style={{ padding: '3px 8px', borderRadius: 5, border: `1px solid ${form.defaultTtlSeconds === val ? 'var(--accent2)' : 'var(--border)'}`, background: form.defaultTtlSeconds === val ? 'rgba(99,102,241,.1)' : 'var(--bg3)', color: form.defaultTtlSeconds === val ? 'var(--accent2)' : 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 9, cursor: 'pointer' }}
                  >{lbl}</button>
                ))}
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)', marginTop: 3, display: 'block' }}>Undelivered events older than TTL → DLQ</span>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: 3, marginBottom: 12 }}>
            {TABS.map(t => (
              <button key={t.id} type="button"
                disabled={'disabled' in t && t.disabled}
                onClick={() => !('disabled' in t && t.disabled) && setTab(t.id as any)}
                style={{ flex: 1, padding: '5px 0', borderRadius: 7, border: 'none', background: tab === t.id ? 'var(--bg2)' : 'transparent', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? 'var(--text)' : 'var(--text3)', cursor: ('disabled' in t && t.disabled) ? 'not-allowed' : 'pointer', opacity: ('disabled' in t && t.disabled) ? 0.4 : 1 }}
              >{t.label}</button>
            ))}
          </div>

          {tab === 'schema' && (
            <div className="field">
              <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Code size={11} /> JSON Schema</label>
              <textarea className="input" rows={10} value={form.schema} onChange={f('schema')} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, resize: 'vertical' }} />
            </div>
          )}
          {tab === 'sample' && (
            <div className="field">
              <label className="label">Sample Payload</label>
              <textarea className="input" rows={10} value={form.samplePayload} onChange={f('samplePayload')} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, resize: 'vertical' }} placeholder='{ "amount": 99.99, "currency": "USD" }' />
            </div>
          )}
          {tab === 'validate' && editing && <ValidatePanel eventTypeId={editing._id} />}
          {tab === 'contract' && editing && <ContractTestPanel eventTypeName={editing.name} />}

          {tab !== 'contract' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={busy}>
                {busy ? (editing ? 'Saving…' : 'Creating…') : (editing ? 'Save Changes' : 'Create Event Type')}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function EventTypesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<EventType | null | 'new'>(null);
  const [simTarget, setSimTarget] = useState<EventType | null>(null);
  const [showAiSchema, setShowAiSchema] = useState(false);

  const { data: eventTypes = [], isLoading } = useQuery<EventType[]>({
    queryKey: ['event-types'],
    queryFn: () => eventTypesApi.list(PID),
  });

  const del = useMutation({
    mutationFn: (id: string) => eventTypesApi.delete(PID, id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['event-types'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left">
          <h1>Event Types</h1>
          <p>// Schema catalog for typed webhook events · {eventTypes.length} registered</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn"
            onClick={() => setShowAiSchema(true)}
            style={{ background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', border: 'none', fontWeight: 600 }}
          >
            <Sparkles size={12} />✨ Generate from Payload
          </button>
          <button className="btn btn-primary" onClick={() => setModal('new')}>
            <Plus size={13} />New Event Type
          </button>
        </div>
      </div>

      <div className="tbl-wrap">
        {isLoading ? (
          <table className="tbl">
            <thead><tr><th>Name</th><th>Version</th><th>SLA / TTL</th><th>Tags</th><th>Active</th><th>Created</th><th>Actions</th></tr></thead>
            <SkeletonTable rows={5} cols={7} />
          </table>
        ) : eventTypes.length === 0 ? (
          <Empty type="generic" title="No event types yet" sub="Define schema contracts for typed webhook events."
            action={<button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={13} />Create Event Type</button>}
          />
        ) : (
          <table className="tbl">
            <thead><tr><th>Name</th><th>Version</th><th>SLA / TTL</th><th>Tags</th><th>Active</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {eventTypes.map(et => (
                <tr key={et._id} style={{ cursor: 'pointer' }} onClick={() => setModal(et)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(99,102,241,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Tag size={12} color="var(--accent2)" />
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{et.name}</div>
                        {et.description && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{et.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td><span className="badge b-accent" style={{ fontFamily: 'var(--font-mono)' }}>v{et.version}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {et.maxDeliverySeconds > 0 ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(251,146,60,.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,.2)' }}>
                          SLA {et.maxDeliverySeconds >= 3600 ? `${et.maxDeliverySeconds/3600}h` : et.maxDeliverySeconds >= 60 ? `${et.maxDeliverySeconds/60}m` : `${et.maxDeliverySeconds}s`}
                        </span>
                      ) : null}
                      {et.defaultTtlSeconds > 0 ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(168,85,247,.1)', color: '#a78bfa', border: '1px solid rgba(168,85,247,.2)' }}>
                          TTL {et.defaultTtlSeconds >= 86400 ? `${Math.round(et.defaultTtlSeconds/86400)}d` : et.defaultTtlSeconds >= 3600 ? `${et.defaultTtlSeconds/3600}h` : `${et.defaultTtlSeconds}s`}
                        </span>
                      ) : null}
                      {!et.maxDeliverySeconds && !et.defaultTtlSeconds && <span style={{ color: 'var(--text3)', fontSize: 11 }}>—</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {et.tags?.length ? et.tags.slice(0, 3).map(t => <span key={t} className="badge b-gray">{t}</span>)
                        : <span style={{ color: 'var(--text3)', fontSize: 11 }}>—</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: et.isActive ? '#4ade80' : '#f87171' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: et.isActive ? '#4ade80' : '#f87171', display: 'inline-block' }} />
                      {et.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
                    {new Date(et.createdAt).toLocaleDateString()}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn-icon btn-sm" title="Simulate" onClick={() => setSimTarget(et)}>
                        <Zap size={11} color="#f59e0b" />
                      </button>
                      <button className="btn-icon btn-sm" title="Edit" onClick={() => setModal(et)}><Edit2 size={11} /></button>
                      <button className="btn-icon btn-sm" title="Delete"
                        style={{ color: 'var(--red)', borderColor: 'var(--rbd)' }}
                        onClick={() => { if (confirm(`Delete "${et.name}"?`)) del.mutate(et._id); }}
                      ><Trash2 size={11} /></button>
                      <ChevronRight size={12} color="var(--text3)" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && <EventTypeModal editing={modal === 'new' ? null : modal} onClose={() => setModal(null)} />}
      {simTarget && <SimulatorModal eventType={simTarget} onClose={() => setSimTarget(null)} />}
      {showAiSchema && <AiSchemaGeneratorModal onClose={() => setShowAiSchema(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['event-types'] })} />}
    </div>
  );
}
