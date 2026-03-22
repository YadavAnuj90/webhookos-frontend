'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import { Invoice, InvoiceLineItem } from '@/lib/types';
import { Receipt, ArrowLeft, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'PAID',  color: '#4ade80', bg: 'rgba(74,222,128,.12)'  },
  open: { label: 'OPEN',  color: '#fbbf24', bg: 'rgba(251,191,36,.12)'  },
  void: { label: 'VOID',  color: '#94a3b8', bg: 'rgba(148,163,184,.1)'  },
};

const TYPE_LABEL: Record<string, string> = {
  subscription: 'Monthly Subscription',
  credit:       'Credit Package Purchase',
  usage:        'Usage-Based Billing',
};

function InvoiceModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const st = STATUS_CFG[invoice.status] || STATUS_CFG.void;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal modal-lg" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--b1)', paddingBottom: 14 }}>
          <div>
            <div className="modal-title">Invoice #{invoice.invoiceNumber}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>
              {TYPE_LABEL[invoice.type] || invoice.type}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 5, background: st.bg, border: `1px solid ${st.color}30`, fontFamily: 'var(--mono)', fontSize: 9, color: st.color, fontWeight: 700 }}>{st.label}</span>
            <button className="btn-icon" onClick={onClose}><X size={14} /></button>
          </div>
        </div>

        <div style={{ paddingTop: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            {[
              ['Period', `${format(new Date(invoice.periodStart), 'dd MMM yyyy')} – ${format(new Date(invoice.periodEnd), 'dd MMM yyyy')}`],
              ['Currency', invoice.currency?.toUpperCase()],
              ...(invoice.paidAt ? [['Paid On', format(new Date(invoice.paidAt), 'dd MMM yyyy')]] : []),
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 12, color: 'var(--t1)' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Line items */}
          <div className="tbl-wrap" style={{ marginBottom: 14 }}>
            <table className="tbl">
              <thead><tr><th>Description</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Unit Price</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
              <tbody>
                {(invoice.lineItems || []).map((li: InvoiceLineItem, i: number) => (
                  <tr key={i}>
                    <td style={{ fontSize: 12 }}>{li.description}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11 }}>{li.quantity?.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11 }}>₹{li.unitPrice?.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>₹{li.total?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--card2)', borderRadius: 8 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase' }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--t1)', letterSpacing: '-0.5px' }}>
              {invoice.currency === 'inr' ? '₹' : '$'}{invoice.total?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [selected, setSelected] = useState<Invoice | null>(null);

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: () => billingApi.getInvoices(),
  });

  return (
    <>
      <div className="page">
        <div className="ph">
          <div className="ph-left">
            <h1>Invoices</h1>
            <p>// Billing history and payment receipts</p>
          </div>
          <Link href="/billing" style={{ textDecoration: 'none' }}>
            <button className="btn btn-ghost"><ArrowLeft size={12} />Back to Billing</button>
          </Link>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Description</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24 }}><div style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid var(--b2)', borderTopColor: 'var(--a)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /></td></tr>
              )}
              {!isLoading && (!invoices || invoices.length === 0) && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <FileText size={24} color="var(--t3)" />
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>No invoices yet</span>
                    </div>
                  </td>
                </tr>
              )}
              {(invoices || []).map((inv, i) => {
                const st = STATUS_CFG[inv.status] || STATUS_CFG.void;
                return (
                  <tr key={inv._id || i} style={{ cursor: 'pointer' }} onClick={() => setSelected(inv)}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'var(--a2)' }}>#{inv.invoiceNumber}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>
                      {inv.paidAt ? format(new Date(inv.paidAt), 'dd MMM yyyy') : format(new Date(inv.periodEnd), 'dd MMM yyyy')}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--t2)' }}>{TYPE_LABEL[inv.type] || inv.type}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t3)' }}>
                      {format(new Date(inv.periodStart), 'dd MMM')} – {format(new Date(inv.periodEnd), 'dd MMM yyyy')}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>
                      {inv.currency === 'inr' ? '₹' : '$'}{inv.total?.toLocaleString()}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', padding: '2px 9px', borderRadius: 5, background: st.bg, border: `1px solid ${st.color}30`, fontFamily: 'var(--mono)', fontSize: 9, color: st.color, fontWeight: 700 }}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <InvoiceModal invoice={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
