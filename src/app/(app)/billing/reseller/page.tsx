'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import {
  ResellerProfile, ResellerCustomer, ResellerRevenue, ResellerPlan, Subscription, Invoice,
} from '@/lib/types';
import {
  Store, ArrowLeft, Plus, UserCheck, UserX, RefreshCw,
  DollarSign, Users, FileText, Lock, Wand2, X, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';

function AddCustomerModal({ onClose, onAdd, loading }: { onClose: () => void; onAdd: (d: any) => void; loading: boolean }) {
  const [form, setForm] = useState({ customerEmail: '', markupPct: 20, pricePerThousandEvents: 5, notes: '' });
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Reseller Customer</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="field">
          <label className="label">Customer Email</label>
          <input className="input" placeholder="customer@example.com" value={form.customerEmail} onChange={e => setForm(p => ({ ...p, customerEmail: e.target.value }))} />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginTop: 3 }}>Must already be registered on WebhookOS</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="field">
            <label className="label">Markup %</label>
            <input type="number" className="input" value={form.markupPct} onChange={e => setForm(p => ({ ...p, markupPct: Number(e.target.value) }))} min={0} max={200} style={{ fontSize: 12 }} />
          </div>
          <div className="field">
            <label className="label">Price per 1K Events (₹)</label>
            <input type="number" className="input" value={form.pricePerThousandEvents} onChange={e => setForm(p => ({ ...p, pricePerThousandEvents: Number(e.target.value) }))} min={0} style={{ fontSize: 12 }} />
          </div>
        </div>
        <div className="field">
          <label className="label">Notes (optional)</label>
          <textarea className="input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ minHeight: 60, resize: 'vertical', fontSize: 12 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={loading || !form.customerEmail.trim()} onClick={() => onAdd(form)}>
            {loading ? 'Adding...' : <><Plus size={12} />Add Customer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreatePlanModal({ onClose, onCreate, loading }: { onClose: () => void; onCreate: (d: any) => void; loading: boolean }) {
  const [form, setForm] = useState({ name: '', description: '', priceMonthly: 999, eventsPerMonth: 10000, endpointsLimit: 5, retentionDays: 30 });
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create Custom Plan</span>
          <button className="btn-icon" onClick={onClose}><X size={14} /></button>
        </div>
        {[
          { label: 'Plan Name', key: 'name', type: 'text', placeholder: 'Starter Reseller' },
          { label: 'Description', key: 'description', type: 'text', placeholder: 'Optional description' },
        ].map(f => (
          <div className="field" key={f.key}>
            <label className="label">{f.label}</label>
            <input className="input" type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ fontSize: 12 }} />
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Price/mo (₹)', key: 'priceMonthly' },
            { label: 'Events/mo', key: 'eventsPerMonth' },
            { label: 'Endpoints', key: 'endpointsLimit' },
            { label: 'Retention (days)', key: 'retentionDays' },
          ].map(f => (
            <div className="field" key={f.key}>
              <label className="label">{f.label}</label>
              <input type="number" className="input" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))} style={{ fontSize: 12 }} min={0} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={loading || !form.name.trim()} onClick={() => onCreate(form)}>
            {loading ? 'Creating...' : 'Create Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

type Tab = 'overview' | 'customers' | 'plans' | 'profile';

export default function ResellerPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<ResellerProfile>>({});
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Guard: only enterprise
  const { data: sub } = useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: () => billingApi.getSubscription(),
    staleTime: 5 * 60 * 1000, retry: 1, throwOnError: false,
  });

  const { data: revenue } = useQuery<ResellerRevenue>({
    queryKey: ['reseller-revenue'],
    queryFn: () => billingApi.getResellerRevenue(),
    enabled: tab === 'overview',
  });

  const { data: customers, isLoading: cusLoading } = useQuery<ResellerCustomer[]>({
    queryKey: ['reseller-customers'],
    queryFn: () => billingApi.getResellerCustomers(),
    enabled: tab === 'customers' || tab === 'overview',
  });

  const { data: plans } = useQuery<ResellerPlan[]>({
    queryKey: ['reseller-plans'],
    queryFn: () => billingApi.getResellerPlans(),
    enabled: tab === 'plans',
  });

  const { data: profile } = useQuery<ResellerProfile>({
    queryKey: ['reseller-profile'],
    queryFn: () => billingApi.getResellerProfile(),
    enabled: tab === 'profile',
    onSuccess: (d) => { if (!profileLoaded) { setProfileForm(d); setProfileLoaded(true); } },
  } as any);

  const addCustomer = useMutation({
    mutationFn: (d: any) => billingApi.addResellerCustomer(d),
    onSuccess: () => { toast.success('Customer added!'); qc.invalidateQueries({ queryKey: ['reseller-customers'] }); setShowAddCustomer(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const suspendMut = useMutation({
    mutationFn: (id: string) => billingApi.suspendCustomer(id),
    onSuccess: () => { toast.success('Customer suspended'); qc.invalidateQueries({ queryKey: ['reseller-customers'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const reactivateMut = useMutation({
    mutationFn: (id: string) => billingApi.reactivateCustomer(id),
    onSuccess: () => { toast.success('Customer reactivated'); qc.invalidateQueries({ queryKey: ['reseller-customers'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const generateMut = useMutation({
    mutationFn: () => billingApi.generateInvoices(),
    onSuccess: (d: any) => toast.success(d?.message || 'Invoices generated!'),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const saveProfile = useMutation({
    mutationFn: () => billingApi.saveResellerProfile(profileForm),
    onSuccess: () => { toast.success('Profile saved!'); qc.invalidateQueries({ queryKey: ['reseller-profile'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const createPlanMut = useMutation({
    mutationFn: (d: any) => billingApi.createResellerPlan(d),
    onSuccess: () => { toast.success('Plan created!'); qc.invalidateQueries({ queryKey: ['reseller-plans'] }); setShowCreatePlan(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  // Enterprise guard
  if (sub && sub.features?.reseller === false) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={22} color="#fbbf24" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Enterprise Feature</div>
          <p style={{ fontSize: 13, color: 'var(--t3)', maxWidth: 340, margin: '0 auto 24px', lineHeight: 1.6 }}>
            The Reseller Portal is available on the Enterprise plan. Upgrade to onboard your own customers and generate usage invoices.
          </p>
          <Link href="/billing"><button className="btn btn-primary">Upgrade to Enterprise →</button></Link>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview',   label: 'Overview',   icon: Store },
    { id: 'customers',  label: 'Customers',  icon: Users },
    { id: 'plans',      label: 'Custom Plans', icon: Wand2 },
    { id: 'profile',    label: 'Profile',    icon: FileText },
  ];

  return (
    <>
      <div className="page">
        <div className="ph">
          <div className="ph-left">
            <h1>Reseller Portal</h1>
            <p>// Manage your reseller customers and revenue</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/billing" style={{ textDecoration: 'none' }}>
              <button className="btn btn-ghost"><ArrowLeft size={12} />Back to Billing</button>
            </Link>
            {tab === 'customers' && (
              <>
                <button className="btn btn-ghost" onClick={() => generateMut.mutate()} disabled={generateMut.isPending} style={{ fontSize: 12 }}>
                  {generateMut.isPending ? 'Generating...' : <><RefreshCw size={12} />Generate Invoices</>}
                </button>
                <button className="btn btn-primary" onClick={() => setShowAddCustomer(true)}>
                  <Plus size={12} />Add Customer
                </button>
              </>
            )}
            {tab === 'plans' && (
              <button className="btn btn-primary" onClick={() => setShowCreatePlan(true)}>
                <Plus size={12} />Create Plan
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`tab ${tab === id ? 'tab-active' : ''}`} onClick={() => setTab(id)}>
              <Icon size={12} style={{ marginRight: 5 }} />{label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
              {[
                { label: 'Total Revenue', val: revenue ? `₹${revenue.totalCollected.toLocaleString()}` : '—', color: '#4ade80', icon: DollarSign },
                { label: 'Paid Invoices', val: revenue?.paidInvoices?.toLocaleString() ?? '—', color: '#38bdf8', icon: FileText },
                { label: 'Active Customers', val: revenue?.totalCustomers?.toLocaleString() ?? '—', color: '#a855f7', icon: Users },
              ].map(({ label, val, color, icon: Icon }) => (
                <div key={label} style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--r4)', padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Icon size={14} color={color} />
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: '-1px' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>// Recent Customers</span>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Customer</th><th>Events (This Month)</th><th>Est. Monthly</th><th>Status</th></tr></thead>
                <tbody>
                  {(!customers || customers.length === 0) && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--t3)', fontFamily: 'var(--mono)', fontSize: 11, padding: 24 }}>No customers yet</td></tr>
                  )}
                  {(customers || []).slice(0, 5).map(c => (
                    <tr key={c.customerId}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--t1)' }}>{c.customer.firstName} {c.customer.lastName}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)' }}>{c.customer.email}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{c.currentMonthEvents.toLocaleString()}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: '#4ade80' }}>
                        ₹{((c.currentMonthEvents / 1000) * c.pricePerThousandEvents).toFixed(0)}
                      </td>
                      <td>
                        <span style={{ padding: '2px 8px', borderRadius: 5, background: c.isActive ? 'rgba(74,222,128,.1)' : 'rgba(248,113,113,.1)', border: `1px solid ${c.isActive ? 'rgba(74,222,128,.25)' : 'rgba(248,113,113,.25)'}`, fontFamily: 'var(--mono)', fontSize: 9, color: c.isActive ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                          {c.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Customers */}
        {tab === 'customers' && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Customer</th><th>Events (This Month)</th><th>Price/1K Events</th><th>Est. Monthly</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {cusLoading && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24 }}><div style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--b2)', borderTopColor: 'var(--a)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /></td></tr>}
                {!cusLoading && (!customers || customers.length === 0) && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--t3)', fontFamily: 'var(--mono)', fontSize: 11, padding: 32 }}>No customers yet — click "Add Customer" to get started</td></tr>
                )}
                {(customers || []).map(c => (
                  <tr key={c.customerId}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{c.customer.firstName} {c.customer.lastName}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)' }}>{c.customer.email}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{c.currentMonthEvents.toLocaleString()}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>₹{c.pricePerThousandEvents}/K</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: '#4ade80' }}>
                      ₹{((c.currentMonthEvents / 1000) * c.pricePerThousandEvents).toFixed(0)}
                    </td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: 5, background: c.isActive ? 'rgba(74,222,128,.1)' : 'rgba(248,113,113,.1)', border: `1px solid ${c.isActive ? 'rgba(74,222,128,.25)' : 'rgba(248,113,113,.25)'}`, fontFamily: 'var(--mono)', fontSize: 9, color: c.isActive ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                        {c.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {c.isActive ? (
                        <button className="btn btn-ghost btn-sm" style={{ color: '#f87171', fontSize: 11 }} onClick={() => suspendMut.mutate(c.customerId)} disabled={suspendMut.isPending}>
                          <UserX size={11} />Suspend
                        </button>
                      ) : (
                        <button className="btn btn-ghost btn-sm" style={{ color: '#4ade80', fontSize: 11 }} onClick={() => reactivateMut.mutate(c.customerId)} disabled={reactivateMut.isPending}>
                          <UserCheck size={11} />Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Custom Plans */}
        {tab === 'plans' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {(!plans || plans.length === 0) && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--t3)', fontFamily: 'var(--mono)', fontSize: 11 }}>
                No custom plans yet — click "Create Plan" to add one
              </div>
            )}
            {(plans || []).map((p, i) => (
              <div key={p._id || i} style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 'var(--r4)', padding: '20px 18px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)', marginBottom: 6 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 12, lineHeight: 1.5 }}>{p.description}</div>}
                <div style={{ fontSize: 22, fontWeight: 900, color: '#a855f7', letterSpacing: '-0.5px', marginBottom: 12 }}>₹{p.priceMonthly.toLocaleString()}<span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginLeft: 3 }}>/mo</span></div>
                {[
                  [`${p.eventsPerMonth.toLocaleString()} events/mo`],
                  [`${p.endpointsLimit} endpoints`],
                  [`${p.retentionDays}-day retention`],
                ].map(([t]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                    <Check size={10} color="#4ade80" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--t2)' }}>{t}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 580 }}>
            {[
              { label: 'Company Name', key: 'companyName', type: 'text', placeholder: 'Acme Corp' },
              { label: 'Logo URL', key: 'logoUrl', type: 'text', placeholder: 'https://example.com/logo.png' },
              { label: 'Support Email', key: 'supportEmail', type: 'email', placeholder: 'support@acme.com' },
              { label: 'Custom Portal Domain', key: 'webhookPortalDomain', type: 'text', placeholder: 'webhooks.acme.com' },
            ].map(f => (
              <div className="field" key={f.key}>
                <label className="label">{f.label}</label>
                <input className="input" type={f.type} placeholder={f.placeholder} value={(profileForm as any)[f.key] || ''} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ fontSize: 12 }} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Default Markup %', key: 'defaultMarkupPct' },
                { label: 'Price per 1K Events (₹)', key: 'pricePerThousandEvents' },
              ].map(f => (
                <div className="field" key={f.key}>
                  <label className="label">{f.label}</label>
                  <input type="number" className="input" value={(profileForm as any)[f.key] || 0} onChange={e => setProfileForm(p => ({ ...p, [f.key]: Number(e.target.value) }))} style={{ fontSize: 12 }} min={0} />
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
              {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </div>

      {showAddCustomer && <AddCustomerModal onClose={() => setShowAddCustomer(false)} onAdd={(d) => addCustomer.mutate(d)} loading={addCustomer.isPending} />}
      {showCreatePlan && <CreatePlanModal onClose={() => setShowCreatePlan(false)} onCreate={(d) => createPlanMut.mutate(d)} loading={createPlanMut.isPending} />}
    </>
  );
}
