'use client';
import { useRealtimeFeed } from '@/hooks/useRealtimeFeed';
import { RealtimeDeliveryEvent } from '@/lib/types';
import { Radio, Wifi, WifiOff, Trash2 } from 'lucide-react';

const TYPE_STYLES: Record<string, { color: string; label: string }> = {
  'delivery.success':     { color: '#22c55e', label: 'Delivered' },
  'delivery.failed':      { color: '#f87171', label: 'Failed' },
  'delivery.dead':        { color: '#ef4444', label: 'Dead' },
  'delivery.retry':       { color: '#fb923c', label: 'Retrying' },
  'delivery.filtered':    { color: '#94a3b8', label: 'Filtered' },
  'delivery.rate_queued':  { color: '#a78bfa', label: 'Queued' },
};

function EventRow({ ev }: { ev: RealtimeDeliveryEvent }) {
  const style = TYPE_STYLES[ev.type] || { color: 'var(--t3)', label: ev.type };
  const time = new Date(ev.timestamp).toLocaleTimeString();
  return (
    <div style={{ display:'flex',alignItems:'center',gap:8,padding:'6px 10px',borderBottom:'1px solid var(--b1)',fontSize:11 }}>
      <span style={{ width:6,height:6,borderRadius:'50%',background:style.color,flexShrink:0 }}/>
      <span style={{ fontFamily:'var(--mono)',fontSize:9,color:style.color,fontWeight:600,width:58,flexShrink:0 }}>{style.label}</span>
      <span style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t2)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
        {ev.eventType}
      </span>
      {ev.statusCode && <span style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>{ev.statusCode}</span>}
      {ev.latencyMs != null && <span style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>{ev.latencyMs}ms</span>}
      <span style={{ fontFamily:'var(--mono)',fontSize:8,color:'var(--t3)',flexShrink:0 }}>{time}</span>
    </div>
  );
}

interface LiveFeedProps {
  projectId?: string;
  endpointId?: string;
  maxHeight?: number;
}

export default function LiveFeed({ projectId = 'default', endpointId, maxHeight = 320 }: LiveFeedProps) {
  const { events, connected, clear } = useRealtimeFeed({ projectId, endpointId });

  return (
    <div className="card" style={{ padding:0,overflow:'hidden' }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 14px',borderBottom:'1px solid var(--b1)' }}>
        <Radio size={12} color={connected ? '#22c55e' : 'var(--t3)'}/>
        <span style={{ fontWeight:700,fontSize:12,flex:1 }}>Live Feed</span>
        {connected ? (
          <span style={{ display:'flex',alignItems:'center',gap:4,fontFamily:'var(--mono)',fontSize:9,color:'#22c55e' }}>
            <Wifi size={10}/>Connected
          </span>
        ) : (
          <span style={{ display:'flex',alignItems:'center',gap:4,fontFamily:'var(--mono)',fontSize:9,color:'var(--t3)' }}>
            <WifiOff size={10}/>Disconnected
          </span>
        )}
        {events.length > 0 && (
          <button onClick={clear} style={{ background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:3,color:'var(--t3)',fontFamily:'var(--mono)',fontSize:9 }}>
            <Trash2 size={9}/>Clear
          </button>
        )}
      </div>
      <div style={{ maxHeight,overflowY:'auto' }}>
        {events.length === 0 ? (
          <div style={{ textAlign:'center',padding:32,color:'var(--t3)',fontSize:11 }}>
            {connected ? 'Waiting for events...' : 'Connect to see live delivery events'}
          </div>
        ) : (
          events.map((ev, i) => <EventRow key={`${ev.eventId}-${i}`} ev={ev}/>)
        )}
      </div>
    </div>
  );
}
