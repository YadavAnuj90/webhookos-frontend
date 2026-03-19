'use client';
import { useState, useEffect, useCallback } from 'react';
import { metricsApi } from '@/lib/api';
import {
  Gauge, Copy, Check, Activity, Database, BarChart3,
  AlertCircle, ExternalLink, RefreshCw, Loader2, CheckCircle2, XCircle,
} from 'lucide-react';
import { SkeletonText } from '@/components/ui/Skeleton';
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
      // sample line: metric_name{labels} value [timestamp]
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

// ── Small components ──────────────────────────────────────────────────────────
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true); toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px', marginBottom: 10 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{label}</div>
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent2)', wordBreak: 'break-all' }}>{value}</code>
      </div>
      <button onClick={copy} className="btn-icon btn-sm" title="Copy">
        {copied ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
      </button>
    </div>
  );
}

const TYPE_COLOR: Record<string, string> = {
  counter:   '#6366f1',
  gauge:     '#0891b2',
  histogram: '#f59e0b',
  summary:   '#8b5cf6',
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MetricsPage() {
  const prometheusUrl = metricsApi.getUrl();

  const [raw, setRaw]         = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ParsedMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // Use metricsApi.get() so the axios interceptor adds the Authorization header
      const text = await metricsApi.get();
      setRaw(text);
      setMetrics(parsePrometheus(text));
      setLastFetched(new Date());
    } catch (e: any) {
      setError(e.message || 'Failed to fetch metrics');
      toast.error('Could not reach metrics endpoint');
    } finally { setLoading(false); }
  }, []);

  // Auto-fetch on mount
  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  // Check if Datadog / New Relic forwarder metrics exist in the data
  const hasDatadog  = metrics.some(m => m.name.includes('datadog'));
  const hasNewRelic = metrics.some(m => m.name.includes('newrelic') || m.name.includes('new_relic'));

  const S: any = { card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' } };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gauge size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>Metrics & Observability</h1>
            <p style={{ margin: 0 }}>// Prometheus-compatible metrics exported for Grafana, Datadog, and New Relic</p>
          </div>
        </div>
        <div className="ph-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastFetched && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
              updated {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchMetrics} disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading
              ? <><Loader2 size={13} style={{ animation: 'spin .7s linear infinite' }} />Fetching…</>
              : <><RefreshCw size={13} />Refresh</>}
          </button>
        </div>
      </div>

      {/* Prometheus endpoint */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
          <Activity size={15} color="var(--accent2)" />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Prometheus Endpoint</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px', borderRadius: 5,
            background: error ? 'rgba(248,113,113,.12)' : 'rgba(74,222,128,.12)',
            color: error ? '#f87171' : '#4ade80', fontWeight: 700 }}>
            {error ? '✗ UNREACHABLE' : loading ? '… LOADING' : '● LIVE'}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', marginBottom: 14, lineHeight: 1.6 }}>
          The <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent2)', background: 'rgba(99,102,241,.1)', padding: '1px 5px', borderRadius: 4 }}>/metrics</code> endpoint returns Prometheus-format text. Scrape it directly from Grafana, or configure Datadog/New Relic agent to forward it.
        </p>
        <CopyRow label="Scrape URL" value={prometheusUrl} />
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'rgba(248,113,113,.07)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 8, marginBottom: 10 }}>
            <XCircle size={13} color="#f87171" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#f87171' }}>{error}</span>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 4 }}>
          {[
            { label: 'Format',    val: 'text/plain 0.0.4' },
            { label: 'Auth',      val: 'None (public)' },
            { label: 'Interval',  val: 'Recommend 15s' },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 14px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration status */}
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Integration Status</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        {[
          { name: 'Datadog',   logo: <BarChart3 size={18} color="#632ca6" />, color: '#632ca6', connected: hasDatadog,  note: 'Set DATADOG_API_KEY in backend environment to enable automatic metric forwarding. Metrics appear in Datadog under the webhookos.* namespace.' },
          { name: 'New Relic', logo: <Database size={18} color="#008c99" />,  color: '#008c99', connected: hasNewRelic, note: 'Set NEW_RELIC_LICENSE_KEY in backend environment. Metrics are forwarded via the New Relic Metric API on every scrape cycle.' },
        ].map(({ name, logo, color, connected, note }) => (
          <div key={name} style={{ background: 'var(--bg2)', border: `1px solid ${connected ? color + '30' : 'var(--border)'}`, borderRadius: 12, padding: '20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {logo}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 5, fontWeight: 700,
                  background: connected ? 'rgba(74,222,128,.12)' : 'rgba(148,163,184,.1)',
                  color: connected ? '#4ade80' : 'var(--text3)' }}>
                  {connected ? '● ACTIVE' : loading ? '… CHECKING' : '○ NOT CONFIGURED'}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', lineHeight: 1.55 }}>{note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grafana setup */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <Activity size={15} color="#f97316" />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Grafana Setup</span>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.65 }}>
          Add a new Prometheus data source in Grafana pointing to the scrape URL above. Then import a dashboard or build custom panels using the metrics below.
        </div>
        <div style={{ position: 'relative', background: '#0d1117', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '14px 44px 14px 16px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#79c0ff', marginBottom: 8 }}># Grafana datasource config (prometheus.yml)</div>
          {[
            ['scrape_configs:', '#e6edf3'],
            ['  - job_name: webhookos', '#a5d6ff'],
            ['    static_configs:', '#e6edf3'],
            [`      - targets: ['${prometheusUrl.replace(/^https?:\/\//, '')}']`, '#4ade80'],
          ].map(([line, color], i) => (
            <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color, lineHeight: 1.7 }}>{line}</div>
          ))}
          <button
            onClick={() => {
              const yaml = `scrape_configs:\n  - job_name: webhookos\n    static_configs:\n      - targets: ['${prometheusUrl.replace(/^https?:\/\//, '')}']`;
              navigator.clipboard.writeText(yaml);
              toast.success('YAML copied');
            }}
            className="btn-icon btn-sm"
            style={{ position: 'absolute', top: 10, right: 10 }}
          ><Copy size={12} /></button>
        </div>
      </div>

      {/* Live metrics table */}
      <div style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Live Metrics</span>
            {!loading && metrics.length > 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 7px', borderRadius: 5, background: 'rgba(74,222,128,.1)', color: '#4ade80' }}>
                {metrics.length} series
              </span>
            )}
          </div>
          <a href={prometheusUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--accent2)', textDecoration: 'none' }}>
            <ExternalLink size={12} />View raw
          </a>
        </div>

        {loading && !metrics.length && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '16px 0' }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <SkeletonText width="60%" height={11} style={{ marginBottom: 8 }} />
                <SkeletonText width="40%" height={20} style={{ marginBottom: 6 }} />
                <SkeletonText width="80%" height={9} />
              </div>
            ))}
          </div>
        )}

        {error && !metrics.length && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '32px 0' }}>
            <XCircle size={16} color="#f87171" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#f87171' }}>Could not load metrics. Is the backend running?</span>
          </div>
        )}

        {metrics.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {metrics.map(m => {
              const typeColor = TYPE_COLOR[m.type] || 'var(--text3)';
              const total = sumSamples(m.samples);
              return (
                <div key={m.name} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent2)' }}>{m.name}</code>
                      {m.type && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 5px', borderRadius: 4,
                          background: typeColor + '18', color: typeColor, textTransform: 'capitalize' }}>
                          {m.type}
                        </span>
                      )}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{total}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>
                    {m.help || `${m.samples.length} sample${m.samples.length !== 1 ? 's' : ''}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fallback static list when endpoint is unreachable */}
        {!loading && error && metrics.length === 0 && (
          <>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginBottom: 10, marginTop: 4 }}>
              Expected metrics when backend is available:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { name: 'whk_events_total',           type: 'counter',   desc: 'Total events processed by status' },
                { name: 'whk_deliveries_total',        type: 'counter',   desc: 'Total delivery attempts by endpoint' },
                { name: 'whk_delivery_duration_ms',    type: 'histogram', desc: 'Delivery latency distribution' },
                { name: 'whk_retry_attempts_total',    type: 'counter',   desc: 'Retry attempt count by result' },
                { name: 'whk_dlq_size',                type: 'gauge',     desc: 'Dead letter queue depth' },
                { name: 'whk_circuit_state',           type: 'gauge',     desc: 'Circuit breaker state (0=closed,1=open)' },
                { name: 'whk_active_endpoints',        type: 'gauge',     desc: 'Number of active endpoints' },
                { name: 'whk_http_requests_total',     type: 'counter',   desc: 'Inbound HTTP requests to API' },
              ].map(m => {
                const typeColor = TYPE_COLOR[m.type] || 'var(--text3)';
                return (
                  <div key={m.name} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 12px', opacity: 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent2)' }}>{m.name}</code>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 5px', borderRadius: 4,
                        background: typeColor + '18', color: typeColor, textTransform: 'capitalize' }}>
                        {m.type}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>{m.desc}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.18)', borderRadius: 9 }}>
          <AlertCircle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>
            To enable Datadog or New Relic forwarding, ask your backend team to set the relevant API key environment variable and restart the server.
          </span>
        </div>
      </div>
    </div>
  );
}
