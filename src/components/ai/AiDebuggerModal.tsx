'use client';
import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi, endpointsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { AiDebugResponse } from '@/lib/types';
import { X, Copy, Check, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAiStatus } from '@/hooks/useAiStatus';
import { AiProviderBadge, AiNotConfiguredBanner } from './AiProviderBadge';

const PID = 'default';

const SEVERITY_CFG = {
  critical: { color: '#f87171', bg: 'rgba(248,113,113,.12)', label: 'CRITICAL', dot: '🔴' },
  high:     { color: '#fb923c', bg: 'rgba(251,146,60,.12)',  label: 'HIGH',     dot: '🟠' },
  medium:   { color: '#fbbf24', bg: 'rgba(251,191,36,.12)',  label: 'MEDIUM',   dot: '🟡' },
  low:      { color: '#4ade80', bg: 'rgba(74,222,128,.12)',  label: 'LOW',      dot: '🟢' },
};

const EXAMPLE_QUESTIONS = [
  'Why is my endpoint failing?',
  'What caused the spike in failures?',
  'Are there any auth errors?',
  "What's wrong with my DLQ?",
];

const TIME_OPTS = [
  { label: '1h',  value: 1 },
  { label: '6h',  value: 6 },
  { label: '24h', value: 24 },
  { label: '48h', value: 48 },
  { label: '7d',  value: 168 },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      style={{ background: 'none', border: '1px solid var(--b2)', borderRadius: 5, padding: '2px 7px', cursor: 'pointer', color: 'var(--t3)', display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10 }}
    >
      {copied ? <Check size={10} color="#4ade80" /> : <Copy size={10} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

interface Props {
  onClose: () => void;
  prefilledEndpointId?: string;
}

export default function AiDebuggerModal({ onClose, prefilledEndpointId }: Props) {
  const { status: aiStatus } = useAiStatus();
  const [question, setQuestion] = useState('');
  const [endpointId, setEndpointId] = useState(prefilledEndpointId || '');
  const [eventType, setEventType] = useState('');
  const [hours, setHours] = useState(24);
  const [result, setResult] = useState<AiDebugResponse | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const { data: eps } = useQuery({
    queryKey: ['eps-list-ai'],
    queryFn: () => endpointsApi.list(PID, { limit: 50 }),
  });

  const mut = useMutation({
    mutationFn: () => aiApi.debug(PID, { question, endpointId: endpointId || undefined, eventType: eventType || undefined, hours }),
    onSuccess: (d: AiDebugResponse) => setResult(d),
    onError: (e: any) => {
      const msg = e.response?.data?.message || '';
      if (msg.toLowerCase().includes('gemini') || msg.toLowerCase().includes('api_key') || e.response?.status === 503) {
        setApiKeyMissing(true);
      } else {
        toast.error('AI analysis failed. Please try again.');
      }
    },
  });

  const handleAsk = () => {
    if (!question.trim()) { toast.error('Please enter a question'); return; }
    setResult(null);
    setApiKeyMissing(false);
    mut.mutate();
  };

  const sev = result ? SEVERITY_CFG[result.severity] : null;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal modal-lg" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--b1)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={15} color="#fff" />
            </div>
            <div>
              <div className="modal-title">AI Webhook Debugger</div>
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

          {/* Question input */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <textarea
              ref={taRef}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAsk(); }}
              placeholder="Ask anything about your webhook delivery..."
              style={{ width: '100%', background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.28)', borderRadius: 10, padding: '12px 14px', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--t1)', outline: 'none', resize: 'none', minHeight: 72, lineHeight: 1.55, boxSizing: 'border-box' }}
            />
            <button
              onClick={handleAsk}
              disabled={mut.isPending || !question.trim() || !aiStatus.configured}
              style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 7, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', border: 'none', color: '#fff', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, cursor: mut.isPending || !question.trim() || !aiStatus.configured ? 'not-allowed' : 'pointer', opacity: mut.isPending || !question.trim() || !aiStatus.configured ? 0.6 : 1 }}
            >
              <Sparkles size={11} />Ask
            </button>
          </div>

          {/* Example chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {EXAMPLE_QUESTIONS.map(q => (
              <button key={q} onClick={() => { setQuestion(q); taRef.current?.focus(); }}
                style={{ fontFamily: 'var(--sans)', fontSize: 11, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(168,85,247,.3)', background: 'rgba(168,85,247,.07)', color: '#c084fc', cursor: 'pointer' }}>
                {q}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 10, marginBottom: 20 }}>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 4 }}>Endpoint (optional)</label>
              <select className="input" value={endpointId} onChange={e => setEndpointId(e.target.value)} style={{ fontSize: 12 }}>
                <option value="">All endpoints</option>
                {eps?.endpoints?.map((ep: any) => <option key={ep._id} value={ep._id}>{ep.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 4 }}>Event Type (optional)</label>
              <input className="input" placeholder="payment.failed" value={eventType} onChange={e => setEventType(e.target.value)} style={{ fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 4 }}>Time Window</label>
              <select className="input" value={hours} onChange={e => setHours(Number(e.target.value))} style={{ fontSize: 12 }}>
                {TIME_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Loading skeleton */}
          {mut.isPending && (
            <div style={{ background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.2)', borderRadius: 12, padding: '24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 20, height: 20, border: '2px solid rgba(168,85,247,.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#c084fc', fontWeight: 500 }}>✨ Analyzing your logs...</span>
              </div>
              {[80, 65, 55, 70].map((w, i) => (
                <div key={i} className="skel" style={{ height: 12, borderRadius: 6, marginBottom: 8, width: `${w}%`, opacity: 0.5 }} />
              ))}
            </div>
          )}

          {/* API key missing */}
          {apiKeyMissing && (
            <div style={{ background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 10 }}>
              <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#fbbf24', lineHeight: 1.5 }}>
                AI features require a Gemini API key. Contact your admin.
              </div>
            </div>
          )}

          {/* Result */}
          {result && sev && (
            <div style={{ background: 'rgba(168,85,247,.05)', border: '1px solid rgba(168,85,247,.2)', borderRadius: 12, padding: '20px' }}>
              {/* Severity + affected events */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: sev.bg, color: sev.color, border: `1px solid ${sev.color}40` }}>
                  {sev.dot} {sev.label}
                </span>
                {result.affectedEvents > 0 && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)' }}>
                    • {result.affectedEvents} affected events
                  </span>
                )}
              </div>

              {/* Answer */}
              <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--t2)', lineHeight: 1.65, marginBottom: 14 }}>
                {result.answer}
              </p>

              {/* Root cause */}
              <div style={{ background: 'rgba(0,0,0,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Root Cause</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--t1)', lineHeight: 1.5 }}>{result.rootCause}</div>
              </div>

              {/* Suggested Actions */}
              {result.suggestedActions?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Suggested Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {result.suggestedActions.map((action, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, background: 'rgba(74,222,128,.05)', border: '1px solid rgba(74,222,128,.15)', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ color: '#4ade80', fontSize: 12, flexShrink: 0, marginTop: 1 }}>✅</span>
                          <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--t1)', lineHeight: 1.45 }}>{action}</span>
                        </div>
                        <CopyBtn text={action} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Replay button */}
              {result.affectedEvents > 0 && (
                <button
                  onClick={() => { toast.success(`Replay queued for affected events`); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(251,146,60,.35)', background: 'rgba(251,146,60,.1)', color: '#fb923c', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  <RotateCcw size={12} />Replay {result.affectedEvents} affected events
                </button>
              )}

              {/* Provider badge */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--b1)', display: 'flex', justifyContent: 'flex-end' }}>
                <AiProviderBadge status={aiStatus} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
