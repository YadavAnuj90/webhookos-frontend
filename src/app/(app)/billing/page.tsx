'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import { BillingPlan, Subscription, TrialInfo } from '@/lib/types';
import { PlanBadge } from '@/components/billing/TrialBanner';
import { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';
import {
  Check, Zap, Crown, Shield, Sparkles, AlertTriangle,
  CreditCard, RefreshCw, X, ChevronRight, Receipt, Coins, Store,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';

// Load Razorpay script once
function useRazorpay() {
  useEffect(() => {
    if (typeof window === 'undefined' || (window as any).Razorpay) return;
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);
}

function openRazorpay(order: any, planLabel: string, onSuccess: (r: any) => void, onDismiss: () => void) {
  const rzp = new (window as any).Razorpay({
    key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency || 'INR',
    order_id: order.orderId,
    name: 'WebhookOS',
    description: planLabel,
    theme: { color: '#4f46e5' },
    handler: onSuccess,
    modal: { ondismiss: onDismiss },
  });
  rzp.open();
}

const PLAN_ORDER = ['trial', 'starter', 'pro', 'enterprise'];
const PLAN_COLOR: Record<string, string> = {
  trial:      '#818cf8',
  starter:    '#38bdf8',
  pro:        '#a855f7',
  enterprise: '#fbbf24',
};
const PLAN_ICON: Record<string, any> = {
  trial: Zap, starter: Zap, pro: Crown, enterprise: Shield,
};

const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  trial:      ['All Pro features free','10-day trial','No credit card needed','Auto-converts on upgrade'],
  starter:    ['50K events/month','20 endpoints','30-day retention','Email support'],
  pro:        ['500K events/month','100 endpoints','90-day retention','Priority support','AI features'],
  enterprise: ['Unlimited events','Unlimited endpoints','1-year retention','SLA 99.99%','Reseller portal','mTLS auth'],
};

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

export default function BillingPage() {
  useRazorpay();
  const qc = useQueryClient();
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get('reason');
  const [paying, setPaying] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    if (reason === 'trial_expired') toast.error('Your trial has expired. Please upgrade to continue.');
    else if (reason === 'subscription_expired') toast.error('Your subscription has expired. Please renew.');
    else if (reason === 'payment_past_due') toast.error('Payment failed. Please update your payment method.');
    else if (reason === 'account_suspended') toast.error('Your account has been suspended. Please contact support.');
  }, [reason]);

  const { data: sub, isLoading: subLoading } = useQuery<Subscription | null>({
    queryKey: ['subscription'],
    // Normalize: if API returns an error-shaped 200 ({message,error,statusCode}), treat as null.
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
    // Normalize: always return an array — never an error-shaped object.
    queryFn: () => billingApi.getPlans().then((d: any) => Array.isArray(d) ? d : []),
    staleTime: 10 * 60 * 1000,
    throwOnError: false,
  });

  const upgradeOrder = useMutation({
    mutationFn: (planId: string) => billingApi.upgradeOrder(planId),
    onSuccess: (order, planId) => {
      openRazorpay(
        order,
        `Upgrade to ${planId} plan`,
        async (res: any) => {
          try {
            await billingApi.upgradeVerify({ orderId: order.orderId, paymentId: res.razorpay_payment_id, signature: res.razorpay_signature, planId });
            toast.success('🎉 Plan activated! Welcome to ' + planId);
            qc.invalidateQueries({ queryKey: ['subscription'] });
            qc.invalidateQueries({ queryKey: ['trial-status'] });
          } catch { toast.error('Payment verification failed. Contact support.'); }
          setPaying(null);
        },
        () => setPaying(null),
      );
    },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Failed to initiate payment'); setPaying(null); },
  });

  const cancelMut = useMutation({
    mutationFn: (reason: string) => billingApi.cancelSub({ reason: reason || undefined }),
    onSuccess: () => {
      toast.success('Subscription cancelled. Access continues until period end.');
      qc.invalidateQueries({ queryKey: ['subscription'] });
      setShowCancel(false);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Cancel failed'),
  });

  const handleUpgrade = (planId: string) => {
    setPaying(planId);
    upgradeOrder.mutate(planId);
  };

  const currentPlanId = sub?.planId || 'trial';

  return (
    <>
      <div className="page">
        {/* Header */}
        <div className="ph">
          <div className="ph-left">
            <h1>Billing & Plans</h1>
            <p>// Manage your subscription, credits and invoices</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/billing/credits" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <Coins size={13} />Credits
            </Link>
            <Link href="/billing/invoices" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              <Receipt size={13} />Invoices
            </Link>
          </div>
        </div>

        {/* Current subscription card */}
        {subLoading && (
          <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        )}
        {!subLoading && sub && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--r4)', padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${PLAN_COLOR[currentPlanId] || '#818cf8'}18`, border: `1px solid ${PLAN_COLOR[currentPlanId] || '#818cf8'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {(() => { const I = PLAN_ICON[currentPlanId] || Zap; return <I size={20} color={PLAN_COLOR[currentPlanId] || '#818cf8'} />; })()}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>{sub.planName}</span>
                <PlanBadge status={sub.status} planName={sub.planName} daysLeft={sub.daysLeft} />
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)' }}>
                {sub.eventsPerMonth?.toLocaleString()} events/mo · {sub.endpointsLimit} endpoints
                {sub.currentPeriodEnd && ` · Renews ${format(new Date(sub.currentPeriodEnd), 'dd MMM yyyy')}`}
                {sub.status === 'trial' && trial?.trialEndAt && ` · Trial ends ${format(new Date(trial.trialEndAt), 'dd MMM yyyy')}`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { href: '/billing/credits', icon: Coins, label: 'Webhook Credits', desc: 'Buy prepaid event credits', color: '#a855f7' },
            { href: '/billing/invoices', icon: Receipt, label: 'Invoices', desc: 'View billing history', color: '#38bdf8' },
            { href: '/billing/reseller', icon: Store, label: 'Reseller Portal', desc: 'Enterprise reseller features', color: '#fbbf24', enterprise: true },
          ].map(({ href, icon: Icon, label, desc, color, enterprise }) => (
            (!enterprise || sub?.features?.reseller) && (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: 'var(--r3)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color .2s', }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--t1)' }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{desc}</div>
                  </div>
                  <ChevronRight size={14} color="var(--t3)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                </div>
              </Link>
            )
          ))}
        </div>

        {/* Plans grid */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>// Available Plans</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {PLAN_ORDER.map(planId => {
            const apiPlan = plans?.find(p => p.id === planId);
            const color = PLAN_COLOR[planId] || '#818cf8';
            const Icon = PLAN_ICON[planId] || Zap;
            const isCurrent = currentPlanId === planId;
            const isPopular = planId === 'pro';
            const highlights = apiPlan
              ? [`${apiPlan.eventsPerMonth?.toLocaleString()} events/mo`, `${apiPlan.endpointsLimit} endpoints`, `${apiPlan.retentionDays}-day retention`]
              : PLAN_HIGHLIGHTS[planId];

            const price = apiPlan?.priceMonthly;
            const priceLabel = planId === 'trial' ? 'Free' : price != null ? `₹${price.toLocaleString()}` : '—';

            return (
              <div key={planId} style={{ background: 'var(--card)', border: `1px solid ${isCurrent ? color + '50' : isPopular ? 'rgba(168,85,247,.3)' : 'var(--b1)'}`, borderRadius: 'var(--r4)', padding: 22, display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: isPopular ? '0 0 0 1px rgba(168,85,247,.15)' : undefined, transition: 'border-color .2s' }}>
                {isPopular && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: 'var(--mono)', padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '.06em' }}>MOST POPULAR</div>}
                {isCurrent && <div style={{ position: 'absolute', top: 12, right: 12, background: `${color}18`, border: `1px solid ${color}35`, borderRadius: 5, padding: '2px 7px', fontFamily: 'var(--mono)', fontSize: 9, color, fontWeight: 700 }}>CURRENT</div>}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}14`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={color} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, color, textTransform: 'capitalize' }}>{planId}</div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 30, fontWeight: 900, color: 'var(--t1)', letterSpacing: '-1.5px' }}>{priceLabel}</span>
                  {planId !== 'trial' && price != null && <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginLeft: 4 }}>/mo</span>}
                </div>

                <div style={{ flex: 1, marginBottom: 18 }}>
                  {highlights.map((f: string) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 7 }}>
                      <Check size={11} color="#4ade80" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.45 }}>{f}</span>
                    </div>
                  ))}
                  {apiPlan?.features?.ai && <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}><Sparkles size={11} color="#a855f7" style={{ flexShrink: 0 }} /><span style={{ fontSize: 12, color: '#a855f7', lineHeight: 1.45 }}>AI features included</span></div>}
                  {apiPlan?.features?.reseller && <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}><Store size={11} color="#fbbf24" style={{ flexShrink: 0 }} /><span style={{ fontSize: 12, color: '#fbbf24', lineHeight: 1.45 }}>Reseller portal</span></div>}
                </div>

                <button
                  className={`btn ${isCurrent ? 'btn-ghost' : isPopular ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ width: '100%', ...(isCurrent ? {} : !isPopular ? { borderColor: `${color}50`, color } : {}) }}
                  disabled={isCurrent || paying === planId || planId === 'trial'}
                  onClick={() => handleUpgrade(planId)}
                >
                  {paying === planId ? <><RefreshCw size={11} className="spin" />Processing...</> : isCurrent ? 'Current Plan' : planId === 'trial' ? 'Free Trial' : `Upgrade →`}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>
          Payments secured by Razorpay · Cancel anytime · GST applicable · All prices in INR
        </div>
      </div>

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
