'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { CreditCard, Check, Zap, Crown, Building2, Rocket, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const PLAN_META: Record<string, { icon: any; color: string; gradient: string; badge?: string }> = {
  free:       { icon: Zap,       color: '#6b7280', gradient: 'rgba(107,114,128,0.1)', },
  starter:    { icon: Rocket,    color: '#818cf8', gradient: 'rgba(129,140,248,0.1)', },
  pro:        { icon: Star,      color: '#10b981', gradient: 'rgba(16,185,129,0.1)',  badge: 'Popular' },
  enterprise: { icon: Building2, color: '#f59e0b', gradient: 'rgba(245,158,11,0.1)', badge: 'Best Value' },
};

declare const Razorpay: any;

export default function BillingPage() {
  const { user, fetchMe } = useAuthStore();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => billingApi.getSubscription(),
  });
  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => billingApi.getPlans(),
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    if (user?.plan === planId) return;
    setProcessingPlan(planId);
    try {
      const order = await billingApi.createOrder(planId);
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'WebhookOS',
        description: `${planId} plan subscription`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await billingApi.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId,
            });
            toast.success(`Upgraded to ${planId} plan!`);
            fetchMe();
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: `${user?.firstName} ${user?.lastName}`, email: user?.email },
        theme: { color: '#6366f1' },
      };
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setProcessingPlan(null);
    }
  };

  const planList = plans || [
    { id: 'free', name: 'Free', price: 0, events: 1000, endpoints: 3, retention: '7 days', features: ['1K events/month', '3 endpoints', '7-day log retention', 'Community support'] },
    { id: 'starter', name: 'Starter', price: 2499, events: 50000, endpoints: 20, retention: '30 days', features: ['50K events/month', '20 endpoints', '30-day retention', 'Email support', 'Filter rules'] },
    { id: 'pro', name: 'Pro', price: 8299, events: 500000, endpoints: 100, retention: '90 days', features: ['500K events/month', '100 endpoints', '90-day retention', 'Priority support', 'Advanced analytics', 'Custom rate limits'] },
    { id: 'enterprise', name: 'Enterprise', price: 33299, events: -1, endpoints: -1, retention: '365 days', features: ['Unlimited events', 'Unlimited endpoints', '365-day retention', 'Dedicated support', 'SSO', 'SLA guarantee', 'Custom integrations'] },
  ];

  const currentPlan = user?.plan || 'free';

  return (
    <div style={{ animation: 'fadeUp 0.35s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Billing</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>// Manage your subscription and usage</p>
      </div>

      {/* Current Plan Banner */}
      <div style={{ marginBottom: 28, padding: '20px 24px', background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${PLAN_META[currentPlan]?.color || '#6b7280'}15`, border: `1px solid ${PLAN_META[currentPlan]?.color || '#6b7280'}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(() => { const Icon = PLAN_META[currentPlan]?.icon || Zap; return <Icon size={20} style={{ color: PLAN_META[currentPlan]?.color || '#6b7280' }} />; })()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>
            {currentPlan} Plan
            {currentPlan !== 'free' && <span style={{ marginLeft: 10, fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 8px', borderRadius: 5, background: 'rgba(16,185,129,0.12)', color: '#10b981', textTransform: 'uppercase' }}>Active</span>}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
            {sub?.subscriptionEndAt ? `Renews ${new Date(sub.subscriptionEndAt).toLocaleDateString()}` : currentPlan === 'free' ? 'Free forever' : 'Active subscription'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--accent2)' }}>
            {currentPlan === 'free' ? '₹0' : planList.find((p: any) => p.id === currentPlan)?.price ? `₹${(planList.find((p: any) => p.id === currentPlan)?.price / 100).toLocaleString()}` : '—'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)' }}>/month</div>
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {planList.map((plan: any) => {
          const meta = PLAN_META[plan.id] || PLAN_META.free;
          const isCurrent = currentPlan === plan.id;
          const isHigher = ['free', 'starter', 'pro', 'enterprise'].indexOf(plan.id) > ['free', 'starter', 'pro', 'enterprise'].indexOf(currentPlan);
          const Icon = meta.icon;
          const priceInRupees = plan.price ? plan.price / 100 : 0;

          return (
            <div key={plan.id} className="card" style={{
              position: 'relative', border: isCurrent ? `1px solid ${meta.color}40` : plan.id === 'pro' ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
              background: isCurrent ? `${meta.gradient}` : 'var(--card)',
            }}>
              {meta.badge && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: meta.color, color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 10px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                  {meta.badge}
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}14`, border: `1px solid ${meta.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)', textTransform: 'capitalize' }}>{plan.name}</div>
                    {isCurrent && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: meta.color, textTransform: 'uppercase' }}>Current plan</div>}
                  </div>
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color: 'var(--text)' }}>
                    {priceInRupees === 0 ? 'Free' : `₹${priceInRupees.toLocaleString()}`}
                  </span>
                  {priceInRupees > 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginLeft: 4 }}>/mo</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {(plan.features || []).map((f: string) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Check size={13} style={{ color: meta.color, flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || plan.id === 'free' || processingPlan === plan.id}
                className={isCurrent ? 'btn-ghost' : 'btn-primary'}
                style={{ width: '100%', justifyContent: 'center', opacity: (!isCurrent && !isHigher && plan.id !== 'free') ? 0.5 : 1 }}
              >
                {processingPlan === plan.id ? (
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                ) : isCurrent ? 'Current Plan' : plan.id === 'free' ? 'Free Forever' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Usage Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 18 }}>Current Month Usage</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { label: 'Events Used', value: sub?.currentMonthEvents || 0, max: sub?.monthlyEventLimit || 1000, color: '#6366f1' },
            { label: 'Plan', value: currentPlan, max: null, color: '#818cf8' },
            { label: 'Renewal', value: sub?.subscriptionEndAt ? new Date(sub.subscriptionEndAt).toLocaleDateString() : '—', max: null, color: '#10b981' },
          ].map(({ label, value, max, color }) => (
            <div key={label} style={{ background: 'var(--card2)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
              {max !== null ? (
                <>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800, color, marginBottom: 10 }}>
                    {Number(value).toLocaleString()} <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-body)' }}>/ {Number(max).toLocaleString()}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: color, width: `${Math.min(100, (Number(value) / Number(max)) * 100)}%`, transition: 'width 0.5s ease' }} />
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color, textTransform: 'capitalize' }}>{String(value)}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
