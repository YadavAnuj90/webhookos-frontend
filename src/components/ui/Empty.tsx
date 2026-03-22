'use client';
import {
  Globe, Zap, Key, BarChart3, AlertTriangle, FileText,
  FlaskConical, Package, Inbox, BellRing, Clock,
} from 'lucide-react';

type EmptyType =
  | 'endpoints' | 'events' | 'api-keys' | 'analytics'
  | 'dlq' | 'history' | 'alerts' | 'playground'
  | 'generic';

const CONFIGS: Record<EmptyType, { icon: any; color: string; bg: string }> = {
  endpoints:  { icon: Globe,        color: '#4f46e5', bg: 'rgba(79,70,229,.10)'  },
  events:     { icon: Zap,          color: '#22c55e', bg: 'rgba(34,197,94,.10)'  },
  'api-keys': { icon: Key,          color: '#0ea5e9', bg: 'rgba(14,165,233,.10)' },
  analytics:  { icon: BarChart3,    color: '#a78bfa', bg: 'rgba(167,139,250,.10)'},
  dlq:        { icon: AlertTriangle,color: '#f59e0b', bg: 'rgba(245,158,11,.10)' },
  history:    { icon: FileText,     color: '#60a5fa', bg: 'rgba(96,165,250,.10)' },
  alerts:     { icon: BellRing,     color: '#f87171', bg: 'rgba(248,113,113,.10)'},
  playground: { icon: FlaskConical, color: '#34d399', bg: 'rgba(52,211,153,.10)' },
  generic:    { icon: Inbox,        color: '#94a3b8', bg: 'rgba(148,163,184,.10)'},
};

export default function Empty({
  title = 'Nothing here yet',
  sub = '',
  action,
  type = 'generic',
}: {
  title?: string;
  sub?: string;
  action?: React.ReactNode;
  type?: EmptyType;
}) {
  const cfg = CONFIGS[type] || CONFIGS.generic;
  const Icon = cfg.icon;

  return (
    <div
      className="empty"
      style={{ padding: '52px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
    >
      <div
        style={{
          width: 60, height: 60, borderRadius: 16,
          background: cfg.bg, border: `1px solid ${cfg.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Icon size={26} color={cfg.color} strokeWidth={1.5} />
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700,
          color: 'var(--text)', marginBottom: 6,
        }}
      >
        {title}
      </h3>
      {sub && (
        <p
          style={{
            fontFamily: 'var(--font-body)', fontSize: 13,
            color: 'var(--text3)', maxWidth: 320, lineHeight: 1.6,
          }}
        >
          {sub}
        </p>
      )}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}
