'use client';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, endpointsApi, eventsApi } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Globe, AlertTriangle, TrendingUp, ArrowRight, Activity, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '@/components/ui/StatusBadge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import OnboardingBanner from '@/components/ui/OnboardingBanner';

const PID = 'default';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading: sl } = useQuery({ queryKey:['ds'], queryFn:()=>analyticsApi.summary(PID,{days:7}), refetchInterval:60000 });
  const { data: ts } = useQuery({ queryKey:['dt'], queryFn:()=>analyticsApi.timeSeries(PID,{granularity:'day'}), refetchInterval:60000 });
  const { data: eps } = useQuery({ queryKey:['de'], queryFn:()=>endpointsApi.list(PID,{limit:5}) });
  const { data: evts, isLoading: evtLoading, refetch: refetchEvts } = useQuery({ queryKey:['dv'], queryFn:()=>eventsApi.list(PID,{limit:8}), refetchInterval:30000 });
  const { data: epsAll, isLoading: epsLoading } = useQuery({ queryKey:['dep'], queryFn:()=>endpointsApi.list(PID,{limit:5}) });

  const chart = (ts||[]).map((b:any) => ({
    t: b._id?.date ? new Date(b._id.date).toLocaleDateString('en',{month:'short',day:'numeric'}) : (b._id?.hour||''),
    delivered: b.delivered||0, failed: b.failed||0,
  }));

  const stats = [
    { label:'Delivered',   val:(summary?.delivered||0).toLocaleString(), color:'var(--green)',  icon:Zap,          sub:'7-day total' },
    { label:'Failed',      val:(summary?.failed||0).toLocaleString(),    color:'var(--red)',    icon:AlertTriangle, sub:'7-day total' },
    { label:'Success Rate',val:summary?.successRate||'--',                color:'var(--a2)',     icon:TrendingUp,   sub:'7-day avg' },
    { label:'Endpoints',   val:(eps?.total||0).toString(),               color:'var(--yellow)', icon:Globe,        sub:'Total active' },
  ];

  return (
    <div className="page">
      {/* Onboarding */}
      <OnboardingBanner />

      {/* Header */}
      <div className="ph">
        <div className="ph-left">
          <h1>Dashboard</h1>
          <p>// Hello {user?.firstName} . {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <Link href="/events" className="btn btn-primary" style={{ textDecoration:'none' }}>
          <Zap size={12}/>Send Event
        </Link>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {stats.map(({ label, val, color, icon:Icon, sub }) => (
          <div key={label} className="stat-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span className="stat-lbl">{label}</span>
              <div style={{ width:30,height:30,borderRadius:8,background:`${color}15`,border:`1px solid ${color}28`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Icon size={13} style={{ color }}/>
              </div>
            </div>
            <div className="stat-val" style={{ color }}>{sl ? <span className="skel" style={{width:80,height:26,display:'block'}}/> : val}</div>
            <div className="stat-trend">{sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card mb-6">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:'var(--t1)' }}>Delivery Volume -- 7 Days</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--t3)', marginTop:2 }}>delivered vs failed</div>
          </div>
          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
            {[{c:'var(--green)',l:'Delivered'},{c:'var(--red)',l:'Failed'}].map(({ c, l }) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:8,height:8,borderRadius:2,background:c }}/>
                <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--t3)' }}>{l}</span>
              </div>
            ))}
            <Link href="/analytics" style={{ display:'flex',alignItems:'center',gap:4,fontFamily:'var(--mono)',fontSize:9,color:'var(--a2)' }}>
              Full report <ArrowRight size={9}/>
            </Link>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chart} margin={{ top:0, right:0, left:-28, bottom:0 }}>
            <defs>
              <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--green)" stopOpacity={0.22}/><stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--red)" stopOpacity={0.18}/><stop offset="95%" stopColor="var(--red)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,180,.07)"/>
            <XAxis dataKey="t" tick={{ fontFamily:'var(--mono)',fontSize:9,fill:'var(--t3)' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontFamily:'var(--mono)',fontSize:9,fill:'var(--t3)' }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background:'var(--card2)',border:'1px solid var(--b2)',borderRadius:8,fontFamily:'var(--mono)',fontSize:11,color:'var(--t1)' }}/>
            <Area type="monotone" dataKey="delivered" stroke="var(--green)" fill="url(#gG)" strokeWidth={1.5} name="Delivered"/>
            <Area type="monotone" dataKey="failed" stroke="var(--red)" fill="url(#gR)" strokeWidth={1.5} name="Failed"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom rows */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Recent Events */}
        <div className="tbl-wrap">
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:'1px solid var(--b1)' }}>
            <div style={{ fontWeight:700,fontSize:13 }}>Recent Events</div>
            <div style={{ display:'flex',gap:8,alignItems:'center' }}>
              <button onClick={()=>refetchEvts()} className="btn-icon btn-sm"><RefreshCw size={11}/></button>
              <Link href="/events" style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--a2)' }}>View all →</Link>
            </div>
          </div>
          {evtLoading ? (
            <table className="tbl"><thead><tr><th>Type</th><th>Status</th><th>Time</th></tr></thead>
              <SkeletonTable rows={5} cols={3} /></table>
          ) : evts?.events?.length ? (
            <table className="tbl"><tbody>
              {evts.events.map((e:any) => (
                <tr key={e._id}>
                  <td><span style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--t1)' }}>{e.eventType}</span></td>
                  <td><StatusBadge status={e.status}/></td>
                  <td style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',textAlign:'right' }}>
                    {formatDistanceToNow(new Date(e.createdAt),{addSuffix:true})}
                  </td>
                </tr>
              ))}
            </tbody></table>
          ) : (
            <div style={{ padding:'32px 20px', textAlign:'center', color:'var(--t3)', fontSize:12 }}>
              No events yet. <Link href="/events" style={{ color:'var(--a2)' }}>Send your first one →</Link>
            </div>
          )}
        </div>

        {/* Endpoints */}
        <div className="tbl-wrap">
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:'1px solid var(--b1)' }}>
            <div style={{ fontWeight:700,fontSize:13 }}>Endpoints</div>
            <Link href="/endpoints" style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--a2)' }}>View all →</Link>
          </div>
          {eps?.endpoints?.length ? (
            <table className="tbl"><tbody>
              {eps.endpoints.map((ep:any) => (
                <tr key={ep._id}>
                  <td>
                    <div style={{ fontWeight:600,fontSize:12,color:'var(--t1)' }}>{ep.name}</div>
                    <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{ep.url}</div>
                  </td>
                  <td style={{ textAlign:'right' }}><StatusBadge status={ep.status}/></td>
                </tr>
              ))}
            </tbody></table>
          ) : (
            <div style={{ padding:'32px 20px', textAlign:'center', color:'var(--t3)', fontSize:12 }}>
              No endpoints. <Link href="/endpoints" style={{ color:'var(--a2)' }}>Create one →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
