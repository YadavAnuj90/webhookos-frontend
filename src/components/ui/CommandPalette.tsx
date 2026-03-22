'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchApi } from '@/lib/api';
import {
  LayoutDashboard, Zap, Globe, BarChart3, AlertTriangle, FileText,
  FlaskConical, Key, Shuffle, Tag, Webhook, Radio,
  BellRing, BarChart2, Gauge, ExternalLink, Building2, Settings,
  CreditCard, Users, Shield, Search, X, Command, ChevronRight,
  Send, Plus, RefreshCw, Play,
} from 'lucide-react';

// ── All navigable pages ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',              href: '/dashboard',             group: 'PAGES',     desc: 'Overview and stats' },
  { icon: Globe,           label: 'Endpoints',              href: '/endpoints',             group: 'PAGES',     desc: 'Manage delivery endpoints' },
  { icon: Zap,             label: 'Events',                 href: '/events',                group: 'PAGES',     desc: 'View all webhook events' },
  { icon: BarChart3,       label: 'Analytics',              href: '/analytics',             group: 'PAGES',     desc: 'Delivery metrics & charts' },
  { icon: AlertTriangle,   label: 'Dead Letter Queue',      href: '/dlq',                   group: 'PAGES',     desc: 'Failed events for replay' },
  { icon: FileText,        label: 'History',                href: '/history',               group: 'PAGES',     desc: 'Full delivery audit trail' },
  { icon: FlaskConical,    label: 'Playground',             href: '/playground',            group: 'DEVELOPER', desc: 'Test webhook delivery' },
  { icon: Key,             label: 'API Keys',               href: '/api-keys',              group: 'DEVELOPER', desc: 'Manage API credentials' },
  { icon: Shuffle,         label: 'Transformations',        href: '/transformations',       group: 'DEVELOPER', desc: 'Payload transform rules' },
  { icon: Tag,             label: 'Event Types',            href: '/event-types',           group: 'DEVELOPER', desc: 'Event catalog & schemas' },
  { icon: Webhook,         label: 'Operational Webhooks',   href: '/operational-webhooks',  group: 'DEVELOPER', desc: 'System event hooks' },
  { icon: Radio,           label: 'Dev Tunnel',             href: '/dev-tunnel',            group: 'DEVELOPER', desc: 'Local tunnel for testing' },
  { icon: BellRing,        label: 'Alerts',                 href: '/alerts',                group: 'MONITOR',   desc: 'Alert rules & notifications' },
  { icon: BarChart2,       label: 'Usage',                  href: '/usage',                 group: 'MONITOR',   desc: 'Event & quota usage' },
  { icon: Gauge,           label: 'Metrics',                href: '/metrics',               group: 'MONITOR',   desc: 'Prometheus metrics' },
  { icon: ExternalLink,    label: 'Customer Portal',        href: '/portal',                group: 'ACCOUNT',   desc: 'Portal tokens & branding' },
  { icon: Building2,       label: 'Workspace',              href: '/workspace',             group: 'ACCOUNT',   desc: 'Team & workspace settings' },
  { icon: Settings,        label: 'Settings',               href: '/settings',              group: 'ACCOUNT',   desc: 'Account preferences' },
  { icon: CreditCard,      label: 'Billing',                href: '/billing',               group: 'BILLING',   desc: 'Plans & invoices' },
  { icon: Users,           label: 'Admin: Users',           href: '/admin/users',           group: 'ADMIN',     desc: 'User management' },
  { icon: Shield,          label: 'Admin: Audit Log',       href: '/admin/audit',           group: 'ADMIN',     desc: 'System audit trail' },
];

const QUICK_ACTIONS = [
  { icon: Plus,      label: 'Create Endpoint',   href: '/endpoints',  group: 'ACTIONS', desc: 'Add a new delivery endpoint' },
  { icon: Send,      label: 'Send Test Event',   href: '/playground', group: 'ACTIONS', desc: 'Fire a test from Playground' },
  { icon: RefreshCw, label: 'Replay DLQ Events', href: '/dlq',        group: 'ACTIONS', desc: 'Replay failed events in queue' },
  { icon: Play,      label: 'View Live Events',  href: '/events',     group: 'ACTIONS', desc: 'Watch real-time delivery log' },
  { icon: Key,       label: 'Create API Key',    href: '/api-keys',   group: 'ACTIONS', desc: 'Generate a new API credential' },
];

const GROUP_LABELS: Record<string, string> = {
  ACTIONS: 'Quick Actions',
  RESULTS: 'Search Results',
  PAGES:   'Navigate',
  DEVELOPER: 'Developer',
  MONITOR: 'Monitor',
  ACCOUNT: 'Account',
  BILLING: 'Billing',
  ADMIN:   'Admin',
};
const GROUP_ORDER = ['ACTIONS', 'RESULTS', 'PAGES', 'DEVELOPER', 'MONITOR', 'ACCOUNT', 'BILLING', 'ADMIN'];

type Item = { icon: any; label: string; href: string; group: string; desc?: string; isAction?: boolean };

// ── Component ─────────────────────────────────────────────────────────────────
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery]       = useState('');
  const [apiResults, setApiResults] = useState<Item[]>([]);
  const [activeIdx, setActiveIdx]   = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);
  const router   = useRouter();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setApiResults([]);
      setActiveIdx(0);
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Backend search with debounce
  useEffect(() => {
    if (query.length < 2) { setApiResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const d = await searchApi.search(query);
        const items: Item[] = (d?.results || []).map((r: any) => ({
          icon: Search,
          label: r.title || r.name || String(r),
          href: r.url || '/dashboard',
          group: 'RESULTS',
          desc: r.subtitle || r.type,
        }));
        setApiResults(items);
      } catch {
        setApiResults([]);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  // Build visible item list
  const q = query.toLowerCase();
  const allItems: Item[] = query.length < 1
    ? [
        ...QUICK_ACTIONS.map(a => ({ ...a, isAction: true })),
        ...NAV_ITEMS.slice(0, 7),
      ]
    : [
        ...NAV_ITEMS.filter(i =>
          i.label.toLowerCase().includes(q) || (i.desc || '').toLowerCase().includes(q)
        ),
        ...apiResults,
      ];

  // Keyboard handler
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => {
          const next = Math.min(i + 1, allItems.length - 1);
          scrollActive(next);
          return next;
        });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => {
          const next = Math.max(i - 1, 0);
          scrollActive(next);
          return next;
        });
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = allItems[activeIdx];
        if (item) { router.push(item.href); onClose(); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, allItems, activeIdx, router, onClose]);

  const scrollActive = (idx: number) => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${idx}"]`) as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  };

  // Reset active on query change
  useEffect(() => { setActiveIdx(0); }, [query]);

  if (!open) return null;

  // Group items
  const groups: Record<string, Item[]> = {};
  allItems.forEach(item => {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  });

  let gIdx = 0; // global sequential index for keyboard nav

  return (
    <>
      <style>{`
        @keyframes cmd-in {
          from { opacity:0; transform:scale(.96) translateY(-10px); }
          to   { opacity:1; transform:scale(1)   translateY(0);    }
        }
        .cmd-item:hover { background:rgba(99,102,241,.08) !important; }
        .cmd-list::-webkit-scrollbar { width:3px; }
        .cmd-list::-webkit-scrollbar-thumb { background:rgba(99,102,241,.35); border-radius:4px; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position:'fixed', inset:0, zIndex:9998, background:'rgba(0,0,0,.62)', backdropFilter:'blur(6px)' }}
      />

      {/* Palette */}
      <div
        style={{ position:'fixed', top:0, left:0, right:0, zIndex:9999, display:'flex', justifyContent:'center', paddingTop:'13vh', pointerEvents:'none' }}
      >
        <div
          style={{ width:'100%', maxWidth:580, margin:'0 16px', background:'var(--bg2)', border:'1px solid rgba(99,102,241,.3)', borderRadius:16, boxShadow:'0 32px 80px rgba(0,0,0,.72), 0 0 0 1px rgba(99,102,241,.12)', overflow:'hidden', animation:'cmd-in .16s cubic-bezier(.34,1.56,.64,1) both', pointerEvents:'all' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Input */}
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderBottom:'1px solid var(--border)' }}>
            <Search size={15} color="var(--text3)" style={{ flexShrink:0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search pages, actions, events, endpoints..."
              style={{ flex:1, background:'transparent', border:'none', outline:'none', fontFamily:'var(--font-body)', fontSize:14, color:'var(--text)', '::placeholder': { color:'var(--text3)' } } as any}
            />
            {query ? (
              <button onClick={() => setQuery('')} style={{ background:'none', border:'none', cursor:'pointer', padding:2, display:'flex', color:'var(--text3)', borderRadius:4 }}>
                <X size={13} />
              </button>
            ) : (
              <kbd style={{ fontFamily:'var(--font-mono)', fontSize:9.5, color:'var(--text3)', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:5, padding:'2px 7px', whiteSpace:'nowrap' }}>⌘K</kbd>
            )}
          </div>

          {/* Results list */}
          <div ref={listRef} className="cmd-list" style={{ maxHeight:400, overflowY:'auto' }}>
            {allItems.length === 0 && (
              <div style={{ padding:'32px 16px', textAlign:'center' }}>
                <div style={{ fontSize:22, marginBottom:8 }}>🔍</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--text3)' }}>No results for <strong style={{ color:'var(--text2)' }}>"{query}"</strong></div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--text3)', marginTop:4 }}>Try searching for a page name or event type</div>
              </div>
            )}

            {GROUP_ORDER.map(gKey => {
              const items = groups[gKey];
              if (!items?.length) return null;
              return (
                <div key={gKey}>
                  <div style={{ padding:'8px 16px 3px', fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'.13em' }}>
                    {GROUP_LABELS[gKey] || gKey}
                  </div>
                  {items.map(item => {
                    const Icon = item.icon;
                    const idx = gIdx++;
                    const active = activeIdx === idx;
                    return (
                      <div
                        key={item.href + item.label + idx}
                        data-idx={idx}
                        className="cmd-item"
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => { router.push(item.href); onClose(); }}
                        style={{ display:'flex', alignItems:'center', gap:11, padding:'8px 16px', cursor:'pointer', background: active ? 'rgba(99,102,241,.13)' : 'transparent', borderLeft: active ? '2px solid var(--accent2)' : '2px solid transparent', transition:'background .1s, border-color .1s' }}
                      >
                        <div style={{ width:32, height:32, borderRadius:9, background: item.isAction ? 'rgba(99,102,241,.16)' : 'var(--bg3)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Icon size={14} color={item.isAction ? 'var(--accent2)' : 'var(--text2)'} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:'var(--font-body)', fontSize:13, fontWeight: active ? 600 : 500, color: active ? 'var(--text)' : 'var(--text2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                            {item.label}
                          </div>
                          {item.desc && (
                            <div style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--text3)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                              {item.desc}
                            </div>
                          )}
                        </div>
                        {active && <ChevronRight size={13} color="var(--accent2)" style={{ flexShrink:0 }} />}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer hints */}
          <div style={{ padding:'8px 16px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14 }}>
            {[['↑↓', 'Navigate'], ['↵', 'Open'], ['Esc', 'Close']].map(([key, label]) => (
              <span key={label} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <kbd style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:4, padding:'1px 5px' }}>{key}</kbd>
                <span style={{ fontFamily:'var(--font-body)', fontSize:10, color:'var(--text3)' }}>{label}</span>
              </span>
            ))}
            <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4, fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', opacity:.6 }}>
              <Command size={10} /><span>K</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
