'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import { CreditsBalance, CreditPackage, CreditTransaction } from '@/lib/types';
import { Coins, Plus, ArrowLeft, ToggleLeft, ToggleRight, TrendingDown, TrendingUp, Gift, RefreshCw, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';

function useRazorpay() {
  useEffect(() => {
    if (typeof window === 'undefined' || (window as any).Razorpay) return;
    const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.async = true;
    document.body.appendChild(s);
  }, []);
}

const TX_CFG: Record<string, { label: string; color: string; sign: string }> = {
  purchase:   { label: 'Purchase',   color: '#4ade80',  sign: '+' },
  usage:      { label: 'Usage',      color: '#f87171',  sign: '-' },
  bonus:      { label: 'Bonus',      color: '#fbbf24',  sign: '+' },
  refund:     { label: 'Refund',     color: '#4ade80',  sign: '+' },
  adjustment: { label: 'Adjustment', color: '#94a3b8',  sign: '±' },
};

export default function CreditsPage() {
  useRazorpay();
  const qc = useQueryClient();
  const [buying, setBuying] = useState<string | null>(null);
  const [txSkip, setTxSkip] = useState(0);
  const [showAutoTopup, setShowAutoTopup] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [autoThreshold, setAutoThreshold] = useState(1000);
  const [autoPkgId, setAutoPkgId] = useState('');

  const { data: balance } = useQuery<CreditsBalance>({
    queryKey: ['credits-balance'],
    queryFn: () => billingApi.getCreditsBalance(),
  });

  const { data: packages } = useQuery<CreditPackage[]>({
    queryKey: ['credit-packages'],
    queryFn: () => billingApi.getCreditPackages(),
    staleTime: 60_000,
  });

  const { data: txData } = useQuery({
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

  const purchaseOrder = useMutation({
    mutationFn: (packageId: string) => billingApi.purchaseCreditsOrder(packageId),
    onSuccess: (order, packageId) => {
      const pkg = packages?.find(p => p._id === packageId);
      new (window as any).Razorpay({
        key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount, currency: order.currency || 'INR',
        order_id: order.orderId,
        name: 'WebhookOS Credits',
        description: pkg?.name || 'Credit Package',
        theme: { color: '#a855f7' },
        handler: async (res: any) => {
          try {
            await billingApi.purchaseCreditsVerify({ orderId: order.orderId, paymentId: res.razorpay_payment_id, signature: res.razorpay_signature, packageId });
            toast.success(`✅ ${(pkg?.credits || 0 + (pkg?.bonusCredits || 0)).toLocaleString()} credits added!`);
            qc.invalidateQueries({ queryKey: ['credits-balance'] });
            qc.invalidateQueries({ queryKey: ['credit-transactions'] });
          } catch { toast.error('Payment verification failed'); }
          setBuying(null);
        },
        modal: { ondismiss: () => setBuying(null) },
      }).open();
    },
    onError: (e: any) => { toast.error(e.response?.data?.message || 'Failed'); setBuying(null); },
  });

  const autoTopupMut = useMutation({
    mutationFn: () => billingApi.updateAutoTopUp({ enabled: autoEnabled, packageId: autoPkgId, threshold: autoThreshold }),
    onSuccess: () => { toast.success('Auto top-up settings saved'); qc.invalidateQueries({ queryKey: ['credits-balance'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const txs: CreditTransaction[] = txData?.transactions || txData || [];

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left">
          <h1>Webhook Credits</h1>
          <p>// Prepaid event credits — buy once, use anytime</p>
        </div>
        <Link href="/billing" style={{ textDecoration: 'none' }}>
          <button className="btn btn-ghost"><ArrowLeft size={12} />Back to Billing</button>
        </Link>
      </div>

      {/* Balance card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Current Balance', val: balance?.balance?.toLocaleString() ?? '—', color: '#a855f7', icon: Coins },
          { label: 'Lifetime Purchased', val: balance?.lifetimePurchased?.toLocaleString() ?? '—', color: '#4ade80', icon: TrendingUp },
          { label: 'Lifetime Used', val: balance?.lifetimeUsed?.toLocaleString() ?? '—', color: '#38bdf8', icon: TrendingDown },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} className="lp-card" style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--r4)', padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon size={14} color={color} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color, letterSpacing: '-1.5px', lineHeight: 1 }}>{val}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginTop: 4 }}>credits</div>
          </div>
        ))}
      </div>

      {/* Auto top-up bar */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--r3)', padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Sliders size={15} color="var(--t3)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>Auto Top-Up</span>
          <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--t3)', marginLeft: 8 }}>
            {autoEnabled ? `Enabled — refill when balance drops below ${autoThreshold.toLocaleString()} credits` : 'Disabled'}
          </span>
        </div>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12 }}
          onClick={() => setShowAutoTopup(v => !v)}
        >
          {showAutoTopup ? 'Hide Settings' : 'Configure'}
        </button>
      </div>

      {showAutoTopup && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--r3)', padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
            <div className="field" style={{ margin: 0 }}>
              <label className="label">Auto Top-Up</label>
              <button
                onClick={() => setAutoEnabled(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: autoEnabled ? 'rgba(74,222,128,.1)' : 'var(--bg3)', border: `1px solid ${autoEnabled ? 'rgba(74,222,128,.3)' : 'var(--b2)'}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: autoEnabled ? '#4ade80' : 'var(--t3)', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600 }}
              >
                {autoEnabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {autoEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="label">When balance drops below</label>
              <input type="number" className="input" value={autoThreshold} onChange={e => setAutoThreshold(Number(e.target.value))} style={{ fontSize: 12 }} min={100} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label className="label">Auto-purchase package</label>
              <select className="input" value={autoPkgId} onChange={e => setAutoPkgId(e.target.value)} style={{ fontSize: 12 }}>
                <option value="">Select package</option>
                {packages?.map(p => <option key={p._id} value={p._id}>{p.name} — ₹{p.price.toLocaleString()}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => autoTopupMut.mutate()} disabled={autoTopupMut.isPending} style={{ height: 38 }}>
              {autoTopupMut.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Packages */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>// Credit Packages</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {(packages || []).map(pkg => {
          const total = pkg.credits + pkg.bonusCredits;
          const hasBonus = pkg.bonusCredits > 0;
          return (
            <div key={pkg._id} style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--r4)', padding: '22px 20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {hasBonus && (
                <div style={{ position: 'absolute', top: -9, right: 14, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#000', fontSize: 9, fontWeight: 700, fontFamily: 'var(--mono)', padding: '2px 9px', borderRadius: 20, letterSpacing: '.04em' }}>
                  +{pkg.bonusCredits.toLocaleString()} BONUS
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Coins size={16} color="#a855f7" />
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{pkg.name}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#a855f7', letterSpacing: '-1px' }}>{pkg.credits.toLocaleString()}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginLeft: 4 }}>base credits</span>
              </div>
              {hasBonus && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                  <Gift size={11} color="#fbbf24" />
                  <span style={{ fontSize: 11, color: '#fbbf24' }}>+{pkg.bonusCredits.toLocaleString()} bonus = {total.toLocaleString()} total</span>
                </div>
              )}
              <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5, marginBottom: 14, flex: 1 }}>{pkg.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.5px' }}>₹{pkg.price.toLocaleString()}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)' }}>₹{(pkg.price / total * 1000).toFixed(2)}/K events</span>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', background: 'linear-gradient(135deg,#6d28d9,#a855f7)', border: 'none' }}
                disabled={buying === pkg._id}
                onClick={() => { setBuying(pkg._id); purchaseOrder.mutate(pkg._id); }}
              >
                {buying === pkg._id ? <><RefreshCw size={11} className="spin" />Processing...</> : <><Plus size={12} />Buy for ₹{pkg.price.toLocaleString()}</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Transaction ledger */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>// Transaction History</span>
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
          <tbody>
            {txs.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--t3)', fontFamily: 'var(--mono)', fontSize: 11, padding: 24 }}>No transactions yet</td></tr>
            )}
            {txs.map((tx, i) => {
              const cfg = TX_CFG[tx.type] || TX_CFG.adjustment;
              return (
                <tr key={tx._id || i}>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>
                    {format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm')}
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 5, background: `${cfg.color}14`, border: `1px solid ${cfg.color}25`, fontFamily: 'var(--mono)', fontSize: 9, color: cfg.color, fontWeight: 700 }}>
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
        </table>
      </div>
      {txs.length >= 20 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn btn-ghost btn-sm" disabled={txSkip === 0} onClick={() => setTxSkip(v => Math.max(0, v - 20))}>← Prev</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setTxSkip(v => v + 20)}>Next →</button>
        </div>
      )}
    </div>
  );
}
