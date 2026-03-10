'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useNotifStore } from '@/lib/store';
import { searchApi } from '@/lib/api';
import {
  Activity, LayoutDashboard, Zap, Globe, BarChart3, AlertTriangle,
  CreditCard, Settings, User, Shield, Bell, Search, LogOut,
  ChevronRight, X, Check, Info, AlertCircle, Menu, Users, FileText,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/endpoints', icon: Globe, label: 'Endpoints' },
  { href: '/events', icon: Zap, label: 'Events' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dlq', icon: AlertTriangle, label: 'Dead Letter Q' },
  { href: '/history', icon: FileText, label: 'History' },
  { href: '/billing', icon: CreditCard, label: 'Billing' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];
const ADMIN_NAV = [
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/audit', icon: Shield, label: 'Audit Log' },
];

function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = ['admin', 'super_admin'].includes(user?.role || '');

  return (
    <aside style={{
      width: collapsed ? 64 : 220, minHeight: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease', flexShrink: 0, position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Activity size={15} color="#fff" />
        </div>
        {!collapsed && <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 15, color: 'var(--text)', whiteSpace: 'nowrap' }}>WebhookOS</span>}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 9, marginBottom: 2,
                background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: active ? 'var(--accent3)' : 'var(--text3)',
                transition: 'all 0.15s', cursor: 'pointer', overflow: 'hidden',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Icon size={16} style={{ flexShrink: 0, color: active ? 'var(--accent2)' : 'inherit' }} />
                {!collapsed && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>}
                {active && !collapsed && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: 'var(--accent2)' }} />}
              </div>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '12px 10px 6px', opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s' }}>Admin</div>
            {ADMIN_NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 9, marginBottom: 2,
                    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: active ? 'var(--accent3)' : 'var(--text3)',
                    transition: 'all 0.15s', cursor: 'pointer', overflow: 'hidden',
                  }}>
                    <Icon size={16} style={{ flexShrink: 0, color: active ? 'var(--accent2)' : 'inherit' }} />
                    {!collapsed && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>}
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setCollapsed(!collapsed)} className="btn-ghost" style={{ width: '100%', padding: '8px', justifyContent: 'center' }}>
          <ChevronRight size={14} style={{ transform: collapsed ? 'rotate(0)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
        </button>
      </div>
    </aside>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); } if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const d = await searchApi.search(q); setResults(d.results || []); } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const typeColors: Record<string, string> = { endpoint: '#818cf8', event: '#10b981', user: '#f59e0b', audit: '#6b7280' };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text3)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, transition: 'all 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
      <Search size={13} /> Search... <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>⌘K</span>
    </button>
  );

  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div style={{ width: '100%', maxWidth: 520, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp 0.2s' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search size={15} style={{ color: 'var(--text3)' }} />
          <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Search endpoints, events, users..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14 }} />
          {loading && <div className="spinner" style={{ width: 14, height: 14 }} />}
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 4 }}><X size={14} /></button>
        </div>
        {results.length > 0 && (
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: '8px' }}>
            {results.map((r: any) => (
              <div key={r.id} onClick={() => { setOpen(false); router.push(`/${r.type}s`); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '2px 6px', borderRadius: 4, background: `${typeColors[r.type] || '#6b7280'}15`, color: typeColors[r.type] || '#6b7280', flexShrink: 0 }}>{r.type}</span>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {q.length >= 2 && results.length === 0 && !loading && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-body)', fontSize: 13 }}>No results for "{q}"</div>
        )}
      </div>
    </div>
  );
}

function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifStore();
  const iconMap = { success: Check, error: X, info: Info, warning: AlertCircle };
  const colorMap = { success: '#10b981', error: '#ef4444', info: '#818cf8', warning: '#f59e0b' };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s', color: 'var(--text2)' }}>
        <Bell size={16} />
        {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: 'var(--error)', borderRadius: '50%', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', border: '2px solid var(--bg)' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 340, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 14, zIndex: 50, overflow: 'hidden', animation: 'fadeUp 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700 }}>Notifications</span>
              {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent2)' }}>Mark all read</button>}
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>No notifications</div>
              ) : notifications.map(n => {
                const Icon = iconMap[n.type] || Info;
                const color = colorMap[n.type] || '#818cf8';
                return (
                  <div key={n.id} onClick={() => markRead(n.id)} style={{ display: 'flex', gap: 10, padding: '12px 16px', cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={13} style={{ color }} /></div>
                    <div><div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{n.title}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{n.message}</div></div>
                    {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginLeft: 'auto', marginTop: 4, flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const planColors: Record<string, string> = { free: '#6b7280', starter: '#818cf8', pro: '#10b981', enterprise: '#f59e0b' };
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?';

  const handleLogout = async () => {
    const rt = localStorage.getItem('refreshToken');
    try { if (rt) await import('@/lib/api').then(m => m.authApi.logout(rt)); } catch {}
    logout();
    router.push('/auth/login');
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700, color: '#fff' }}>{initials}</div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: planColors[user?.plan || 'free'] || '#6b7280', textTransform: 'uppercase' }}>{user?.plan || 'free'}</div>
        </div>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 200, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 12, zIndex: 50, overflow: 'hidden', animation: 'fadeUp 0.2s', padding: '6px' }}>
            {[
              { href: '/profile', icon: User, label: 'Profile' },
              { href: '/settings', icon: Settings, label: 'Settings' },
              { href: '/billing', icon: CreditCard, label: 'Billing' },
            ].map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.15s', fontSize: 13, fontFamily: 'var(--font-body)' }}
                  onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(99,102,241,0.08)'); (e.currentTarget.style.color = 'var(--text)'); }}
                  onMouseLeave={e => { (e.currentTarget.style.background = 'transparent'); (e.currentTarget.style.color = 'var(--text2)'); }}>
                  <Icon size={14} />{label}
                </div>
              </Link>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, color: 'var(--error)', cursor: 'pointer', width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontFamily: 'var(--font-body)', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <LogOut size={14} />Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <header style={{ height: 60, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 40 }}>
      <GlobalSearch />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <NotificationPanel />
        <UserMenu />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>WebhookOS v3.0.0</span>
      <div style={{ display: 'flex', gap: 16 }}>
        {['Docs', 'Status', 'Privacy', 'Terms'].map(l => (
          <a key={l} href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text2)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}>{l}</a>
        ))}
      </div>
    </footer>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, padding: '32px' }}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
