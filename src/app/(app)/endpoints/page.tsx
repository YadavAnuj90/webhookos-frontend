'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpointsApi } from '@/lib/api';
import { Globe, Plus, Pause, Play, Trash2, RotateCcw, Copy, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import Empty from '@/components/ui/Empty';

const PID = 'default';

function CreateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name:'', url:'', eventTypes:'', timeoutMs:30000 });
  const mut = useMutation({
    mutationFn: (d: any) => endpointsApi.create(PID, d),
    onSuccess: () => { toast.success('Endpoint created'); qc.invalidateQueries({ queryKey:['endpoints'] }); onClose(); },
    onError: (e:any) => toast.error(e.response?.data?.message||'Failed'),
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ ...form, eventTypes: form.eventTypes ? form.eventTypes.split(',').map((s:string)=>s.trim()) : [] });
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create Endpoint</span>
          <button className="btn-icon" onClick={onClose}><X size={14}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="field"><label className="label">Name</label><input className="input" placeholder="My API Server" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required/></div>
          <div className="field"><label className="label">URL</label><input className="input" type="url" placeholder="https://api.example.com/webhooks" value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} required/></div>
          <div className="field"><label className="label">Event Types (comma-separated, blank = all)</label><input className="input" placeholder="payment.success, order.created" value={form.eventTypes} onChange={e=>setForm(p=>({...p,eventTypes:e.target.value}))}/></div>
          <div className="field"><label className="label">Timeout (ms)</label><input className="input" type="number" value={form.timeoutMs} onChange={e=>setForm(p=>({...p,timeoutMs:+e.target.value}))}/></div>
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={mut.isPending}>
              {mut.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EndpointsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['endpoints', page, statusFilter],
    queryFn: () => endpointsApi.list(PID, { page, limit:15, status:statusFilter||undefined }),
  });

  const pause   = useMutation({ mutationFn:(id:string)=>endpointsApi.pause(PID,id),   onSuccess:()=>{ toast.success('Paused');   qc.invalidateQueries({queryKey:['endpoints']}); } });
  const resume  = useMutation({ mutationFn:(id:string)=>endpointsApi.resume(PID,id),  onSuccess:()=>{ toast.success('Resumed');  qc.invalidateQueries({queryKey:['endpoints']}); } });
  const del     = useMutation({ mutationFn:(id:string)=>endpointsApi.delete(PID,id),  onSuccess:()=>{ toast.success('Deleted');  qc.invalidateQueries({queryKey:['endpoints']}); } });
  const rotate  = useMutation({ mutationFn:(id:string)=>endpointsApi.rotateSecret(PID,id), onSuccess:(d)=>{ toast.success(`New secret: ${d.secret}`); } });

  const copySecret = (secret: string) => { navigator.clipboard.writeText(secret); toast.success('Secret copied'); };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left"><h1>Endpoints</h1><p>// Webhook delivery targets . {data?.total||0} total</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <select className="input" style={{ width:130 }} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="disabled">Disabled</option>
          </select>
          <button className="btn btn-primary" onClick={()=>setShowCreate(true)}><Plus size={13}/>Add Endpoint</button>
        </div>
      </div>

      <div className="tbl-wrap">
        {isLoading ? (
          <div style={{ padding:32, textAlign:'center' }}><div className="spin" style={{ margin:'0 auto' }}/></div>
        ) : !data?.endpoints?.length ? (
          <Empty title="No endpoints yet" sub="Create your first endpoint to start receiving webhooks." action={<button className="btn btn-primary" onClick={()=>setShowCreate(true)}><Plus size={13}/>Create Endpoint</button>}/>
        ) : (
          <table className="tbl">
            <thead><tr>
              <th>Name</th><th>URL</th><th>Status</th><th>Event Types</th>
              <th>Success / Fail</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {data.endpoints.map((ep:any) => (
                <tr key={ep._id}>
                  <td><div style={{ fontWeight:600,color:'var(--t1)',fontSize:12.5 }}>{ep.name}</div><div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>ID: {ep._id?.slice(-8)}</div></td>
                  <td><div style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t2)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{ep.url}</div></td>
                  <td><StatusBadge status={ep.status}/></td>
                  <td><div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                    {ep.eventTypes?.length ? ep.eventTypes.slice(0,3).map((t:string)=><span key={t} className="badge b-accent">{t}</span>) : <span className="badge b-gray">all</span>}
                  </div></td>
                  <td><span style={{ fontFamily:'var(--mono)',fontSize:10 }}><span style={{ color:'var(--green)' }}>{ep.totalDelivered||0}</span> / <span style={{ color:'var(--red)' }}>{ep.totalFailed||0}</span></span></td>
                  <td>
                    <div style={{ display:'flex', gap:5 }}>
                      {ep.status==='active'
                        ? <button className="btn-icon btn-sm" data-tip="Pause" onClick={()=>pause.mutate(ep._id)}><Pause size={11}/></button>
                        : <button className="btn-icon btn-sm" data-tip="Resume" onClick={()=>resume.mutate(ep._id)}><Play size={11}/></button>
                      }
                      <button className="btn-icon btn-sm" data-tip="Rotate secret" onClick={()=>rotate.mutate(ep._id)}><RotateCcw size={11}/></button>
                      {ep.secret && <button className="btn-icon btn-sm" data-tip="Copy secret" onClick={()=>copySecret(ep.secret)}><Copy size={11}/></button>}
                      <button className="btn-icon btn-sm" style={{ color:'var(--red)',borderColor:'var(--rbd)' }} data-tip="Delete" onClick={()=>{ if(confirm(`Delete "${ep.name}"?`)) del.mutate(ep._id); }}><Trash2 size={11}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data && data.total > 15 && (
          <div className="pg">
            <span className="pg-info">Showing {(page-1)*15+1}-{Math.min(page*15,data.total)} of {data.total}</span>
            <button className="btn btn-ghost btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
            <button className="btn btn-ghost btn-sm" disabled={page*15>=data.total} onClick={()=>setPage(p=>p+1)}>Next</button>
          </div>
        )}
      </div>
      {showCreate && <CreateModal onClose={()=>setShowCreate(false)}/>}
    </div>
  );
}
