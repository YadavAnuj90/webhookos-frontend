'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import Empty from '@/components/ui/Empty';

const PID = 'default';

export default function DlqPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey:['dlq',page], queryFn:()=>eventsApi.getDlq(PID,{page,limit:20}), refetchInterval:30000 });

  const replay = useMutation({ mutationFn:(id:string)=>eventsApi.replay(PID,id), onSuccess:()=>{ toast.success('Queued for replay'); qc.invalidateQueries({queryKey:['dlq']}); } });
  const replayAll = useMutation({ mutationFn:()=>eventsApi.replayDlq(PID), onSuccess:(d:any)=>{ toast.success(d.message||'All events queued'); qc.invalidateQueries({queryKey:['dlq']}); } });

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left"><h1>Dead Letter Queue</h1><p>// Events that exhausted all {5} retry attempts</p></div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost" onClick={()=>qc.invalidateQueries({queryKey:['dlq']})}><RefreshCw size={12}/></button>
          {data?.total > 0 && (
            <button className="btn btn-danger" onClick={()=>{ if(confirm(`Replay all ${data.total} DLQ events?`)) replayAll.mutate(); }} disabled={replayAll.isPending}>
              <RotateCcw size={12}/>Replay All ({data.total})
            </button>
          )}
        </div>
      </div>

      {data?.total > 0 && (
        <div className="alert alert-red" style={{ marginBottom:20 }}>
          <AlertTriangle size={15} style={{ flexShrink:0, marginTop:1 }}/>
          <div><strong>{data.total} events</strong> permanently failed after 5 retry attempts. Review them below and replay individually or all at once.</div>
        </div>
      )}

      <div className="tbl-wrap">
        {isLoading ? <div style={{ padding:32,textAlign:'center' }}><div className="spin" style={{ margin:'0 auto' }}/></div>
        : !data?.events?.length
          ? <Empty title="Dead Letter Queue is empty" sub="All events are being delivered successfully. Great job!" />
          : (
            <table className="tbl">
              <thead><tr>
                <th>Event Type</th><th>Endpoint</th><th>Last Error</th><th>Retries</th><th>Dead At</th><th>Action</th>
              </tr></thead>
              <tbody>
                {data.events.map((e:any) => (
                  <tr key={e._id}>
                    <td><span style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--t1)' }}>{e.eventType}</span></td>
                    <td><span style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>{e.endpointId?.slice(-8)}</span></td>
                    <td>
                      <div style={{ maxWidth:220 }}>
                        {e.lastError?.statusCode && <span className="badge b-red" style={{ marginRight:5 }}>{e.lastError.statusCode}</span>}
                        <span style={{ fontSize:11,color:'var(--t3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block' }}>
                          {e.lastError?.message||'--'}
                        </span>
                      </div>
                    </td>
                    <td><span className="badge b-red">{e.retryCount}</span></td>
                    <td><span style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>{e.deadAt ? formatDistanceToNow(new Date(e.deadAt),{addSuffix:true}) : '--'}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={()=>replay.mutate(e._id)} disabled={replay.isPending}>
                        <RotateCcw size={10}/>Replay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
        {data?.total > 20 && (
          <div className="pg">
            <span className="pg-info">{(page-1)*20+1}-{Math.min(page*20,data.total)} of {data.total}</span>
            <button className="btn btn-ghost btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
            <button className="btn btn-ghost btn-sm" disabled={page*20>=data.total} onClick={()=>setPage(p=>p+1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
