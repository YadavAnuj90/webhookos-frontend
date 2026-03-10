'use client';
import { useState, useEffect } from 'react';
import { alertsApi } from '@/lib/api';
import { BellRing, Plus, Trash2, ToggleLeft, ToggleRight, Send, Mail, Slack, Webhook, AlertTriangle, CheckCircle } from 'lucide-react';

const CHANNEL_ICONS: any = { email: Mail, slack: Slack, webhook: Webhook };
const CONDITION_LABELS: any = { consecutive_failures: 'Consecutive Failures', failure_rate: 'Failure Rate %', latency_spike: 'Latency Spike (ms)', all_failures: 'Any Failure' };

export default function AlertsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editRule, setEditRule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState('');
  const [form, setForm] = useState({ name: '', conditionType: 'consecutive_failures', threshold: 3, channel: 'email', channelTarget: '', cooldownSeconds: 300 });

  const load = async () => { try { const d = await alertsApi.list(); setRules(Array.isArray(d) ? d : []); } catch {} };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    try {
      if (editRule) { await alertsApi.update(editRule._id, form); } else { await alertsApi.create(form); }
      setShowCreate(false); setEditRule(null); setForm({ name: '', conditionType: 'consecutive_failures', threshold: 3, channel: 'email', channelTarget: '', cooldownSeconds: 300 });
      await load();
    } catch {} finally { setLoading(false); }
  };

  const del = async (id: string) => { if (!confirm('Delete this alert rule?')) return; try { await alertsApi.delete(id); await load(); } catch {} };
  const toggle = async (id: string) => { try { await alertsApi.toggle(id); await load(); } catch {} };
  const test = async (id: string) => {
    setTesting(id);
    try { await alertsApi.test(id); } catch {}
    setTimeout(() => setTesting(''), 2000);
  };

  const openEdit = (rule: any) => { setEditRule(rule); setForm({ name: rule.name, conditionType: rule.conditionType, threshold: rule.threshold, channel: rule.channel, channelTarget: rule.channelTarget, cooldownSeconds: rule.cooldownSeconds || 300 }); setShowCreate(true); };

  const S: any = {
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12 },
    input: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' },
    label: { fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' },
    select: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', outline: 'none', cursor: 'pointer' },
  };

  const CHANNEL_PLACEHOLDERS: any = { email: 'alerts@yourcompany.com', slack: 'https://hooks.slack.com/services/...', webhook: 'https://your-server.com/webhook' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: 'linear-gradient(135deg,#d97706,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BellRing size={18} color="#fff" /></div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Alert Rules</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text3)', margin: 0 }}>Get notified on Slack, email or webhooks when deliveries fail</p>
          </div>
        </div>
        <button onClick={() => { setEditRule(null); setShowCreate(true); }} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} />New Rule
        </button>
      </div>

      {/* Channel quick guide */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: Mail, label: 'Email', desc: 'Send alerts to any email address', color: '#0ea5e9' },
          { icon: Slack, label: 'Slack', desc: 'Post to a Slack channel via webhook URL', color: '#4ade80' },
          { icon: Webhook, label: 'Webhook', desc: 'POST JSON payload to any URL', color: '#a78bfa' },
        ].map(({ icon: Icon, label, desc, color }) => (
          <div key={label} style={{ ...S.card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={16} color={color} /></div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Rules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rules.length === 0 ? (
          <div style={{ ...S.card, padding: 48, textAlign: 'center' }}>
            <BellRing size={32} color="var(--text3)" style={{ opacity: 0.3, marginBottom: 12 }} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text3)' }}>No alert rules configured</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', marginTop: 4, opacity: 0.6 }}>Create a rule to get notified when webhooks fail</div>
          </div>
        ) : rules.map(rule => {
          const ChannelIcon = CHANNEL_ICONS[rule.channel] || Mail;
          return (
            <div key={rule._id} style={{ ...S.card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, opacity: rule.isActive ? 1 : 0.55 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: rule.isActive ? 'rgba(99,102,241,0.15)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BellRing size={15} color={rule.isActive ? 'var(--accent2)' : 'var(--text3)'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{rule.name}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, padding: '2px 7px', borderRadius: 5, background: rule.isActive ? 'rgba(74,222,128,0.1)' : 'var(--bg3)', color: rule.isActive ? '#4ade80' : 'var(--text3)', fontWeight: 600 }}>{rule.isActive ? 'Active' : 'Paused'}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{CONDITION_LABELS[rule.conditionType]} {'>='} {rule.threshold}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}><ChannelIcon size={11} /> {rule.channelTarget}</span>
                  {rule.lastTriggeredAt && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>Last fired: {new Date(rule.lastTriggeredAt).toLocaleDateString()}</span>}
                  {rule.triggerCount > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f59e0b' }}>{rule.triggerCount}x triggered</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => test(rule._id)} disabled={!!testing} title="Send test alert" style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: testing === rule._id ? 'rgba(74,222,128,0.1)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-body)', fontSize: 11, color: testing === rule._id ? '#4ade80' : 'var(--text3)' }}>
                  {testing === rule._id ? <><CheckCircle size={12} />Sent!</> : <><Send size={11} />Test</>}
                </button>
                <button onClick={() => openEdit(rule)} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)' }}>Edit</button>
                <button onClick={() => toggle(rule._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: rule.isActive ? '#4ade80' : 'var(--text3)' }}>
                  {rule.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                <button onClick={() => del(rule._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#f87171' }}><Trash2 size={15} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...S.card, width: 500, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 20, marginTop: 0 }}>{editRule ? 'Edit Alert Rule' : 'New Alert Rule'}</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Endpoint failure alert" style={S.input} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={S.label}>Condition</label>
                <select value={form.conditionType} onChange={e => setForm(f => ({ ...f, conditionType: e.target.value }))} style={S.select}>
                  {Object.entries(CONDITION_LABELS).map(([v, l]) => <option key={v} value={v}>{l as string}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Threshold</label>
                <input type="number" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: +e.target.value }))} style={S.input} min={1} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>Notification Channel</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {['email', 'slack', 'webhook'].map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, channel: c }))} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${form.channel === c ? 'var(--accent2)' : 'var(--border)'}`, background: form.channel === c ? 'rgba(99,102,241,0.12)' : 'transparent', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: form.channel === c ? 'var(--accent2)' : 'var(--text3)', cursor: 'pointer', textTransform: 'capitalize' }}>{c}</button>
                ))}
              </div>
              <input value={form.channelTarget} onChange={e => setForm(f => ({ ...f, channelTarget: e.target.value }))} placeholder={CHANNEL_PLACEHOLDERS[form.channel]} style={S.input} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>Cooldown (seconds)</label>
              <input type="number" value={form.cooldownSeconds} onChange={e => setForm(f => ({ ...f, cooldownSeconds: +e.target.value }))} style={S.input} min={60} step={60} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Don't re-alert within this window (min 60s)</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowCreate(false); setEditRule(null); }} style={{ padding: '9px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} disabled={loading || !form.name} style={{ padding: '9px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: !form.name ? 0.6 : 1 }}>{loading ? 'Saving...' : editRule ? 'Update Rule' : 'Create Rule'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
