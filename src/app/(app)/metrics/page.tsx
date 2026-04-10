'use client';
import { useState, useEffect, useCallback, Fragment } from 'react';
import { metricsApi } from '@/lib/api';
import {
  Gauge, Copy, Check, Activity, Database, BarChart3,
  AlertCircle, ExternalLink, RefreshCw, Loader2, CheckCircle2, XCircle,
  Cpu, Zap, Timer, ShieldAlert, ArrowUpRight, ArrowDownRight,
  Radio, Server, Layers, GitBranch, Clock, Eye,
  TrendingUp, Signal, Box, AlertTriangle, Search,
} from 'lucide-react';
import { SkeletonText, SkeletonCard } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

// ── Prometheus text format parser ─────────────────────────────────────────────
interface ParsedMetric {
  name: string;
  help: string;
  type: string;
  samples: { labels: string; value: string }[];
}

function parsePrometheus(text: string): ParsedMetric[] {
  const lines = text.split('\n');
  const map: Record<string, ParsedMetric> = {};
  let currentName = '';

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith('# HELP ')) {
      const rest = line.slice(7);
      const sp = rest.indexOf(' ');
      const name = sp === -1 ? rest : rest.slice(0, sp);
      const help = sp === -1 ? '' : rest.slice(sp + 1);
      if (!map[name]) map[name] = { name, help, type: '', samples: [] };
      map[name].help = help;
      currentName = name;
    } else if (line.startsWith('# TYPE ')) {
      const rest = line.slice(7);
      const parts = rest.split(' ');
      const name = parts[0];
      const type = parts[1] || '';
      if (!map[name]) map[name] = { name, help: '', type, samples: [] };
      map[name].type = type;
      currentName = name;
    } else if (!line.startsWith('#')) {
      const braceIdx = line.indexOf('{');
      const spaceIdx = line.lastIndexOf(' ');
      let metricName: string;
      let labels = '';
      let value: string;

      if (braceIdx !== -1) {
        metricName = line.slice(0, braceIdx);
        const closeIdx = line.indexOf('}');
        labels = line.slice(braceIdx + 1, closeIdx);
        value = line.slice(closeIdx + 2).split(' ')[0];
      } else {
        metricName = line.slice(0, spaceIdx);
        value = line.slice(spaceIdx + 1).split(' ')[0];
      }

      const base = metricName.replace(/_total$/, '').replace(/_sum$|_count$|_bucket$/, '');
      const target = map[metricName] || map[base] || map[currentName];
      if (target) {
        target.samples.push({ labels, value });
      }
    }
  }

  return Object.values(map).filter(m => m.name && m.samples.length > 0);
}

function sumSamples(samples: { value: string }[]): string {
  const total = samples.reduce((a, s) => a + (parseFloat(s.value) || 0), 0);
  if (total >= 1_000_000) return (total / 1_000_000).toFixed(1) + 'M';
  if (total >= 1_000)     return (total / 1_000).toFixed(1) + 'K';
  return Number.isInteger(total) ? String(total) : total.toFixed(4);
}

function getNumericSum(samples: { value: string }[]): number {
  return samples.reduce((a, s) => a + (parseFloat(s.value) || 0), 0);
}

// ── Type config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  counter:   { color: '#818cf8', bg: 'rgba(129,140,248,.10)', icon: TrendingUp },
  gauge:     { color: '#22d3ee', bg: 'rgba(34,211,238,.10)',  icon: Gauge },
  histogram: { color: '#fbbf24', bg: 'rgba(251,191,36,.10)',  icon: BarChart3 },
  summary:   { color: '#c084fc', bg: 'rgba(192,132,252,.10)', icon: Layers },
};

// ── Stat card icons for known metrics ────────────────────────────────────────
const METRIC_CARDS: {
  match: string; label: string; icon: any; color: string; bg: string; suffix?: string;
}[] = [
  { match: 'webhook_delivered_total',     label: 'Delivered',        icon: CheckCircle2,  color: '#22c55e', bg: 'rgba(34,197,94,.10)' },
  { match: 'webhook_failed_total',        label: 'Failed',           icon: XCircle,       color: '#f87171', bg: 'rgba(248,113,113,.10)' },
  { match: 'webhook_queue_size',          label: 'Queue Size',       icon: Layers,        color: '#818cf8', bg: 'rgba(129,140,248,.10)' },
  { match: 'webhook_dlq_size',            label: 'DLQ Size',         icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(251,191,36,.10)' },
  { match: 'webhook_active_endpoints',    label: 'Active Endpoints', icon: Radio,         color: '#22d3ee', bg: 'rgba(34,211,238,.10)' },
  { match: 'webhook_circuit_breakers_open', label: 'Circuits Open', icon: ShieldAlert,   color: '#f97316', bg: 'rgba(249,115,22,.10)' },
];

// ── Copy button component ────────────────────────────────────────────────────
function CopyButton({ value, size = 12 }: { value: string; size?: number }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="btn-icon" title="Copy" style={{ padding: 4 }}>
      {copied ? <Check size={size} color="var(--green)" /> : <Copy size={size} />}
    </button>
  );
}

// ── Status pulse ─────────────────────────────────────────────────────────────
function StatusPulse({ live, loading, error }: { live: boolean; loading: boolean; error: boolean }) {
  const color = error ? 'var(--red)' : loading ? 'var(--yellow)' : 'var(--green)';
  const label = error ? 'UNREACHABLE' : loading ? 'LOADING' : 'LIVE';
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
      background: error ? 'var(--rbg)' : loading ? 'var(--ybg)' : 'var(--gbg)',
      color, border: `1px solid ${error ? 'var(--rbd)' : loading ? 'var(--ybd)' : 'var(--gbd)'}`,
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block',
        ...(live && !error && !loading ? { animation: 'pulse 2s ease-in-out infinite' } : {})
      }} />
      {label}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MetricsPage() {
  const prometheusUrl = metricsApi.getUrl();

  const [raw, setRaw]         = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ParsedMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [search, setSearch]   = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const text = await metricsApi.get();
      setRaw(text);
      setMetrics(parsePrometheus(text));
      setLastFetched(new Date());
    } catch (e: any) {
      setError(e.message || 'Failed to fetch metrics');
      toast.error('Could not reach metrics endpoint');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  // Auto-refresh every 15s
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchMetrics, 15000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchMetrics]);

  // Check integrations
  const hasDatadog  = metrics.some(m => m.name.includes('datadog'));
  const hasNewRelic = metrics.some(m => m.name.includes('newrelic') || m.name.includes('new_relic'));

  // Build stat cards from live data
  const statCards = METRIC_CARDS.map(cfg => {
    const m = metrics.find(mt => mt.name === cfg.match);
    return { ...cfg, value: m ? sumSamples(m.samples) : '—', rawValue: m ? getNumericSum(m.samples) : 0 };
  });

  // Filtered metrics
  const filteredMetrics = metrics.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.help.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && m.type !== typeFilter) return false;
    return true;
  });

  const typeGroups = ['counter', 'gauge', 'histogram', 'summary'];
  const typeCounts = typeGroups.reduce((acc, t) => {
    acc[t] = metrics.filter(m => m.type === t).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="page">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="ph">
        <div className="ph-left">
          <h1>Metrics & Observability</h1>
          <p>// Prometheus-compatible metrics for Grafana, Datadog & New Relic</p>
        </div>
        <div className="ph-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastFetched && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)' }}>
              {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            className={`btn btn-ghost btn-sm`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={autoRefresh ? { background: 'var(--gbg)', color: 'var(--green)', border: '1px solid var(--gbd)' } : {}}
          >
            <Signal size={11} />{autoRefresh ? 'Auto 15s' : 'Auto Off'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={fetchMetrics} disabled={loading}>
            {loading ? <Loader2 size={11} style={{ animation: 'spin .7s linear infinite' }} /> : <RefreshCw size={11} />}
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stat Cards Grid ─────────────────────────────────────────────────── */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 20 }}>
        {loading && !metrics.length
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(c => (
            <div key={c.match} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: c.bg, border: `1px solid ${c.color}25`, flexShrink: 0,
                }}>
                  <c.icon size={17} color={c.color} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="stat-lbl">{c.label}</div>
                  <div className="stat-val">{c.value}</div>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* ── Prometheus Endpoint Card ────────────────────────────────────────── */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--abg)', border: '1px solid var(--abd)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={15} color="var(--a)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>Prometheus Endpoint</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>
              Scrape URL for Grafana, Datadog Agent & New Relic
            </div>
          </div>
          <StatusPulse live={metrics.length > 0} loading={loading} error={!!error} />
        </div>

        {/* Scrape URL */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--card2)', border: '1px solid var(--b1)', borderRadius: 'var(--r2)',
          padding: '10px 14px', marginBottom: 12,
        }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginBottom: 2 }}>SCRAPE URL</div>
            <code style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--a)', wordBreak: 'break-all' }}>{prometheusUrl}</code>
          </div>
          <CopyButton value={prometheusUrl} />
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'var(--rbg)', border: '1px solid var(--rbd)', borderRadius: 'var(--r2)', marginBottom: 12 }}>
            <XCircle size={13} color="var(--red)" />
            <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>
          </div>
        )}

        {/* Endpoint info pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { icon: Box, label: 'Format', val: 'text/plain 0.0.4' },
            { icon: ShieldAlert, label: 'Auth', val: 'Bearer JWT' },
            { icon: Clock, label: 'Interval', val: 'Recommend 15s' },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} style={{
              background: 'var(--card2)', border: '1px solid var(--b1)', borderRadius: 'var(--r2)',
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Icon size={13} color="var(--t3)" />
              <div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>{label}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--t1)', fontWeight: 600 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Integration Status ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          {
            name: 'Grafana',   icon: Activity, color: '#f97316', connected: true,
            note: 'Add Prometheus data source pointing to scrape URL above',
          },
          {
            name: 'Datadog',   icon: BarChart3, color: '#632ca6', connected: hasDatadog,
            note: 'Set DATADOG_API_KEY env var to enable auto-forwarding',
          },
          {
            name: 'New Relic', icon: Database, color: '#008c99', connected: hasNewRelic,
            note: 'Set NEW_RELIC_LICENSE_KEY env var for Metric API forwarding',
          },
        ].map(({ name, icon: Icon, color, connected, note }) => (
          <div key={name} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: color + '15', border: `1px solid ${color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={16} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{name}</div>
              </div>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                background: connected ? 'var(--gbg)' : 'rgba(148,163,184,.08)',
                color: connected ? 'var(--green)' : 'var(--t3)',
                border: `1px solid ${connected ? 'var(--gbd)' : 'var(--b1)'}`,
              }}>
                {connected ? 'ACTIVE' : 'NOT SET'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.55 }}>{note}</div>
          </div>
        ))}
      </div>

      {/* ── Grafana Config ──────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: 'rgba(249,115,22,.10)', border: '1px solid rgba(249,115,22,.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={13} color="#f97316" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Grafana Setup</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 12, lineHeight: 1.6 }}>
          Add a Prometheus data source in Grafana pointing to the scrape URL above, then import or build custom dashboards.
        </div>
        <div style={{
          position: 'relative', background: '#0d1117', border: '1px solid rgba(255,255,255,.06)',
          borderRadius: 'var(--r2)', padding: '14px 44px 14px 16px', overflow: 'hidden',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#6e7681', marginBottom: 6 }}># prometheus.yml</div>
          {[
            ['scrape_configs:', '#e6edf3'],
            ['  - job_name: webhookos', '#a5d6ff'],
            ['    metrics_path: /api/v1/metrics', '#a5d6ff'],
            ['    static_configs:', '#e6edf3'],
            [`      - targets: ['${prometheusUrl.replace(/^https?:\/\//, '').replace(/\/api\/v1\/metrics$/, '')}']`, '#4ade80'],
          ].map(([line, color], i) => (
            <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 11, color, lineHeight: 1.7 }}>{line}</div>
          ))}
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <CopyButton
              value={`scrape_configs:\n  - job_name: webhookos\n    metrics_path: /api/v1/metrics\n    static_configs:\n      - targets: ['${prometheusUrl.replace(/^https?:\/\//, '').replace(/\/api\/v1\/metrics$/, '')}']`}
            />
          </div>
        </div>
      </div>

      {/* ── Live Metrics ────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px',
          borderBottom: '1px solid var(--b1)',
        }}>
          <Cpu size={14} color="var(--a)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', flex: 1 }}>
            Live Metrics
          </span>

          {/* Type filter pills */}
          {metrics.length > 0 && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className={`btn btn-ghost btn-sm`}
                onClick={() => setTypeFilter('')}
                style={{
                  fontSize: 10, padding: '2px 8px',
                  ...(typeFilter === '' ? { background: 'var(--abg)', color: 'var(--a)', border: '1px solid var(--abd)' } : {}),
                }}
              >
                All ({metrics.length})
              </button>
              {typeGroups.map(t => typeCounts[t] > 0 && (
                <button
                  key={t}
                  className="btn btn-ghost btn-sm"
                  onClick={() => setTypeFilter(typeFilter === t ? '' : t)}
                  style={{
                    fontSize: 10, padding: '2px 8px', textTransform: 'capitalize',
                    ...(typeFilter === t ? { background: TYPE_CONFIG[t].bg, color: TYPE_CONFIG[t].color, border: `1px solid ${TYPE_CONFIG[t].color}30` } : {}),
                  }}
                >
                  {t} ({typeCounts[t]})
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          {metrics.length > 0 && (
            <div className="search-box" style={{ width: 180 }}>
              <Search size={12} />
              <input
                className="input"
                placeholder="Search metrics..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ fontSize: 11 }}
              />
            </div>
          )}

          <a href={prometheusUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--a)', textDecoration: 'none' }}>
            <ExternalLink size={11} />Raw
          </a>
        </div>

        {/* Loading state */}
        {loading && !metrics.length && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 20 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{ background: 'var(--card2)', border: '1px solid var(--b1)', borderRadius: 'var(--r2)', padding: 16 }}>
                <SkeletonText width="60%" height={11} style={{ marginBottom: 8 }} />
                <SkeletonText width="40%" height={20} style={{ marginBottom: 6 }} />
                <SkeletonText width="80%" height={9} />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !metrics.length && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '40px 20px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: 'var(--rbg)', border: '1px solid var(--rbd)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <XCircle size={22} color="var(--red)" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>Could not load metrics</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Is the backend running?</div>
            <button className="btn btn-ghost btn-sm" onClick={fetchMetrics} style={{ marginTop: 4 }}>
              <RefreshCw size={11} />Retry
            </button>
          </div>
        )}

        {/* Metrics grid */}
        {filteredMetrics.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--b1)' }}>
            {filteredMetrics.map(m => {
              const cfg = TYPE_CONFIG[m.type] || { color: 'var(--t3)', bg: 'rgba(148,163,184,.08)', icon: Activity };
              const TypeIcon = cfg.icon;
              const total = sumSamples(m.samples);
              return (
                <div key={m.name} style={{
                  background: 'var(--card)', padding: '14px 18px',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 7, flexShrink: 0, marginTop: 1,
                    background: cfg.bg, border: `1px solid ${cfg.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <TypeIcon size={14} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <code style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.name}
                      </code>
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
                        background: cfg.bg, color: cfg.color, textTransform: 'uppercase', flexShrink: 0,
                      }}>
                        {m.type}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)', lineHeight: 1.4 }}>
                      {m.help || `${m.samples.length} sample${m.samples.length !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>{total}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>
                      {m.samples.length} sample{m.samples.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No results from search */}
        {metrics.length > 0 && filteredMetrics.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '32px 20px' }}>
            <Search size={20} color="var(--t3)" />
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>No metrics match your filter</div>
          </div>
        )}

        {/* Fallback static list when endpoint is unreachable */}
        {!loading && error && metrics.length === 0 && (
          <div style={{ padding: 20, borderTop: '1px solid var(--b1)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
              Expected metrics when backend is available
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { name: 'webhook_delivered_total',     type: 'counter',   desc: 'Total events delivered successfully' },
                { name: 'webhook_failed_total',        type: 'counter',   desc: 'Total delivery failures' },
                { name: 'webhook_delivery_duration_ms', type: 'histogram', desc: 'Delivery latency distribution' },
                { name: 'webhook_retry_attempts',       type: 'summary',   desc: 'Retry attempt count with percentiles' },
                { name: 'webhook_dlq_size',             type: 'gauge',     desc: 'Dead letter queue depth' },
                { name: 'webhook_circuit_breakers_open', type: 'gauge',    desc: 'Circuit breakers currently open' },
                { name: 'webhook_active_endpoints',     type: 'gauge',     desc: 'Number of active endpoints' },
                { name: 'webhook_queue_size',            type: 'gauge',     desc: 'Current processing queue depth' },
              ].map(m => {
                const cfg = TYPE_CONFIG[m.type] || TYPE_CONFIG.counter;
                return (
                  <div key={m.name} style={{
                    background: 'var(--card2)', border: '1px solid var(--b1)', borderRadius: 'var(--r2)',
                    padding: '10px 14px', opacity: 0.55, display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6, background: cfg.bg, border: `1px solid ${cfg.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <cfg.icon size={12} color={cfg.color} />
                    </div>
                    <div>
                      <code style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--a)' }}>{m.name}</code>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>{m.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tip bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          borderTop: '1px solid var(--b1)', background: 'var(--card2)',
        }}>
          <AlertCircle size={12} color="var(--yellow)" />
          <span style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
            Set DATADOG_API_KEY or NEW_RELIC_LICENSE_KEY env vars on the backend to enable automatic metric forwarding every minute.
          </span>
        </div>
      </div>
    </div>
  );
}
