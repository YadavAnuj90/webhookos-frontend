'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { billingApi } from '@/lib/api';
import { TrialInfo } from '@/lib/types';
import { AlertTriangle, X, Zap } from 'lucide-react';
import { useState } from 'react';

export default function TrialBanner() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery<TrialInfo>({
    queryKey: ['trial-status'],
    queryFn: () => billingApi.getTrial(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    throwOnError: false,
  });

  // Guard: reject error-shaped 200 responses (e.g. {message, error, statusCode})
  if (!data || !data.status || dismissed) return null;
  if (data.status === 'active') return null;

  const expired = data.status === 'trial_expired';
  const warn    = !expired && (data.daysLeft ?? 99) <= 3;

  const bg      = expired ? 'rgba(248,113,113,.12)'  : warn ? 'rgba(251,146,60,.1)'   : 'rgba(99,102,241,.08)';
  const border  = expired ? 'rgba(248,113,113,.35)'  : warn ? 'rgba(251,146,60,.3)'   : 'rgba(99,102,241,.25)';
  const color   = expired ? '#f87171'                : warn ? '#fb923c'               : '#818cf8';
  const icon    = expired || warn ? <AlertTriangle size={14} color={color} style={{ flexShrink: 0 }} /> : <Zap size={14} color={color} style={{ flexShrink: 0 }} />;
  const msg     = expired
    ? 'Your 10-day free trial has expired. Choose a plan to continue.'
    : warn
    ? `⚠️ Trial expires in ${data.daysLeft} day${data.daysLeft === 1 ? '' : 's'}! Upgrade to keep access.`
    : `You have ${data.daysLeft} day${data.daysLeft === 1 ? '' : 's'} left in your free trial.`;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: bg, borderBottom: `1px solid ${border}`,
      padding: '8px 24px', minHeight: 40,
    }}>
      {icon}
      <span style={{ fontFamily: 'var(--sans)', fontSize: 12.5, color, flex: 1, lineHeight: 1.4 }}>
        {msg}
      </span>
      <button
        onClick={() => router.push('/billing')}
        style={{
          padding: '4px 14px', borderRadius: 7, border: `1px solid ${color}50`,
          background: `${color}15`, color, fontFamily: 'var(--sans)',
          fontSize: 11.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        {expired ? 'Choose a Plan' : 'Upgrade Now →'}
      </button>
      {!expired && (
        <button
          onClick={() => setDismissed(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color, flexShrink: 0 }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// Sub-status badge — used in user dropdown + sidebar
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  trial:         { label: 'TRIAL',       color: '#818cf8', bg: 'rgba(99,102,241,.15)'  },
  trial_expired: { label: 'EXPIRED',     color: '#f87171', bg: 'rgba(248,113,113,.15)' },
  active:        { label: 'ACTIVE',      color: '#4ade80', bg: 'rgba(74,222,128,.12)'  },
  past_due:      { label: 'PAYMENT DUE', color: '#fb923c', bg: 'rgba(251,146,60,.15)'  },
  cancelled:     { label: 'CANCELLED',   color: '#94a3b8', bg: 'rgba(148,163,184,.12)' },
  suspended:     { label: 'SUSPENDED',   color: '#f87171', bg: 'rgba(248,113,113,.15)' },
  credit_only:   { label: 'PAY-AS-YOU-GO', color: '#a855f7', bg: 'rgba(168,85,247,.15)' },
};

export function PlanBadge({ status, planName, daysLeft }: { status: string; planName?: string; daysLeft?: number }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.active;
  const label = status === 'trial' && daysLeft != null
    ? `TRIAL · ${daysLeft}d`
    : planName?.toUpperCase() || cfg.label;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 5,
      background: cfg.bg, color: cfg.color,
      fontFamily: 'var(--mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '.04em',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}
