'use client';
import { useState, useMemo, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import {
  FileText, Filter, User, Shield, Zap, Globe, Settings, RefreshCw,
  ChevronLeft, ChevronRight, Search, Key, CreditCard, Smartphone,
  LogIn, LogOut, Trash2, Plus, Edit3, RotateCcw, Play, Pause,
  ChevronDown, Download, Clock, Activity, AlertCircle, Check, X,
  Eye, EyeOff, ArrowUpRight,
} from 'lucide-react';
import { SkeletonTable } from '@/components/ui/Skeleton';
import Empty from '@/components/ui/Empty';
import { formatDistanceToNow } from 'date-fns';

/* ══════════════════════════════════════════════════════════════════════════════
   ACTION CONFIG — maps each action to an icon, color, label
   ══════════════════════════════════════════════════════════════════════════════ */
type ActionDef = { icon: any; color: string; bg: string; bd: string; label: string };
const ACTIONS: Record<string, ActionDef> = {
  login:             { icon: LogIn,      color: 'var(--blue)',   bg: 'var(--bbg)', bd: 'var(--bbd)', label: 'Login' },
  logout:            { icon: LogOut,     color: 'var(--t3)',     bg: 'rgba(71,86,112,.08)', bd: 'rgba(71,86,112,.18)', label: 'Logout' },
  register:          { icon: User,       color: 'var(--green)',  bg: 'var(--gbg)', bd: 'var(--gbd)', label: 'Register' },
  password_reset:    { icon: Key,        color: 'var(--orange)', bg: 'var(--obg)', bd: 'var(--obd)', label: 'Password Reset' },
  password_change:   { icon: Key,        color: 'var(--yellow)', bg: 'var(--ybg)', bd: 'var(--ybd)', label: 'Password Change' },
  api_key_created:   { icon: Key,        color: 'var(--green)',  bg: 'var(--gbg)', bd: 'var(--gbd)', label: 'API Key Created' },
  api_key_revoked:   { icon: Key,        color: 'var(--red)',    bg: 'var(--rbg)', bd: 'var(--rbd)', label: 'API Key Revoked' },
  endpoint_created:  { icon: Globe,      color: 'var(--green)',  bg: 'var(--gbg)', bd: 'var(--gbd)', label: 'Endpoint Created' },
  endpoint_updated:  { icon: Globe,      color: 'var(--yellow)', bg: 'var(--ybg)', bd: 'var(--ybd)', label: 'Endpoint Updated' },
  endpoint_deleted:  { icon: Globe,      color: 'var(--red)',    bg: 'var(--rbg)', bd: 'var(--rbd)', label: 'Endpoint Deleted' },
  endpoint_paused:   { icon: Pause,      color: 'var(--yellow)', bg: 'var(--ybg)', bd: 'var(--ybd)', label: 'Endpoint Paused' },
  endpoint_resumed:  { icon: Play,       color: 'var(--green)',  bg: 'var(--gbg)', bd: 'var(--gbd)', label: 'Endpoint Resumed' },
  event_created:     { icon: Zap,        color: 'var(--green)',  bg: 'var(--gbg)', bd: 'var(--gbd)', label: 'Event Created' },
  event_replayed:    { icon: RotateCcw,  color: 'var(--a2)',     bg: 'var(--abg)', bd: 'var(--abd)', label: 'Event Replayed' },
  user_invited:      { icon: User,       color: 'var(--blue)',   bg: 'var(--bbg)', bd: 'var(--bbd)', label: 'User Invited' },
  user_removed:      { icon: User,       color: 'var(--red)',    bg: 'var(--rbg)', bd: 'var(--rbd)', label: 'User Removed' },
  role_changed:      { icon: Shield,     color: 'var(--a2)',     bg: 'var(--abg)', bd: 'var(--abd)', label: 'Role Changed' },
  '2fa_enabled':     { icon: Smartphone, color: 'var(--green)',  bg: 'var(--gbg)', bd: 'var(--gbd)', label: '2FA Enabled' },
  '2fa_disabled':    { icon: Smartphone, color: 'var(--red)',    bg: 'var(--rbg)', bd: 'var(--rbd)', label: '2FA Disabled' },
  billing_upgraded:  { icon: CreditCard, color: 'var(--green)',  bg: 'var(--gbg)', bd: 'var(--gbd)', label: 'Plan Upgraded' },
  billing_downgraded:{ icon: CreditCard, color: 'var(--yellow)', bg: 'var(--ybg)', bd: 'var(--ybd)', label: 'Plan Downgraded' },
  // generic fallbacks
  create:  { icon: Plus,       color: 'var(--green)',  bg: 'var(--gbg)', bd: 'var(--gbd)', label: 'Create' },
  update:  { icon: Edit3,      color: 'var(--yellow)', bg: 'var(--ybg)', bd: 'var(--ybd)', label: 'Update' },
  delete:  { icon: Trash2,     color: 'var(--red)',    bg: 'var(--rbg)', bd: 'var(--rbd)', label: 'Delete' },
  replay:  { icon: RotateCcw,  color: 'var(--a2)',     bg: 'var(--abg)', bd: 'var(--abd)', label: 'Replay' },
  pause:   { icon: Pause,      color: 'var(--yellow)', bg: 'var(--ybg)', bd: 'var(--ybd)', label: 'Pause' },
  resume:  { icon: Play,       color: 'var(--green)',  bg: 'var(--gbg)', bd: 'var(--gbd)', label: 'Resume' },
  rotate:  { icon: RefreshCw,  color: 'var(--blue)',   bg: 'var(--bbg)', bd: 'var(--bbd)', label: 'Rotate' },
};

const DEFAULT_ACTION: ActionDef = { icon: Activity, color: 'var(--t3)', bg: 'rgba(71,86,112,.08)', bd: 'rgba(71,86,112,.18)', label: '' };
const getAction = (a: string): ActionDef => {
  if (ACTIONS[a]) return ACTIONS[a];
  return { ...DEFAULT_ACTION, label: fmtAction(a) };
};

/** Capitalize & humanize raw action string: "api_key_created" → "Api Key Created" */
function fmtAction(a: string): string {
  return a.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ══════════════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════════════ */
function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      relative: formatDistanceToNow(d, { addSuffix: true }),
    };
  } catch {
    return { date: '--', time: '', relative: '' };
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════════ */
export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const limit = 25;

  /* ── API call ── */
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['audit-history', page, actionFilter],
    queryFn: () => auditApi.myHistory({ page, limit, action: actionFilter || undefined }),
    refetchOnWindowFocus: false,
  });

  const logs: any[] = useMemo(() => {
    const raw = data?.logs || data?.data || (Array.isArray(data) ? data : []);
    return raw;
  }, [data]);
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  /* ── Client-side search + outcome filter ── */
  const filtered = useMemo(() => {
    let list = logs;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l: any) =>
        (l.action || '').toLowerCase().includes(q) ||
        (l.resourceType || '').toLowerCase().includes(q) ||
        (l.resourceId || '').toLowerCase().includes(q) ||
        (l.metadata && JSON.stringify(l.metadata).toLowerCase().includes(q)) ||
        (l.ipAddress || '').includes(q) ||
        (l.userEmail || '').toLowerCase().includes(q)
      );
    }
    if (outcomeFilter) {
      list = list.filter((l: any) => l.outcome === outcomeFilter);
    }
    return list;
  }, [logs, search, outcomeFilter]);

  /* ── Stats from current page data ── */
  const stats = useMemo(() => {
    const success = logs.filter((l: any) => l.outcome !== 'failure').length;
    const failure = logs.filter((l: any) => l.outcome === 'failure').length;
    const uniqueActions = new Set(logs.map((l: any) => l.action)).size;
    return { total, success, failure, uniqueActions };
  }, [logs, total]);

  /* ── Group by date for timeline sections ── */
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach((log: any) => {
      const day = log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown';
      (map[day] ||= []).push(log);
    });
    return Object.entries(map);
  }, [filtered]);

  /* ── Unique actions for filter dropdown ── */
  const actionOptions = useMemo(() => {
    const set = new Set(logs.map((l: any) => l.action).filter(Boolean));
    return Array.from(set).sort();
  }, [logs]);

  return (
    <div className="page">
      {/* ═══ Page Header ═══ */}
      <div className="ph">
        <div className="ph-left" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--a), var(--a2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--sa)',
          }}>
            <FileText size={19} color="#fff" />
          </div>
          <div>
            <h1>Activity History</h1>
            <p>Complete audit trail of every action in your account</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => refetch()}
            style={{ gap: 5 }}
          >
            <RefreshCw size={12} className={isFetching ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ═══ Stat Cards ═══ */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard icon={Activity} color="var(--a2)" label="Total Events" value={stats.total} />
        <StatCard icon={Check} color="var(--green)" label="Successful" value={stats.success} trend={stats.total > 0 ? `${Math.round((stats.success / Math.max(1, stats.success + stats.failure)) * 100)}%` : undefined} />
        <StatCard icon={AlertCircle} color="var(--red)" label="Failed" value={stats.failure} />
        <StatCard icon={Zap} color="var(--yellow)" label="Action Types" value={stats.uniqueActions} trend="this page" />
      </div>

      {/* ═══ Toolbar — Search + Filters ═══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18,
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div className="search-box" style={{ flex: '1 1 220px', maxWidth: 320 }}>
          <Search size={13} />
          <input
            className="input"
            placeholder="Search actions, resources, IPs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 12.5 }}
          />
        </div>

        {/* Action filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={11} color="var(--t3)" />
          <select
            className="input"
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
            style={{ width: 160, padding: '7px 30px 7px 10px', fontSize: 12 }}
          >
            <option value="">All Actions</option>
            {actionOptions.map(a => (
              <option key={a} value={a}>{fmtAction(a)}</option>
            ))}
          </select>
        </div>

        {/* Outcome filter */}
        <select
          className="input"
          value={outcomeFilter}
          onChange={e => setOutcomeFilter(e.target.value)}
          style={{ width: 130, padding: '7px 30px 7px 10px', fontSize: 12 }}
        >
          <option value="">All Outcomes</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>

        {/* Count indicator */}
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', letterSpacing: '.08em' }}>
          {filtered.length} OF {total} EVENTS
        </div>
      </div>

      {/* ═══ Timeline Table ═══ */}
      <div className="tbl-wrap">
        {isLoading ? (
          <table className="tbl">
            <thead><tr>{['Time', 'Action', 'Resource', 'Details', 'Outcome', 'IP Address'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <SkeletonTable rows={8} cols={6} />
          </table>
        ) : filtered.length === 0 ? (
          <Empty
            type="history"
            title="No activity yet"
            sub={search || actionFilter || outcomeFilter ? 'No logs match your current filters. Try adjusting them.' : 'Actions you take will appear here as an audit trail.'}
          />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 150 }}>Time</th>
                <th style={{ width: 170 }}>Action</th>
                <th>Resource</th>
                <th>Details</th>
                <th style={{ width: 90, textAlign: 'center' }}>Outcome</th>
                <th style={{ width: 120 }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(([day, dayLogs]) => (
                <Fragment key={day}>
                  {/* ── Date separator row ── */}
                  <tr>
                    <td colSpan={6} style={{
                      padding: '10px 14px 6px',
                      background: 'var(--card2)',
                      borderBottom: '1px solid var(--b1)',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        <Clock size={10} color="var(--t3)" />
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600,
                          color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em',
                        }}>
                          {day}
                        </span>
                        <span className="badge b-gray" style={{ fontSize: 8, padding: '1px 6px' }}>
                          {dayLogs.length}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* ── Log rows ── */}
                  {dayLogs.map((log: any, i: number) => {
                    const def = getAction(log.action);
                    const Icon = def.icon;
                    const dt = fmtDate(log.createdAt);
                    const isExpanded = expandedId === (log._id || `${day}-${i}`);
                    const isFail = log.outcome === 'failure';

                    return (
                      <Fragment key={log._id || `${day}-${i}`}>
                        <tr
                          onClick={() => setExpandedId(isExpanded ? null : (log._id || `${day}-${i}`))}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Time */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t2)', fontWeight: 500 }}>
                                {dt.time}
                              </span>
                              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>
                                {dt.relative}
                              </span>
                            </div>
                          </td>

                          {/* Action */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                background: def.bg, border: `1px solid ${def.bd}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Icon size={13} color={def.color} />
                              </div>
                              <span style={{
                                fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 600,
                                color: def.color, letterSpacing: '.02em',
                              }}>
                                {def.label}
                              </span>
                            </div>
                          </td>

                          {/* Resource */}
                          <td>
                            {log.resourceType ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{
                                  fontSize: 12.5, fontWeight: 600, color: 'var(--t1)',
                                  textTransform: 'capitalize',
                                }}>
                                  {log.resourceType.replace(/_/g, ' ')}
                                </span>
                                {log.resourceId && (
                                  <span style={{
                                    fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--t3)',
                                    maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    display: 'block',
                                  }}>
                                    {log.resourceId}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--t3)' }}>—</span>
                            )}
                          </td>

                          {/* Details */}
                          <td style={{ maxWidth: 260 }}>
                            <span style={{
                              fontSize: 12, color: 'var(--t2)', lineHeight: 1.45,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}>
                              {log.metadata && Object.keys(log.metadata).length > 0
                                ? formatMetadata(log.metadata)
                                : '—'}
                            </span>
                          </td>

                          {/* Outcome */}
                          <td style={{ textAlign: 'center' }}>
                            {isFail ? (
                              <span className="badge b-red" style={{ fontSize: 9 }}>
                                <X size={9} /> Failed
                              </span>
                            ) : (
                              <span className="badge b-green" style={{ fontSize: 9 }}>
                                <Check size={9} /> Success
                              </span>
                            )}
                          </td>

                          {/* IP */}
                          <td>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--t3)' }}>
                              {log.ipAddress || '—'}
                            </span>
                          </td>
                        </tr>

                        {/* ── Expanded Detail Row ── */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} style={{ padding: 0, background: 'rgba(91,108,248,.02)' }}>
                              <div style={{
                                padding: '14px 20px 16px', display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: 14,
                              }}>
                                <DetailField label="User" value={log.userEmail || log.userId || '—'} />
                                <DetailField label="Action" value={log.action || '—'} />
                                <DetailField label="Resource Type" value={log.resourceType || '—'} />
                                <DetailField label="Resource ID" value={log.resourceId || '—'} mono />
                                <DetailField label="IP Address" value={log.ipAddress || '—'} mono />
                                <DetailField label="User Agent" value={log.userAgent ? truncateUA(log.userAgent) : '—'} />
                                <DetailField label="Outcome" value={log.outcome || 'success'} />
                                <DetailField label="Timestamp" value={log.createdAt ? new Date(log.createdAt).toISOString() : '—'} mono />
                                {isFail && log.errorMessage && (
                                  <div style={{ gridColumn: '1 / -1' }}>
                                    <DetailField label="Error" value={log.errorMessage} isError />
                                  </div>
                                )}
                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                  <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{
                                      fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 500,
                                      color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em',
                                      marginBottom: 4,
                                    }}>Metadata</div>
                                    <div style={{
                                      fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--t2)',
                                      background: 'var(--card2)', border: '1px solid var(--b1)',
                                      borderRadius: 8, padding: '10px 12px', lineHeight: 1.55,
                                      overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                    }}>
                                      {JSON.stringify(log.metadata, null, 2)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}

        {/* ═══ Pagination ═══ */}
        {!isLoading && filtered.length > 0 && (
          <div className="pg" style={{ justifyContent: 'space-between' }}>
            <span className="pg-info">
              {total > 0 ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}` : '0 results'}
            </span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                className="btn-icon btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={13} />
              </button>
              {generatePageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', padding: '0 4px' }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`btn-sm ${(p as number) === page ? 'btn btn-primary' : 'btn-icon'}`}
                    onClick={() => setPage(p as number)}
                    style={{ minWidth: 30, fontSize: 11, fontFamily: 'var(--mono)' }}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                className="btn-icon btn-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════════════ */

function StatCard({ icon: Icon, color, label, value, trend }: {
  icon: any; color: string; label: string; value: number | string; trend?: string;
}) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="stat-lbl">{label}</span>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div className="stat-val" style={{ color }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {trend && <div className="stat-trend">{trend}</div>}
    </div>
  );
}

function DetailField({ label, value, mono, isError }: {
  label: string; value: string; mono?: boolean; isError?: boolean;
}) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 500,
        color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em',
        marginBottom: 3,
      }}>{label}</div>
      <div style={{
        fontSize: 12, color: isError ? 'var(--red)' : 'var(--t1)',
        fontFamily: mono ? 'var(--mono)' : 'var(--sans)',
        fontWeight: 500, lineHeight: 1.45,
        wordBreak: 'break-all',
      }}>{value}</div>
    </div>
  );
}

/* ── Helpers ── */
function formatMetadata(meta: Record<string, any>): string {
  const keys = Object.keys(meta);
  if (keys.length === 0) return '—';
  // Show first 2-3 key=value pairs
  return keys.slice(0, 3).map(k => {
    const v = meta[k];
    const vs = typeof v === 'string' ? v : JSON.stringify(v);
    return `${k}: ${vs.length > 40 ? vs.slice(0, 37) + '...' : vs}`;
  }).join(' · ') + (keys.length > 3 ? ` (+${keys.length - 3} more)` : '');
}

function truncateUA(ua: string): string {
  return ua.length > 80 ? ua.slice(0, 77) + '...' : ua;
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
