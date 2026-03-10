'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Zap, AlertTriangle, Clock, Gauge } from 'lucide-react';

const PID = 'default';
const COLORS = ['var(--a2)','var(--green)','var(--yellow)','var(--red)','var(--blue)','var(--orange)'];

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const { data: summary } = useQuery({ queryKey:['as',days], queryFn:()=>analyticsApi.summary(PID,{days}) });
  const { data: ts } = useQuery({ queryKey:['ats',days], queryFn:()=>analyticsApi.timeSeries(PID,{granularity:days<=7?'hour':'day'}) });
  const { data: types } = useQuery({ queryKey:['att',days], queryFn:()=>analyticsApi.eventTypes(PID,{days}) });

  const chart = (ts||[]).map((b:any) => ({
    t: b._id?.date ? new Date(b._id.date).toLocaleDateString('en',{month:'short',day:'numeric'}) : `${b._id?.hour}:00`,
    delivered: b.delivered||0, failed: b.failed||0,
    avgLatency: b.deliveryCount>0 ? Math.round(b.totalLatencyMs/b.deliveryCount) : 0,
  }));

  const pieData = (types||[]).slice(0,6).map((t:any) => ({ name:t.eventType, value:t.count }));

  const stats = [
    { label:'Total Delivered', val:(summary?.delivered||0).toLocaleString(), color:'var(--green)',  icon:Zap },
    { label:'Total Failed',    val:(summary?.failed||0).toLocaleString(),    color:'var(--red)',    icon:AlertTriangle },
    { label:'Success Rate',    val:summary?.successRate||'--',                color:'var(--a2)',     icon:TrendingUp },
    { label:'Avg Latency',     val:summary?.avgLatencyMs ? `${summary.avgLatencyMs}ms` : '--', color:'var(--yellow)', icon:Clock },
  ];

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-left"><h1>Analytics</h1><p>// Delivery metrics and trends</p></div>
        <div style={{ display:'flex', gap:6 }}>
          {[7,14,30].map(d => (
            <button key={d} className={`btn ${days===d?'btn-primary':'btn-ghost'} btn-sm`} onClick={()=>setDays(d)}>{d}d</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {stats.map(({ label, val, color, icon:Icon }) => (
          <div key={label} className="stat-card">
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <span className="stat-lbl">{label}</span>
              <div style={{ width:30,height:30,borderRadius:8,background:`${color}15`,border:`1px solid ${color}28`,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <Icon size={13} style={{ color }}/>
              </div>
            </div>
            <div className="stat-val" style={{ color }}>{val}</div>
            <div className="stat-trend">Last {days} days</div>
          </div>
        ))}
      </div>

      {/* Time series */}
      <div className="card mb-4">
        <div style={{ fontWeight:700,fontSize:13,color:'var(--t1)',marginBottom:4 }}>Delivery Volume</div>
        <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',marginBottom:16 }}>Delivered vs failed over time</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chart} margin={{ top:0,right:0,left:-28,bottom:0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--green)" stopOpacity={.2}/><stop offset="95%" stopColor="var(--green)" stopOpacity={0}/></linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--red)" stopOpacity={.15}/><stop offset="95%" stopColor="var(--red)" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,180,.07)"/>
            <XAxis dataKey="t" tick={{ fontFamily:'var(--mono)',fontSize:9,fill:'var(--t3)' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontFamily:'var(--mono)',fontSize:9,fill:'var(--t3)' }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background:'var(--card2)',border:'1px solid var(--b2)',borderRadius:8,fontFamily:'var(--mono)',fontSize:11,color:'var(--t1)' }}/>
            <Area type="monotone" dataKey="delivered" stroke="var(--green)" fill="url(#g1)" strokeWidth={1.5} name="Delivered"/>
            <Area type="monotone" dataKey="failed" stroke="var(--red)" fill="url(#g2)" strokeWidth={1.5} name="Failed"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Latency */}
        <div className="card">
          <div style={{ fontWeight:700,fontSize:13,color:'var(--t1)',marginBottom:4 }}>Avg Latency (ms)</div>
          <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',marginBottom:16 }}>Response time per period</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chart.slice(-14)} margin={{ top:0,right:0,left:-28,bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,120,180,.07)"/>
              <XAxis dataKey="t" tick={{ fontFamily:'var(--mono)',fontSize:8,fill:'var(--t3)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontFamily:'var(--mono)',fontSize:8,fill:'var(--t3)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'var(--card2)',border:'1px solid var(--b2)',borderRadius:8,fontFamily:'var(--mono)',fontSize:11,color:'var(--t1)' }} formatter={(v:any)=>[`${v}ms`,'Avg Latency']}/>
              <Bar dataKey="avgLatency" fill="var(--a2)" radius={[3,3,0,0]} name="Latency ms"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Event types pie */}
        <div className="card">
          <div style={{ fontWeight:700,fontSize:13,color:'var(--t1)',marginBottom:4 }}>Event Types</div>
          <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)',marginBottom:8 }}>Distribution by type</div>
          {pieData.length ? (
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                    {pieData.map((_:any,i:number)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'var(--card2)',border:'1px solid var(--b2)',borderRadius:8,fontFamily:'var(--mono)',fontSize:11,color:'var(--t1)' }}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1 }}>
                {pieData.map((d:any,i:number) => (
                  <div key={d.name} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                      <div style={{ width:8,height:8,borderRadius:2,background:COLORS[i%COLORS.length] }}/>
                      <span style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t2)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t3)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ padding:'32px',textAlign:'center',color:'var(--t3)',fontSize:12 }}>No data yet</div>}
        </div>
      </div>
    </div>
  );
}
