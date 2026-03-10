'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Check, Zap, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

const PLAN_FEATURES: Record<string, string[]> = {
  free:       ['1,000 events/month','3 endpoints','7-day log retention','Basic analytics','Community support'],
  starter:    ['50,000 events/month','20 endpoints','30-day log retention','Full analytics','Email support','Webhook replay'],
  pro:        ['500,000 events/month','100 endpoints','90-day log retention','Advanced analytics','Priority support','Custom headers','Filter rules'],
  enterprise: ['Unlimited events','Unlimited endpoints','365-day retention','All features','Dedicated support','SLA guarantee','Custom integrations'],
};
const PLAN_COLOR: Record<string,string> = { free:'var(--t3)', starter:'var(--a2)', pro:'var(--green)', enterprise:'var(--yellow)' };
const PLAN_ICON: Record<string,any>     = { free:null, starter:Zap, pro:Crown, enterprise:Crown };

export default function BillingPage() {
  const { user, setUser } = useAuth();
  const [paying, setPaying] = useState<string|null>(null);

  const { data: plans } = useQuery({ queryKey:['plans'], queryFn:()=>billingApi.getPlans() });
  const { data: sub }   = useQuery({ queryKey:['sub'],   queryFn:()=>billingApi.getSubscription() });

  const createOrder = useMutation({
    mutationFn: (planId: string) => billingApi.createOrder(planId),
    onSuccess: (order, planId) => openRazorpay(order, planId),
    onError: (e:any) => toast.error(e.response?.data?.message||'Failed to create order'),
  });

  const verifyPayment = useMutation({
    mutationFn: (d:any) => billingApi.verifyPayment(d),
    onSuccess: (d) => { toast.success('Subscription upgraded!'); if(d.user) setUser(d.user); setPaying(null); },
    onError: (e:any) => { toast.error(e.response?.data?.message||'Payment verification failed'); setPaying(null); },
  });

  const openRazorpay = (order:any, planId:string) => {
    if (typeof window === 'undefined') return;
    const rzp = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount, currency: order.currency, order_id: order.orderId,
      name: 'WebhookOS', description: `Upgrade to ${planId} plan`,
      prefill: order.prefill,
      theme: { color: '#5b6cf8' },
      handler: (response: any) => {
        verifyPayment.mutate({ razorpayOrderId: order.orderId, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature, planId });
      },
      modal: { ondismiss: () => setPaying(null) },
    });
    rzp.open();
  };

  const handleUpgrade = (planId: string) => {
    if (planId === 'free') return;
    setPaying(planId); createOrder.mutate(planId);
  };

  const currentPlan = user?.plan || 'free';
  const orderedPlans = ['free','starter','pro','enterprise'];

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left"><h1>Billing & Plans</h1><p>// Current plan: <strong style={{ color:PLAN_COLOR[currentPlan] }}>{currentPlan}</strong></p></div>
      </div>

      {/* Current plan banner */}
      {sub && sub.plan !== 'free' && (
        <div style={{ background:'var(--card)',border:'1px solid var(--abd)',borderRadius:'var(--r3)',padding:16,marginBottom:20,display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:'var(--abg)',border:'1px solid var(--abd)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Crown size={16} style={{ color:'var(--a2)' }}/>
          </div>
          <div>
            <div style={{ fontWeight:700,fontSize:13 }}>Active: <span style={{ color:PLAN_COLOR[sub.plan] }}>{sub.plan}</span></div>
            {sub.subscriptionEndAt && <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',marginTop:2 }}>Renews {new Date(sub.subscriptionEndAt).toLocaleDateString()}</div>}
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {orderedPlans.map(planId => {
          const plan = plans?.find((p:any)=>p.id===planId) || { id:planId, name:planId, price:0 };
          const isCurrent = currentPlan === planId;
          const isPopular = planId === 'pro';
          const Icon = PLAN_ICON[planId];
          const features = PLAN_FEATURES[planId] || [];
          return (
            <div key={planId} style={{ background:'var(--card)', border:`1px solid ${isCurrent?'var(--abd)':isPopular?'var(--b2)':'var(--b1)'}`, borderRadius:'var(--r4)', padding:22, display:'flex', flexDirection:'column', position:'relative', transition:'border-color .2s', boxShadow:isPopular?'var(--sa)':undefined }}>
              {isPopular && <div style={{ position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'var(--a)',color:'#fff',fontSize:9,fontWeight:700,fontFamily:'var(--mono)',padding:'3px 10px',borderRadius:20,whiteSpace:'nowrap',letterSpacing:'.06em' }}>MOST POPULAR</div>}
              {isCurrent && <div style={{ position:'absolute',top:12,right:12 }}><span className="badge b-green">Current</span></div>}
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
                {Icon && <div style={{ width:28,height:28,borderRadius:8,background:`${PLAN_COLOR[planId]}15`,border:`1px solid ${PLAN_COLOR[planId]}30`,display:'flex',alignItems:'center',justifyContent:'center' }}><Icon size={13} style={{ color:PLAN_COLOR[planId] }}/></div>}
                <div style={{ fontWeight:800,fontSize:14,color:PLAN_COLOR[planId],textTransform:'capitalize' }}>{planId}</div>
              </div>
              <div style={{ marginBottom:16 }}>
                <span style={{ fontSize:28,fontWeight:800,color:'var(--t1)',letterSpacing:'-1px' }}>
                  {plan.price===0 ? 'Free' : ` ${plan.price?.toLocaleString()}`}
                </span>
                {plan.price>0 && <span style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',marginLeft:4 }}>/month</span>}
              </div>
              <div style={{ flex:1, marginBottom:18 }}>
                {features.map(f => (
                  <div key={f} style={{ display:'flex',alignItems:'flex-start',gap:7,marginBottom:7 }}>
                    <Check size={11} style={{ color:'var(--green)',marginTop:1,flexShrink:0 }}/>
                    <span style={{ fontSize:12,color:'var(--t2)',lineHeight:1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                className={`btn ${isCurrent?'btn-ghost':isPopular?'btn-primary':'btn-ghost'}`}
                style={{ width:'100%' }}
                disabled={isCurrent || paying===planId || planId==='free'}
                onClick={()=>handleUpgrade(planId)}
              >
                {paying===planId ? 'Processing...' : isCurrent ? 'Current Plan' : planId==='free' ? 'Free Forever' : `Upgrade to ${planId}`}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:24,textAlign:'center',fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>
        Payments secured by Razorpay . Cancel anytime . GST applicable
      </div>
    </div>
  );
}
