'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import { BillingPlan, Subscription, TrialInfo } from '@/lib/types';
import { PlanBadge } from '@/components/billing/TrialBanner';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  Check, Zap, Crown, Shield, Sparkles, AlertTriangle,
  CreditCard, RefreshCw, X, ChevronRight, Receipt, Coins, Store,
  ArrowRight, ShieldCheck, Lock, CheckCircle2, Loader2,
  Building2, Rocket, Star, Globe, Headphones, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';

/* ── Razorpay script loader ─────────────────────────────────────────────── */
function useRazorpay() {
  useEffect(() => {
    if (typeof window === 'undefined' || (window as any).Razorpay) return;
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);
}

/* ── Open Razorpay checkout ─────────────────────────────────────────────── */
function openRazorpayCheckout(
  order: any,
  planLabel: string,
  planColor: string,
  onSuccess: (r: any) => void,
  onDismiss: () => void,
) {
  const rzp = new (window as any).Razorpay({
    key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency || 'INR',
    order_id: order.orderId,
    name: 'WebhookOS',
    description: `${planLabel} Plan — Monthly Subscription`,
    image: '/logo-icon.png',
    prefill: order.prefill || {},
    notes: { plan: planLabel },
    theme: { color: planColor, backdrop_color: 'rgba(0,0,0,0.7)' },
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
      escape: true,
      animation: true,
      confirm_close: true,
    },
  });
  rzp.open();
}

/* ── Plan config ────────────────────────────────────────────────────────── */
const PLAN_ORDER = ['trial', 'starter', 'pro', 'enterprise'];
const PLAN_COLOR: Record<string, string> = {
  trial:      '#818cf8',
  starter:    '#38bdf8',
  pro:        '#a855f7',
  enterprise: '#fbbf24',
};
const PLAN_GRADIENT: Record<string, string> = {
  trial:      'linear-gradient(135deg,#6366f1,#818cf8)',
  starter:    'linear-gradient(135deg,#0284c7,#38bdf8)',
  pro:        'linear-gradient(135deg,#7c3aed,#a855f7)',
  enterprise: 'linear-gradient(135deg,#d97706,#fbbf24)',
};
const PLAN_ICON: Record<string, any> = {
  trial: Zap, starter: Rocket, pro: Crown, enterprise: Shield,
};
const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  trial:      ['5K events/month', '5 endpoints', '7-day retention', 'No credit card needed'],
  starter:    ['50K events/month', '20 endpoints', '30-day retention', 'Email support'],
  pro:        ['500K events/month', '100 endpoints', '90-day retention', 'Priority support', 'AI features'],
  enterprise: ['Unlimited events', 'Unlimited endpoints', '365-day retention', 'SLA 99.99%', 'Dedicated support', 'Reseller portal'],
};

/** Convert paise to formatted INR string */
function paise(amount: number): string {
  return (amount / 100).toLocaleString('en-IN');
}

/** Format plan feature values — handles -1 as "Unlimited" */
function fmtLimit(val: number | undefined, suffix: string): string {
  if (val == null) return '';
  if (val === -1) return `Unlimited ${suffix}`;
  return `${val.toLocaleString()} ${suffix}`;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  UPGRADE CONFIRMATION MODAL                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */
function UpgradeModal({
  open, planId, planName, priceMonthly, highlights, features, onConfirm, onClose, loading,
}: {
  open: boolean;
  planId: string;
  planName: string;
  priceMonthly: number;
  highlights: string[];
  features?: { ai?: boolean; reseller?: boolean };
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  const color = PLAN_COLOR[planId] || '#818cf8';
  const gradient = PLAN_GRADIENT[planId] || PLAN_GRADIENT.starter;
  const Icon = PLAN_ICON[planId] || Zap;
  const priceStr = paise(priceMonthly);
  const gst = Math.round(priceMonthly * 0.18);
  const total = priceMonthly + gst;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, width: '95%', padding: 0, overflow: 'hidden' }}>
        {/* Top gradient banner */}
        <div style={{
          background: gradient, padding: '24px 28px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={24} color="#fff" strokeWidth={1.8} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              Upgrade to {planName}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginTop: 2 }}>
              Unlock premium features for your webhooks
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto', background: 'rgba(255,255,255,.15)', border: 'none',
              borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <X size={14} color="#fff" />
          </button>
        </div>

        <div style={{ padding: '20px 28px 24px' }}>
          {/* Features included */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
              What you get
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {highlights.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={11} color={color} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--t2)' }}>{f}</span>
                </div>
              ))}
              {features?.ai && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={11} color="#a855f7" />
                  <span style={{ fontSize: 11, color: '#a855f7' }}>AI features</span>
                </div>
              )}
              {features?.reseller && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Store size={11} color="#fbbf24" />
                  <span style={{ fontSize: 11, color: '#fbbf24' }}>Reseller portal</span>
                </div>
              )}
            </div>
          </div>

          {/* Price breakdown */}
          <div style={{
            background: 'var(--card2)', border: '1px solid var(--b1)', borderRadius: 'var(--r2)',
            padding: '14px 16px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--t2)' }}>{planName} Plan (monthly)</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--t1)', fontWeight: 600 }}>₹{priceStr}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--t3)' }}>GST (18%)</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--t3)' }}>₹{paise(gst)}</span>
            </div>
            <div style={{ height: 1, background: 'var(--b1)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Total</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 800, color }}>₹{paise(total)}</span>
            </div>
          </div>

          {/* Pay button */}
          <button
            className="btn btn-primary"
            style={{ width: '100%', background: gradient, border: 'none', padding: '12px 0', fontSize: 13, fontWeight: 700 }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={13} style={{ animation: 'spin .7s linear infinite' }} />Creating order...</>
            ) : (
              <><CreditCard size={13} />Pay ₹{paise(total)} via Razorpay</>
            )}
          </button>

          {/* Trust badges */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            marginTop: 14, flexWrap: 'wrap',
          }}>
            {[
              { icon: ShieldCheck, label: 'Secured by Razorpay' },
              { icon: Lock, label: '256-bit encryption' },
              { icon: RefreshCw, label: 'Cancel anytime' },
            ].map(({ icon: Ic, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Ic size={9} color="var(--t3)" />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--t3)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CANCEL MODAL                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */
function CancelModal({ onClose, onConfirm, loading }: { onClose: () => void; onConfirm: (r: string) => void; loading: boolean }) {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Cancel Subscription</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.6 }}>
          Your subscription will remain active until the end of the current billing period. Are you sure you want to cancel?
        </p>
        <div className="field">
          <label className="label">Reason (optional)</label>
          <textarea className="input" placeholder="Tell us why you're cancelling..." value={reason} onChange={e => setReason(e.target.value)} style={{ minHeight: 72, resize: 'vertical', fontSize: 12 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Keep Plan</button>
          <button className="btn" style={{ flex: 1, background: '#f87171', border: 'none', color: '#fff' }} onClick={() => onConfirm(reason)} disabled={loading}>
            {loading ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function BillingPage() {
  useRazorpay();
  const qc = useQueryClient();
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get('reason');
  const [paying, setPaying] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{
    open: boolean; planId: string; planName: string; priceMonthly: number;
    highlights: string[]; features?: { ai?: boolean; reseller?: boolean };
  }>({ open: false, planId: '', planName: '', priceMonthly: 0, highlights: [] });

  useEffect(() => {
    if (reason === 'trial_expired') toast.error('Your trial has expired. Please upgrade to continue.');
    else if (reason === 'subscription_expired') toast.error('Your subscription has expired. Please renew.');
    else if (reason === 'payment_past_due') toast.error('Payment failed. Please update your payment method.');
    else if (reason === 'account_suspended') toast.error('Your account has been suspended. Please contact support.');
  }, [reason]);

  const { data: sub, isLoading: subLoading } = useQuery<Subscription | null>({
    queryKey: ['subscription'],
    queryFn: () => billingApi.getSubscription().then((d: any) => {
      if (!d || typeof d !== 'object') return null;
      if ('statusCode' in d || 'error' in d) return null;
      return d as Subscription;
    }),
    throwOnError: false,
  });

  const { data: trial } = useQuery<TrialInfo | null>({
    queryKey: ['trial-status'],
    queryFn: () => billingApi.getTrial().then((d: any) => {
      if (!d || typeof d !== 'object') return null;
      if ('statusCode' in d || 'error' in d) return null;
      return d as TrialInfo;
    }),
    retry: 1, throwOnError: false,
  });

  const { data: plans } = useQuery<BillingPlan[]>({
    queryKey: ['billing-plans'],
    queryFn: () => billingApi.getPlans().then((d: any) => Array.isArray(d) ? d : []),
    staleTime: 10 * 60 * 1000,
    throwOnError: false,
  });

  /* ── Upgrade mutation ────────────────────────────────────────────────── */
  const upgradeOrder = useMutation({
    mutationFn: (planId: string) => billingApi.upgradeOrder(planId),
    onSuccess: (order, planId) => {
      setUpgradeModal(m => ({ ...m, open: false }));
      const color = PLAN_COLOR[planId] || '#4f46e5';
      openRazorpayCheckout(
        order,
        order.planName || planId,
        color,
        async (res: any) => {
          try {
            await billingApi.upgradeVerify({
              orderId: order.orderId,
              paymentId: res.razorpay_payment_id,
              signature: res.razorpay_signature,
              planId,
            });
            toast.success(`Plan activated! Welcome to ${order.planName || planId}`);
            qc.invalidateQueries({ queryKey: ['subscription'] });
            qc.invalidateQueries({ queryKey: ['trial-status'] });
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
          setPaying(null);
        },
        () => setPaying(null),
      );
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Failed to initiate payment');
      setPaying(null);
      setUpgradeModal(m => ({ ...m, open: false }));
    },
  });

  const cancelMut = useMutation({
    mutationFn: (r: string) => billingApi.cancelSub({ reason: r || undefined }),
    onSuccess: () => {
      toast.success('Subscription cancelled. Access continues until period end.');
      qc.invalidateQueries({ queryKey: ['subscription'] });
      setShowCancel(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Cancel failed'),
  });

  /** Show confirmation modal, then trigger Razorpay on confirm */
  const handleUpgrade = (planId: string) => {
    const apiPlan = plans?.find(p => p.id === planId);
    const highlights = apiPlan
      ? [
          fmtLimit(apiPlan.eventsPerMonth, 'events/mo'),
          fmtLimit(apiPlan.endpointsLimit, 'endpoints'),
          `${apiPlan.retentionDays}-day retention`,
        ].filter(Boolean)
      : PLAN_HIGHLIGHTS[planId] || [];

    setUpgradeModal({
      open: true,
      planId,
      planName: apiPlan?.name || planId,
      priceMonthly: apiPlan?.priceMonthly || 0,
      highlights,
      features: apiPlan?.features,
    });
  };

  const confirmUpgrade = () => {
    setPaying(upgradeModal.planId);
    upgradeOrder.mutate(upgradeModal.planId);
  };

  const currentPlanId = sub?.planId || 'trial';

  return (
    <>
      <div className="page">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="ph">
          <div className="ph-left">
            <h1>Billing & Plans</h1>
            <p>// Manage your subscription, credits and invoices</p>
          </div>
          <div className="billing-header-btns">
            <Link href="/billing/credits" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <Coins size={13} />Credits
            </Link>
            <Link href="/billing/invoices" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <Receipt size={13} />Invoices
            </Link>
          </div>
        </div>

        {/* ── Current subscription card ──────────────────────────────────── */}
        {subLoading && (
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        )}
        {!subLoading && sub && (
          <div style={{
            background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--r4)',
            padding: '20px 24px', marginBottom: 24,
          }}>
            <div className="billing-sub">
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${PLAN_COLOR[currentPlanId] || '#818cf8'}18`,
                border: `1px solid ${PLAN_COLOR[currentPlanId] || '#818cf8'}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {(() => { const I = PLAN_ICON[currentPlanId] || Zap; return <I size={20} color={PLAN_COLOR[currentPlanId] || '#818cf8'} />; })()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>{sub.planName}</span>
                  <PlanBadge status={sub.status} planName={sub.planName} daysLeft={sub.daysLeft} />
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)' }}>
                  {fmtLimit(sub.eventsPerMonth, 'events/mo')} · {fmtLimit(sub.endpointsLimit, 'endpoints')}
                  {sub.currentPeriodEnd && ` · Renews ${format(new Date(sub.currentPeriodEnd), 'dd MMM yyyy')}`}
                  {sub.status === 'trial' && trial?.trialEndAt && ` · Trial ends ${format(new Date(trial.trialEndAt), 'dd MMM yyyy')}`}
                </div>
              </div>
              <div className="billing-sub-actions">
                {sub.status === 'active' && (
                  <button className="btn btn-ghost" onClick={() => setShowCancel(true)} style={{ fontSize: 12, color: '#f87171' }}>
                    Cancel Plan
                  </button>
                )}
                <Link href="/billing/invoices" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }}>
                    <Receipt size={12} />View Invoices
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick links ────────────────────────────────────────────────── */}
        <div className="billing-quick">
          {[
            { href: '/billing/credits', icon: Coins, label: 'Webhook Credits', desc: 'Buy prepaid event credits', color: '#a855f7' },
            { href: '/billing/invoices', icon: Receipt, label: 'Invoices', desc: 'View billing history', color: '#38bdf8' },
            { href: '/billing/reseller', icon: Store, label: 'Reseller Portal', desc: 'Enterprise reseller features', color: '#fbbf24', enterprise: true },
          ].map(({ href, icon: Icon, label, desc, color, enterprise }) => (
            (!enterprise || sub?.features?.reseller) && (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r3)',
                  padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', transition: 'border-color .2s', height: '100%',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${color}12`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--t1)' }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{desc}</div>
                  </div>
                  <ChevronRight size={14} color="var(--t3)" style={{ flexShrink: 0 }} />
                </div>
              </Link>
            )
          ))}
        </div>

        {/* ── Plans grid ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            // Available Plans
          </span>
        </div>

        <div className="billing-plans">
          {PLAN_ORDER.map(planId => {
            const apiPlan = plans?.find(p => p.id === planId);
            const color = PLAN_COLOR[planId] || '#818cf8';
            const gradient = PLAN_GRADIENT[planId] || PLAN_GRADIENT.starter;
            const Icon = PLAN_ICON[planId] || Zap;
            const isCurrent = currentPlanId === planId;
            const isPopular = planId === 'pro';
            const isEnterprise = planId === 'enterprise';

            /* Build features list from API data with -1 → "Unlimited" */
            const highlights: string[] = apiPlan
              ? [
                  fmtLimit(apiPlan.eventsPerMonth, 'events/mo'),
                  fmtLimit(apiPlan.endpointsLimit, 'endpoints'),
                  `${apiPlan.retentionDays}-day retention`,
                ].filter(Boolean)
              : PLAN_HIGHLIGHTS[planId];

            const priceRaw = apiPlan?.priceMonthly;
            const priceLabel = planId === 'trial'
              ? 'Free'
              : isEnterprise || !priceRaw
                ? 'Custom'
                : `₹${paise(priceRaw)}`;

            return (
              <div key={planId} style={{
                background: 'var(--card)',
                border: `1px solid ${isCurrent ? color + '50' : isPopular ? 'rgba(168,85,247,.3)' : 'var(--b1)'}`,
                borderRadius: 'var(--r4)', padding: 0,
                display: 'flex', flexDirection: 'column', position: 'relative',
                boxShadow: isPopular ? '0 0 0 1px rgba(168,85,247,.15)' : undefined,
                transition: 'border-color .2s, box-shadow .2s',
                overflow: 'hidden',
              }}>
                {/* Top gradient strip */}
                <div style={{ height: 3, background: gradient }} />

                {isPopular && (
                  <div style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    background: gradient, color: '#fff', fontSize: 9, fontWeight: 700,
                    fontFamily: 'var(--mono)', padding: '4px 14px', borderRadius: '0 0 10px 10px',
                    whiteSpace: 'nowrap', letterSpacing: '.06em',
                  }}>
                    MOST POPULAR
                  </div>
                )}
                {isCurrent && (
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    background: `${color}18`, border: `1px solid ${color}35`,
                    borderRadius: 5, padding: '2px 7px',
                    fontFamily: 'var(--mono)', fontSize: 9, color, fontWeight: 700,
                  }}>
                    CURRENT
                  </div>
                )}

                <div style={{ padding: '22px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Plan name + icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: isPopular ? 10 : 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: `${color}14`, border: `1px solid ${color}28`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={15} color={color} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color, textTransform: 'capitalize' }}>{planId}</div>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--t1)', letterSpacing: '-1.5px' }}>
                      {priceLabel}
                    </span>
                    {planId !== 'trial' && !isEnterprise && priceRaw != null && priceRaw > 0 && (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginLeft: 4 }}>/mo</span>
                    )}
                    {isEnterprise && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>
                        Contact us for pricing
                      </div>
                    )}
                  </div>

                  {/* Feature list */}
                  <div style={{ flex: 1, marginBottom: 18 }}>
                    {highlights.map((f: string) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 7 }}>
                        <Check size={11} color="#4ade80" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.45 }}>{f}</span>
                      </div>
                    ))}
                    {apiPlan?.features?.ai && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                        <Sparkles size={11} color="#a855f7" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#a855f7', lineHeight: 1.45 }}>AI features included</span>
                      </div>
                    )}
                    {apiPlan?.features?.reseller && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                        <Store size={11} color="#fbbf24" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#fbbf24', lineHeight: 1.45 }}>Reseller portal</span>
                      </div>
                    )}
                  </div>

                  {/* CTA button */}
                  {isEnterprise && !isCurrent ? (
                    <Link href="/billing/credits" style={{ textDecoration: 'none', width: '100%' }}>
                      <button className="btn btn-ghost" style={{ width: '100%', borderColor: `${color}50`, color }}>
                        <Building2 size={11} />Contact Sales
                      </button>
                    </Link>
                  ) : (
                    <button
                      className={`btn ${isCurrent ? 'btn-ghost' : 'btn-primary'}`}
                      style={{
                        width: '100%',
                        ...(isCurrent ? {} : { background: gradient, border: 'none' }),
                      }}
                      disabled={isCurrent || paying === planId || planId === 'trial'}
                      onClick={() => handleUpgrade(planId)}
                    >
                      {paying === planId
                        ? <><Loader2 size={11} style={{ animation: 'spin .7s linear infinite' }} />Processing...</>
                        : isCurrent
                          ? 'Current Plan'
                          : planId === 'trial'
                            ? 'Free Trial'
                            : <><CreditCard size={11} />Upgrade to {planId}</>
                      }
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer trust badges ────────────────────────────────────────── */}
        <div className="billing-foot" style={{
          marginTop: 20, textAlign: 'center',
          fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={9} />Payments by Razorpay</span>
          <span className="billing-foot-dot">·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><RefreshCw size={9} />Cancel anytime</span>
          <span className="billing-foot-dot">·</span>
          <span>GST applicable</span>
          <span className="billing-foot-dot">·</span>
          <span>All prices in INR</span>
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      <UpgradeModal
        open={upgradeModal.open}
        planId={upgradeModal.planId}
        planName={upgradeModal.planName}
        priceMonthly={upgradeModal.priceMonthly}
        highlights={upgradeModal.highlights}
        features={upgradeModal.features}
        onConfirm={confirmUpgrade}
        onClose={() => setUpgradeModal(m => ({ ...m, open: false }))}
        loading={upgradeOrder.isPending}
      />

      {showCancel && (
        <CancelModal
          onClose={() => setShowCancel(false)}
          onConfirm={(r) => cancelMut.mutate(r)}
          loading={cancelMut.isPending}
        />
      )}
    </>
  );
}
