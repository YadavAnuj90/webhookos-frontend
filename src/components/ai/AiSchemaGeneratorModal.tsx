'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { useProjectStore } from '@/lib/store';
import { AiGeneratedSchema } from '@/lib/types';
import { X, Sparkles, AlertCircle, Check, Copy, ChevronRight, ChevronLeft, Tag, FileJson } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAiStatus } from '@/hooks/useAiStatus';
import { AiProviderBadge, AiNotConfiguredBanner } from './AiProviderBadge';

const EXAMPLE_PAYLOADS = [
  {
    label: 'Payment',
    payload: `{
  "id": "pay_123abc",
  "amount": 9900,
  "currency": "INR",
  "status": "succeeded",
  "customer_email": "user@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}`,
  },
  {
    label: 'Order',
    payload: `{
  "order_id": "ord_456def",
  "items": [{ "sku": "PROD-1", "qty": 2, "price": 499 }],
  "total": 998,
  "shipping_address": { "city": "Mumbai", "country": "IN" }
}`,
  },
  {
    label: 'User Event',
    payload: `{
  "user_id": "usr_789ghi",
  "event": "signup",
  "email": "user@example.com",
  "name": "John Doe",
  "plan": "pro",
  "timestamp": "2024-01-15T10:30:00Z"
}`,
  },
];

function JsonPreview({ obj }: { obj: Record<string, any> }) {
  const [copied, setCopied] = useState(false);
  const str = JSON.stringify(obj, null, 2);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { navigator.clipboard.writeText(str); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
        style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,0,0,.4)', border: '1px solid var(--b2)', borderRadius: 5, padding: '2px 7px', cursor: 'pointer', color: 'var(--t3)', fontSize: 10, fontFamily: 'var(--mono)' }}
      >
        {copied ? <Check size={10} color="#4ade80" /> : <Copy size={10} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre style={{ background: 'rgba(0,0,0,.25)', border: '1px solid var(--b2)', borderRadius: 8, padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 10, color: '#a5b4fc', overflowX: 'auto', maxHeight: 220, margin: 0, lineHeight: 1.6 }}>
        {str}
      </pre>
    </div>
  );
}

interface Props {
  onClose: () => void;
  onSaved?: () => void;
}

export default function AiSchemaGeneratorModal({ onClose, onSaved }: Props) {
  const { projectId: PID } = useProjectStore();
  const { status: aiStatus } = useAiStatus();
  const [step, setStep] = useState<1 | 2>(1);
  const [payload, setPayload] = useState('');
  const [eventTypeName, setEventTypeName] = useState('');
  const [result, setResult] = useState<AiGeneratedSchema | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const generate = useMutation({
    mutationFn: () => {
      let parsed: object;
      try { parsed = JSON.parse(payload); } catch { throw new Error('invalid_json'); }
      return aiApi.generateSchema(PID, { payload: parsed, eventTypeName: eventTypeName || undefined, autoSave: false });
    },
    onSuccess: (d: AiGeneratedSchema) => { setResult(d); setStep(2); },
    onError: (e: any) => {
      if (e.message === 'invalid_json') { toast.error('Invalid JSON payload'); return; }
      const msg = e.response?.data?.message || '';
      if (msg.toLowerCase().includes('gemini') || msg.toLowerCase().includes('api_key') || e.response?.status === 503) {
        setApiKeyMissing(true);
      } else {
        toast.error('Schema generation failed. Please try again.');
      }
    },
  });

  const save = useMutation({
    mutationFn: () => {
      let parsed: object;
      try { parsed = JSON.parse(payload); } catch { throw new Error('invalid_json'); }
      return aiApi.generateSchema(PID, { payload: parsed, eventTypeName: result?.suggestedName || eventTypeName || undefined, autoSave: true });
    },
    onSuccess: () => {
      toast.success('Schema saved to Event Catalog!');
      onSaved?.();
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Save failed'),
  });

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal modal-lg" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--b1)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileJson size={15} color="#fff" />
            </div>
            <div>
              <div className="modal-title">AI Schema Generator</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#a855f7', marginTop: 1 }}>
                {aiStatus.configured ? `Powered by ${aiStatus.label} ✨` : 'AI not configured'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step >= 1 ? 'linear-gradient(135deg,#6d28d9,#a855f7)' : 'var(--b2)', color: '#fff', fontSize: 9, fontWeight: 700 }}>1</span>
              <span style={{ color: step === 1 ? '#c084fc' : 'var(--t3)' }}>Payload</span>
              <ChevronRight size={10} />
              <span style={{ width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step >= 2 ? 'linear-gradient(135deg,#6d28d9,#a855f7)' : 'var(--b2)', color: step >= 2 ? '#fff' : 'var(--t3)', fontSize: 9, fontWeight: 700 }}>2</span>
              <span style={{ color: step === 2 ? '#c084fc' : 'var(--t3)' }}>Review & Save</span>
            </div>
            <button className="btn-icon" onClick={onClose}><X size={14} /></button>
          </div>
        </div>

        <div style={{ paddingTop: 20 }}>
          {/* ── Step 1: Paste Payload ── */}
          {step === 1 && (
            <>
              {/* Not configured warning */}
              {!aiStatus.configured && <AiNotConfiguredBanner />}

              {/* Example chips */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Try an example</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {EXAMPLE_PAYLOADS.map(ex => (
                    <button
                      key={ex.label}
                      onClick={() => setPayload(ex.payload)}
                      style={{ fontFamily: 'var(--sans)', fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(168,85,247,.3)', background: 'rgba(168,85,247,.07)', color: '#c084fc', cursor: 'pointer' }}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="label">Sample Payload (JSON)</label>
                <textarea
                  value={payload}
                  onChange={e => setPayload(e.target.value)}
                  placeholder={'{\n  "id": "evt_123",\n  "amount": 9900,\n  "status": "succeeded"\n}'}
                  style={{ width: '100%', minHeight: 180, background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.28)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t1)', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                />
              </div>

              <div className="field">
                <label className="label">Event Type Name <span style={{ color: 'var(--t3)', fontWeight: 400 }}>(optional — AI will suggest one)</span></label>
                <input
                  className="input"
                  placeholder="e.g. payment.succeeded"
                  value={eventTypeName}
                  onChange={e => setEventTypeName(e.target.value)}
                  style={{ fontSize: 12 }}
                />
              </div>

              {/* API key missing */}
              {apiKeyMissing && (
                <div style={{ background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, marginBottom: 16 }}>
                  <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#fbbf24', lineHeight: 1.5 }}>
                    AI features require a Gemini API key. Contact your admin.
                  </div>
                </div>
              )}

              {/* Loading skeleton */}
              {generate.isPending && (
                <div style={{ background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.2)', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(168,85,247,.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#c084fc', fontWeight: 500 }}>✨ Generating schema from your payload...</span>
                  </div>
                  {[75, 60, 85, 50].map((w, i) => (
                    <div key={i} className="skel" style={{ height: 10, borderRadius: 5, marginBottom: 7, width: `${w}%`, opacity: 0.5 }} />
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                <button
                  className="btn"
                  style={{ flex: 1, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', border: 'none', fontWeight: 600, opacity: generate.isPending || !payload.trim() ? 0.6 : 1 }}
                  onClick={() => generate.mutate()}
                  disabled={generate.isPending || !payload.trim() || !aiStatus.configured}
                >
                  <Sparkles size={12} />✨ Generate Schema
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: Review & Save ── */}
          {step === 2 && result && (
            <>
              {/* Suggested name + tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="label">Event Type Name</label>
                    <input
                      className="input"
                      value={result.suggestedName}
                      onChange={e => setResult(r => r ? { ...r, suggestedName: e.target.value } : r)}
                      style={{ fontSize: 12 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="label">Version</label>
                    <input
                      className="input"
                      value={result.version}
                      onChange={e => setResult(r => r ? { ...r, version: e.target.value } : r)}
                      style={{ fontSize: 12, width: 80 }}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="field">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  value={result.suggestedDescription}
                  onChange={e => setResult(r => r ? { ...r, suggestedDescription: e.target.value } : r)}
                  rows={2}
                  style={{ fontSize: 12, resize: 'vertical' }}
                />
              </div>

              {/* Tags */}
              {result.tags?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Suggested Tags</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {result.tags.map(tag => (
                      <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--mono)', fontSize: 10, padding: '3px 9px', borderRadius: 20, background: 'rgba(168,85,247,.1)', color: '#c084fc', border: '1px solid rgba(168,85,247,.25)' }}>
                        <Tag size={9} />{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* JSON Schema preview */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 7 }}>Generated JSON Schema</div>
                <JsonPreview obj={result.jsonSchema} />
              </div>

              {/* Sample payload preview */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 7 }}>Sample Payload</div>
                <JsonPreview obj={result.samplePayload} />
              </div>

              {/* Provider badge */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <AiProviderBadge status={aiStatus} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => { setStep(1); setResult(null); }}
                >
                  <ChevronLeft size={12} />Back
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={onClose}
                >
                  Discard
                </button>
                <button
                  className="btn"
                  style={{ flex: 2, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', border: 'none', fontWeight: 600, opacity: save.isPending ? 0.7 : 1 }}
                  onClick={() => save.mutate()}
                  disabled={save.isPending}
                >
                  <Check size={12} />{save.isPending ? 'Saving...' : 'Save to Event Catalog'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
