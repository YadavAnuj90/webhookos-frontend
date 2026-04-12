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
        onMouseLeave={() => setGlare(null)}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 8, marginBottom: 1,
          background: active ? (color ? `${color}18` : 'rgba(99,102,241,0.13)') : 'transparent',
          color: active ? ac : 'var(--text3)',
          borderLeft: active ? `2px solid ${ac}` : '2px solid transparent',
          transition: 'color 0.15s, background 0.15s',
          cursor: 'pointer', overflow: 'hidden',
        }}
      >
        {/* Cursor-following light blob */}
        {glare && (
          <span style={{
            position: 'absolute',
            left: glare.x - 40,
            top: glare.y - 40,
            width: 80, height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${ac}30 0%, transparent 70%)`,
            pointerEvents: 'none',
            transition: 'opacity 0.1s',
            zIndex: 0,
          }} />
        )}
        <Icon size={15} style={{ flexShrink: 0, color: active ? ac : 'inherit', position: 'relative', zIndex: 1 }} />
        {!collapsed && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', position: 'relative', zIndex: 1 }}>
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
  return (
    <header style={{ height: 54, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>
      {/* Mobile hamburger */}
      <button
        onClick={toggleMobile}
        style={{ display: 'none', padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text3)', alignItems: 'center' }}
        className="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      <div style={{ flex: 1, maxWidth: 400 }}>
        <button
          onClick={onOpenCmd}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: '6px 12px', cursor: 'pointer', transition: 'border-color .15s, box-shadow .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent2)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(79,70,229,0.13)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
        >
          <Search size={13} color="var(--text3)" style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', flex: 1, textAlign: 'left' }}>Search pages, endpoints, events...</span>
          <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', whiteSpace: 'nowrap', opacity: 0.7 }}>⌘K</kbd>
        </button>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ cursor: 'pointer', padding: 8, borderRadius: 8, background: 'transparent', border: 'none', color: 'var(--text3)', display: 'flex', alignItems: 'center', transition: 'color .2s, background .2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; }}
        >
          {theme === 'dark'
            ? <Sun size={16} strokeWidth={1.8} />
            : <Moon size={16} strokeWidth={1.8} />}
        </button>
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ cursor: 'pointer', padding: 8, borderRadius: 8, background: showNotifs ? 'var(--bg3)' : 'transparent', border: 'none', color: 'var(--text3)', display: 'flex', alignItems: 'center', position: 'relative', transition: 'background 0.15s' }}
          >
            <Bell size={16} />
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 14, height: 14, borderRadius: 7, background: '#f87171', border: '1.5px solid var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: '#fff', fontWeight: 800, lineHeight: 1 }}>{unread > 9 ? '9+' : unread}</span>
              </span>
            )}
          </button>
          {showNotifs && (
            <div style={{ position: 'absolute', right: 0, top: '100%', width: 340, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 200, marginTop: 8, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Notifications</span>
                  {unread > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '1px 7px', borderRadius: 20, background: '#f871711a', color: '#f87171', border: '1px solid #f8717130' }}>{unread} unread</span>}
                </div>
                {allNotifs.length > 0 && <button onClick={clearAll} style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--accent2)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>}
              </div>

              {/* Notification list */}
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {allNotifs.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                    <Bell size={24} style={{ color: 'var(--text3)', opacity: 0.3, marginBottom: 8 }} />
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>You're all caught up!</div>
                  </div>
                ) : allNotifs.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => { if (n.href) { router.push(n.href); setShowNotifs(false); } }}
                    style={{
                      padding: '11px 16px', borderBottom: '1px solid var(--border)',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                      cursor: n.href ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (n.href) (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'rgba(99,102,241,0.04)'; }}
                  >
                    <div style={{ marginTop: 1, flexShrink: 0 }}><NotifIcon type={n.type} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', fontWeight: n.read ? 400 : 600 }}>{n.title}</span>
                        {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', flexShrink: 0 }} />}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text2)', marginTop: 2, lineHeight: 1.45 }}>{n.body}</div>
                      {n.time && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 4 }}>{n.time}</div>}
                    </div>
                    {n.href && <ChevronRight size={12} color="var(--text3)" style={{ marginTop: 2, flexShrink: 0 }} />}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                <Link href="/alerts" onClick={() => setShowNotifs(false)} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent2)', textDecoration: 'none' }}>
                  Manage alert rules →
                </Link>
              </div>
            </div>
          )}
        </div>
        <div ref={userRef} style={{ position: 'relative', marginLeft: 4 }}>
          <button onClick={() => setShowUser(!showUser)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: '#fff' }}>{((user?.firstName || user?.email || 'U')[0].toUpperCase()) || 'U'}</span></div>
            <ChevronDown size={11} color="var(--text3)" style={{ transform: showUser ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
          {showUser && (
            <div style={{ position: 'absolute', right: 0, top: '100%', width: 220, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 200, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{(user?.firstName ? user.firstName + ' ' + (user.lastName || '') : user?.email) || 'User'}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{user?.email}</div>
                {sub && (
                  <div style={{ marginTop: 7 }}>
                    <PlanBadge status={sub.status} planName={sub.planName} daysLeft={sub.daysLeft} />
                  </div>
                )}
              </div>
              {[{ icon: User, label: 'Profile', href: '/profile' }, { icon: Settings, label: 'Settings', href: '/settings' }, { icon: Building2, label: 'Workspace', href: '/workspace' }].map(({ icon: Icon, label, href }) => (
                <Link key={href} href={href} onClick={() => setShowUser(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', color: 'var(--text2)' }}>
                  <Icon size={13} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>{label}</span>
                </Link>
              ))}
              <Link href="/billing" onClick={() => setShowUser(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', color: '#4ade80' }}>
                <CreditCard size={13} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600 }}>Manage Billing</span>
              </Link>
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>
                  <LogOut size={13} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>Sign Out</span>
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
