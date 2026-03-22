'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi, eventsApi } from '@/lib/api';
import { DlqTriageReport as TriageReport, DlqTriageGroup } from '@/lib/types';
import { Sparkles, RotateCcw, AlertCircle, Zap, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAiStatus } from '@/hooks/useAiStatus';
import { AiProviderBadge, AiNotConfiguredBanner } from './AiProviderBadge';

const PID = 'default';

const PRIORITY_CFG = {
  critical: { color: '#f87171', bg: 'rgba(248,113,113,.12)', dot: '🔴' },
  high:     { color: '#fb923c', bg: 'rgba(251,146,60,.12)',  dot: '🟠' },
  medium:   { color: '#fbbf24', bg: 'rgba(251,191,36,.12)',  dot: '🟡' },
  low:      { color: '#4ade80', bg: 'rgba(74,222,128,.12)',  dot: '🟢' },
};

const FAILURE_LABELS: Record<string, string> = {
  network: '🌐 Network',
  auth: '🔐 Auth',
  client_error: '⚠️ Client Error',
  server_error: '💥 Server Error',
  schema: '📋 Schema',
  timeout: '⏱ Timeout',
  unknown: '❓ Unknown',
};

function GroupCard({ group, onReplay }: { group: DlqTriageGroup; onReplay: (ids: string[]) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = PRIORITY_CFG[group.priority];

  return (
    <div style={{ border: `1px solid ${cfg.color}30`, borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', background: cfg.bg }}
        onClick={() => setExpanded(v => !v)}
      >
        <span style={{ fontSize: 12 }}>{cfg.dot}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {group.pattern}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', marginTop: 2 }}>
            {FAILURE_LABELS[group.failureType] || group.failureType} · {group.count} event{group.count !== 1 ? 's' : ''}
          </div>
        </div>
        {group.canAutoReplay && (
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', borderRadius: 5, background: 'rgba(74,222,128,.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,.25)', whiteSpace: 'nowrap' }}>
            ✅ Auto-replay
          </span>
        )}
        {expanded ? <ChevronDown size={12} color="var(--t3)" /> : <ChevronRight size={12} color="var(--t3)" />}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,.15)', borderTop: `1px solid ${cfg.color}20` }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 10 }}>
            <strong style={{ color: '#a855f7' }}>Suggested Fix:</strong> {group.suggestedFix}
          </div>
          {group.fixCommand && (
            <div style={{ background: 'rgba(0,0,0,.3)', borderRadius: 7, padding: '7px 11px', fontFamily: 'var(--mono)', fontSize: 11, color: '#a5b4fc', marginBottom: 12 }}>
              $ {group.fixCommand}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            {group.canAutoReplay && group.eventIds.length > 0 && (
              <button
                onClick={() => onReplay(group.eventIds)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(74,222,128,.35)', background: 'rgba(74,222,128,.1)', color: '#4ade80', fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                <RotateCcw size={11} />Replay {group.eventIds.length} events
              </button>
            )}
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', alignSelf: 'center' }}>
              IDs: {group.eventIds.slice(0, 3).map(id => id.slice(-6)).join(', ')}{group.eventIds.length > 3 ? ` +${group.eventIds.length - 3}` : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DlqTriageReport() {
  const qc = useQueryClient();
  const { status: aiStatus } = useAiStatus();
  const [report, setReport] = useState<TriageReport | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const triage = useMutation({
    mutationFn: () => aiApi.triageDlq(PID),
    onSuccess: (d: TriageReport) => setReport(d),
    onError: (e: any) => {
      const msg = e.response?.data?.message || '';
      if (msg.toLowerCase().includes('gemini') || msg.toLowerCase().includes('api_key') || e.response?.status === 503) {
        setApiKeyMissing(true);
      } else {
        toast.error('AI triage failed. Please try again.');
      }
    },
  });

  const replayGroup = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => eventsApi.replay(PID, id))),
    onSuccess: () => { toast.success('Events queued for replay'); qc.invalidateQueries({ queryKey: ['dlq'] }); },
    onError: () => toast.error('Some replays failed'),
  });

  if (!report && !triage.isPending && !apiKeyMissing) {
    return (
      <div style={{ background: 'rgba(168,85,247,.05)', border: '1px solid rgba(168,85,247,.2)', borderRadius: 12, padding: '28px 24px', textAlign: 'center', marginBottom: 20 }}>
        {!aiStatus.configured && <AiNotConfiguredBanner />}
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>AI-Powered DLQ Triage</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--t3)', marginBottom: 18, lineHeight: 1.5 }}>
          Let {aiStatus.configured ? aiStatus.label : 'AI'} analyze your dead events, group failures by root cause, and suggest targeted fixes.
        </div>
        <button
          onClick={() => triage.mutate()}
          disabled={!aiStatus.configured}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 9, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', border: 'none', color: '#fff', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, cursor: aiStatus.configured ? 'pointer' : 'not-allowed', opacity: aiStatus.configured ? 1 : 0.5 }}
        >
          <Sparkles size={13} />✨ Run AI Triage
        </button>
      </div>
    );
  }

  if (triage.isPending) {
    return (
      <div style={{ background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.2)', borderRadius: 12, padding: '24px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 20, height: 20, border: '2px solid rgba(168,85,247,.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin .7s linear infinite', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#c084fc', fontWeight: 500 }}>✨ Triaging your dead events...</span>
        </div>
        {[90, 70, 60, 80, 50].map((w, i) => (
          <div key={i} className="skel" style={{ height: 12, borderRadius: 6, marginBottom: 8, width: `${w}%`, opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  if (apiKeyMissing) {
    return (
      <div style={{ background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.25)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 10, marginBottom: 20 }}>
        <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#fbbf24', lineHeight: 1.5 }}>
          AI features require a Gemini API key. Contact your admin.
        </div>
      </div>
    );
  }

  if (!report) return null;

  const recoveryPct = Math.round(report.estimatedRecoveryRate * 100);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Summary card */}
      <div style={{ background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.22)', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={13} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>AI Triage Report</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#a855f7' }}>{report.totalDead} dead events · {report.groups.length} failure groups</div>
            </div>
          </div>
          <button
            onClick={() => { setReport(null); setApiKeyMissing(false); }}
            style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--b2)', background: 'none', color: 'var(--t3)', cursor: 'pointer' }}
          >
            Re-run
          </button>
        </div>

        <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 14 }}>{report.summary}</p>

        {/* Recovery rate bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Estimated Recovery Rate</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: recoveryPct >= 70 ? '#4ade80' : recoveryPct >= 40 ? '#fbbf24' : '#f87171' }}>{recoveryPct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${recoveryPct}%`, borderRadius: 6, background: recoveryPct >= 70 ? 'linear-gradient(90deg,#4ade80,#22d3ee)' : recoveryPct >= 40 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : 'linear-gradient(90deg,#f87171,#fb923c)', transition: 'width .5s ease' }} />
          </div>
        </div>

        {/* Quick wins */}
        {report.quickWins?.length > 0 && (
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 7 }}>Quick Wins</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {report.quickWins.map((win, i) => (
                <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                  <CheckCircle size={12} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--t2)', lineHeight: 1.45 }}>{win}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Failure groups */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
        Failure Groups
      </div>
      {report.groups.map((group, i) => (
        <GroupCard
          key={i}
          group={group}
          onReplay={(ids) => replayGroup.mutate(ids)}
        />
      ))}

      {/* Provider badge */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <AiProviderBadge status={aiStatus} />
      </div>
    </div>
  );
}
