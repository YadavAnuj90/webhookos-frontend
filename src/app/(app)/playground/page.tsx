'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { playgroundApi } from '@/lib/api';
import { FlaskConical, Send, Copy, Check, ChevronDown, ChevronUp, Zap, Clock, CheckCircle, XCircle, Shield } from 'lucide-react';

const METHODS = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'];
const TEMPLATES = [
  { label: 'Basic webhook', payload: { event: 'user.created', data: { id: '123', email: 'user@example.com', name: 'John Doe' }, timestamp: new Date().toISOString() } },
  { label: 'Payment event', payload: { event: 'payment.completed', data: { amount: 9900, currency: 'USD', customerId: 'cus_123' }, metadata: {} } },
  { label: 'Order update', payload: { event: 'order.shipped', data: { orderId: 'ord_456', status: 'shipped', trackingNumber: 'TRK001' } } },
];

export default function PlaygroundPage() {
  const [url, setUrl] = useState('https://webhook.site/');
  const [method, setMethod] = useState('POST');
  const [payload, setPayload] = useState(JSON.stringify(TEMPLATES[0].payload, null, 2));
  const [headers, setHeaders] = useState('{\n  "X-Custom-Header": "value"\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [tab, setTab] = useState<'body'|'headers'|'response'|'curl'>('body');
  const [validateMode, setValidateMode] = useState(false);
  const [sigPayload, setSigPayload] = useState('');
  const [signature, setSignature] = useState('');
  const [secret, setSecret] = useState('');
  const [sigResult, setSigResult] = useState<any>(null);

  const fire = async () => {
    setLoading(true); setResult(null); setTab('response');
    try {
      let hdrs: any = {};
      try { hdrs = JSON.parse(headers); } catch {}
      let body: any;
      try { body = JSON.parse(payload); } catch { body = payload; }
      const r = await playgroundApi.fire({ url, method, headers: hdrs, payload: body });
      setResult(r);
    } catch (e: any) { setResult({ error: e.message, success: false }); }
    finally { setLoading(false); }
  };

  const validate = async () => {
    try { const r = await playgroundApi.validateSignature({ payload: sigPayload, signature, secret }); setSigResult(r); } catch (e: any) { toast.error('Validation failed'); }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const copyCurl = () => {
    if (result?.curl) { navigator.clipboard.writeText(result.curl); setCopiedCurl(true); setTimeout(() => setCopiedCurl(false), 2000); }
  };

  const S: any = {
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 },
    label: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' },
    input: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' },
    tab: (active: boolean) => ({ padding: '6px 14px', borderRadius: 7, fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: active ? 600 : 400, background: active ? 'rgba(99,102,241,0.15)' : 'transparent', color: active ? 'var(--accent2)' : 'var(--text3)', border: 'none', cursor: 'pointer' }),
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FlaskConical size={18} color="#fff" /></div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Playground</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Fire test webhooks to any URL and inspect the response in real-time</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => setValidateMode(false)} style={{ ...S.tab(!validateMode), border: '1px solid var(--border)' }}>Fire Request</button>
          <button onClick={() => setValidateMode(true)} style={{ ...S.tab(validateMode), border: '1px solid var(--border)' }}><Shield size={12} style={{ marginRight: 4 }} />Validate Signature</button>
        </div>
      </div>

      {!validateMode ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: Request */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...S.card, padding: 20 }}>
              <label style={S.label}>Target URL</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={method} onChange={e => setMethod(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent2)', fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-endpoint.com/webhook" style={{ ...S.input, flex: 1 }} />
              </div>
            </div>
            <div style={{ ...S.card, overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 4, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                {(['body', 'headers'] as const).map(t => <button key={t} onClick={() => setTab(t)} style={S.tab(tab === t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
              </div>
              <div style={{ padding: 16 }}>
                {tab === 'body' && (
                  <>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      {TEMPLATES.map(tpl => <button key={tpl.label} onClick={() => setPayload(JSON.stringify(tpl.payload, null, 2))} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', cursor: 'pointer' }}>{tpl.label}</button>)}
                    </div>
                    <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={14} style={S.textarea} />
                  </>
                )}
                {tab === 'headers' && <textarea value={headers} onChange={e => setHeaders(e.target.value)} rows={14} style={S.textarea} placeholder='{\n  "Authorization": "Bearer token"\n}' />}
              </div>
            </div>
            <button onClick={fire} disabled={loading || !url} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: loading ? 'var(--bg3)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Firing...</> : <><Send size={15} />Fire Request</>}
            </button>
          </div>

          {/* Right: Response */}
          <div style={{ ...S.card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              {(['response', 'curl'] as const).map(t => <button key={t} onClick={() => setTab(t)} style={S.tab(tab === t)}>{t === 'curl' ? 'cURL' : 'Response'}</button>)}
              {result && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {result.status > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: result.success ? '#4ade80' : '#f87171', background: result.success ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', padding: '2px 8px', borderRadius: 5 }}>{result.status}</span>}
                  {result.latency && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{result.latency}ms</span>}
                  <button onClick={copyResult} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 11 }}>
                    {copied ? <><Check size={12} color="#4ade80" />Copied</> : <><Copy size={12} />Copy</>}
                  </button>
                </div>
              )}
            </div>
            <div style={{ flex: 1, padding: 16, overflowY: 'auto', minHeight: 400 }}>
              {!result && !loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text3)', opacity: 0.5 }}>
                  <Zap size={36} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>Response will appear here</span>
                </div>
              )}
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                  <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--accent2)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)' }}>Sending request...</span>
                </div>
              )}
              {result && tab === 'response' && (
                <div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Status', val: result.status || '--', color: result.success ? '#4ade80' : '#f87171' },
                      { label: 'Latency', val: result.latency ? result.latency + 'ms' : '--', color: 'var(--text2)' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                  {result.error && <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: 12, marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f87171' }}>{result.error}</div>}
                  {result.headers && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Response Headers</div>
                      <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', overflow: 'auto', margin: 0 }}>{Object.entries(result.headers).slice(0, 10).map(([k, v]) => `${k}: ${v}`).join('\n')}</pre>
                    </div>
                  )}
                  {result.body !== undefined && (
                    <div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Response Body</div>
                      <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', overflow: 'auto', margin: 0, maxHeight: 300 }}>{typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
              {result && tab === 'curl' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                    <button onClick={copyCurl} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {copiedCurl ? <><Check size={12} color="#4ade80" />Copied!</> : <><Copy size={12} />Copy cURL</>}
                    </button>
                  </div>
                  <pre style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent3)', overflow: 'auto', margin: 0 }}>{result.curl || '# Fire a request first'}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 600, ...S.card, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Shield size={18} color="var(--accent2)" />
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Validate Webhook Signature</h2>
          </div>
          {[['Payload (raw body)', sigPayload, setSigPayload, 'The raw request body string'], ['Signature header', signature, setSignature, 'sha256=abc123...'], ['Webhook secret', secret, setSecret, 'Your signing secret']].map(([lbl, val, set, ph]: any) => (
            <div key={lbl as string} style={{ marginBottom: 14 }}>
              <label style={S.label}>{lbl as string}</label>
              <input value={val as string} onChange={e => (set as any)(e.target.value)} placeholder={ph as string} style={S.input} />
            </div>
          ))}
          <button onClick={validate} style={{ padding: '10px 24px', borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Validate</button>
          {sigResult && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 10, border: `1px solid ${sigResult.valid ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`, background: sigResult.valid ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              {sigResult.valid ? <CheckCircle size={18} color="#4ade80" /> : <XCircle size={18} color="#f87171" />}
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: sigResult.valid ? '#4ade80' : '#f87171' }}>{sigResult.valid ? 'Signature Valid' : 'Signature Invalid'}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Expected: {sigResult.expected}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
