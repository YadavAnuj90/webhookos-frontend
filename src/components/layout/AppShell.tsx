'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useNotifStore, useProjectStore } from '@/lib/store';
import { workspacesApi, set402Handler, billingApi, projectsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { TrialInfo, Subscription } from '@/lib/types';
import toast from 'react-hot-toast';
import TrialBanner, { PlanBadge } from '@/components/billing/TrialBanner';
import CommandPalette from '@/components/ui/CommandPalette';
import {
  Activity, LayoutDashboard, Zap, Globe, BarChart3, AlertTriangle,
  CreditCard, Settings, User, Shield, Bell, Search, LogOut,
  ChevronRight, X, Check, Info, AlertCircle, Menu, Users, FileText,
  Key, BellRing, FlaskConical, Shuffle, ExternalLink, BarChart2,
  ChevronDown, Plus, Building2, CheckCheck, Sun, Moon,
  Tag, Webhook, Radio, Gauge, Receipt, Coins, Store, Calendar, Lock, Briefcase,
} from 'lucide-react';

const NAV_GROUPS = [
  { label: 'CORE', items: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/endpoints', icon: Globe, label: 'Endpoints' },
    { href: '/events', icon: Zap, label: 'Events' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dlq', icon: AlertTriangle, label: 'Dead Letter Q' },
    { href: '/history', icon: FileText, label: 'History' },
  ]},
  { label: 'DEVELOPER', items: [
    { href: '/playground',            icon: FlaskConical, label: 'Playground' },
    { href: '/api-keys',              icon: Key,          label: 'API Keys' },
    { href: '/transformations',       icon: Shuffle,      label: 'Transformations' },
    { href: '/event-types',           icon: Tag,          label: 'Event Types' },
    { href: '/scheduled-events',      icon: Calendar,     label: 'Scheduled' },
    { href: '/operational-webhooks',  icon: Webhook,      label: 'Op. Webhooks' },
    { href: '/dev-tunnel',            icon: Radio,        label: 'Dev Tunnel' },
  ]},
  { label: 'MONITOR', items: [
    { href: '/alerts',  icon: BellRing,  label: 'Alerts' },
    { href: '/usage',   icon: BarChart2, label: 'Usage' },
    { href: '/metrics', icon: Gauge,     label: 'Metrics' },
  ]},
  { label: 'ACCOUNT', items: [
    { href: '/portal', icon: ExternalLink, label: 'Customer Portal' },
    { href: '/workspace', icon: Building2, label: 'Workspace' },
    { href: '/permissions', icon: Lock, label: 'Permissions' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

const BILLING_NAV = [
  { href: '/billing',          icon: CreditCard, label: 'Overview'        },
  { href: '/billing/credits',  icon: Coins,      label: 'Credits'         },
  { href: '/billing/invoices', icon: Receipt,    label: 'Invoices'        },
];

const ADMIN_NAV = [
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/audit', icon: Shield, label: 'Audit Log' },
  { href: '/admin/careers', icon: Briefcase, label: 'Careers' },
];

function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    workspacesApi.list().then(d => { const arr = Array.isArray(d) ? d : []; setWorkspaces(arr); if (arr[0] && !active) setActive(arr[0]); }).catch(() => { toast.error('Could not load workspaces'); });
  }, []);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  if (collapsed) return (
    <div style={{ padding: '10px 8px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={13} color="#fff" /></div>
    </div>
  );
  return (
    <div ref={ref} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 8, background: open ? 'rgba(99,102,241,0.1)' : 'transparent', border: 'none', cursor: 'pointer' }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Building2 size={11} color="#fff" /></div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active?.name || 'Personal Workspace'}</span>
        <ChevronDown size={11} color="var(--text3)" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 10, right: 10, zIndex: 999, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', padding: 6, marginTop: 4 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '4px 8px 6px' }}>Workspaces</div>
          {workspaces.map(ws => (
            <button key={ws._id} onClick={() => { setActive(ws); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, background: active?._id === ws._id ? 'rgba(99,102,241,0.12)' : 'transparent', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>{ws.name?.[0]?.toUpperCase()}</span></div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
              {active?._id === ws._id && <CheckCheck size={11} color="var(--accent2)" />}
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
          <button onClick={() => { setOpen(false); router.push('/workspace'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent2)' }}>
            <Plus size={12} color="var(--accent2)" /><span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>New Workspace</span>
          </button>
        </div>
      )}
    </div>
  );
}

function NavItem({ href, icon: Icon, label, collapsed, color }: { href: string; icon: any; label: string; collapsed: boolean; color?: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/billing' && pathname.startsWith(href + '/')) || (href === '/billing' && pathname === '/billing');
  const ac = color || 'var(--accent2)';
  const itemRef = useRef<HTMLDivElement>(null);
  const [glare, setGlare] = useState<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = itemRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setGlare({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        ref={itemRef}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setGlare(null); setHovered(false); }}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 8, marginBottom: 1,
          background: active
            ? (color ? `${color}18` : 'rgba(99,102,241,0.13)')
            : hovered ? 'var(--nav-hover-bg, rgba(99,102,241,0.07))' : 'transparent',
          color: active ? ac : hovered ? 'var(--text)' : 'var(--text3)',
          borderLeft: active ? `2px solid ${ac}` : '2px solid transparent',
          transition: 'color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s',
          cursor: 'pointer', overflow: 'hidden',
          boxShadow: hovered && !active
            ? '0 0 20px rgba(99,102,241,0.08), inset 0 0 0 1px rgba(99,102,241,0.08)'
            : 'none',
          transform: hovered && !active ? 'translateX(2px)' : 'translateX(0)',
        }}
      >
        {glare && !active && (
          <span style={{
            position: 'absolute',
            left: glare.x - 50,
            top: glare.y - 50,
            width: 100, height: 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ac}18 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }} />
        )}
        {hovered && !active && (
          <span style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
            borderRadius: 2,
            background: `linear-gradient(180deg, transparent, ${ac}60, transparent)`,
            pointerEvents: 'none', zIndex: 0,
          }} />
        )}
        <Icon size={15} style={{
          flexShrink: 0,
          color: active ? ac : hovered ? ac : 'inherit',
          position: 'relative', zIndex: 1,
          filter: hovered && !active ? `drop-shadow(0 0 4px ${ac}50)` : 'none',
          transition: 'color 0.2s, filter 0.2s',
        }} />
        {!collapsed && (
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 13,
            fontWeight: active ? 600 : hovered ? 500 : 400,
            whiteSpace: 'nowrap', position: 'relative', zIndex: 1,
            transition: 'font-weight 0.15s',
          }}>
            {label}
          </span>
        )}
      </div>
    </Link>
  );
}

function Sidebar({ collapsed, setCollapsed, isReseller }: { collapsed: boolean; setCollapsed: (v: boolean) => void; isReseller: boolean }) {
  const { user } = useAuthStore();
  const isAdmin = ['admin', 'super_admin'].includes(user?.role || '');
  return (
    <aside style={{ width: collapsed ? 64 : 224, height: '100vh', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', flexShrink: 0, overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ padding: '14px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><img src="/logo.svg" alt="WebhookOS" width={34} height={34} style={{ display: 'block' }} /></div>
        {!collapsed && <div><div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 14, color: 'var(--text)', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>WebhookOS</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: '0.08em', marginTop: 1 }}>WEBHOOK DELIVERY</div></div>}
      </div>
      <WorkspaceSwitcher collapsed={collapsed} />
      <nav style={{ flex: 1, padding: '6px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '9px 10px 4px', opacity: 0.7 }}>{group.label}</div>}
            {collapsed && <div style={{ height: 6 }} />}
            {group.items.map(({ href, icon, label }) => (
              <NavItem key={href} href={href} icon={icon} label={label} collapsed={collapsed} />
            ))}
          </div>
        ))}

        {/* Billing section */}
        <div>
          {!collapsed && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '9px 10px 4px', opacity: 0.8 }}>BILLING</div>}
          {collapsed && <div style={{ height: 6 }} />}
          {BILLING_NAV.map(({ href, icon, label }) => (
            <NavItem key={href} href={href} icon={icon} label={label} collapsed={collapsed} color="#4ade80" />
          ))}
          {isReseller && (
            <NavItem href="/billing/reseller" icon={Store} label="Reseller Portal" collapsed={collapsed} color="#a855f7" />
          )}
        </div>

        {isAdmin && (
          <>
            {!collapsed && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '9px 10px 4px', opacity: 0.8 }}>ADMIN</div>}
            {ADMIN_NAV.map(({ href, icon: Icon, label }) => (
              <NavItem key={href} href={href} icon={Icon} label={label} collapsed={collapsed} color="#f87171" />
            ))}
          </>
        )}
      </nav>
      <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setCollapsed(!collapsed)} className="btn-ghost" style={{ width: '100%', padding: '7px', justifyContent: 'center', borderRadius: 8 }}>
          <ChevronRight size={13} style={{ transform: collapsed ? 'rotate(0)' : 'rotate(180deg)', transition: 'transform 0.2s', color: 'var(--text3)' }} />
        </button>
      </div>
    </aside>
  );
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────
const CRUMB_MAP: Record<string, string> = {
  dashboard: 'Dashboard', endpoints: 'Endpoints', events: 'Events', analytics: 'Analytics',
  dlq: 'Dead Letter Q', history: 'History', playground: 'Playground', 'api-keys': 'API Keys',
  transformations: 'Transformations', 'event-types': 'Event Types', 'operational-webhooks': 'Op. Webhooks',
  'dev-tunnel': 'Dev Tunnel', alerts: 'Alerts', usage: 'Usage', metrics: 'Metrics',
  portal: 'Portal', workspace: 'Workspace', settings: 'Settings', profile: 'Profile',
  billing: 'Billing', credits: 'Credits', invoices: 'Invoices', reseller: 'Reseller',
  admin: 'Admin', users: 'Users', audit: 'Audit Log', health: 'Health',
  'scheduled-events': 'Scheduled Events', permissions: 'Permissions',
};

function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length <= 1) return null; // no breadcrumbs on top-level pages

  const crumbs = parts.map((seg, i) => {
    const href = '/' + parts.slice(0, i + 1).join('/');
    const label = CRUMB_MAP[seg] || (seg.length > 16 ? seg.slice(-8) + '…' : seg);
    const isLast = i === parts.length - 1;
    return { href, label, isLast };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 20px', height: 28, borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
      <Link href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textDecoration: 'none' }}>Home</Link>
      {crumbs.map(({ href, label, isLast }) => (
        <span key={href} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronRight size={9} color="var(--text3)" />
          {isLast
            ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text2)', fontWeight: 600 }}>{label}</span>
            : <Link href={href} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textDecoration: 'none' }}>{label}</Link>
          }
        </span>
      ))}
    </div>
  );
}

// ─── Notification types ───────────────────────────────────────────────────────
type SysNotif = { id: string; type: 'alert' | 'dlq' | 'billing' | 'info'; title: string; body: string; time: string; read: boolean; href?: string };

function NotifIcon({ type }: { type: SysNotif['type'] }) {
  if (type === 'alert')   return <AlertCircle size={13} color="#f87171" />;
  if (type === 'dlq')     return <AlertTriangle size={13} color="#f59e0b" />;
  if (type === 'billing') return <CreditCard size={13} color="#4ade80" />;
  return <Info size={13} color="var(--accent2)" />;
}

function Topbar({ toggleMobile, onOpenCmd }: { toggleMobile: () => void; onOpenCmd: () => void }) {
  const { user, logout } = useAuthStore();
  const { notifs: storeNotifs, clearAll } = useNotifStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sysNotifs, setSysNotifs] = useState<SysNotif[]>([]);
  const router = useRouter();

  const { data: sub } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: () => billingApi.getSubscription(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    throwOnError: false,
  });

  // Fetch DLQ count for notification
  const { projectId: topbarPid } = useProjectStore();
  const { data: dlqData } = useQuery({
    queryKey: ['dlq-count', topbarPid],
    queryFn: () => import('@/lib/api').then(m => m.eventsApi.list(topbarPid, { status: 'dead', limit: 1 })),
    refetchInterval: 60000,
    retry: 1,
  });

  // Build system notifications from API data
  useEffect(() => {
    const generated: SysNotif[] = [];
    const dlqCount = (dlqData as any)?.total || 0;
    if (dlqCount > 0) {
      generated.push({ id: 'dlq', type: 'dlq', title: 'Dead Letter Queue', body: `${dlqCount} event${dlqCount > 1 ? 's' : ''} in DLQ — needs attention`, time: 'Now', read: false, href: '/dlq' });
    }
    if (sub?.status === 'trial' && sub?.daysLeft !== undefined && sub.daysLeft <= 3) {
      generated.push({ id: 'trial', type: 'billing', title: 'Trial expiring soon', body: `Your trial ends in ${sub.daysLeft} day${sub.daysLeft === 1 ? '' : 's'}. Upgrade to keep access.`, time: 'Now', read: false, href: '/billing' });
    }
    if (sub?.status === 'overdue') {
      generated.push({ id: 'overdue', type: 'billing', title: 'Payment overdue', body: 'Your account has an overdue payment. Update billing to avoid suspension.', time: 'Now', read: false, href: '/billing' });
    }
    setSysNotifs(generated);
  }, [dlqData, sub]);

  const allNotifs = [
    ...sysNotifs,
    ...storeNotifs.slice(0, 6).map((n: any, i: number) => ({
      id: `store-${i}`, type: n.type === 'error' ? 'alert' as const : 'info' as const,
      title: n.type === 'error' ? 'Error' : n.type === 'success' ? 'Success' : 'Info',
      body: n.message, time: n.time || '', read: n.read,
    })),
  ];
  const unread = allNotifs.filter(n => !n.read).length;

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const handleLogout = async () => { try { await logout(); } catch {} router.push('/auth/login'); };

  const iconBtnStyle: React.CSSProperties = {
    cursor: 'pointer', padding: 7, borderRadius: 8,
    background: 'transparent', border: '1px solid transparent',
    color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .18s ease', position: 'relative',
  };
  const iconBtnHover = (e: React.MouseEvent, active = false) => {
    const el = e.currentTarget as HTMLElement;
    el.style.background = 'var(--abg)';
    el.style.borderColor = 'var(--abd)';
    el.style.color = 'var(--accent2)';
    el.style.transform = 'scale(1.05)';
  };
  const iconBtnLeave = (e: React.MouseEvent, active = false) => {
    const el = e.currentTarget as HTMLElement;
    el.style.background = active ? 'var(--abg)' : 'transparent';
    el.style.borderColor = active ? 'var(--abd)' : 'transparent';
    el.style.color = active ? 'var(--accent2)' : 'var(--text3)';
    el.style.transform = 'scale(1)';
  };

  return (
    <header style={{
      height: 52, background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 16px 0 20px',
      gap: 8, flexShrink: 0,
      backdropFilter: 'blur(16px)',
    }}>
      <button
        onClick={toggleMobile}
        style={{ display: 'none', padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text3)', alignItems: 'center' }}
        className="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      {/* Search — centered feel */}
      <div style={{ flex: 1, maxWidth: 420 }}>
        <button
          onClick={onOpenCmd}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg3)', border: '1px solid var(--b1)',
            borderRadius: 10, padding: '7px 14px',
            cursor: 'pointer', transition: 'all .2s ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = 'var(--abd)';
            el.style.boxShadow = '0 0 0 3px var(--abg)';
            el.style.background = 'var(--bg2)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.borderColor = 'var(--b1)';
            el.style.boxShadow = 'none';
            el.style.background = 'var(--bg3)';
          }}
        >
          <Search size={14} color="var(--text3)" style={{ flexShrink: 0, opacity: 0.6 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', flex: 1, textAlign: 'left', opacity: 0.7 }}>
            Search pages, endpoints, events...
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <kbd style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)',
              background: 'var(--bg)', border: '1px solid var(--b1)',
              borderRadius: 5, padding: '2px 6px', lineHeight: 1.3,
              boxShadow: '0 1px 0 var(--b1)',
            }}>⌘</kbd>
            <kbd style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)',
              background: 'var(--bg)', border: '1px solid var(--b1)',
              borderRadius: 5, padding: '2px 6px', lineHeight: 1.3,
              boxShadow: '0 1px 0 var(--b1)',
            }}>K</kbd>
          </div>
        </button>
      </div>

      {/* Right actions */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={iconBtnStyle}
          onMouseEnter={iconBtnHover}
          onMouseLeave={e => iconBtnLeave(e)}
        >
          {theme === 'dark'
            ? <Sun size={16} strokeWidth={1.8} />
            : <Moon size={16} strokeWidth={1.8} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ ...iconBtnStyle, background: showNotifs ? 'var(--abg)' : 'transparent', borderColor: showNotifs ? 'var(--abd)' : 'transparent', color: showNotifs ? 'var(--accent2)' : 'var(--text3)' }}
            onMouseEnter={iconBtnHover}
            onMouseLeave={e => iconBtnLeave(e, showNotifs)}
          >
            <Bell size={16} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                minWidth: 16, height: 16, borderRadius: 8,
                background: 'linear-gradient(135deg,#ef4444,#f87171)',
                border: '2px solid var(--bg2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#fff', fontWeight: 800, lineHeight: 1 }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              </span>
            )}
          </button>
          {showNotifs && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 360,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 14, boxShadow: 'var(--s2), 0 16px 48px rgba(0,0,0,0.25)',
              zIndex: 200, overflow: 'hidden',
              animation: 'selectSlideIn 0.15s ease',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Notifications</span>
                  {unread > 0 && (
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 8px',
                      borderRadius: 20, background: 'var(--rbg)', color: 'var(--red)',
                      border: '1px solid var(--rbd)', fontWeight: 600,
                    }}>{unread} new</span>
                  )}
                </div>
                {allNotifs.length > 0 && (
                  <button onClick={clearAll} style={{
                    fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--accent2)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '3px 8px', borderRadius: 6, transition: 'background .15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--abg)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                  >Clear all</button>
                )}
              </div>
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {allNotifs.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                      <Bell size={18} style={{ color: 'var(--text3)', opacity: 0.4 }} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>All clear</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--t3)', marginTop: 3, opacity: 0.6 }}>No new notifications</div>
                  </div>
                ) : allNotifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => { if (n.href) { router.push(n.href); setShowNotifs(false); } }}
                    style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--b1)',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      background: n.read ? 'transparent' : 'var(--abg)',
                      cursor: n.href ? 'pointer' : 'default',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (n.href) (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'var(--abg)'; }}
                  >
                    <div style={{
                      marginTop: 2, flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                      background: n.type === 'alert' ? 'var(--rbg)' : n.type === 'dlq' ? 'var(--ybg)' : n.type === 'billing' ? 'var(--gbg)' : 'var(--abg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <NotifIcon type={n.type} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', fontWeight: n.read ? 400 : 600 }}>{n.title}</span>
                        {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', flexShrink: 0 }} />}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text2)', marginTop: 2, lineHeight: 1.5 }}>{n.body}</div>
                      {n.time && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 4, opacity: 0.7 }}>{n.time}</div>}
                    </div>
                    {n.href && <ChevronRight size={12} color="var(--text3)" style={{ marginTop: 8, flexShrink: 0, opacity: 0.5 }} />}
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                <Link href="/alerts" onClick={() => setShowNotifs(false)} style={{
                  fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--accent2)',
                  textDecoration: 'none', fontWeight: 500,
                  padding: '3px 10px', borderRadius: 6, transition: 'background .15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--abg)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  Manage alert rules →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 20, background: 'var(--b1)', margin: '0 6px', flexShrink: 0 }} />

        {/* User Avatar */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUser(!showUser)}
            style={{
              background: 'none', border: '1px solid transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 6px 4px 4px', borderRadius: 10,
              transition: 'all .18s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--bg3)';
              el.style.borderColor = 'var(--b1)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = showUser ? 'var(--bg3)' : 'none';
              el.style.borderColor = showUser ? 'var(--b1)' : 'transparent';
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg,#4f46e5,#818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
            }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                {((user?.firstName || user?.email || 'U')[0].toUpperCase()) || 'U'}
              </span>
            </div>
            <ChevronDown size={11} color="var(--text3)" style={{ transform: showUser ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
          {showUser && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 240,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 12, boxShadow: 'var(--s2), 0 12px 40px rgba(0,0,0,0.25)',
              zIndex: 200, overflow: 'hidden',
              animation: 'selectSlideIn 0.15s ease',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {(user?.firstName ? user.firstName + ' ' + (user.lastName || '') : user?.email) || 'User'}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{user?.email}</div>
                {sub && (
                  <div style={{ marginTop: 8 }}>
                    <PlanBadge status={sub.status} planName={sub.planName} daysLeft={sub.daysLeft} />
                  </div>
                )}
              </div>
              <div style={{ padding: '4px' }}>
                {[{ icon: User, label: 'Profile', href: '/profile' }, { icon: Settings, label: 'Settings', href: '/settings' }, { icon: Building2, label: 'Workspace', href: '/workspace' }].map(({ icon: Icon, label, href }) => (
                  <Link key={href} href={href} onClick={() => setShowUser(false)} style={{
                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 8, color: 'var(--text2)',
                    transition: 'all .12s',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--bg3)'; el.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--text2)'; }}
                  >
                    <Icon size={14} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 500 }}>{label}</span>
                  </Link>
                ))}
                <Link href="/billing" onClick={() => setShowUser(false)} style={{
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8, color: '#4ade80',
                  transition: 'all .12s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(74,222,128,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <CreditCard size={14} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600 }}>Manage Billing</span>
                </Link>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: 4 }}>
                <button onClick={handleLogout} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8,
                  background: 'none', border: 'none', cursor: 'pointer', color: '#f87171',
                  transition: 'background .12s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <LogOut size={14} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 500 }}>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const sidebarW = collapsed ? 64 : 224;
  const router = useRouter();

  // Fetch subscription to know if reseller
  const { data: sub } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: () => billingApi.getSubscription(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    throwOnError: false,
  });

  const isReseller = sub?.features?.reseller === true;

  // Wire up 402 handler once
  useEffect(() => {
    set402Handler((code, msg) => {
      toast.error(msg || 'Payment required');
      router.push(`/billing?reason=${code}`);
    });
  }, [router]);

  // ── Resolve default project on mount ─────────────────────────────────────
  // Fetches the user's real default project and stores its ID,
  // so all pages using useProjectStore get a real MongoDB ObjectId
  // instead of the placeholder "default".
  const { setProject } = useProjectStore();
  useEffect(() => {
    projectsApi.myDefault()
      .then((p: any) => {
        if (p?._id) setProject(p._id, p.name);
      })
      .catch(() => {}); // Silently fail — backend will still resolve "default" on each request
  }, []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Command Palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Sidebar — fixed on left (desktop) / slide-in (mobile) */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        width: sidebarW, transition: 'width 0.25s ease, transform 0.25s ease',
      }}
        className={mobileOpen ? 'sidebar-open' : ''}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} isReseller={isReseller} />
      </div>

      {/* Content — offset by sidebar width, body scrolls */}
      <div style={{ marginLeft: sidebarW, transition: 'margin-left 0.25s ease', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        className="main-content"
      >
        {/* Topbar + Breadcrumbs — sticky at top */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          <Topbar toggleMobile={() => setMobileOpen(p => !p)} onOpenCmd={() => setCmdOpen(true)} />
          <Breadcrumbs />
        </div>
        {/* Trial Banner */}
        <TrialBanner />
        {/* Main — NO overflow, body scrolls */}
        <main style={{ flex: 1, padding: '28px 32px' }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-open { transform: translateX(0) !important; }
          div[style*="position: fixed"][style*="zIndex: 50"] { transform: translateX(-100%); }
          .sidebar-open { transform: translateX(0) !important; }
          .main-content { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
