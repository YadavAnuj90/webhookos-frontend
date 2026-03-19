'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Globe, Zap, Key, BarChart3, X, ChevronRight, Rocket } from 'lucide-react';

const STORAGE_KEY = 'whk-onboarding-dismissed';

const STEPS = [
  {
    id: 'endpoint',
    icon: Globe,
    color: '#4f46e5',
    bg: 'rgba(79,70,229,.12)',
    title: 'Create your first endpoint',
    desc: 'Add a URL where webhooks will be delivered.',
    action: 'Create Endpoint',
    href: '/endpoints',
  },
  {
    id: 'event',
    icon: Zap,
    color: '#22c55e',
    bg: 'rgba(34,197,94,.12)',
    title: 'Send a test event',
    desc: 'Fire a webhook and watch it arrive in real time.',
    action: 'Send Event',
    href: '/events',
  },
  {
    id: 'apikey',
    icon: Key,
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,.12)',
    title: 'Generate an API key',
    desc: 'Integrate WebhookOS into your backend securely.',
    action: 'Get API Key',
    href: '/api-keys',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,.12)',
    title: 'Explore analytics',
    desc: 'Track delivery rates, latency, and event types.',
    action: 'View Analytics',
    href: '/analytics',
  },
];

function getCompletedSteps(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('whk-onboarding-steps');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function markStepDone(id: string) {
  if (typeof window === 'undefined') return;
  const steps = getCompletedSteps();
  steps.add(id);
  localStorage.setItem('whk-onboarding-steps', JSON.stringify(Array.from(steps)));
}

export default function OnboardingBanner() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(true); // start hidden, load from storage
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dim = localStorage.getItem(STORAGE_KEY) === '1';
    setDismissed(dim);
    setCompleted(getCompletedSteps());
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  const handleStep = (step: typeof STEPS[number]) => {
    markStepDone(step.id);
    setCompleted(getCompletedSteps());
    router.push(step.href);
  };

  const toggle = (id: string) => {
    const next = new Set(completed);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setCompleted(next);
    localStorage.setItem('whk-onboarding-steps', JSON.stringify(Array.from(next)));
  };

  if (!mounted || dismissed) return null;

  const doneCount = STEPS.filter(s => completed.has(s.id)).length;
  const allDone = doneCount === STEPS.length;

  return (
    <div
      style={{
        margin: '0 0 28px',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(79,70,229,.06)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(79,70,229,.08), rgba(139,92,246,.06))',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Rocket size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            {allDone ? '🎉 You\'re all set!' : 'Quick Start'}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>
            {allDone
              ? 'You\'ve completed the setup. Welcome to WebhookOS!'
              : `${doneCount} of ${STEPS.length} steps completed`
            }
          </div>
        </div>

        {/* Progress bar */}
        {!allDone && (
          <div style={{ width: 100, flexShrink: 0 }}>
            <div style={{ height: 5, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 10,
                background: 'linear-gradient(90deg,#4f46e5,#7c3aed)',
                width: `${(doneCount / STEPS.length) * 100}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)', marginTop: 3, textAlign: 'right' }}>
              {Math.round((doneCount / STEPS.length) * 100)}%
            </div>
          </div>
        )}

        <button
          onClick={dismiss}
          title="Dismiss"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 4, borderRadius: 6, flexShrink: 0 }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = completed.has(step.id);
          return (
            <div
              key={step.id}
              style={{
                padding: '16px 18px',
                borderRight: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
                background: done ? 'rgba(34,197,94,.03)' : 'transparent',
                transition: 'background 0.2s',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: done ? 'rgba(34,197,94,.1)' : step.bg,
                  border: `1px solid ${done ? 'rgba(34,197,94,.25)' : step.color + '25'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={14} color={done ? '#22c55e' : step.color} />
                </div>
                <button
                  onClick={() => toggle(step.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', marginLeft: 'auto' }}
                  title={done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {done
                    ? <CheckCircle2 size={16} color="var(--green)" />
                    : <Circle size={16} color="var(--text3)" />
                  }
                </button>
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                  color: done ? 'var(--text3)' : 'var(--text)',
                  textDecoration: done ? 'line-through' : 'none',
                  marginBottom: 3,
                }}>
                  {step.title}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
                  {step.desc}
                </div>
              </div>

              {!done && (
                <button
                  onClick={() => handleStep(step)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'none', border: `1px solid ${step.color}40`,
                    borderRadius: 7, padding: '5px 10px',
                    fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
                    color: step.color, cursor: 'pointer',
                    marginTop: 'auto',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = step.bg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                >
                  {step.action} <ChevronRight size={11} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
