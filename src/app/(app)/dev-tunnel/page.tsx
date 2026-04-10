'use client';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tunnelApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import {
  Radio, Copy, Check, Terminal, Zap, RefreshCw, AlertCircle,
  Wifi, WifiOff, Loader2, Globe, Play, Square, Hash, Link2,
  Clock, Shield, Trash2, Plus, ArrowRight, Activity, ExternalLink,
  ChevronDown, ChevronRight, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Empty from '@/components/ui/Empty';
import { SkeletonTable } from '@/components/ui/Skeleton';

/* ══════════════════════════════════════════════════════════════════════════════
   TYPES — matched to backend response shapes
   ══════════════════════════════════════════════════════════════════════════════ */
interface Tunnel {
  tunnelId: string;
  userId: string;
  publicUrl: string;
  inboundUrl: string;
  sseUrl: string;
  active: boolean;
  forwarded: number;
  lastEventAt: string | null;
  createdAt: string;
  expiresIn?: string;
}

/* ══════════════════════════════════════════════════════════════════════════════
   COPY BUTTON (inline)
   ══════════════════════════════════════════════════════════════════════════════ */
function CopyBtn({ value, label }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;
    navigator.clipboard.writeText(value);
    setOk(true);
    toast.success(`${label || 'Copied'}!`);
    setTimeout(() => setOk(false), 2000);
  };
  return (
    <button onClick={copy} className="btn-icon btn-sm" title={`Copy ${label || ''}`} disabled={!value}>
      {ok ? <Check size={11} color="var(--green)" /> : <Copy size={11} />}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════════ */
export default function DevTunnelPage() {
  const qc = useQueryClient();
  const { accessToken } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ── Fetch tunnels from API (no localStorage!) ── */
  const { data: tunnels, isLoading, isFetching } = useQuery<Tunnel[]>({
    queryKey: ['tunnels-mine'],
    queryFn: () => tunnelApi.mine(),
    refetchInterval: 8_000,    // live-poll every 8s
    refetchOnWindowFocus: true,
  });

  /* ── Create tunnel ── */
  const createMut = useMutation({
    mutationFn: () => tunnelApi.create(),
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['tunnels-mine'] });
      setExpandedId(d.tunnelId);
      toast.success('Tunnel created');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create tunnel'),
  });

  /* ── Delete tunnel ── */
  const deleteMut = useMutation({
    mutationFn: (id: string) => tunnelApi.remove(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['tunnels-mine'] });
      if (expandedId === id) setExpandedId(null);
      toast.success('Tunnel deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  /* ── Stats ── */
  const list = tunnels || [];
  const activeTunnels = list.filter(t => t.active);
  const totalForwarded = list.reduce((s, t) => s + (t.forwarded || 0), 0);

  /* ── CLI command builder ── */
  const cliCmd = (t: Tunnel) =>
    `node cli/tunnel.js --token ${accessToken || '<your-jwt-token>'} --port 3000 --tunnel ${t.tunnelId}`;
  const cliToken = accessToken ? `${accessToken.slice(0, 20)}…` : '<your-jwt-token>';

  return (
    <div className="page">
      {/* ═══ Header ═══ */}
      <div className="ph">
        <div className="ph-left" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(8,145,178,.22), 0 4px 20px rgba(8,145,178,.25)',
          }}>
            <Radio size={19} color="#fff" />
          </div>
          <div>
            <h1>Dev Tunnel</h1>
            <p>Forward webhooks from the internet to your local machine</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => qc.invalidateQueries({ queryKey: ['tunnels-mine'] })}
            style={{ gap: 5 }}
          >
            <RefreshCw size={12} className={isFetching ? 'spinning' : ''} />
            Refresh
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => createMut.mutate()}
            disabled={createMut.isPending}
            style={{ gap: 5 }}
          >
            {createMut.isPending
              ? <><Loader2 size={12} style={{ animation: 'spin .7s linear infinite' }} /> Creating…</>
              : <><Plus size={13} /> New Tunnel</>}
          </button>
        </div>
      </div>

      {/* ═══ How it works ═══ */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--b1)',
        borderRadius: 'var(--r3)', padding: '16px 24px', marginBottom: 18,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
          fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
          color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '.1em',
        }}>
          <Zap size={10} /> How it works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {[
            { icon: Globe, text: 'Create a tunnel to get a public URL that forwards to your local machine.' },
            { icon: Terminal, text: 'Run the CLI on your laptop to connect and receive forwarded payloads.' },
            { icon: Play, text: 'Send a test event from the Playground — it arrives at localhost instantly.' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '0 20px',
              borderLeft: i > 0 ? '1px solid var(--b1)' : 'none',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: 'rgba(8,145,178,.1)', border: '1px solid rgba(8,145,178,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 800, color: '#22d3ee' }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.55 }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Stat Cards ═══ */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 18 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-lbl">Total Tunnels</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bbg)', border: '1px solid var(--bbd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={13} color="var(--blue)" />
            </div>
          </div>
          <div className="stat-val" style={{ color: 'var(--blue)' }}>{list.length}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-lbl">Active Now</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--gbg)', border: '1px solid var(--gbd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wifi size={13} color="var(--green)" />
            </div>
          </div>
          <div className="stat-val" style={{ color: 'var(--green)' }}>{activeTunnels.length}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-lbl">Events Forwarded</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--abg)', border: '1px solid var(--abd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={13} color="var(--a2)" />
            </div>
          </div>
          <div className="stat-val" style={{ color: 'var(--a2)' }}>{totalForwarded}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-lbl">Waiting for CLI</span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--rbg)', border: '1px solid var(--rbd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WifiOff size={13} color="var(--red)" />
            </div>
          </div>
          <div className="stat-val" style={{ color: 'var(--red)' }}>{list.length - activeTunnels.length}</div>
        </div>
      </div>

      {/* ═══ Main Content: 2-column ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}>

        {/* ── Left: Tunnel List / Table ── */}
        <div className="tbl-wrap">
          {isLoading ? (
            <table className="tbl">
              <thead><tr>{['Status', 'Tunnel ID', 'Public URL', 'Events', 'Created', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <SkeletonTable rows={3} cols={6} />
            </table>
          ) : list.length === 0 ? (
            <div style={{ padding: '48px 32px', textAlign: 'center' }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16, margin: '0 auto 18px',
                background: 'rgba(8,145,178,.08)', border: '1px solid rgba(8,145,178,.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Radio size={26} color="#22d3ee" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>No tunnels yet</div>
              <div style={{ fontSize: 12.5, color: 'var(--t3)', marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
                Create a tunnel to get a public URL that forwards webhook payloads to your local dev server.
              </div>
              <button
                className="btn btn-primary"
                onClick={() => createMut.mutate()}
                disabled={createMut.isPending}
                style={{ gap: 7 }}
              >
                {createMut.isPending
                  ? <><Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} /> Creating…</>
                  : <><Zap size={14} /> Create First Tunnel</>}
              </button>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>Status</th>
                  <th>Tunnel ID</th>
                  <th>Public URL</th>
                  <th style={{ width: 80, textAlign: 'center' }}>Events</th>
                  <th style={{ width: 130 }}>Created</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => {
                  const isOpen = expandedId === t.tunnelId;
                  return (
                    <TunnelRow
                      key={t.tunnelId}
                      tunnel={t}
                      isOpen={isOpen}
                      cliToken={cliToken}
                      cliCmd={cliCmd(t)}
                      accessToken={accessToken}
                      onToggle={() => setExpandedId(isOpen ? null : t.tunnelId)}
                      onDelete={() => deleteMut.mutate(t.tunnelId)}
                      deleting={deleteMut.isPending}
                    />
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Right: Info Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Prerequisites */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--b1)',
            borderRadius: 'var(--r3)', padding: '18px 20px',
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: 'var(--t1)',
              marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <Shield size={13} color="var(--a2)" /> Prerequisites
            </div>
            {[
              { icon: Terminal, text: 'Node.js 18+ installed locally' },
              { icon: Globe, text: 'CLI installed: npm i -g webhookos-cli' },
              { icon: Shield, text: 'Access token from API Keys page' },
              { icon: Radio, text: 'Local server running on a port' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0', borderTop: i > 0 ? '1px solid var(--b1)' : 'none',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  background: 'var(--abg)', border: '1px solid var(--abd)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <s.icon size={10} color="var(--a2)" />
                </div>
                <span style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.45 }}>{s.text}</span>
              </div>
            ))}
          </div>

          {/* Quick Test */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--b1)',
            borderRadius: 'var(--r3)', padding: '18px 20px',
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: 'var(--t1)',
              marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <Zap size={13} color="var(--yellow)" /> Quick Test
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.55, marginBottom: 12 }}>
              After connecting the CLI, send a test webhook:
            </div>
            <div style={{
              background: '#0d1117', borderRadius: 'var(--r1)',
              padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 10,
              color: '#e6edf3', lineHeight: 1.6, wordBreak: 'break-all',
              border: '1px solid rgba(255,255,255,.06)',
            }}>
              <span style={{ color: '#79c0ff' }}>curl</span>
              <span style={{ color: '#ff7b72' }}> -X POST</span>
              <span style={{ color: '#e6edf3' }}> {'<public-url>'}</span>
              <span style={{ color: '#ff7b72' }}> \{'\n'}  -H</span>
              <span style={{ color: '#a5d6ff' }}> "Content-Type: application/json"</span>
              <span style={{ color: '#ff7b72' }}> \{'\n'}  -d</span>
              <span style={{ color: '#a5d6ff' }}> {'\'{"test": true}\''}</span>
            </div>
          </div>

          {/* Warning */}
          <div style={{
            background: 'var(--rbg)', border: '1px solid var(--rbd)',
            borderRadius: 'var(--r3)', padding: '16px 18px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6,
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
              color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '.08em',
            }}>
              <AlertCircle size={12} /> Dev only
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.55 }}>
              Tunnels are ephemeral and reset on server restart. Do not use for production.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   TUNNEL ROW (with expand/collapse detail)
   ══════════════════════════════════════════════════════════════════════════════ */
function TunnelRow({ tunnel: t, isOpen, cliToken, cliCmd, accessToken, onToggle, onDelete, deleting }: {
  tunnel: Tunnel; isOpen: boolean; cliToken: string; cliCmd: string;
  accessToken: string | null; onToggle: () => void; onDelete: () => void; deleting: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const copyField = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  const fmtTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return d.toLocaleDateString();
    } catch { return '—'; }
  };

  return (
    <>
      {/* ── Main Row ── */}
      <tr onClick={onToggle} style={{ cursor: 'pointer' }}>
        {/* Status */}
        <td>
          <span
            className={`badge ${t.active ? 'b-green' : 'b-gray'}`}
            style={{ fontSize: 9, gap: 4 }}
          >
            {t.active ? <Wifi size={9} /> : <WifiOff size={9} />}
            {t.active ? 'Connected' : 'Waiting for CLI'}
          </span>
        </td>

        {/* Tunnel ID */}
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isOpen ? <ChevronDown size={11} color="var(--a2)" /> : <ChevronRight size={11} color="var(--t3)" />}
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t1)', fontWeight: 500 }}>
              {t.tunnelId.slice(0, 10)}…{t.tunnelId.slice(-6)}
            </span>
          </div>
        </td>

        {/* Public URL */}
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--t2)',
              maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
            }}>
              {t.publicUrl}
            </span>
            <CopyBtn value={t.publicUrl} label="URL" />
          </div>
        </td>

        {/* Events */}
        <td style={{ textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: t.forwarded > 0 ? 'var(--a2)' : 'var(--t3)' }}>
            {t.forwarded || 0}
          </span>
        </td>

        {/* Created */}
        <td>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--t3)' }}>
            {fmtTime(t.createdAt)}
          </span>
        </td>

        {/* Actions */}
        <td>
          <button
            className="btn-icon btn-sm"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={deleting}
            title="Delete tunnel"
            style={{ color: 'var(--red)' }}
          >
            <Trash2 size={12} />
          </button>
        </td>
      </tr>

      {/* ── Expanded Detail ── */}
      {isOpen && (
        <tr>
          <td colSpan={6} style={{ padding: 0, background: 'rgba(91,108,248,.02)' }}>
            <div style={{ padding: '18px 22px' }}>

              {/* Next-step banner when tunnel is idle (not yet connected via CLI) */}
              {!t.active && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 16px', marginBottom: 16,
                  background: 'var(--ybg)', border: '1px solid var(--ybd)',
                  borderRadius: 'var(--r2)',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(234,179,8,.15)', border: '1px solid rgba(234,179,8,.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ArrowRight size={13} color="var(--yellow)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--yellow)', marginBottom: 4 }}>
                      Next step: Connect your CLI
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--t2)', lineHeight: 1.55 }}>
                      Tunnel is created but not connected yet. Copy the CLI command below and run it in your terminal to start receiving webhooks. Status will change to <span style={{ color: 'var(--green)', fontWeight: 600 }}>Active</span> once connected.
                    </div>
                  </div>
                </div>
              )}

              {/* Connected success banner */}
              {t.active && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', marginBottom: 16,
                  background: 'var(--gbg)', border: '1px solid var(--gbd)',
                  borderRadius: 'var(--r2)',
                }}>
                  <Wifi size={13} color="var(--green)" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>
                    CLI connected — webhooks sent to the public URL will be forwarded to your local server.
                  </span>
                </div>
              )}

              {/* URL Fields */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16,
              }}>
                <FieldCard label="Public URL (Inbound)" value={t.publicUrl} icon={Globe} accent="#22d3ee" onCopy={() => copyField(t.publicUrl, 'Public URL')} copied={copied === 'Public URL'} />
                <FieldCard label="SSE Stream URL" value={t.sseUrl} icon={Link2} accent="var(--a2)" onCopy={() => copyField(t.sseUrl, 'SSE URL')} copied={copied === 'SSE URL'} />
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16,
              }}>
                <FieldCard label="Tunnel ID" value={t.tunnelId} icon={Hash} accent="var(--t3)" onCopy={() => copyField(t.tunnelId, 'Tunnel ID')} copied={copied === 'Tunnel ID'} />
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                }}>
                  <MiniStat label="Events Forwarded" value={String(t.forwarded || 0)} icon={Activity} color="var(--a2)" />
                  <MiniStat label="Last Event" value={t.lastEventAt ? new Date(t.lastEventAt).toLocaleTimeString() : 'None'} icon={Clock} color="var(--yellow)" />
                </div>
              </div>

              {/* CLI Command */}
              <div className="label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Terminal size={9} color="var(--t3)" /> CLI Command
              </div>
              <div style={{
                position: 'relative', background: '#0d1117',
                border: '1px solid rgba(255,255,255,.06)',
                borderRadius: 'var(--r2)', padding: '12px 44px 12px 14px',
              }}>
                <code style={{
                  fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.7,
                  wordBreak: 'break-all', display: 'block',
                }}>
                  <span style={{ color: '#79c0ff' }}>node</span>
                  <span style={{ color: '#e6edf3' }}> cli/tunnel.js </span>
                  <span style={{ color: '#ff7b72' }}>--token</span>
                  <span style={{ color: '#a5d6ff' }}> {cliToken} </span>
                  <span style={{ color: '#ff7b72' }}>--port</span>
                  <span style={{ color: '#a5d6ff' }}> 3000 </span>
                  <span style={{ color: '#ff7b72' }}>--tunnel</span>
                  <span style={{ color: '#a5d6ff' }}> {t.tunnelId}</span>
                </code>
                <button
                  onClick={(e) => { e.stopPropagation(); copyField(cliCmd, 'Command'); }}
                  className="btn-icon btn-sm"
                  style={{ position: 'absolute', top: 8, right: 8 }}
                  title="Copy command"
                >
                  {copied === 'Command' ? <Check size={11} color="var(--green)" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════════════ */
function FieldCard({ label, value, icon: Icon, accent, onCopy, copied }: {
  label: string; value: string; icon: any; accent: string; onCopy: () => void; copied: boolean;
}) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon size={9} color={accent} /> {label}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--card2)', border: '1px solid var(--b1)',
        borderRadius: 'var(--r2)', padding: '9px 10px', minHeight: 38,
      }}>
        <code style={{
          fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--t1)',
          flex: 1, wordBreak: 'break-all', lineHeight: 1.4,
        }}>
          {value || '—'}
        </code>
        <button onClick={(e) => { e.stopPropagation(); onCopy(); }} className="btn-icon btn-sm" title={`Copy ${label}`} disabled={!value}>
          {copied ? <Check size={10} color="var(--green)" /> : <Copy size={10} />}
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: any; color: string;
}) {
  return (
    <div style={{
      background: 'var(--card2)', border: '1px solid var(--b1)',
      borderRadius: 'var(--r2)', padding: '10px 12px',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)',
        textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <Icon size={9} color={color} /> {label}
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}
