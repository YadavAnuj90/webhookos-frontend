'use client';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { AiProviderStatus } from '@/lib/types';

/** Small "Powered by …" badge shown at the bottom of AI result panels */
export function AiProviderBadge({ status }: { status: AiProviderStatus }) {
  if (!status.configured) return null;
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--t3)',
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <Sparkles size={9} color="#a855f7" />
      Powered by {status.label} ✨
    </span>
  );
}

/** Full-width warning banner when AI is not configured */
export function AiNotConfiguredBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.28)',
      borderRadius: 10, padding: '12px 16px', marginBottom: 16,
    }}>
      <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#fbbf24', lineHeight: 1.55 }}>
        <strong>AI features are not configured.</strong> Contact your admin to set up an AI provider (DeepSeek or Gemini).
      </div>
    </div>
  );
}
