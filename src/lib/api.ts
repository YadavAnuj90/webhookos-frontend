import axios from 'axios';
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('accessToken');
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
});

// 402 handler — set by the AppShell so it can use Next.js router + toast
let _on402: ((code: string, msg: string) => void) | null = null;
export function set402Handler(fn: (code: string, msg: string) => void) { _on402 = fn; }

let refreshing = false;
api.interceptors.response.use(r => r, async err => {
  const orig = err.config;

  // ── 402 Payment Required ──────────────────────────────────────────────────
  if (err.response?.status === 402) {
    const { code, message } = err.response.data || {};
    if (_on402) {
      _on402(code || 'payment_required', message || 'Payment required');
    } else if (typeof window !== 'undefined') {
      window.location.href = `/billing?reason=${code || 'payment_required'}`;
    }
    return Promise.reject(err);
  }

  // ── 401 Token Refresh ────────────────────────────────────────────────────
  if (err.response?.status === 401 && !orig._retry && !refreshing) {
    orig._retry = true; refreshing = true;
    try {
      const rt = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (!rt) throw new Error('No refresh token');
      const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(orig);
    } catch {
      localStorage.clear();
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
    } finally { refreshing = false; }
  }
  return Promise.reject(err);
});
export default api;

export const authApi = {
  register: (d: any) => api.post('/auth/register', d).then(r => r.data),
  login: (d: any) => api.post('/auth/login', d).then(r => r.data),
  logout: (rt: string) => api.post('/auth/logout', { refreshToken: rt }).then(r => r.data),
  logoutAll: () => api.post('/auth/logout-all').then(r => r.data),
  refresh: (rt: string) => api.post('/auth/refresh', { refreshToken: rt }).then(r => r.data),
  getMe: () => api.get('/auth/me').then(r => r.data),
  getSessions: () => api.get('/auth/sessions').then(r => r.data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }).then(r => r.data),
  changePassword: (d: any) => api.post('/auth/change-password', d).then(r => r.data),
  verifyEmail: (token: string) => api.get('/auth/verify-email', { params: { token } }).then(r => r.data),
  resendVerification: () => api.post('/auth/resend-verification').then(r => r.data),
  createApiKey: (d: any) => api.post('/auth/api-keys', d).then(r => r.data),
  listApiKeys: () => api.get('/auth/api-keys').then(r => r.data),
  revokeApiKey: (id: string) => api.delete(`/auth/api-keys/${id}`).then(r => r.data),

  // ── Two-Factor Authentication ───────────────────────────────────────────────
  twoFactorSetup:    ()                    => api.post('/auth/2fa/setup').then(r => r.data),
  twoFactorVerify:   (d: { code: string }) => api.post('/auth/2fa/verify', d).then(r => r.data),
  twoFactorDisable:  (d: { code: string }) => api.post('/auth/2fa/disable', d).then(r => r.data),
  twoFactorLogin:    (d: { challengeToken: string; code: string }) => api.post('/auth/2fa/login', d).then(r => r.data),
  twoFactorStatus:   ()                    => api.get('/auth/2fa/status').then(r => r.data),
  twoFactorRecoveryCodes: ()               => api.post('/auth/2fa/recovery-codes').then(r => r.data),
};

export const usersApi = {
  updateProfile: (d: any) => api.put('/users/me', d).then(r => r.data),
  updatePrefs: (d: any) => api.put('/users/me/preferences', d).then(r => r.data),
  adminList: (p?: any) => api.get('/users/admin/list', { params: p }).then(r => r.data),
  adminStats: () => api.get('/users/admin/stats').then(r => r.data),
  changeRole: (id: string, role: string) => api.patch(`/users/admin/${id}/role`, { role }).then(r => r.data),
  suspend: (id: string) => api.patch(`/users/admin/${id}/suspend`).then(r => r.data),
  activate: (id: string) => api.patch(`/users/admin/${id}/activate`).then(r => r.data),
};

export const projectsApi = {
  list: () => api.get('/projects').then(r => r.data),
  create: (d: any) => api.post('/projects', d).then(r => r.data),
  get: (id: string) => api.get(`/projects/${id}`).then(r => r.data),
  update: (id: string, d: any) => api.put(`/projects/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/projects/${id}`).then(r => r.data),
  addMember: (id: string, d: any) => api.post(`/projects/${id}/members`, d).then(r => r.data),
};

export const endpointsApi = {
  list: (pid: string, p?: any) => api.get(`/projects/${pid}/endpoints`, { params: p }).then(r => r.data),
  create: (pid: string, d: any) => api.post(`/projects/${pid}/endpoints`, d).then(r => r.data),
  get: (pid: string, id: string) => api.get(`/projects/${pid}/endpoints/${id}`).then(r => r.data),
  update: (pid: string, id: string, d: any) => api.put(`/projects/${pid}/endpoints/${id}`, d).then(r => r.data),
  delete: (pid: string, id: string) => api.delete(`/projects/${pid}/endpoints/${id}`).then(r => r.data),
  pause: (pid: string, id: string) => api.patch(`/projects/${pid}/endpoints/${id}/pause`).then(r => r.data),
  resume: (pid: string, id: string) => api.patch(`/projects/${pid}/endpoints/${id}/resume`).then(r => r.data),
  rotateSecret: (pid: string, id: string) => api.post(`/projects/${pid}/endpoints/${id}/rotate-secret`).then(r => r.data),
};

export const eventsApi = {
  list: (pid: string, p?: any) => api.get(`/projects/${pid}/events`, { params: p }).then(r => r.data),
  get: (pid: string, id: string) => api.get(`/projects/${pid}/events/${id}`).then(r => r.data),
  send: (pid: string, d: any) => api.post(`/projects/${pid}/events/send`, d).then(r => r.data),
  replay: (pid: string, id: string) => api.post(`/projects/${pid}/events/${id}/replay`).then(r => r.data),
  getDlq: (pid: string, p?: any) => api.get(`/projects/${pid}/events/dlq`, { params: p }).then(r => r.data),
  replayDlq: (pid: string) => api.post(`/projects/${pid}/events/dlq/replay-all`).then(r => r.data),
};

export const analyticsApi = {
  summary: (pid: string, p?: any) => api.get(`/projects/${pid}/analytics/summary`, { params: p }).then(r => r.data),
  timeSeries: (pid: string, p?: any) => api.get(`/projects/${pid}/analytics/time-series`, { params: p }).then(r => r.data),
  eventTypes: (pid: string, p?: any) => api.get(`/projects/${pid}/analytics/event-types`, { params: p }).then(r => r.data),
};

export const billingApi = {
  // ── Subscription ───────────────────────────────────────────────────────────
  getPlans:        ()             => api.get('/billing/plans').then(r => r.data),
  getSubscription: ()             => api.get('/billing/subscription').then(r => r.data),
  getTrial:        ()             => api.get('/billing/subscription/trial').then(r => r.data),
  upgradeOrder:    (planId: string) => api.post('/billing/subscription/upgrade/order', { planId }).then(r => r.data),
  upgradeVerify:   (d: any)       => api.post('/billing/subscription/upgrade/verify', d).then(r => r.data),
  cancelSub:       (d?: any)      => api.post('/billing/subscription/cancel', d || {}).then(r => r.data),

  // ── Credits ────────────────────────────────────────────────────────────────
  getCreditsBalance:    ()        => api.get('/billing/credits/balance').then(r => r.data),
  getCreditPackages:    ()        => api.get('/billing/credits/packages').then(r => r.data),
  purchaseCreditsOrder: (packageId: string) => api.post('/billing/credits/purchase/order', { packageId }).then(r => r.data),
  purchaseCreditsVerify:(d: any)  => api.post('/billing/credits/purchase/verify', d).then(r => r.data),
  getTransactions:      (p?: any) => api.get('/billing/credits/transactions', { params: p }).then(r => r.data),
  updateAutoTopUp:      (d: any)  => api.patch('/billing/credits/auto-topup', d).then(r => r.data),

  // ── Invoices ───────────────────────────────────────────────────────────────
  getInvoices: ()             => api.get('/billing/invoices').then(r => r.data),
  getInvoice:  (id: string)   => api.get(`/billing/invoices/${id}`).then(r => r.data),

  // ── Reseller ───────────────────────────────────────────────────────────────
  getResellerProfile:    ()        => api.get('/billing/reseller/profile').then(r => r.data),
  saveResellerProfile:   (d: any)  => api.post('/billing/reseller/profile', d).then(r => r.data),
  getResellerCustomers:  ()        => api.get('/billing/reseller/customers').then(r => r.data),
  addResellerCustomer:   (d: any)  => api.post('/billing/reseller/customers', d).then(r => r.data),
  suspendCustomer:       (id: string) => api.post(`/billing/reseller/customers/${id}/suspend`).then(r => r.data),
  reactivateCustomer:    (id: string) => api.post(`/billing/reseller/customers/${id}/reactivate`).then(r => r.data),
  getCustomerInvoices:   (id: string) => api.get(`/billing/reseller/customers/${id}/invoices`).then(r => r.data),
  generateInvoices:      ()        => api.post('/billing/reseller/invoices/generate').then(r => r.data),
  getResellerRevenue:    ()        => api.get('/billing/reseller/revenue').then(r => r.data),
  getResellerPlans:      ()        => api.get('/billing/reseller/plans').then(r => r.data),
  createResellerPlan:    (d: any)  => api.post('/billing/reseller/plans', d).then(r => r.data),
};

export const auditApi = {
  myHistory: (p?: any) => api.get('/audit/me', { params: p }).then(r => r.data),
  systemHistory: (p?: any) => api.get('/audit/system', { params: p }).then(r => r.data),
};

export const searchApi = {
  search: (q: string) => api.get('/search', { params: { q } }).then(r => r.data),
};

export const workspacesApi = {
  create: (d: any) => api.post('/workspaces', d).then(r => r.data),
  list: () => api.get('/workspaces').then(r => r.data),
  get: (id: string) => api.get(`/workspaces/${id}`).then(r => r.data),
  update: (id: string, d: any) => api.put(`/workspaces/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/workspaces/${id}`).then(r => r.data),
  invite: (id: string, d: any) => api.post(`/workspaces/${id}/invite`, d).then(r => r.data),
  acceptInvite: (token: string) => api.post(`/workspaces/invite/${token}/accept`).then(r => r.data),
  listInvites: (id: string) => api.get(`/workspaces/${id}/invites`).then(r => r.data),
  removeMember: (id: string, uid: string) => api.delete(`/workspaces/${id}/members/${uid}`).then(r => r.data),
  updateRole: (id: string, uid: string, role: string) => api.patch(`/workspaces/${id}/members/${uid}/role`, { role }).then(r => r.data),
};

export const apiKeysApi = {
  create: (d: any) => api.post('/api-keys', d).then(r => r.data),
  list: () => api.get('/api-keys').then(r => r.data),
  stats: () => api.get('/api-keys/stats').then(r => r.data),
  revoke: (id: string) => api.patch(`/api-keys/${id}/revoke`).then(r => r.data),
  delete: (id: string) => api.delete(`/api-keys/${id}`).then(r => r.data),
};

export const alertsApi = {
  create: (d: any) => api.post('/alerts', d).then(r => r.data),
  list: () => api.get('/alerts').then(r => r.data),
  update: (id: string, d: any) => api.put(`/alerts/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/alerts/${id}`).then(r => r.data),
  toggle: (id: string) => api.patch(`/alerts/${id}/toggle`).then(r => r.data),
  test: (id: string) => api.post(`/alerts/${id}/test`).then(r => r.data),
};

export const playgroundApi = {
  fire: (d: any) => api.post('/playground/fire', d).then(r => r.data),
  validateSignature: (d: any) => api.post('/playground/validate-signature', d).then(r => r.data),
};

export const transformationsApi = {
  create: (d: any) => api.post('/transformations', d).then(r => r.data),
  list: () => api.get('/transformations').then(r => r.data),
  update: (id: string, d: any) => api.put(`/transformations/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/transformations/${id}`).then(r => r.data),
  preview: (d: any) => api.post('/transformations/preview', d).then(r => r.data),
};

export const portalApi = {
  createToken: (d: any) => api.post('/portal/tokens', d).then(r => r.data),
  listTokens: () => api.get('/portal/tokens').then(r => r.data),
  revokeToken: (id: string) => api.patch(`/portal/tokens/${id}/revoke`).then(r => r.data),
  deleteToken: (id: string) => api.delete(`/portal/tokens/${id}`).then(r => r.data),
};

export const usageApi = {
  get: (period?: string) => api.get('/usage', { params: { period } }).then(r => r.data),
  summary: () => api.get('/usage/summary').then(r => r.data),
};

// ── GROUP 1: Event Type Catalog ──────────────────────────────────────────────
export const eventTypesApi = {
  list:     (pid: string)                        => api.get(`/projects/${pid}/event-types`).then(r => r.data),
  get:      (pid: string, id: string)            => api.get(`/projects/${pid}/event-types/${id}`).then(r => r.data),
  create:   (pid: string, d: any)                => api.post(`/projects/${pid}/event-types`, d).then(r => r.data),
  update:   (pid: string, id: string, d: any)    => api.put(`/projects/${pid}/event-types/${id}`, d).then(r => r.data),
  delete:   (pid: string, id: string)            => api.delete(`/projects/${pid}/event-types/${id}`).then(r => r.data),
  validate: (pid: string, d: { eventTypeId: string; payload: object }) =>
    api.post(`/projects/${pid}/event-types/validate`, d).then(r => r.data),
};

// ── GROUP 2: Operational Webhooks ────────────────────────────────────────────
export const operationalWebhooksApi = {
  list:         (pid: string)                     => api.get(`/projects/${pid}/operational-webhooks`).then(r => r.data),
  create:       (pid: string, d: any)             => api.post(`/projects/${pid}/operational-webhooks`, d).then(r => r.data),
  update:       (pid: string, id: string, d: any) => api.put(`/projects/${pid}/operational-webhooks/${id}`, d).then(r => r.data),
  delete:       (pid: string, id: string)         => api.delete(`/projects/${pid}/operational-webhooks/${id}`).then(r => r.data),
  rotateSecret: (pid: string, id: string)         => api.post(`/projects/${pid}/operational-webhooks/${id}/rotate-secret`).then(r => r.data),
  test:         (pid: string, id: string)         => api.post(`/projects/${pid}/operational-webhooks/${id}/test`, {}).then(r => r.data),
};

// ── GROUP 3: Dev Tunnel ──────────────────────────────────────────────────────
export const tunnelApi = {
  create: ()                  => api.post('/tunnel/create', {}).then(r => r.data),
  mine:   ()                  => api.get('/tunnel/mine').then(r => r.data),
  status: (tunnelId: string)  => api.get(`/tunnel/status/${tunnelId}`).then(r => r.data),
  remove: (tunnelId: string)  => api.delete(`/tunnel/${tunnelId}`).then(r => r.data),
};

// ── GROUP 4: Portal Branding ─────────────────────────────────────────────────
export const portalBrandingApi = {
  updateBranding: (id: string, d: any) => api.patch(`/portal/tokens/${id}/branding`, d).then(r => r.data),
  getByDomain:    (domain: string)     => api.get(`/portal/domain/${domain}`).then(r => r.data),
};

// ── GROUP 5: Metrics ─────────────────────────────────────────────────────────
export const metricsApi = {
  getUrl: () => `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/metrics`,
  // Uses axios so the Bearer token interceptor fires automatically
  get: () => api.get('/metrics', { responseType: 'text' }).then(r => r.data as string),
};

// ── NEW GROUP 6: GDPR Erasure ─────────────────────────────────────────────────
export const gdprApi = {
  erase: (pid: string, customerId: string) =>
    api.delete(`/projects/${pid}/events/erase`, { params: { customerId } }).then(r => r.data),
};

// ── Scheduling: Delayed / Cron Webhooks ──────────────────────────────────────
export const schedulingApi = {
  list:   (pid: string, p?: any) => api.get(`/projects/${pid}/scheduled-events`, { params: p }).then(r => r.data),
  get:    (pid: string, id: string) => api.get(`/projects/${pid}/scheduled-events/${id}`).then(r => r.data),
  create: (pid: string, d: any) => api.post(`/projects/${pid}/scheduled-events`, d).then(r => r.data),
  update: (pid: string, id: string, d: any) => api.put(`/projects/${pid}/scheduled-events/${id}`, d).then(r => r.data),
  cancel: (pid: string, id: string, reason?: string) => api.delete(`/projects/${pid}/scheduled-events/${id}`, { data: { reason } }).then(r => r.data),
};

// ── Permissions / RBAC ───────────────────────────────────────────────────────
export const permissionsApi = {
  getMatrix:       ()                                    => api.get('/permissions/matrix').then(r => r.data),
  getRolePerms:    (role: string)                        => api.get(`/permissions/roles/${role}`).then(r => r.data),
  compareRoles:    (role1: string, role2: string)        => api.get('/permissions/compare', { params: { role1, role2 } }).then(r => r.data),
  listCustomRoles: (pid: string)                         => api.get(`/projects/${pid}/roles`).then(r => r.data),
  getCustomRole:   (pid: string, roleId: string)         => api.get(`/projects/${pid}/roles/${roleId}`).then(r => r.data),
  createCustomRole:(pid: string, d: any)                 => api.post(`/projects/${pid}/roles`, d).then(r => r.data),
  updateCustomRole:(pid: string, roleId: string, d: any) => api.put(`/projects/${pid}/roles/${roleId}`, d).then(r => r.data),
  deleteCustomRole:(pid: string, roleId: string)         => api.delete(`/projects/${pid}/roles/${roleId}`).then(r => r.data),
};

// ── NEW GROUP 7: Contract Testing (NO auth required) ──────────────────────────
export const contractTestApi = {
  // Uses plain fetch (no auth) — safe for CI/CD
  run: (pid: string, name: string, body: { payload: object; version?: string }) =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/projects/${pid}/event-types/${name}/contract-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async res => {
      const data = await res.json();
      if (!res.ok && res.status !== 422) throw new Error(data?.message || `HTTP ${res.status}`);
      return { ...data, status: res.status };
    }),
};

// ── NEW GROUP 8: Webhook Simulator ────────────────────────────────────────────
export const simulateApi = {
  run: (pid: string, id: string, d: { overrides?: Record<string, any>; endpointId?: string }) =>
    api.post(`/projects/${pid}/event-types/${id}/simulate`, d).then(r => r.data),
};

// ── NEW GROUP 9: Delivery Heatmap ─────────────────────────────────────────────
export const heatmapApi = {
  get: (pid: string) => api.get(`/projects/${pid}/analytics/heatmap`).then(r => r.data),
};

// ── NEW GROUP 10: Audit Log CSV Export ────────────────────────────────────────
export const auditExportApi = {
  getUrl: (from: string, to: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    return `${base}/audit/export?from=${from}&to=${to}`;
  },
  exportBlob: (from: string, to: string) =>
    api.get('/audit/export', { params: { from, to }, responseType: 'blob' }).then(r => r.data),
};

// ── NEW GROUP 11: Portal Token Subscriptions ──────────────────────────────────
export const portalSubscriptionsApi = {
  update: (id: string, subscribedEventTypes: string[]) =>
    api.patch(`/portal/tokens/${id}/subscriptions`, { subscribedEventTypes }).then(r => r.data),
};

// ── NEW GROUP 12: AI Features (Gemini-powered) ────────────────────────────────
export const aiApi = {
  debug: (pid: string, body: { question: string; endpointId?: string; eventType?: string; hours?: number }) =>
    api.post(`/ai/projects/${pid}/debug`, body).then(r => r.data),

  generateSchema: (pid: string, body: { payload: object; eventTypeName?: string; autoSave?: boolean }) =>
    api.post(`/ai/projects/${pid}/generate-schema`, body).then(r => r.data),

  triageDlq: (pid: string) =>
    api.post(`/ai/projects/${pid}/triage-dlq`).then(r => r.data),

  detectPiiStandalone: (payload: object) =>
    api.post('/ai/detect-pii', { payload }).then(r => r.data),

  detectPiiForEndpoint: (pid: string, endpointId: string, body: { payload: object; autoApply?: boolean }) =>
    api.post(`/ai/projects/${pid}/endpoints/${endpointId}/detect-pii`, body).then(r => r.data),

  status: () =>
    api.get('/ai/status').then(r => r.data),
};
