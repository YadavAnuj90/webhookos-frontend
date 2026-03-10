'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useNotifStore } from '@/lib/store';
import { searchApi, workspacesApi } from '@/lib/api';
import {
  Activity, LayoutDashboard, Zap, Globe, BarChart3, AlertTriangle,
  CreditCard, Settings, User, Shield, Bell, Search, LogOut,
  ChevronRight, X, Check, Info, AlertCircle, Menu, Users, FileText,
  Key, BellRing, FlaskConical, Shuffle, ExternalLink, BarChart2,
  ChevronDown, Plus, Building2, CheckCheck, Sun, Moon,
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
    { href: '/playground', icon: FlaskConical, label: 'Playground' },
    { href: '/api-keys', icon: Key, label: 'API Keys' },
    { href: '/transformations', icon: Shuffle, label: 'Transformations' },
  ]},
  { label: 'MONITOR', items: [
    { href: '/alerts', icon: BellRing, label: 'Alerts' },
    { href: '/usage', icon: BarChart2, label: 'Usage' },
  ]},
  { label: 'ACCOUNT', items: [
    { href: '/portal', icon: ExternalLink, label: 'Customer Portal' },
    { href: '/workspace', icon: Building2, label: 'Workspace' },
    { href: '/billing', icon: CreditCard, label: 'Billing' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

const ADMIN_NAV = [
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/audit', icon: Shield, label: 'Audit Log' },
];

function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    workspacesApi.list().then(d => { const arr = Array.isArray(d) ? d : []; setWorkspaces(arr); if (arr[0] && !active) setActive(arr[0]); }).catch(() => {});
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

function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = ['admin', 'super_admin'].includes(user?.role || '');
  return (
    <aside style={{ width: collapsed ? 64 : 224, minHeight: '100vh', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', flexShrink: 0, position: 'sticky', top: 0 }}>
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
            {group.items.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, marginBottom: 1, background: active ? 'rgba(99,102,241,0.13)' : 'transparent', color: active ? 'var(--accent3)' : 'var(--text3)', borderLeft: active ? '2px solid var(--accent2)' : '2px solid transparent', transition: 'all 0.15s', cursor: 'pointer', overflow: 'hidden' }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                    <Icon size={15} style={{ flexShrink: 0, color: active ? 'var(--accent2)' : 'inherit' }} />
                    {!collapsed && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
        {isAdmin && (
          <>
            {!collapsed && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '9px 10px 4px', opacity: 0.8 }}>ADMIN</div>}
            {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 8, marginBottom: 1, background: active ? 'rgba(248,113,113,0.1)' : 'transparent', color: active ? '#f87171' : 'var(--text3)', borderLeft: active ? '2px solid #f87171' : '2px solid transparent', transition: 'all 0.15s', cursor: 'pointer' }}>
                    <Icon size={15} style={{ flexShrink: 0 }} />{!collapsed && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>}
                  </div>
                </Link>
              );
            })}
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

function Topbar({ toggleMobile }: { toggleMobile: () => void }) {
  const { user, logout } = useAuthStore();
  const { notifs, clearAll } = useNotifStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const router = useRouter();
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const unread = notifs.filter((n: any) => !n.read).length;

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
    const t = setTimeout(async () => { if (query.length < 2) { setResults([]); return; } try { const d = await searchApi.search(query); setResults(d?.results || []); } catch { setResults([]); } }, 300);
    return () => clearTimeout(t);
  }, [query]);
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
      <div style={{ flex: 1, maxWidth: 400, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)', border: `1px solid ${searchFocused ? 'var(--accent2)' : 'var(--border)'}`, borderRadius: 9, padding: '6px 12px', boxShadow: searchFocused ? '0 0 0 3px rgba(79,70,229,0.13)' : 'none', transition: 'border-color .15s, box-shadow .15s' }}>
          <Search size={13} color={searchFocused ? 'var(--accent2)' : 'var(--text3)'} style={{ flexShrink: 0, transition: 'color .15s' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search endpoints, events..."
            style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', width: '100%' }}
          />
          {query && <button onClick={() => { setQuery(''); setResults([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={11} color="var(--text3)" /></button>}
          {!query && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', opacity: searchFocused ? 0 : 0.7, transition: 'opacity .15s', whiteSpace: 'nowrap' }}>⌘K</span>}
        </div>
        {results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginTop: 4, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxHeight: 280, overflowY: 'auto' }}>
            {results.map((r: any, i: number) => (
              <div key={i} style={{ padding: '8px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onClick={() => { setQuery(''); setResults([]); router.push(r.url || '/dashboard'); }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{r.title}</div>
                {r.subtitle && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>{r.subtitle}</div>}
              </div>
            ))}
          </div>
        )}
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
          <button onClick={() => setShowNotifs(!showNotifs)} style={{ cursor: 'pointer', padding: 8, borderRadius: 8, background: 'transparent', border: 'none', color: 'var(--text3)', display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Bell size={16} />
            {unread > 0 && <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#f87171', border: '1.5px solid var(--bg2)' }} />}
          </button>
          {showNotifs && (
            <div style={{ position: 'absolute', right: 0, top: '100%', width: 300, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 200, marginTop: 6 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Notifications</span>
                {notifs.length > 0 && <button onClick={clearAll} style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--accent2)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>}
              </div>
              {notifs.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 12 }}>No notifications</div>
                : notifs.slice(0, 8).map((n: any, i: number) => (
                  <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start', background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)' }}>
                    <div style={{ marginTop: 1, flexShrink: 0 }}>{n.type === 'success' ? <Check size={13} color="#4ade80" /> : n.type === 'error' ? <AlertCircle size={13} color="#f87171" /> : <Info size={13} color="var(--accent2)" />}</div>
                    <div><div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', fontWeight: n.read ? 400 : 500 }}>{n.message}</div>{n.time && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{n.time}</div>}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
        <div ref={userRef} style={{ position: 'relative', marginLeft: 4 }}>
          <button onClick={() => setShowUser(!showUser)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: '#fff' }}>{((user?.firstName || user?.email || 'U')[0].toUpperCase()) || 'U'}</span></div>
            <ChevronDown size={11} color="var(--text3)" style={{ transform: showUser ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
          {showUser && (
            <div style={{ position: 'absolute', right: 0, top: '100%', width: 200, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 200, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{(user?.firstName ? user.firstName + ' ' + (user.lastName || '') : user?.email) || 'User'}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{user?.email}</div>
              </div>
              {[{ icon: User, label: 'Profile', href: '/profile' }, { icon: Settings, label: 'Settings', href: '/settings' }, { icon: Building2, label: 'Workspace', href: '/workspace' }].map(({ icon: Icon, label, href }) => (
                <Link key={href} href={href} onClick={() => setShowUser(false)} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', color: 'var(--text2)' }}>
                  <Icon size={13} /><span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>{label}</span>
                </Link>
              ))}
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
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />}
      <div style={{ display: 'flex' }}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Topbar toggleMobile={() => setMobileOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>{children}</main>
      </div>
    </div>
  );
}
