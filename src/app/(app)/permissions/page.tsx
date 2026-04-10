'use client';
import { useState, useMemo, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsApi } from '@/lib/api';
import { CustomRole } from '@/lib/types';
import { Shield, Plus, X, Trash2, Check, Users, Lock, Search, Minus, Eye, Layers, GitBranch, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Empty from '@/components/ui/Empty';
import { SkeletonTable } from '@/components/ui/Skeleton';

const PID = 'default';

/* ─── Dynamic Role Styling ─────────────────────────────────────────────────── */
const PALETTE = [
  '#ef4444', '#f59e0b', '#818cf8', '#64748b', '#22c55e',
  '#f97316', '#06b6d4', '#ec4899', '#8b5cf6', '#14b8a6',
];
const ICONS = [Shield, Lock, Layers, Eye, Users, GitBranch];

type RoleStyle = { color: string; bg: string; icon: any; label: string };

/** Auto-generates visual styling for any role name from API — zero hardcoded roles. */
function buildRoleStyles(roleNames: string[]): Record<string, RoleStyle> {
  const map: Record<string, RoleStyle> = {};
  roleNames.forEach((rn, i) => {
    const color = PALETTE[i % PALETTE.length];
    map[rn] = {
      color,
      bg: `linear-gradient(135deg, ${color}, ${color}cc)`,
      icon: ICONS[i % ICONS.length],
      label: rn.charAt(0).toUpperCase() + rn.slice(1).replace(/_/g, ' '),
    };
  });
  return map;
}

function hasPerm(roles: any, role: string, res: string, act: string): boolean {
  const rp = roles[role];
  if (Array.isArray(rp)) return rp.includes(`${res}:${act}`);
  if (rp && typeof rp === 'object') return Array.isArray(rp[res]) && rp[res].includes(act);
  return false;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MATRIX VIEW                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */
function MatrixView() {
  const { data: matrix, isLoading } = useQuery({
    queryKey: ['perm-matrix'],
    queryFn: () => permissionsApi.getMatrix(),
  });
  const [search, setSearch] = useState('');
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Derive everything from API data
  const resources: string[] = matrix?.resources || [];
  const actions: string[] = matrix?.actions || [];
  const roles = matrix?.roles || {};
  const roleNames = Object.keys(roles);
  const RS = useMemo(() => buildRoleStyles(roleNames), [roleNames.join(',')]);

  if (isLoading) return <SkeletonTable rows={10} cols={6} />;
  if (!matrix) return null;

  const filtered = search.trim()
    ? resources.filter(r => r.toLowerCase().includes(search.toLowerCase()))
    : resources;

  // Stats computed from API response
  const roleStats = roleNames.map(rn => {
    let count = 0;
    for (const res of resources) for (const act of actions) if (hasPerm(roles, rn, res, act)) count++;
    const total = resources.length * actions.length;
    return { role: rn, count, total, pct: total ? Math.round((count / total) * 100) : 0 };
  });

  const toggleRes = (res: string) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(res) ? next.delete(res) : next.add(res);
    return next;
  });

  const allExpanded = filtered.length > 0 && filtered.every(r => expanded.has(r));
  const toggleAll = () => {
    if (allExpanded) {
      setExpanded(new Set());
    } else {
      setExpanded(new Set(filtered));
    }
  };

  return (
    <>
      {/* ── Role Cards — all derived from API ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${roleNames.length}, 1fr)`, gap: 14, marginBottom: 24 }}>
        {roleStats.map(({ role, count, total, pct }) => {
          const rc = RS[role];
          const Icon = rc.icon;
          const isHovered = hoveredRole === role;
          return (
            <div
              key={role}
              onMouseEnter={() => setHoveredRole(role)}
              onMouseLeave={() => setHoveredRole(null)}
              style={{
                background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r3)',
                padding: 0, overflow: 'hidden', transition: 'all .25s ease',
                borderColor: isHovered ? `${rc.color}40` : undefined,
                boxShadow: isHovered ? `0 8px 32px ${rc.color}15` : undefined,
                cursor: 'default',
              }}
            >
              <div style={{ height: 3, background: rc.bg }} />
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: `${rc.color}15`, border: `1px solid ${rc.color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={15} color={rc.color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)' }}>{rc.label}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)', marginTop: 1 }}>{count} of {total} granted</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 22, fontWeight: 800, color: rc.color, letterSpacing: '-0.5px', lineHeight: 1 }}>{pct}%</div>
                  </div>
                </div>
                <div style={{ height: 4, background: 'var(--b1)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`, background: rc.bg, borderRadius: 2,
                    transition: 'width .8s cubic-bezier(.25,.46,.45,.94)',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)' }}>{count} granted</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)' }}>{total} total</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Search Bar + Collapse/Expand Toggle ────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--t3)', pointerEvents: 'none' }} />
          <input
            className="input" placeholder="Search resources…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 12 }}
          />
        </div>

        {/* Collapse / Expand All button */}
        <button
          onClick={toggleAll}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}
        >
          <ChevronsUpDown size={12} />
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </button>

        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {roleNames.map(rn => {
            const rc = RS[rn];
            return (
              <div key={rn} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: rc.color }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>{rc.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Collapsible Matrix ─────────────────────────────────────── */}
      <div className="tbl-wrap">
        <table className="tbl" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: 220 }}>Resource</th>
              <th style={{ width: 100 }}>Action</th>
              {roleNames.map(rn => {
                const rc = RS[rn];
                return (
                  <th key={rn} style={{ textAlign: 'center', width: 110 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: rc.color, boxShadow: `0 0 6px ${rc.color}50` }} />
                      <span style={{ color: rc.color }}>{rc.label}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.map(res => {
              const isOpen = expanded.has(res);
              const resGranted = roleNames.reduce((acc, rn) => acc + actions.filter(act => hasPerm(roles, rn, res, act)).length, 0);
              const resTotal = actions.length * roleNames.length;

              return (
                <Fragment key={res}>
                  {/* ── Resource header row (always visible, clickable) ── */}
                  <tr
                    onClick={() => toggleRes(res)}
                    style={{ cursor: 'pointer', background: isOpen ? 'rgba(91,108,248,.03)' : undefined }}
                  >
                    <td style={{ borderRight: '1px solid var(--b1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          background: isOpen ? 'var(--abg)' : 'transparent',
                          border: isOpen ? '1px solid var(--abd)' : '1px solid var(--b1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all .15s ease',
                        }}>
                          {isOpen
                            ? <ChevronDown size={11} color="var(--a2)" />
                            : <ChevronRight size={11} color="var(--t3)" />
                          }
                        </div>
                        <div style={{
                          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                          background: 'var(--abg)', border: '1px solid var(--abd)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Layers size={11} color="var(--a2)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--t1)', textTransform: 'capitalize' }}>
                            {res.replace(/_/g, ' ')}
                          </div>
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--t3)', marginTop: 1 }}>
                            {actions.length} actions · {resGranted}/{resTotal} grants
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Summary: show compact grant badges per role in collapsed state */}
                    <td>
                      {!isOpen && (
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>
                          {actions.length} actions
                        </span>
                      )}
                    </td>
                    {roleNames.map(rn => {
                      const rc = RS[rn];
                      const grantCount = actions.filter(act => hasPerm(roles, rn, res, act)).length;
                      return (
                        <td key={rn} style={{ textAlign: 'center' }}>
                          {!isOpen ? (
                            /* Collapsed: show count badge */
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              minWidth: 28, height: 22, borderRadius: 6, fontSize: 10, fontWeight: 700,
                              fontFamily: 'var(--mono)',
                              background: grantCount === actions.length ? `${rc.color}15` : grantCount > 0 ? `${rc.color}08` : 'transparent',
                              color: grantCount > 0 ? rc.color : 'var(--t3)',
                              border: `1px solid ${grantCount > 0 ? `${rc.color}22` : 'var(--b1)'}`,
                              transition: 'all .15s ease',
                            }}>
                              {grantCount}/{actions.length}
                            </span>
                          ) : (
                            /* Expanded: empty in header row */
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>
                              {grantCount}/{actions.length}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* ── Action rows (only visible when expanded) ── */}
                  {isOpen && actions.map(act => (
                    <tr key={`${res}:${act}`} style={{ background: 'rgba(91,108,248,.015)' }}>
                      <td style={{ borderRight: '1px solid var(--b1)', paddingLeft: 60 }} />
                      <td>
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t2)',
                          padding: '2px 7px', borderRadius: 4, background: 'var(--card2)',
                          textTransform: 'capitalize',
                        }}>
                          {act}
                        </span>
                      </td>
                      {roleNames.map(rn => {
                        const has = hasPerm(roles, rn, res, act);
                        const rc = RS[rn];
                        return (
                          <td key={rn} style={{ textAlign: 'center' }}>
                            {has ? (
                              <div style={{
                                display: 'inline-flex', width: 28, height: 28, borderRadius: 8,
                                background: `${rc.color}12`, alignItems: 'center', justifyContent: 'center',
                                border: `1px solid ${rc.color}22`, transition: 'all .15s ease',
                              }}>
                                <Check size={13} color={rc.color} strokeWidth={2.5} />
                              </div>
                            ) : (
                              <div style={{
                                display: 'inline-flex', width: 28, height: 28, borderRadius: 8,
                                alignItems: 'center', justifyContent: 'center', opacity: 0.3,
                              }}>
                                <Minus size={10} color="var(--t3)" strokeWidth={1.5} />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Matrix Legend ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, padding: '10px 14px',
        background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r2)',
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Legend</span>
        <div style={{ width: 1, height: 14, background: 'var(--b1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            display: 'inline-flex', width: 20, height: 20, borderRadius: 5,
            background: 'var(--gbg)', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--gbd)',
          }}>
            <Check size={10} color="var(--green)" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t2)' }}>Granted</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ display: 'inline-flex', width: 20, height: 20, borderRadius: 5, alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <Minus size={9} color="var(--t3)" />
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>Denied</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)' }}>
          {expanded.size}/{filtered.length} expanded · {filtered.length} resources · {roleNames.length} roles
        </span>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  COMPARE VIEW — uses /permissions/compare API for server-side diff         */
/* ═══════════════════════════════════════════════════════════════════════════ */
function CompareView() {
  // Fetch matrix just to get available role names
  const { data: matrix } = useQuery({ queryKey: ['perm-matrix'], queryFn: () => permissionsApi.getMatrix() });

  const roleNames = Object.keys(matrix?.roles || {});
  const RS = useMemo(() => buildRoleStyles(roleNames), [roleNames.join(',')]);

  const [role1, setRole1] = useState('');
  const [role2, setRole2] = useState('');
  const r1 = role1 || roleNames[0] || '';
  const r2 = role2 || roleNames[roleNames.length - 1] || '';

  // Call server-side compare API — returns { onlyInRole1[], onlyInRole2[], shared[] }
  const { data: diff, isLoading: diffLoading } = useQuery({
    queryKey: ['perm-compare', r1, r2],
    queryFn: () => permissionsApi.compareRoles(r1, r2),
    enabled: !!r1 && !!r2 && r1 !== r2,
  });

  // Also fetch individual role perms from API for total counts
  const { data: r1Perms } = useQuery({
    queryKey: ['role-perms', r1],
    queryFn: () => permissionsApi.getRolePerms(r1),
    enabled: !!r1,
  });
  const { data: r2Perms } = useQuery({
    queryKey: ['role-perms', r2],
    queryFn: () => permissionsApi.getRolePerms(r2),
    enabled: !!r2,
  });

  if (!matrix) return <SkeletonTable rows={6} cols={4} />;

  const rc1 = RS[r1] || { color: '#818cf8', bg: '#818cf8', icon: Shield, label: r1 };
  const rc2 = RS[r2] || { color: '#64748b', bg: '#64748b', icon: Shield, label: r2 };
  const Icon1 = rc1.icon;
  const Icon2 = rc2.icon;

  // Data from API
  const onlyInRole1: string[] = diff?.onlyInRole1 || [];
  const onlyInRole2: string[] = diff?.onlyInRole2 || [];
  const sharedPerms: string[] = diff?.shared || [];
  const only1 = onlyInRole1.length;
  const only2 = onlyInRole2.length;
  const shared = sharedPerms.length;
  const r1Total = Array.isArray(r1Perms) ? r1Perms.length : 0;
  const r2Total = Array.isArray(r2Perms) ? r2Perms.length : 0;

  // Group diffs by resource (parse "resource:action" strings from API)
  const groupedOnly1: Record<string, string[]> = {};
  for (const p of onlyInRole1) {
    const [res, act] = p.includes(':') ? p.split(':') : [p, p];
    if (!groupedOnly1[res]) groupedOnly1[res] = [];
    groupedOnly1[res].push(act);
  }
  const groupedOnly2: Record<string, string[]> = {};
  for (const p of onlyInRole2) {
    const [res, act] = p.includes(':') ? p.split(':') : [p, p];
    if (!groupedOnly2[res]) groupedOnly2[res] = [];
    groupedOnly2[res].push(act);
  }

  // Merge all diff resources
  const allDiffResources = Array.from(new Set([...Object.keys(groupedOnly1), ...Object.keys(groupedOnly2)])).sort();

  return (
    <>
      {/* ── Role Selector Cards ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', gap: 0, marginBottom: 24, alignItems: 'stretch' }}>
        {/* Role A */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r3)', overflow: 'hidden', padding: 0 }}>
          <div style={{ height: 3, background: rc1.bg }} />
          <div style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: `${rc1.color}15`, border: `1px solid ${rc1.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon1 size={16} color={rc1.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>Role A</div>
                <select className="input" value={r1} onChange={e => setRole1(e.target.value)}
                  style={{ fontSize: 13, fontWeight: 700, padding: '6px 10px', background: 'transparent', border: 'none', color: rc1.color }}>
                  {roleNames.map(rn => <option key={rn} value={rn}>{RS[rn]?.label || rn}</option>)}
                </select>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--t2)' }}>
              {r1Total} total permissions
            </div>
          </div>
        </div>

        {/* VS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--card2)',
            border: '1px solid var(--b2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.05em',
          }}>VS</div>
        </div>

        {/* Role B */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r3)', overflow: 'hidden', padding: 0 }}>
          <div style={{ height: 3, background: rc2.bg }} />
          <div style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: `${rc2.color}15`, border: `1px solid ${rc2.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon2 size={16} color={rc2.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>Role B</div>
                <select className="input" value={r2} onChange={e => setRole2(e.target.value)}
                  style={{ fontSize: 13, fontWeight: 700, padding: '6px 10px', background: 'transparent', border: 'none', color: rc2.color }}>
                  {roleNames.map(rn => <option key={rn} value={rn}>{RS[rn]?.label || rn}</option>)}
                </select>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--t2)' }}>
              {r2Total} total permissions
            </div>
          </div>
        </div>
      </div>

      {/* Same role warning */}
      {r1 === r2 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r3)' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--gbg)', border: '1px solid var(--gbd)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
          }}>
            <Check size={22} color="var(--green)" />
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 4 }}>Same Role Selected</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>Pick two different roles to compare</div>
        </div>
      )}

      {r1 !== r2 && diffLoading && <SkeletonTable rows={6} cols={3} />}

      {r1 !== r2 && diff && (
        <>
          {/* ── Visual Stats ──────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
            <div className="stat-card" style={{ borderTop: '3px solid var(--green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-lbl">Shared</span>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--gbg)', border: '1px solid var(--gbd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GitBranch size={13} style={{ color: 'var(--green)' }} />
                </div>
              </div>
              <div className="stat-val" style={{ color: 'var(--green)' }}>{shared}</div>
              <div className="stat-trend">Both roles have access</div>
            </div>
            <div className="stat-card" style={{ borderTop: `3px solid ${rc1.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-lbl">Only {rc1.label}</span>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${rc1.color}15`, border: `1px solid ${rc1.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon1 size={13} style={{ color: rc1.color }} />
                </div>
              </div>
              <div className="stat-val" style={{ color: rc1.color }}>{only1}</div>
              <div className="stat-trend">Exclusive permissions</div>
            </div>
            <div className="stat-card" style={{ borderTop: `3px solid ${rc2.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-lbl">Only {rc2.label}</span>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${rc2.color}15`, border: `1px solid ${rc2.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon2 size={13} style={{ color: rc2.color }} />
                </div>
              </div>
              <div className="stat-val" style={{ color: rc2.color }}>{only2}</div>
              <div className="stat-trend">Exclusive permissions</div>
            </div>
          </div>

          {/* ── Overlap Bar ──────────────────────────────────────── */}
          <div style={{ padding: '14px 18px', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r2)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Permission overlap</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t2)' }}>
                {Math.round((shared / Math.max(shared + only1 + only2, 1)) * 100)}% similarity
              </span>
            </div>
            <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
              {only1 > 0 && <div style={{ width: `${(only1 / (shared + only1 + only2)) * 100}%`, background: rc1.color, borderRadius: 3, transition: 'width .6s ease' }} />}
              {shared > 0 && <div style={{ width: `${(shared / (shared + only1 + only2)) * 100}%`, background: 'var(--green)', borderRadius: 3, transition: 'width .6s ease' }} />}
              {only2 > 0 && <div style={{ width: `${(only2 / (shared + only1 + only2)) * 100}%`, background: rc2.color, borderRadius: 3, transition: 'width .6s ease' }} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: rc1.color }}>{rc1.label} only ({only1})</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--green)' }}>Shared ({shared})</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: rc2.color }}>{rc2.label} only ({only2})</span>
            </div>
          </div>

          {/* ── Diff Table ────────────────────────────────────────── */}
          {allDiffResources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r3)' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: 'var(--gbg)', border: '1px solid var(--gbd)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <Check size={22} color="var(--green)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 4 }}>Identical Permissions</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>Both roles share all {shared} permissions</div>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Differences</span>
                <span className="badge b-accent" style={{ fontSize: 9 }}>{only1 + only2}</span>
              </div>
              {allDiffResources.map(res => {
                const r1Acts = groupedOnly1[res] || [];
                const r2Acts = groupedOnly2[res] || [];
                const allActs = Array.from(new Set([...r1Acts, ...r2Acts])).sort();
                return (
                  <div key={res} className="tbl-wrap" style={{ marginBottom: 10 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                      background: 'var(--card2)', borderBottom: '1px solid var(--b1)',
                    }}>
                      <Layers size={12} color="var(--a2)" />
                      <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--t1)', textTransform: 'capitalize' }}>{res.replace(/_/g, ' ')}</span>
                      <span className="badge b-gray" style={{ fontSize: 8 }}>{allActs.length} diff{allActs.length > 1 ? 's' : ''}</span>
                    </div>
                    <table className="tbl" style={{ width: '100%' }}>
                      <tbody>
                        {allActs.map(act => (
                          <tr key={`${res}:${act}`}>
                            <td style={{ width: 120 }}>
                              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t2)', padding: '2px 7px', borderRadius: 4, background: 'var(--card2)' }}>{act}</span>
                            </td>
                            <td style={{ textAlign: 'center', width: 120 }}>
                              {r1Acts.includes(act) ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6,
                                  background: `${rc1.color}12`, border: `1px solid ${rc1.color}22`,
                                }}>
                                  <Check size={10} color={rc1.color} strokeWidth={2.5} />
                                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: rc1.color }}>{rc1.label}</span>
                                </span>
                              ) : <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', opacity: 0.5 }}>—</span>}
                            </td>
                            <td style={{ textAlign: 'center', width: 120 }}>
                              {r2Acts.includes(act) ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6,
                                  background: `${rc2.color}12`, border: `1px solid ${rc2.color}22`,
                                }}>
                                  <Check size={10} color={rc2.color} strokeWidth={2.5} />
                                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: rc2.color }}>{rc2.label}</span>
                                </span>
                              ) : <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', opacity: 0.5 }}>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CUSTOM ROLES (fetched from API)                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */
function CustomRolesView({ onCreateClick }: { onCreateClick: () => void }) {
  const qc = useQueryClient();
  const { data: customRoles, isLoading } = useQuery({
    queryKey: ['custom-roles'],
    queryFn: () => permissionsApi.listCustomRoles(PID),
  });
  const roles: CustomRole[] = customRoles || [];

  const deleteMut = useMutation({
    mutationFn: (id: string) => permissionsApi.deleteCustomRole(PID, id),
    onSuccess: () => { toast.success('Role deleted'); qc.invalidateQueries({ queryKey: ['custom-roles'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <SkeletonTable rows={4} cols={4} />;

  if (roles.length === 0) {
    return (
      <Empty
        title="No custom roles"
        sub="Custom roles let you define fine-grained permissions beyond the built-in roles."
        action={<button className="btn btn-primary btn-sm" onClick={onCreateClick}><Plus size={11} />Create Role</button>}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {roles.map(role => {
        // Color comes from API (custom role's stored color), fallback to accent
        const c = role.color || '#6366f1';
        // Group permissions by resource — all from API
        const grouped: Record<string, string[]> = {};
        for (const p of role.permissions) {
          const [res, act] = p.includes(':') ? p.split(':') : [p, ''];
          if (!grouped[res]) grouped[res] = [];
          if (act) grouped[res].push(act);
        }
        const resCount = Object.keys(grouped).length;
        return (
          <div key={role._id} style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r3)', overflow: 'hidden', transition: 'border-color .2s' }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${c}, ${c}88)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${c}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${c}22`, flexShrink: 0,
              }}>
                <Shield size={17} color={c} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{role.name}</div>
                {role.description && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{role.description}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge" style={{ background: `${c}12`, color: c, borderColor: `${c}22` }}>{role.permissions.length} permissions</span>
                <span className="badge b-gray">{resCount} resources</span>
                <button className="btn btn-danger btn-sm" style={{ padding: '5px 10px' }} onClick={() => deleteMut.mutate(role._id)} disabled={deleteMut.isPending}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
            <div style={{ padding: '0 20px 16px', display: 'flex', flexWrap: 'wrap', gap: 6, borderTop: '1px solid var(--b1)', paddingTop: 14 }}>
              {Object.entries(grouped).slice(0, 8).map(([res, acts]) => (
                <div key={res} style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--b1)' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 600, color: c, background: `${c}10`, padding: '3px 8px', textTransform: 'capitalize' }}>{res.replace(/_/g, ' ')}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t2)', padding: '3px 7px', background: 'var(--card2)' }}>{acts.join(', ')}</span>
                </div>
              ))}
              {Object.keys(grouped).length > 8 && (
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', padding: '3px 6px', alignSelf: 'center' }}>+{Object.keys(grouped).length - 8} more</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CREATE ROLE MODAL (resources & actions from API)                          */
/* ═══════════════════════════════════════════════════════════════════════════ */
function CreateRoleModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: matrix } = useQuery({ queryKey: ['perm-matrix'], queryFn: () => permissionsApi.getMatrix() });
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', permissions: [] as string[] });

  // Everything from API
  const resources: string[] = matrix?.resources || [];
  const actions: string[] = matrix?.actions || [];
  const total = resources.length * actions.length;
  const pct = total > 0 ? Math.round((form.permissions.length / total) * 100) : 0;

  const create = useMutation({
    mutationFn: (d: any) => permissionsApi.createCustomRole(PID, d),
    onSuccess: () => { toast.success('Custom role created'); qc.invalidateQueries({ queryKey: ['custom-roles'] }); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const toggle = (perm: string) => setForm(p => ({
    ...p, permissions: p.permissions.includes(perm) ? p.permissions.filter(x => x !== perm) : [...p.permissions, perm],
  }));

  const toggleRes = (res: string) => {
    const perms = actions.map(a => `${res}:${a}`);
    const all = perms.every(p => form.permissions.includes(p));
    setForm(p => ({ ...p, permissions: all ? p.permissions.filter(x => !perms.includes(x)) : Array.from(new Set([...p.permissions, ...perms])) }));
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620, maxHeight: '90vh', padding: 0, display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--b1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${form.color}15`, border: `1px solid ${form.color}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={14} color={form.color} />
            </div>
            <div>
              <div className="modal-title">{form.name || 'New Custom Role'}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8.5, color: 'var(--t3)', marginTop: 1 }}>{pct}% permissions selected</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10, marginBottom: 14 }}>
            <div className="field">
              <label className="label">Role Name</label>
              <input className="input" placeholder="ops-engineer" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="field">
              <label className="label">Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 8px', background: 'var(--card2)', border: '1px solid var(--b1)', borderRadius: 'var(--r2)' }}>
                <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: 22, height: 22, border: 'none', borderRadius: 5, cursor: 'pointer', background: 'transparent', padding: 0 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t2)' }}>{form.color}</span>
              </div>
            </div>
          </div>
          <div className="field" style={{ marginBottom: 18 }}>
            <label className="label">Description</label>
            <input className="input" placeholder="What can this role do?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--t1)' }}>Permissions</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="badge" style={{ background: `${form.color}15`, color: form.color, borderColor: `${form.color}25` }}>{form.permissions.length} / {total}</span>
                <button onClick={() => setForm(p => ({
                  ...p, permissions: p.permissions.length === total ? [] : resources.flatMap(r => actions.map(a => `${r}:${a}`)),
                }))} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--a2)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {form.permissions.length === total ? 'Clear all' : 'Select all'}
                </button>
              </div>
            </div>
            <div style={{ height: 3, background: 'var(--b1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: form.color, borderRadius: 2, transition: 'width .4s ease' }} />
            </div>
          </div>

          {/* Permission grid — resources & actions from API */}
          <div style={{ border: '1px solid var(--b1)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
            {resources.map((res, ri) => {
              const perms = actions.map(a => `${res}:${a}`);
              const count = perms.filter(p => form.permissions.includes(p)).length;
              const allOn = count === actions.length;
              return (
                <div key={res} style={{ borderBottom: ri < resources.length - 1 ? '1px solid var(--b1)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--card2)' }}>
                    <Layers size={10} color={count > 0 ? form.color : 'var(--t3)'} />
                    <span style={{ fontWeight: 600, fontSize: 11, textTransform: 'capitalize', color: 'var(--t1)', flex: 1 }}>{res.replace(/_/g, ' ')}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: count > 0 ? form.color : 'var(--t3)' }}>{count}/{actions.length}</span>
                    <button onClick={() => toggleRes(res)} style={{
                      padding: '2px 8px', fontSize: 9, fontFamily: 'var(--mono)', borderRadius: 5,
                      border: `1px solid ${allOn ? `${form.color}30` : 'var(--b1)'}`,
                      color: allOn ? form.color : 'var(--t3)',
                      background: allOn ? `${form.color}08` : 'transparent', cursor: 'pointer',
                    }}>
                      {allOn ? '✓ All' : 'Grant all'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 4, padding: '6px 12px 8px', flexWrap: 'wrap' }}>
                    {actions.map(act => {
                      const perm = `${res}:${act}`;
                      const on = form.permissions.includes(perm);
                      return (
                        <button key={perm} onClick={() => toggle(perm)} className="badge" style={{
                          cursor: 'pointer', fontSize: 9.5, padding: '3px 9px',
                          background: on ? `${form.color}12` : 'var(--card)',
                          borderColor: on ? `${form.color}30` : 'var(--b1)',
                          color: on ? form.color : 'var(--t3)',
                          transition: 'all .12s ease',
                        }}>
                          {on && <Check size={8} style={{ marginRight: 3 }} />}{act}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--b1)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={() => create.mutate(form)} disabled={create.isPending || !form.name || !form.permissions.length}>
            {create.isPending ? 'Creating…' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PAGE                                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function PermissionsPage() {
  const [tab, setTab] = useState<'matrix' | 'compare' | 'custom'>('matrix');
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left">
          <h1>Permissions</h1>
          <p>// Role-based access control matrix</p>
        </div>
        <div className="ph-right">
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={12} />Custom Role
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 22, width: 'fit-content' }}>
        <button className={`tab${tab === 'matrix' ? ' on' : ''}`} onClick={() => setTab('matrix')}>
          <Lock size={11} style={{ marginRight: 5 }} />Matrix
        </button>
        <button className={`tab${tab === 'compare' ? ' on' : ''}`} onClick={() => setTab('compare')}>
          <GitBranch size={11} style={{ marginRight: 5 }} />Compare
        </button>
        <button className={`tab${tab === 'custom' ? ' on' : ''}`} onClick={() => setTab('custom')}>
          <Shield size={11} style={{ marginRight: 5 }} />Custom Roles
        </button>
      </div>

      {tab === 'matrix' && <MatrixView />}
      {tab === 'compare' && <CompareView />}
      {tab === 'custom' && <CustomRolesView onCreateClick={() => setShowCreate(true)} />}

      {showCreate && <CreateRoleModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
