'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, endpointsApi } from '@/lib/api';
import { Zap, RefreshCw, Send, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '@/components/ui/StatusBadge';
import Empty from '@/components/ui/Empty';

const PID = 'default';

function SendModal({ onClose }: { onClose:()=>void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ endpointId:'', eventType:'payment.success', payload:'{\n  "amount": 9900,\n  "currency": "INR"\n}', idempotencyKey:'' });
  const { data: eps } = useQuery({ queryKey:['eps-list'], queryFn:()=>endpointsApi.list(PID,{limit:50}) });
  const mut = useMutation({
    mutationFn: (d:any) => eventsApi.send(PID, d),
    onSuccess: () => { toast.success('Event queued for delivery'); qc.invalidateQueries({queryKey:['events']}); onClose(); },
    onError: (e:any) => toast.error(e.response?.data?.message||'Failed to send event'),
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let payload: any;
    try { payload = JSON.parse(form.payload); } catch { toast.error('Invalid JSON payload'); return; }
    mut.mutate({ ...form, payload, idempotencyKey: form.idempotencyKey||undefined });
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Send Webhook Event</span>
          <button className="btn-icon" onClick={onClose}><X size={14}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Endpoint</label>
            <select className="input" value={form.endpointId} onChange={e=>setForm(p=>({...p,endpointId:e.target.value}))} required>
              <option value="">-- Select endpoint --</option>
              {eps?.endpoints?.map((ep:any)=><option key={ep._id} value={ep._id}>{ep.name} ({ep.url})</option>)}
            </select>
          </div>
          <div className="field"><label className="label">Event Type</label><input className="input" placeholder="payment.success" value={form.eventType} onChange={e=>setForm(p=>({...p,eventType:e.target.value}))} required/></div>
          <div className="field"><label className="label">Payload (JSON)</label><textarea className="input" style={{ minHeight:130, fontFamily:'var(--mono)', fontSize:11 }} value={form.payload} onChange={e=>setForm(p=>({...p,payload:e.target.value}))} required/></div>
          <div className="field"><label className="label">Idempotency Key (optional)</label><input className="input" placeholder="Leave blank to auto-generate" value={form.idempotencyKey} onChange={e=>setForm(p=>({...p,idempotencyKey:e.target.value}))}/></div>
          <div style={{ display:'flex', gap:8 }}>
            <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={mut.isPending}>
              {mut.isPending ? 'Sending...' : <><Send size={12}/>Send Event</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [showSend, setShowSend] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['events', page, status],
    queryFn: () => eventsApi.list(PID, { page, limit:20, status:status||undefined }),
    refetchInterval: 15000,
  });

  const replay = useMutation({
    mutationFn: (id:string) => eventsApi.replay(PID, id),
    onSuccess: () => { toast.success('Queued for replay'); qc.invalidateQueries({queryKey:['events']}); },
    onError: (e:any) => toast.error(e.response?.data?.message||'Replay failed'),
  });

  const STATUS_OPTS = ['','pending','delivered','failed','dead','filtered','rate_limited'];

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left"><h1>Events</h1><p>// Webhook event log . {data?.total||0} total</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <select className="input" style={{ width:150 }} value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
            {STATUS_OPTS.map(s=><option key={s} value={s}>{s||'All Status'}</option>)}
          </select>
          <button className="btn btn-ghost" onClick={()=>qc.invalidateQueries({queryKey:['events']})}><RefreshCw size={12}/></button>
          <button className="btn btn-primary" onClick={()=>setShowSend(true)}><Zap size={12}/>Send Event</button>
        </div>
      </div>

      <div className="tbl-wrap">
        {isLoading ? <div style={{ padding:32,textAlign:'center' }}><div className="spin" style={{ margin:'0 auto' }}/></div>
        : !data?.events?.length ? <Empty title="No events" sub={status ? `No events with status "${status}".` : 'No events dispatched yet.'}/>
        : (
          <table className="tbl">
            <thead><tr>
              <th>Event Type</th><th>Endpoint</th><th>Status</th><th>Retries</th><th>Created</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {data.events.map((e:any) => (
                <tr key={e._id}>
                  <td><span style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--t1)' }}>{e.eventType}</span></td>
                  <td><span style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>{e.endpointId?.slice(-8)}</span></td>
                  <td><StatusBadge status={e.status}/></td>
                  <td><span style={{ fontFamily:'var(--mono)',fontSize:10,color:(e.retryCount>0)?'var(--yellow)':'var(--t3)' }}>{e.retryCount}</span></td>
                  <td><span style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>{formatDistanceToNow(new Date(e.createdAt),{addSuffix:true})}</span></td>
                  <td>
                    {['failed','dead'].includes(e.status) && (
                      <button className="btn btn-ghost btn-sm" onClick={()=>replay.mutate(e._id)} disabled={replay.isPending}>
                        <RefreshCw size={10}/>Replay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && data.total > 20 && (
          <div className="pg">
            <span className="pg-info">{(page-1)*20+1}-{Math.min(page*20,data.total)} of {data.total}</span>
            <button className="btn btn-ghost btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
            <button className="btn btn-ghost btn-sm" disabled={page*20>=data.total} onClick={()=>setPage(p=>p+1)}>Next</button>
          </div>
        )}
      </div>
      {showSend && <SendModal onClose={()=>setShowSend(false)}/>}
    </div>
  );
}
