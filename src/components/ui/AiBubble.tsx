'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useProjectStore, useAuthStore } from '@/lib/store';
import { aiApi } from '@/lib/api';
import {
  Sparkles, X, Send, Zap, Shield, Bug, BarChart3,
  AlertTriangle, FileJson, ChevronRight, Loader2, ArrowLeft,
  Bot, MessageSquare, Copy, Check, RotateCcw, Trash2,
  Plus, Mic, Paperclip,
} from 'lucide-react';

const SUGGESTIONS = [
  { id: 'debug', icon: Bug, label: 'Debug delivery issues', color: '#a855f7' },
  { id: 'triage', icon: AlertTriangle, label: 'Triage dead letters', color: '#f59e0b' },
  { id: 'pii', icon: Shield, label: 'Scan for PII', color: '#22c55e' },
  { id: 'schema', icon: FileJson, label: 'Generate schema', color: '#3b82f6' },
  { id: 'status', icon: BarChart3, label: 'AI system status', color: '#06b6d4' },
];

type Message = {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  time: string;
  status?: 'sending' | 'sent' | 'error';
};

let msgCounter = 0;
const uid = () => `msg-${++msgCounter}-${Date.now()}`;

export default function AiBubble() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pulseRing, setPulseRing] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { projectId } = useProjectStore();
  const { user } = useAuthStore();

  const userName = user?.firstName
    ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
    : 'there';
  const userInitial = (user?.firstName || user?.email || 'U')[0].toUpperCase();

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setPulseRing(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const bubble = document.getElementById('ai-bubble-btn');
        if (bubble && bubble.contains(e.target as Node)) return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const callAi = useCallback(async (actionId: string, customQ?: string) => {
    const userMsg = customQ || SUGGESTIONS.find(s => s.id === actionId)?.label || 'Ask AI';
    const userMsgObj: Message = { id: uid(), role: 'user', content: userMsg, time: now(), status: 'sent' };
    setMessages(prev => [...prev, userMsgObj]);
    setLoading(true);

    try {
      let response = '';
      if (!projectId && actionId !== 'status') {
        response = 'Please select a project first to use AI features.';
      } else {
        switch (actionId) {
          case 'debug': {
            const q = customQ || 'What are the recent webhook delivery issues and how can I fix them?';
            const data = await aiApi.debug(projectId, { question: q, hours: 24 });
            response = data?.answer || data?.analysis || data?.message || JSON.stringify(data, null, 2);
            break;
          }
          case 'triage': {
            const data = await aiApi.triageDlq(projectId);
            if (data?.summary) response = data.summary;
            else if (data?.results?.length) response = data.results.map((r: any) => `• ${r.eventType || 'Event'}: ${r.recommendation || r.issue || 'Check manually'}`).join('\n');
            else response = data?.message || 'No dead letter events found — your DLQ is clean!';
            break;
          }
          case 'pii': {
            const samplePayload = { email: 'test@example.com', name: 'John Doe', event: 'user.created' };
            const data = await aiApi.detectPiiStandalone(samplePayload);
            if (data?.findings?.length) response = `Found ${data.findings.length} PII field(s):\n\n${data.findings.map((f: any) => `• **${f.field}**: ${f.type} (${f.risk || 'medium'} risk)`).join('\n')}`;
            else response = data?.message || 'No PII detected in the sample payload. Your data looks clean!';
            break;
          }
          case 'schema': {
            const samplePayload = { event: 'user.created', userId: '123', email: 'test@example.com', timestamp: new Date().toISOString() };
            const data = await aiApi.generateSchema(projectId, { payload: samplePayload });
            response = data?.schema ? `Here's the generated schema:\n\n\`\`\`json\n${JSON.stringify(data.schema, null, 2)}\n\`\`\`` : (data?.message || 'Schema generated successfully.');
            break;
          }
          case 'status': {
            const data = await aiApi.status();
            response = `**AI Service Status**\n\nStatus: ${data?.status === 'ok' || data?.healthy ? 'Operational' : data?.status || 'Unknown'}\n${data?.model ? `Model: ${data.model}\n` : ''}${data?.usage ? `Usage: ${JSON.stringify(data.usage)}` : ''}`;
            break;
          }
          default: {
            const q = customQ || 'How can I improve my webhook delivery rates?';
            const data = await aiApi.debug(projectId, { question: q, hours: 24 });
            response = data?.answer || data?.analysis || data?.message || 'I analyzed your webhooks but couldn\'t generate a specific answer. Try a more specific question.';
          }
        }
      }
      setMessages(prev => [...prev, { id: uid(), role: 'ai', content: response, time: now() }]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { id: uid(), role: 'ai', content: errMsg, time: now(), status: 'error' }]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleSend = () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion('');
    if (inputRef.current) inputRef.current.style.height = '40px';
    callAi('ask', q);
  };

  const copyMsg = (msg: Message) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    const el = e.target;
    el.style.height = '40px';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* ═══ Floating Bubble ═══ */}
      <button
        id="ai-bubble-btn"
        onClick={() => { setOpen(!open); if (!open) setPulseRing(false); }}
        aria-label="AI Assistant"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 58, height: 58, borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
            : 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open
            ? '0 0 0 4px rgba(99,102,241,0.15), 0 8px 24px rgba(79,70,229,0.45)'
            : '0 6px 24px rgba(79,70,229,0.4), 0 2px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          transform: open ? 'scale(0.92)' : 'scale(1)',
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = open ? 'scale(0.92)' : 'scale(1)'; }}
      >
        <div style={{
          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s',
          transform: open ? 'rotate(90deg) scale(0.85)' : 'rotate(0) scale(1)',
        }}>
          {open ? <X size={22} color="#fff" strokeWidth={2.5} /> : <Sparkles size={24} color="#fff" />}
        </div>

        {pulseRing && !open && (
          <>
            <span style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.4)', animation: 'aiBubblePulse 2.5s ease-out infinite', pointerEvents: 'none' }} />
            <span style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '1.5px solid rgba(124,58,237,0.2)', animation: 'aiBubblePulse 2.5s ease-out infinite 0.5s', pointerEvents: 'none' }} />
          </>
        )}
      </button>

      {/* ═══ Chat Panel ═══ */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed', bottom: 100, right: 28, zIndex: 9998,
            width: 400, height: 560,
            background: 'var(--bg)',
            border: '1px solid var(--b2)',
            borderRadius: 24,
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.4), 0 0 0 1px var(--b1)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'aiBubbleSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* ─── Header ─── */}
          <div style={{
            padding: '18px 20px 16px',
            background: 'var(--bg2)',
            borderBottom: '1px solid var(--b1)',
            display: 'flex', alignItems: 'center', gap: 12,
            position: 'relative',
          }}>
            {/* Subtle gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.4,
              background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />

            <div style={{
              width: 38, height: 38, borderRadius: 12, position: 'relative',
              background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
            }}>
              <Sparkles size={18} color="#fff" />
              <span style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 10, height: 10, borderRadius: '50%',
                background: '#22c55e', border: '2px solid var(--bg2)',
              }} />
            </div>

            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700,
                color: 'var(--text)', letterSpacing: '-0.3px',
              }}>
                WebhookOS AI
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)',
                marginTop: 2, letterSpacing: '0.02em',
              }}>
                Powered by Gemini &middot; Always ready
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4, position: 'relative', zIndex: 1 }}>
              {hasMessages && (
                <button
                  onClick={clearChat}
                  title="New conversation"
                  style={{
                    background: 'none', border: '1px solid var(--b1)', cursor: 'pointer',
                    color: 'var(--text3)', padding: 7, borderRadius: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--bg3)'; el.style.borderColor = 'var(--b2)'; el.style.color = 'var(--text2)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'none'; el.style.borderColor = 'var(--b1)'; el.style.color = 'var(--text3)'; }}
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ─── Messages ─── */}
          <div style={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            padding: hasMessages ? '20px 16px 12px' : '0',
            display: 'flex', flexDirection: 'column',
            gap: 20,
          }}>
            {/* Welcome state */}
            {!hasMessages && !loading && (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', padding: '32px 24px',
                gap: 20,
              }}>
                {/* Welcome avatar */}
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
                  position: 'relative',
                }}>
                  <Sparkles size={28} color="#fff" />
                  <div style={{
                    position: 'absolute', inset: -3, borderRadius: 23,
                    border: '1px solid rgba(124,58,237,0.2)',
                    pointerEvents: 'none',
                  }} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700,
                    color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px',
                  }}>
                    Hi {userName}!
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)',
                    lineHeight: 1.5, maxWidth: 260,
                  }}>
                    I can help debug webhooks, analyze failures, detect PII, and more.
                  </div>
                </div>

                {/* Quick action chips */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8,
                  justifyContent: 'center', maxWidth: 340,
                }}>
                  {SUGGESTIONS.map(s => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => callAi(s.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          padding: '8px 14px', borderRadius: 100,
                          background: 'var(--bg2)',
                          border: '1px solid var(--b1)',
                          cursor: 'pointer', color: 'var(--text2)',
                          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                          transition: 'all .18s ease',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = s.color + '60';
                          el.style.background = s.color + '10';
                          el.style.color = s.color;
                          el.style.transform = 'translateY(-1px)';
                          el.style.boxShadow = `0 4px 12px ${s.color}18`;
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = 'var(--b1)';
                          el.style.background = 'var(--bg2)';
                          el.style.color = 'var(--text2)';
                          el.style.transform = 'translateY(0)';
                          el.style.boxShadow = 'none';
                        }}
                      >
                        <Icon size={13} />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Role label */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  paddingLeft: msg.role === 'user' ? 0 : 0,
                }}>
                  {msg.role === 'ai' ? (
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles size={10} color="#fff" />
                    </div>
                  ) : (
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      background: 'var(--bg3)', border: '1px solid var(--b1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700, color: 'var(--text2)' }}>
                        {userInitial}
                      </span>
                    </div>
                  )}
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                    color: 'var(--text)',
                  }}>
                    {msg.role === 'ai' ? 'WebhookOS AI' : 'You'}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)',
                    marginLeft: 'auto', opacity: 0.6,
                  }}>
                    {msg.time}
                  </span>
                </div>

                {/* Message content */}
                <div style={{
                  marginLeft: 30,
                  padding: msg.role === 'ai' ? '0' : '0',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.65,
                    color: msg.status === 'error' ? 'var(--red)' : 'var(--text)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    background: msg.role === 'ai' ? 'var(--bg2)' : 'transparent',
                    padding: msg.role === 'ai' ? '12px 14px' : '4px 0',
                    borderRadius: msg.role === 'ai' ? 12 : 0,
                    border: msg.role === 'ai' ? '1px solid var(--b1)' : 'none',
                  }}>
                    {msg.status === 'error' && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 6,
                        background: 'var(--rbg)', color: 'var(--red)',
                        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                        marginBottom: 8,
                      }}>
                        <AlertTriangle size={10} /> Error
                      </div>
                    )}
                    {msg.content}
                  </div>

                  {/* Action bar for AI messages */}
                  {msg.role === 'ai' && (
                    <div style={{
                      display: 'flex', gap: 2, marginTop: 6,
                    }}>
                      <button
                        onClick={() => copyMsg(msg)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '4px 10px', borderRadius: 7,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: copiedId === msg.id ? 'var(--green)' : 'var(--text3)',
                          fontFamily: 'var(--font-body)', fontSize: 11,
                          transition: 'all .12s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                      >
                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => callAi('ask', msg.content.slice(0, 100))}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '4px 10px', borderRadius: 7,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text3)',
                          fontFamily: 'var(--font-body)', fontSize: 11,
                          transition: 'all .12s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                      >
                        <RotateCcw size={11} /> Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 7,
                    background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Sparkles size={10} color="#fff" />
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                    WebhookOS AI
                  </span>
                </div>
                <div style={{
                  marginLeft: 30, padding: '14px 16px',
                  background: 'var(--bg2)', border: '1px solid var(--b1)',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', animation: 'aiDot 1.4s ease-in-out infinite' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', animation: 'aiDot 1.4s ease-in-out 0.2s infinite' }} />
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', animation: 'aiDot 1.4s ease-in-out 0.4s infinite' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ─── Input Area ─── */}
          <div style={{
            padding: '12px 16px 16px',
            borderTop: '1px solid var(--b1)',
            background: 'var(--bg2)',
          }}>
            {/* Quick suggestion chips when chat has messages */}
            {hasMessages && !loading && (
              <div style={{
                display: 'flex', gap: 6, marginBottom: 10,
                overflowX: 'auto', paddingBottom: 2,
              }}>
                {SUGGESTIONS.slice(0, 3).map(s => (
                  <button
                    key={s.id}
                    onClick={() => callAi(s.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 100,
                      background: 'var(--bg3)', border: '1px solid var(--b1)',
                      cursor: 'pointer', color: 'var(--text3)',
                      fontFamily: 'var(--font-body)', fontSize: 11,
                      whiteSpace: 'nowrap', transition: 'all .15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--abd)'; el.style.color = 'var(--accent2)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--b1)'; el.style.color = 'var(--text3)'; }}
                  >
                    <s.icon size={11} />
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 8,
              background: 'var(--bg)',
              border: `1px solid ${inputFocused ? 'var(--abd)' : 'var(--b1)'}`,
              borderRadius: 16, padding: '6px 8px 6px 16px',
              transition: 'border-color .2s, box-shadow .2s',
              boxShadow: inputFocused ? '0 0 0 3px var(--abg)' : 'none',
            }}>
              <textarea
                ref={inputRef}
                placeholder="Message WebhookOS AI..."
                value={question}
                onChange={handleTextareaInput}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                disabled={loading}
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
                  fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)',
                  padding: '6px 0', lineHeight: 1.5,
                  height: 40, maxHeight: 100,
                  overflow: 'auto',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!question.trim() || loading}
                style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: question.trim() && !loading
                    ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
                    : 'transparent',
                  border: question.trim() && !loading ? 'none' : '1px solid var(--b1)',
                  cursor: question.trim() && !loading ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .2s ease',
                  transform: question.trim() && !loading ? 'scale(1)' : 'scale(0.95)',
                  boxShadow: question.trim() && !loading ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
                }}
              >
                <Send
                  size={15}
                  color={question.trim() && !loading ? '#fff' : 'var(--text3)'}
                  style={{ marginLeft: 1, marginTop: -1 }}
                />
              </button>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 5, marginTop: 10,
            }}>
              <Zap size={9} color="var(--accent2)" />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text3)',
                opacity: 0.5, letterSpacing: '0.03em',
              }}>
                Gemini-powered &middot; Responses may be inaccurate
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
