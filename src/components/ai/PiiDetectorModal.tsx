'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { useProjectStore } from '@/lib/store';
import { PiiDetectionResult, PiiDetectedField } from '@/lib/types';
import { X, Sparkles, AlertCircle, Shield, ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAiStatus } from '@/hooks/useAiStatus';
import { AiProviderBadge, AiNotConfiguredBanner } from './AiProviderBadge';

const PII_TYPE_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  email:        { label: 'Email',        color: '#f87171', bg: 'rgba(248,113,113,.12)', icon: '📧' },
  phone:        { label: 'Phone',        color: '#fb923c', bg: 'rgba(251,146,60,.12)',  icon: '📱' },
  name:         { label: 'Name',         color: '#fbbf24', bg: 'rgba(251,191,36,.12)',  icon: '👤' },
  address:      { label: 'Address',      color: '#fb923c', bg: 'rgba(251,146,60,.12)',  icon: '🏠' },
  credit_card:  { label: 'Credit Card',  color: '#f87171', bg: 'rgba(248,113,113,.12)', icon: '💳' },
  ssn:          { label: 'SSN',          color: '#f87171', bg: 'rgba(248,113,113,.12)', icon: '🪪' },
  ip_address:   { label: 'IP Address',   color: '#fbbf24', bg: 'rgba(251,191,36,.12)',  icon: '🌐' },
  auth_token:   { label: 'Auth Token',   color: '#f87171', bg: 'rgba(248,113,113,.12)', icon: '🔐' },
  api_key:      { label: 'API Key',      color: '#f87171', bg: 'rgba(248,113,113,.12)', icon: '🔑' },
  dob:          { label: 'Date of Birth',color: '#fbbf24', bg: 'rgba(251,191,36,.12)',  icon: '🎂' },
  national_id:  { label: 'National ID',  color: '#f87171', bg: 'rgba(248,113,113,.12)', icon: '🪪' },
  other:        { label: 'Other PII',    color: '#c084fc', bg: 'rgba(192,132,252,.12)', icon: '⚠️' },
};

const CONFIDENCE_CFG: Record<string, { label: string; color: string }> = {
  high:   { label: 'High',   color: '#f87171' },
  medium: { label: 'Medium', color: '#fbbf24' },
  low:    { label: 'Low',    color: '#4ade80' },
};

const EXAMPLE_PAYLOADS = [
  {
    label: 'User Data',
    payload: `{
  "user_id": "usr_123",
  "email": "john.doe@example.com",
  "phone": "+91-9876543210",
  "name": "John Doe",
  "address": "123 Main St, Mumbai",
  "card_last4": "4242"
}`,
  },
  {
    label: 'Payment',
    payload: `{
  "amount": 9900,
  "currency": "INR",
  "customer_email": "user@example.com",
  "card_number": "4111111111111111",
  "ip": "192.168.1.1"
}`,
  },
];

function FieldRow({ field }: { field: PiiDetectedField }) {
  const cfg = PII_TYPE_LABELS[field.type] || PII_TYPE_LABELS.other;
  const conf = CONFIDENCE_CFG[field.confidence];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: cfg.bg, border: `1px solid ${cfg.color}30`, borderRadius: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{cfg.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
          <code style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: cfg.color }}>{field.path}</code>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '1px 6px', borderRadius: 4, background: `${cfg.color}25`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>{cfg.label}</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: conf.color }}>Confidence: {conf.label}</span>
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--t3)', lineHeight: 1.4 }}>{field.reason}</div>
      </div>
    </div>
  );
}

interface Props {
  onClose: () => void;
  /** If provided, uses endpoint-scoped detection + offers autoApply */
  endpointId?: string;
  onApplied?: (piiPaths: string[]) => void;
}

export default function PiiDetectorModal({ onClose, endpointId, onApplied }: Props) {
  const { projectId: PID } = useProjectStore();
  const { status: aiStatus } = useAiStatus();
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState<PiiDetectionResult | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const detect = useMutation({
    mutationFn: () => {
      let parsed: object;
      try { parsed = JSON.parse(payload); } catch { throw new Error('invalid_json'); }
      if (endpointId) {
        return aiApi.detectPiiForEndpoint(PID, endpointId, { payload: parsed, autoApply: false });
      }
      return aiApi.detectPiiStandalone(parsed);
    },
    onSuccess: (d: PiiDetectionResult) => setResult(d),
    onError: (e: any) => {
      if (e.message === 'invalid_json') { toast.error('Invalid JSON payload'); return; }
      const msg = e.response?.data?.message || '';
      if (msg.toLowerCase().includes('gemini') || msg.toLowerCase().includes('api_key') || e.response?.status === 503) {
        setApiKeyMissing(true);
      } else {
        toast.error('PII detection failed. Please try again.');
      }
    },
  });

  const applyMask = useMutation({
    mutationFn: () => {
      let parsed: object;
      try { parsed = JSON.parse(payload); } catch { throw new Error('invalid_json'); }
      return aiApi.detectPiiForEndpoint(PID, endpointId!, { payload: parsed, autoApply: true });
    },
    onSuccess: (d: PiiDetectionResult) => {
      toast.success(`PII masking applied for ${d.piiPaths.length} field${d.piiPaths.length !== 1 ? 's' : ''}`);
      onApplied?.(d.piiPaths);
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Apply failed'),
  });

  const noPii = result && result.detectedFields.length === 0;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--b1)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={15} color="#fff" />
            </div>
            <div>
              <div className="modal-title">PII Auto-Detector</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#a855f7', marginTop: 1 }}>
                {aiStatus.configured ? `Powered by ${aiStatus.label} ✨` : 'AI not configured'}
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ paddingTop: 20 }}>
          {/* Not configured warning */}
          {!aiStatus.configured && <AiNotConfiguredBanner />}

          {/* Example chips */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Try an example</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLE_PAYLOADS.map(ex => (
                <button
                  key={ex.label}
                  onClick={() => { setPayload(ex.payload); setResult(null); }}
                  style={{ fontFamily: 'var(--sans)', fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(168,85,247,.3)', background: 'rgba(168,85,247,.07)', color: '#c084fc', cursor: 'pointer' }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payload input */}
          <div className="field">
            <label className="label">Sample Payload (JSON)</label>
            <textarea
              value={payload}
              onChange={e => { setPayload(e.target.value); setResult(null); }}
              placeholder={'{\n  "user": {\n    "email": "john@example.com",\n    "phone": "+1-555-1234"\n  }\n}'}
              style={{ width: '100%', minHeight: 140, background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.28)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t1)', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
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
          {detect.isPending && (
            <div style={{ background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.2)', borderRadius: 10, padding: '20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(168,85,247,.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#c084fc', fontWeight: 500 }}>✨ Scanning for PII fields...</span>
              </div>
              {[70, 55, 80, 60].map((w, i) => (
                <div key={i} className="skel" style={{ height: 10, borderRadius: 5, marginBottom: 7, width: `${w}%`, opacity: 0.5 }} />
              ))}
            </div>
          )}

          {/* Results */}
          {result && !detect.isPending && (
            <div style={{ marginBottom: 16 }}>
              {noPii ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.25)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                  <ShieldCheck size={18} color="#4ade80" />
                  <div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: '#4ade80' }}>No PII detected</div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>This payload appears to be free of personally identifiable information.</div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Eye size={14} color="#f87171" />
                    <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>
                      {result.detectedFields.length} PII field{result.detectedFields.length !== 1 ? 's' : ''} detected
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--t2)', lineHeight: 1.55, marginBottom: 12 }}>{result.summary}</p>
                  <div>
                    {result.detectedFields.map((f, i) => <FieldRow key={i} field={f} />)}
                  </div>
                  {result.piiPaths?.length > 0 && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(0,0,0,.2)', borderRadius: 8 }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Fields to mask</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {result.piiPaths.map(p => (
                          <code key={p} style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(168,85,247,.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,.2)' }}>{p}</code>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {/* Provider badge */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <AiProviderBadge status={aiStatus} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Close</button>
            {result && !noPii && endpointId && (
              <button
                className="btn"
                style={{ flex: 2, background: 'rgba(168,85,247,.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,.35)', fontWeight: 600, opacity: applyMask.isPending ? 0.7 : 1 }}
                onClick={() => applyMask.mutate()}
                disabled={applyMask.isPending}
              >
                <EyeOff size={12} />{applyMask.isPending ? 'Applying...' : 'Apply Masking to Endpoint'}
              </button>
            )}
            <button
              className="btn"
              style={{ flex: 2, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', border: 'none', fontWeight: 600, opacity: detect.isPending || !payload.trim() || !aiStatus.configured ? 0.6 : 1 }}
              onClick={() => detect.mutate()}
              disabled={detect.isPending || !payload.trim() || !aiStatus.configured}
            >
              <Sparkles size={12} />{detect.isPending ? 'Scanning...' : '✨ Scan for PII'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
