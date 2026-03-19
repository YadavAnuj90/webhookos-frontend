'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { tunnelApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Radio, Copy, Check, Terminal, Zap, RefreshCw, AlertCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LS_KEY = 'whk_dev_tunnel';

interface TunnelData { tunnelId: string; publicUrl: string }

function CopyField({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true); toast.success(`${label} copied`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px', minHeight: 42 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1 }}>
            <Loader2 size={13} color="var(--text3)" style={{ animation: 'spin .7s linear infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>Waiting for server…</span>
          </div>
        ) : (
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent2)', flex: 1, wordBreak: 'break-all' }}>{value || '—'}</code>
        )}
        <button onClick={copy} className="btn-icon btn-sm" title={`Copy ${label}`} disabled={!value || loading}>
          {copied ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

export default function DevTunnelPage() {
  const { accessToken } = useAuth();
  const [tunnel, setTunnel]     = useState<TunnelData | null>(null);
  const [active, setActive]     = useState<boolean | null>(null);
  const [creating, setCreating] = useState(false);
  const [polling, setPolling]   = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load persisted tunnel from localStorage on mount ──────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) { const d = JSON.parse(saved); setTunnel(d); }
    } catch { /* ignore */ }
  }, []);

  // ── Poll status whenever we have a tunnelId ────────────────────────────────
  const pollStatus = useCallback(async (tunnelId: string) => {
    setPolling(true);
    try {
      const s: { tunnelId: string; publicUrl: string; active: boolean } = await tunnelApi.status(tunnelId);
      setActive(s.active);
      // Update publicUrl if the server now has one
      if (s.publicUrl) {
        setTunnel(prev => {
          const next = { tunnelId: s.tunnelId || tunnelId, publicUrl: s.publicUrl };
          localStorage.setItem(LS_KEY, JSON.stringify(next));
          return next;
        });
      }
    } catch {
      setActive(false);
    } finally {
      setPolling(false);
    }
  }, []);

  useEffect(() => {
    if (!tunnel?.tunnelId) return;
    pollStatus(tunnel.tunnelId); // immediate first poll
    pollRef.current = setInterval(() => pollStatus(tunnel.tunnelId), 10_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [tunnel?.tunnelId, pollStatus]);

  // ── Create ─────────────────────────────────────────────────────────────────
  const create = async () => {
    setCreating(true);
    // Clear old state
    if (pollRef.current) clearInterval(pollRef.current);
    setActive(null);
    try {
      const d: TunnelData = await tunnelApi.create();
      const next = { tunnelId: d.tunnelId, publicUrl: d.publicUrl || '' };
      setTunnel(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      toast.success('Tunnel created');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create tunnel');
    } finally { setCreating(false); }
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const cliToken   = accessToken ? `${accessToken.slice(0, 20)}…` : '<your-jwt-token>';
  const cliCommandFull = tunnel
    ? `node cli/tunnel.js --token ${accessToken || '<your-jwt-token>'} --port 3000 --tunnel ${tunnel.tunnelId}`
    : `node cli/tunnel.js --token ${accessToken || '<your-jwt-token>'} --port 3000`;

  const S: any = { card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' } };
  const publicUrlLoading = !!tunnel && !tunnel.publicUrl && active !== false;

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#0891b2,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Dev Tunnel</h1>
            <p style={{ margin: 0 }}>// Forward webhooks from the internet to your local machine</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ ...S.card, background: 'rgba(8,145,178,.06)', borderColor: 'rgba(8,145,178,.2)', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: '#22d3ee', marginBottom: 10 }}>How it works</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { n: '1', text: 'Create a tunnel to get a public HTTPS URL forwarded to your local machine.' },
            { n: '2', text: 'Run the CLI on your laptop to start receiving forwarded webhook payloads.' },
            { n: '3', text: 'Send a test event from the Playground — it arrives at localhost instantly.' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(34,211,238,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#22d3ee' }}>{s.n}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Main tunnel card */}
        <div style={S.card}>
          {!tunnel ? (
            /* ─── Empty state ─── */
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(8,145,178,.12)', border: '1px solid rgba(8,145,178,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Radio size={24} color="#22d3ee" />
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>No active tunnel</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>Create a tunnel to get started</div>
              <button
                onClick={create} disabled={creating}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 10, background: 'linear-gradient(135deg,#0891b2,#06b6d4)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: creating ? 0.7 : 1 }}
              >
                {creating
                  ? <><Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} />Creating…</>
                  : <><Zap size={14} />Create Tunnel</>}
              </button>
            </div>
          ) : (
            /* ─── Active state ─── */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(8,145,178,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Radio size={16} color="#22d3ee" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Tunnel Active</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>{tunnel.tunnelId}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Live status badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
                    color: active === null ? 'var(--text3)' : active ? '#4ade80' : '#f87171' }}>
                    {active === null
                      ? <><Loader2 size={13} style={{ animation: 'spin .7s linear infinite' }} /><span>Checking…</span></>
                      : active
                        ? <><Wifi size={13} /><span>Connected</span></>
                        : <><WifiOff size={13} /><span>Disconnected</span></>}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>
                    {polling ? 'polling…' : 'polls 10s'}
                  </span>
                </div>
              </div>

              <CopyField label="Public URL"  value={tunnel.publicUrl}  loading={publicUrlLoading} />
              <CopyField label="Tunnel ID"   value={tunnel.tunnelId} />

              {/* CLI Command */}
              <div style={{ marginBottom: 6, fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>CLI Command</div>
              <div style={{ position: 'relative', background: '#0d1117', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 44px 12px 14px', marginBottom: 16 }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#e6edf3', lineHeight: 1.6, wordBreak: 'break-all', display: 'block' }}>
                  <span style={{ color: '#79c0ff' }}>node</span>
                  <span style={{ color: '#e6edf3' }}> cli/tunnel.js </span>
                  <span style={{ color: '#ff7b72' }}>--token</span>
                  <span style={{ color: '#a5d6ff' }}> {cliToken}</span>
                  <span style={{ color: '#ff7b72' }}> --port</span>
                  <span style={{ color: '#a5d6ff' }}> 3000</span>
                  <span style={{ color: '#ff7b72' }}> --tunnel</span>
                  <span style={{ color: '#a5d6ff' }}> {tunnel.tunnelId}</span>
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(cliCommandFull); toast.success('Command copied'); }}
                  className="btn-icon btn-sm"
                  style={{ position: 'absolute', top: 8, right: 8 }}
                ><Copy size={12} /></button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={create} disabled={creating}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 12, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.6 : 1 }}
                >
                  {creating ? <><Loader2 size={12} style={{ animation: 'spin .7s linear infinite' }} />Creating…</> : <><RefreshCw size={12} />Create new tunnel</>}
                </button>
                <button
                  onClick={() => tunnel && pollStatus(tunnel.tunnelId)} disabled={polling}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 12, cursor: polling ? 'not-allowed' : 'pointer', opacity: polling ? 0.6 : 1 }}
                >
                  {polling ? <><Loader2 size={12} style={{ animation: 'spin .7s linear infinite' }} />Checking…</> : <><Wifi size={12} />Check status</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...S.card, padding: '18px 20px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Prerequisites</div>
            {[
              'Node.js 18+ installed locally',
              'CLI installed: npm i -g webhookos-cli',
              'Access token from API Keys page',
              'Local server running on a port',
            ].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(99,102,241,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Terminal size={8} color="var(--accent2)" />
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ ...S.card, padding: '18px 20px', background: 'rgba(248,113,113,.04)', borderColor: 'rgba(248,113,113,.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <AlertCircle size={13} color="#f87171" />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: '#f87171' }}>Dev only</div>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
              Tunnels are ephemeral and reset on server restart. Do not use for production endpoints.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
