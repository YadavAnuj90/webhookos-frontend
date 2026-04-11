'use client';
import { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import { CreditsBalance, CreditPackage, CreditTransaction } from '@/lib/types';
import {
  Coins, Plus, ArrowLeft, ToggleLeft, ToggleRight,
  TrendingDown, TrendingUp, Gift, RefreshCw, Sliders,
  Zap, Crown, Rocket, Star, ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock, Receipt,
  Sparkles, ShieldCheck, AlertCircle, Wallet, CreditCard,
  X, Send, Building2, Globe, User, Phone, Users, MessageSquare,
  BarChart3, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';

/* ── Razorpay loader ─────────────────────────────────────────────────────── */
function useRazorpay() {
  useEffect(() => {
    if (typeof window === 'undefined' || (window as any).Razorpay) return;
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function paise(amount: number): string {
  return (amount / 100).toLocaleString('en-IN');
}

function fmtCredits(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + 'K';
  return n.toLocaleString();
}

/* ── Transaction config ───────────────────────────────────────────────────── */
const TX_CFG: Record<string, { label: string; color: string; bg: string; bd: string; sign: string; icon: any }> = {
  purchase:   { label: 'Purchase',   color: 'var(--green)',  bg: 'var(--gbg)',  bd: 'var(--gbd)',  sign: '+', icon: ArrowUpRight },
  usage:      { label: 'Usage',      color: 'var(--red)',    bg: 'var(--rbg)',  bd: 'var(--rbd)',  sign: '-', icon: ArrowDownRight },
  bonus:      { label: 'Bonus',      color: 'var(--yellow)', bg: 'var(--ybg)',  bd: 'var(--ybd)',  sign: '+', icon: Gift },
  refund:     { label: 'Refund',     color: 'var(--green)',  bg: 'var(--gbg)',  bd: 'var(--gbd)',  sign: '+', icon: RefreshCw },
  adjustment: { label: 'Adjustment', color: 'var(--t3)',     bg: 'rgba(148,163,184,.08)', bd: 'var(--b1)', sign: '±', icon: Sliders },
};

/* ── Tier visual config ───────────────────────────────────────────────────── */
const TIER_STYLE: { icon: any; color: string; bg: string; gradient: string }[] = [
  { icon: Zap,    color: '#818cf8', bg: 'rgba(129,140,248,.10)', gradient: 'linear-gradient(135deg,#6366f1,#818cf8)' },
  { icon: Rocket, color: '#22d3ee', bg: 'rgba(34,211,238,.10)',  gradient: 'linear-gradient(135deg,#0891b2,#22d3ee)' },
  { icon: Star,   color: '#fbbf24', bg: 'rgba(251,191,36,.10)',  gradient: 'linear-gradient(135deg,#d97706,#fbbf24)' },
  { icon: Crown,  color: '#c084fc', bg: 'rgba(192,132,252,.10)', gradient: 'linear-gradient(135deg,#7c3aed,#c084fc)' },
];

/* ── Enterprise features list ─────────────────────────────────────────────── */
const ENTERPRISE_FEATURES = [
  'Custom credit volume & pricing',
  'Dedicated account manager',
  'Priority support & SLA',
  'Custom integrations',
  'Volume discounts',
  'Invoice-based billing',
];

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CONTACT SALES MODAL                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */
function ContactSalesModal({
  open, onClose, packageId, packageName,
}: {
  open: boolean; onClose: () => void; packageId: string; packageName: string;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    businessEmail: '', companyName: '', companyUrl: '',
    fullName: '', phone: '', teamSize: '', useCase: '', monthlyEvents: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => billingApi.submitSalesInquiry({ ...form, packageId }),
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Sales inquiry submitted!');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to submit'),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const canSubmit = form.businessEmail.trim() && form.companyName.trim() && form.fullName.trim();

  if (!open) return null;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, width: '95%' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--b1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'rgba(192,132,252,.10)', border: '1px solid rgba(192,132,252,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Crown size={16} color="#c084fc" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Contact Sales</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{packageName} — Custom Enterprise Pricing</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {submitted ? (
          /* ── Success state ────────────────────────────────────────────────── */
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
              background: 'var(--gbg)', border: '1px solid var(--gbd)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle2 size={26} color="var(--green)" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>
              Inquiry Submitted!
            </div>
            <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 24px' }}>
              Our sales team will reach out to <strong style={{ color: 'var(--t1)' }}>{form.businessEmail}</strong> within 24 hours to discuss your enterprise needs.
            </div>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          /* ── Form ─────────────────────────────────────────────────────────── */
          <div style={{ padding: '20px 24px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label className="label">
                  <User size={10} style={{ marginRight: 4 }} />Full Name *
                </label>
                <input className="input" placeholder="Saurabh Sonkar" value={form.fullName} onChange={set('fullName')} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label className="label">
                  <Building2 size={10} style={{ marginRight: 4 }} />Company Name *
                </label>
                <input className="input" placeholder="CallerDesk" value={form.companyName} onChange={set('companyName')} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label className="label">
                  <Send size={10} style={{ marginRight: 4 }} />Business Email *
                </label>
                <input className="input" type="email" placeholder="you@company.com" value={form.businessEmail} onChange={set('businessEmail')} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label className="label">
                  <Phone size={10} style={{ marginRight: 4 }} />Phone Number
                </label>
                <input className="input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="field" style={{ margin: 0 }}>
                <label className="label">
                  <Globe size={10} style={{ marginRight: 4 }} />Company Website
                </label>
                <input className="input" placeholder="https://company.com" value={form.companyUrl} onChange={set('companyUrl')} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label className="label">
                  <Users size={10} style={{ marginRight: 4 }} />Team Size
                </label>
                <select className="input" value={form.teamSize} onChange={set('teamSize')}>
                  <option value="">Select</option>
                  <option value="1-10">1–10</option>
                  <option value="11-50">11–50</option>
                  <option value="51-200">51–200</option>
                  <option value="201-1000">201–1,000</option>
                  <option value="1000+">1,000+</option>
                </select>
              </div>
            </div>

            <div className="field" style={{ margin: '0 0 12px' }}>
              <label className="label">
                <BarChart3 size={10} style={{ marginRight: 4 }} />Expected Monthly Events
              </label>
              <select className="input" value={form.monthlyEvents} onChange={set('monthlyEvents')}>
                <option value="">Select estimated volume</option>
                <option value="100K-500K">100K – 500K events/month</option>
                <option value="500K-1M">500K – 1M events/month</option>
                <option value="1M-5M">1M – 5M events/month</option>
                <option value="5M-10M">5M – 10M events/month</option>
                <option value="10M+">10M+ events/month</option>
              </select>
            </div>

            <div className="field" style={{ margin: '0 0 16px' }}>
              <label className="label">
                <MessageSquare size={10} style={{ marginRight: 4 }} />Tell us about your use case
              </label>
              <textarea
                className="input"
                placeholder="Describe how you plan to use WebhookOS at scale..."
                value={form.useCase}
                onChange={set('useCase')}
                rows={3}
                style={{ resize: 'vertical', minHeight: 70 }}
              />
            </div>

            {/* Submit */}
            <button
              className="btn btn-primary"
              style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#c084fc)', border: 'none' }}
              disabled={!canSubmit || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending
                ? <><RefreshCw size={12} style={{ animation: 'spin .7s linear infinite' }} />Submitting...</>
                : <><Send size={12} />Submit Inquiry</>
              }
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
              marginTop: 12, fontSize: 10, color: 'var(--t3)',
            }}>
              <ShieldCheck size={10} />
              Our team typically responds within 24 business hours
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function CreditsPage() {
  useRazorpay();
  const qc = useQueryClient();
  const [buying, setBuying]     = useState<string | null>(null);
  const [txSkip, setTxSkip]     = useState(0);
  const [showAutoTopup, setShowAutoTopup] = useState(false);
  const [autoEnabled, setAutoEnabled]     = useState(false);
  const [autoThreshold, setAutoThreshold] = useState(1000);
  const [autoPkgId, setAutoPkgId]         = useState('');
  const [salesModal, setSalesModal]       = useState<{ open: boolean; packageId: string; packageName: string }>({
    open: false, packageId: '', packageName: '',
  });

  /* ── Queries ──────────────────────────────────────────────────────────────── */
  const { data: balance, isLoading: balLoading } = useQuery<CreditsBalance>({
    queryKey: ['credits-balance'],
    queryFn: () => billingApi.getCreditsBalance(),
  });

  const { data: packages, isLoading: pkgLoading } = useQuery<CreditPackage[]>({
    queryKey: ['credit-packages'],
    queryFn: () => billingApi.getCreditPackages(),
    staleTime: 60_000,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['credit-transactions', txSkip],
    queryFn: () => billingApi.getTransactions({ limit: 20, skip: txSkip }),
  });

  useEffect(() => {
    if (balance) {
      setAutoEnabled(balance.autoTopUpEnabled);
      setAutoThreshold(balance.autoTopUpThreshold || 1000);
      setAutoPkgId(balance.autoTopUpPackageId || '');
    }
  }, [balance]);

  /* ── Mutations ────────────────────────────────────────────────────────────── */
  const purchaseOrder = useMutation({
    mutationFn: (packageId: string) => billingApi.purchaseCreditsOrder(packageId),
    onSuccess: (order, packageId) => {
      const pkg = packages?.find(p => p._id === packageId);
      new (window as any).Razorpay({
        key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || 'INR',
        order_id: order.orderId,
        name: 'WebhookOS Credits',
        description: pkg?.name || 'Credit Package',
        theme: { color: '#7c3aed' },
        handler: async (res: any) => {
          try {
            await billingApi.purchaseCreditsVerify({
              orderId: order.orderId,
              paymentId: res.razorpay_payment_id,
              signature: res.razorpay_signature,
              packageId,
            });
            toast.success(`${fmtCredits((pkg?.credits || 0) + (pkg?.bonusCredits || 0))} credits added!`);
            qc.invalidateQueries({ queryKey: ['credits-balance'] });
            qc.invalidateQueries({ queryKey: ['credit-transactions'] });
          } catch {
            toast.error('Payment verification failed');
          }
          setBuying(null);
        },
        modal: { ondismiss: () => setBuying(null) },
      }).open();
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Failed to create order');
      setBuying(null);
    },
  });

  const autoTopupMut = useMutation({
    mutationFn: () => billingApi.updateAutoTopUp({ enabled: autoEnabled, packageId: autoPkgId, threshold: autoThreshold }),
    onSuccess: () => {
      toast.success('Auto top-up settings saved');
      qc.invalidateQueries({ queryKey: ['credits-balance'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save'),
  });

  const txs: CreditTransaction[] = txData?.transactions || txData || [];
  const usagePct = balance && balance.lifetimePurchased > 0
    ? Math.round((balance.lifetimeUsed / balance.lifetimePurchased) * 100)
    : 0;

  // Separate regular packages from contact-sales packages
  const regularPkgs = (packages || []).filter(p => !p.contactSales);
  const enterprisePkgs = (packages || []).filter(p => p.contactSales);

  return (
    <div className="page">
      {/* ── Sales Modal ─────────────────────────────────────────────────────── */}
      <ContactSalesModal
        open={salesModal.open}
        onClose={() => setSalesModal({ open: false, packageId: '', packageName: '' })}
        packageId={salesModal.packageId}
        packageName={salesModal.packageName}
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="ph">
        <div className="ph-left">
          <h1>Webhook Credits</h1>
          <p>// Prepaid event credits — buy once, use anytime</p>
        </div>
        <Link href="/billing" style={{ textDecoration: 'none' }}>
          <button className="btn btn-ghost"><ArrowLeft size={12} />Back to Billing</button>
        </Link>
      </div>

      {/* ── Balance Stats ───────────────────────────────────────────────────── */}
      <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 20 }}>
        {balLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : [
              { label: 'Current Balance', val: balance?.balance?.toLocaleString() ?? '0', icon: Wallet, color: '#a855f7', bg: 'rgba(168,85,247,.10)' },
              { label: 'Lifetime Purchased', val: balance?.lifetimePurchased?.toLocaleString() ?? '0', icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,.10)' },
              { label: 'Lifetime Used', val: balance?.lifetimeUsed?.toLocaleString() ?? '0', icon: TrendingDown, color: '#38bdf8', bg: 'rgba(56,189,248,.10)' },
            ].map(({ label, val, icon: Icon, color, bg }) => (
              <div key={label} className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: bg, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={17} color={color} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="stat-lbl">{label}</div>
                    <div className="stat-val" style={{ color }}>{val}</div>
                  </div>
                </div>
                {label === 'Current Balance' && balance && balance.lifetimePurchased > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>Usage</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>{usagePct}%</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 2, background: 'var(--b1)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(usagePct, 100)}%`, borderRadius: 2, background: usagePct > 80 ? 'var(--red)' : 'var(--a)' }} />
                    </div>
                  </div>
                )}
              </div>
            ))
        }
      </div>

      {/* ── Auto Top-Up Bar ─────────────────────────────────────────────────── */}
      <div className="card" style={{
        padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: autoEnabled ? 'var(--gbg)' : 'rgba(148,163,184,.08)',
          border: `1px solid ${autoEnabled ? 'var(--gbd)' : 'var(--b1)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Sliders size={13} color={autoEnabled ? 'var(--green)' : 'var(--t3)'} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>Auto Top-Up</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>
            {autoEnabled
              ? `Refill when balance drops below ${autoThreshold.toLocaleString()} credits`
              : 'Disabled — enable to auto-refill when credits run low'}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowAutoTopup(v => !v)}>
          {showAutoTopup ? 'Hide' : 'Configure'}
        </button>
      </div>

      {showAutoTopup && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
            <div className="field" style={{ margin: 0 }}>
              <label className="label">Status</label>
              <button
                onClick={() => setAutoEnabled(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: autoEnabled ? 'var(--gbg)' : 'var(--card2)',
                  border: `1px solid ${autoEnabled ? 'var(--gbd)' : 'var(--b1)'}`,
                  borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                  color: autoEnabled ? 'var(--green)' : 'var(--t3)',
                  fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600,
                }}
              >
                {autoEnabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {autoEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="label">When balance below</label>
              <input type="number" className="input" value={autoThreshold} onChange={e => setAutoThreshold(Number(e.target.value))} style={{ fontSize: 12 }} min={100} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="label">Auto-purchase package</label>
              <select className="input" value={autoPkgId} onChange={e => setAutoPkgId(e.target.value)} style={{ fontSize: 12 }}>
                <option value="">Select package</option>
                {regularPkgs.map(p => <option key={p._id} value={p._id}>{p.name} — ₹{paise(p.price)}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => autoTopupMut.mutate()} disabled={autoTopupMut.isPending} style={{ height: 38 }}>
              {autoTopupMut.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ── Credit Packages ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          // Credit Packages
        </span>
      </div>

      {pkgLoading ? (
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((packages?.length || 4), 4)}, 1fr)`, gap: 14, marginBottom: 24 }}>
          {/* ── Regular (purchasable) packages ──────────────────────────── */}
          {regularPkgs.map((pkg, idx) => {
            const tier = TIER_STYLE[idx % TIER_STYLE.length];
            const TierIcon = tier.icon;
            const total = pkg.credits + pkg.bonusCredits;
            const hasBonus = pkg.bonusCredits > 0;
            const pricePerK = (pkg.price / 100) / (total / 1000);
            const isBuying = buying === pkg._id;
            const isBestValue = regularPkgs.length >= 3 && idx === regularPkgs.length - 1;

            return (
              <div key={pkg._id} className="card" style={{
                padding: 0, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
                border: isBestValue ? `1px solid ${tier.color}40` : undefined,
              }}>
                <div style={{ height: 3, background: tier.gradient }} />

                {hasBonus && (
                  <div style={{
                    position: 'absolute', top: 12, right: 14,
                    background: 'var(--ybg)', border: '1px solid var(--ybd)',
                    color: 'var(--yellow)', fontSize: 9, fontWeight: 700, fontFamily: 'var(--mono)',
                    padding: '2px 8px', borderRadius: 20,
                  }}>
                    +{fmtCredits(pkg.bonusCredits)} BONUS
                  </div>
                )}

                {isBestValue && (
                  <div style={{
                    position: 'absolute', top: 12, left: 14,
                    background: tier.bg, border: `1px solid ${tier.color}30`,
                    color: tier.color, fontSize: 8, fontWeight: 700, fontFamily: 'var(--mono)',
                    padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase',
                  }}>
                    Best Value
                  </div>
                )}

                <div style={{ padding: '20px 20px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: hasBonus || isBestValue ? 14 : 0 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: tier.bg, border: `1px solid ${tier.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <TierIcon size={16} color={tier.color} strokeWidth={1.8} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{pkg.name}</span>
                  </div>

                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: tier.color, letterSpacing: '-1px', lineHeight: 1 }}>
                      {fmtCredits(pkg.credits)}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', marginLeft: 6 }}>credits</span>
                  </div>

                  {hasBonus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                      <Sparkles size={11} color="var(--yellow)" />
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--yellow)' }}>
                        +{fmtCredits(pkg.bonusCredits)} bonus = {fmtCredits(total)} total
                      </span>
                    </div>
                  )}

                  <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.55, marginBottom: 16, flex: 1 }}>
                    {pkg.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--t3)', marginRight: 1 }}>₹</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.5px' }}>
                        {paise(pkg.price)}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>
                      ₹{pricePerK.toFixed(2)}/K
                    </span>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', background: tier.gradient, border: 'none' }}
                    disabled={isBuying}
                    onClick={() => { setBuying(pkg._id); purchaseOrder.mutate(pkg._id); }}
                  >
                    {isBuying
                      ? <><RefreshCw size={11} style={{ animation: 'spin .7s linear infinite' }} />Processing...</>
                      : <><CreditCard size={12} />Buy for ₹{paise(pkg.price)}</>
                    }
                  </button>
                </div>
              </div>
            );
          })}

          {/* ── Enterprise / Contact Sales packages ────────────────────── */}
          {enterprisePkgs.map((pkg) => {
            const tier = TIER_STYLE[3]; // Crown / purple
            const TierIcon = tier.icon;

            return (
              <div key={pkg._id} className="card" style={{
                padding: 0, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
                border: `1px solid ${tier.color}30`,
              }}>
                {/* Gradient top strip */}
                <div style={{ height: 3, background: tier.gradient }} />

                {/* Enterprise badge */}
                <div style={{
                  position: 'absolute', top: 12, right: 14,
                  background: tier.bg, border: `1px solid ${tier.color}30`,
                  color: tier.color, fontSize: 8, fontWeight: 700, fontFamily: 'var(--mono)',
                  padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.04em',
                }}>
                  Enterprise
                </div>

                <div style={{ padding: '20px 20px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 14 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: tier.bg, border: `1px solid ${tier.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <TierIcon size={16} color={tier.color} strokeWidth={1.8} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{pkg.name}</span>
                  </div>

                  {/* Credits */}
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: tier.color, letterSpacing: '-1px', lineHeight: 1 }}>
                      {fmtCredits(pkg.credits)}+
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', marginLeft: 6 }}>credits</span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.55, marginBottom: 12 }}>
                    {pkg.description}
                  </p>

                  {/* Feature list */}
                  <div style={{ flex: 1, marginBottom: 16 }}>
                    {ENTERPRISE_FEATURES.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                        <CheckCircle2 size={10} color={tier.color} />
                        <span style={{ fontSize: 10, color: 'var(--t2)' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Custom pricing label */}
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Custom Pricing</span>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>
                      Tailored to your volume & needs
                    </div>
                  </div>

                  {/* Contact Sales button */}
                  <button
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      background: tier.gradient,
                      border: 'none',
                    }}
                    onClick={() => setSalesModal({ open: true, packageId: pkg._id, packageName: pkg.name })}
                  >
                    <Building2 size={12} />Contact Sales
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Transaction History ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          // Transaction History
        </span>
        {txs.length > 0 && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>
            {txSkip + 1}–{txSkip + txs.length} shown
          </span>
        )}
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Credits</th>
              <th>Balance After</th>
              <th>Description</th>
            </tr>
          </thead>
          {txLoading ? (
            <SkeletonTable rows={5} cols={5} />
          ) : (
            <tbody>
              {txs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'rgba(148,163,184,.08)', border: '1px solid var(--b1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Receipt size={18} color="var(--t3)" strokeWidth={1.5} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--t3)' }}>No transactions yet</span>
                      <span style={{ fontSize: 11, color: 'var(--t3)', opacity: 0.6 }}>Purchase a credit package to get started</span>
                    </div>
                  </td>
                </tr>
              )}
              {txs.map((tx, i) => {
                const cfg = TX_CFG[tx.type] || TX_CFG.adjustment;
                const TxIcon = cfg.icon;
                return (
                  <tr key={tx._id || i}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>
                      {format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', borderRadius: 5,
                        background: cfg.bg, border: `1px solid ${cfg.bd}`,
                        fontFamily: 'var(--mono)', fontSize: 9, color: cfg.color, fontWeight: 700,
                      }}>
                        <TxIcon size={9} />
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: cfg.color }}>
                      {cfg.sign}{Math.abs(tx.amount).toLocaleString()}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--t2)' }}>
                      {tx.balanceAfter.toLocaleString()}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--t2)', maxWidth: 300 }}>{tx.description}</td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="pg" style={{ marginTop: 12 }}>
        <div className="pg-info">
          {txSkip > 0 || txs.length >= 20 ? `Showing ${txSkip + 1}–${txSkip + txs.length}` : ''}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" disabled={txSkip === 0} onClick={() => setTxSkip(v => Math.max(0, v - 20))}>
            <ChevronLeft size={12} />Prev
          </button>
          <button className="btn btn-ghost btn-sm" disabled={txs.length < 20} onClick={() => setTxSkip(v => v + 20)}>
            Next<ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
