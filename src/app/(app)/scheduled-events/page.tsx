'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingApi, endpointsApi } from '@/lib/api';
import { ScheduledEvent, PRIORITY_CONFIG, EventPriority } from '@/lib/types';
import { Clock, Plus, X, Calendar, RefreshCw, Trash2, Edit3, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';
import Empty from '@/components/ui/Empty';
import { SkeletonTable } from '@/components/ui/Skeleton';

const PID = 'default';

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: 'rgba(250,204,21,.12)',  color: '#facc15', label: 'Pending' },
  queued:    { bg: 'rgba(99,102,241,.12)',   color: '#818cf8', label: 'Queued' },
  delivered: { bg: 'rgba(34,197,94,.12)',    color: '#22c55e', label: 'Delivered' },
  cancelled: { bg: 'rgba(148,163,184,.12)',  color: '#94a3b8', label: 'Cancelled' },
  failed:    { bg: 'rgba(248,113,113,.12)',  color: '#f87171', label: 'Failed' },
  expired:   { bg: 'rgba(148,163,184,.12)',  color: '#64748b', label: 'Expired' },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:5, background:c.bg, color:c.color, border:`1px solid ${c.color}30` }}>
      {c.label}
    </span>
  );
}

function PriorityDot({ p }: { p: EventPriority }) {
  const cfg = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.p2;
  return <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:cfg.color }}>{cfg.emoji} {cfg.label}</span>;
}

function ScheduleModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: endpoints } = useQuery({ queryKey: ['endpoints-list'], queryFn: () => endpointsApi.list(PID) });
  const eps = endpoints?.data || endpoints || [];

  const [form, setForm] = useState({
    endpointId: '', eventType: 'payment.success',
    payload: '{\n  "amount": 9900,\n  "currency": "INR"\n}',
    scheduledFor: '', priority: 'p2', idempotencyKey: '',
  });

  const create = useMutation({
    mutationFn: (d: any) => schedulingApi.create(PID, d),
    onSuccess: () => { toast.success('Event scheduled'); qc.invalidateQueries({ queryKey: ['scheduled-events'] }); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to schedule'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let payload: any;
    try { payload = JSON.parse(form.payload); } catch { toast.error('Invalid JSON payload'); return; }
    if (!form.scheduledFor) { toast.error('Pick a schedule time'); return; }
    create.mutate({
      endpointId: form.endpointId || undefined,
      eventType: form.eventType,
      payload,
      scheduledFor: new Date(form.scheduledFor).toISOString(),
      priority: form.priority,
      idempotencyKey: form.idempotencyKey || undefined,
    });
  };

  return (
    <div style={{ position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,.6)',backdropFilter:'blur(4px)' }}>
      <div style={{ width:520,background:'var(--card)',border:'1px solid var(--b2)',borderRadius:'var(--r3)',padding:28,boxShadow:'0 24px 80px rgba(0,0,0,.5)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
          <div style={{ fontWeight:700,fontSize:15 }}>Schedule Webhook</div>
          <button className="btn-icon" onClick={onClose}><X size={14}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Endpoint</label>
            <select className="input" value={form.endpointId} onChange={e=>setForm(p=>({...p,endpointId:e.target.value}))}>
              <option value="">All active endpoints</option>
              {eps.map((ep: any) => <option key={ep._id} value={ep._id}>{ep.name} — {ep.url}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="label">Event Type</label>
              <input className="input" placeholder="payment.success" value={form.eventType} onChange={e=>setForm(p=>({...p,eventType:e.target.value}))} required/>
            </div>
            <div className="field">
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                {Object.entries(PRIORITY_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label} — {v.desc}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">Scheduled For</label>
            <input className="input" type="datetime-local" value={form.scheduledFor} onChange={e=>setForm(p=>({...p,scheduledFor:e.target.value}))} required/>
          </div>
          <div className="field">
            <label className="label">Payload (JSON)</label>
            <textarea className="input" rows={5} value={form.payload} onChange={e=>setForm(p=>({...p,payload:e.target.value}))} style={{ fontFamily:'var(--mono)',fontSize:11,resize:'vertical' }}/>
          </div>
          <div className="field">
            <label className="label">Idempotency Key (optional)</label>
            <input className="input" placeholder="unique-key-123" value={form.idempotencyKey} onChange={e=>setForm(p=>({...p,idempotencyKey:e.target.value}))}/>
          </div>
          <div style={{ display:'flex',gap:8,justifyContent:'flex-end',marginTop:8 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={create.isPending}>
              <Calendar size={11}/>{create.isPending ? 'Scheduling...' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ScheduledEventsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ScheduledEvent | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['scheduled-events', statusFilter, page],
    queryFn: () => schedulingApi.list(PID, { page, limit: 20, status: statusFilter || undefined }),
  });
  const events: ScheduledEvent[] = data?.data || data || [];
  const total = data?.total || events.length;

  const cancelMut = useMutation({
    mutationFn: (id: string) => schedulingApi.cancel(PID, id),
    onSuccess: () => { toast.success('Event cancelled'); qc.invalidateQueries({ queryKey: ['scheduled-events'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left">
          <h1>Scheduled Events</h1>
          <p>// Schedule webhooks for future delivery</p>
        </div>
        <div className="ph-right">
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={12}/>Schedule Event</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:16 }}>
        <select className="input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={{ width:160,fontSize:12 }}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <div style={{ flex:1 }}/>
        <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>{total} event{total !== 1 ? 's' : ''}</div>
        <button className="btn btn-ghost btn-sm" onClick={() => qc.invalidateQueries({ queryKey: ['scheduled-events'] })}><RefreshCw size={11}/>Refresh</button>
      </div>

      {/* Table */}
      {isLoading ? <SkeletonTable rows={6} cols={6}/> : events.length === 0 ? (
        <Empty title="No scheduled events" sub="Schedule your first webhook for future delivery." action={<button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}><Plus size={11}/>Schedule Event</button>}/>
      ) : (
        <div className="card" style={{ padding:0,overflow:'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Endpoint</th>
                <th>Scheduled For</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ width:100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev._id} style={{ cursor:'pointer' }} onClick={() => setSelected(ev)}>
                  <td>
                    <div style={{ fontWeight:600,fontSize:12 }}>{ev.eventType}</div>
                    <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',marginTop:1 }}>{ev._id.slice(-8)}</div>
                  </td>
                  <td><span style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t2)' }}>{ev.endpointId?.slice(-8) || 'All'}</span></td>
                  <td>
                    <div style={{ fontSize:11 }}>{format(new Date(ev.scheduledFor), 'MMM d, yyyy HH:mm')}</div>
                    <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',marginTop:1 }}>{formatDistanceToNow(new Date(ev.scheduledFor), { addSuffix: true })}</div>
                  </td>
                  <td><PriorityDot p={ev.priority}/></td>
                  <td><StatusBadge status={ev.status}/></td>
                  <td onClick={e => e.stopPropagation()}>
                    {ev.status === 'pending' && (
                      <button className="btn btn-danger btn-sm" style={{ padding:'3px 8px' }} onClick={() => cancelMut.mutate(ev._id)} disabled={cancelMut.isPending}>
                        <Trash2 size={10}/>Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display:'flex',justifyContent:'center',gap:8,marginTop:16 }}>
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t3)',alignSelf:'center' }}>Page {page}</span>
          <button className="btn btn-ghost btn-sm" disabled={events.length < 20} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <div style={{ position:'fixed',inset:0,zIndex:9998,display:'flex',justifyContent:'flex-end' }}>
          <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,.4)' }} onClick={() => setSelected(null)}/>
          <div style={{ width:440,background:'var(--card)',borderLeft:'1px solid var(--b2)',height:'100vh',overflowY:'auto',position:'relative',zIndex:1,padding:24 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
              <div style={{ fontWeight:700,fontSize:15 }}>Scheduled Event</div>
              <button className="btn-icon" onClick={() => setSelected(null)}><X size={14}/></button>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div><div className="label">Event Type</div><div style={{ fontWeight:600,fontSize:13 }}>{selected.eventType}</div></div>
              <div><div className="label">Status</div><StatusBadge status={selected.status}/></div>
              <div><div className="label">Priority</div><PriorityDot p={selected.priority}/></div>
              <div><div className="label">Scheduled For</div><div style={{ fontSize:12 }}>{format(new Date(selected.scheduledFor), 'PPpp')}</div></div>
              <div><div className="label">Endpoint ID</div><code style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t2)' }}>{selected.endpointId || 'All endpoints'}</code></div>
              {selected.idempotencyKey && <div><div className="label">Idempotency Key</div><code style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t2)' }}>{selected.idempotencyKey}</code></div>}
              {selected.dispatchedEventId && <div><div className="label">Dispatched Event</div><code style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--green)' }}>{selected.dispatchedEventId}</code></div>}
              {selected.cancelledReason && <div><div className="label">Cancel Reason</div><div style={{ fontSize:12,color:'var(--t2)' }}>{selected.cancelledReason}</div></div>}
              <div><div className="label">Payload</div>
                <pre style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t1)',background:'var(--card2)',padding:12,borderRadius:'var(--r2)',border:'1px solid var(--b1)',overflow:'auto',maxHeight:300 }}>
                  {JSON.stringify(selected.payload, null, 2)}
                </pre>
              </div>
              <div><div className="label">Created</div><div style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t3)' }}>{format(new Date(selected.createdAt), 'PPpp')}</div></div>
            </div>
          </div>
        </div>
      )}

      {showModal && <ScheduleModal onClose={() => setShowModal(false)}/>}
    </div>
  );
}
