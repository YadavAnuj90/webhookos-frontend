import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(r => r, async err => {
  const orig = err.config;
  if (err.response?.status === 401 && !orig._retry) {
    orig._retry = true;
    try {
      const rt = localStorage.getItem('refreshToken');
      const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken: rt });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      orig.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(orig);
    } catch { localStorage.clear(); window.location.href = '/auth/login'; }
  }
  return Promise.reject(err);
});

export default api;
export const authApi = {
  register: (d: any) => api.post('/auth/register', d).then(r => r.data),
  login: (d: any) => api.post('/auth/login', d).then(r => r.data),
  logout: (rt: string) => api.post('/auth/logout', { refreshToken: rt }).then(r => r.data),
  logoutAll: () => api.post('/auth/logout-all').then(r => r.data),
  getMe: () => api.get('/auth/me').then(r => r.data),
  getSessions: () => api.get('/auth/sessions').then(r => r.data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }).then(r => r.data),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }).then(r => r.data),
  changePassword: (d: any) => api.post('/auth/change-password', d).then(r => r.data),
  createApiKey: (d: any) => api.post('/auth/api-keys', d).then(r => r.data),
  listApiKeys: () => api.get('/auth/api-keys').then(r => r.data),
  revokeApiKey: (id: string) => api.delete(`/auth/api-keys/${id}`).then(r => r.data),
};
export const usersApi = {
  updateProfile: (d: any) => api.put('/users/me', d).then(r => r.data),
  updatePreferences: (d: any) => api.put('/users/me/preferences', d).then(r => r.data),
  adminList: (p: any) => api.get('/users/admin/list', { params: p }).then(r => r.data),
  adminStats: () => api.get('/users/admin/stats').then(r => r.data),
  changeRole: (id: string, role: string) => api.patch(`/users/admin/${id}/role`, { role }).then(r => r.data),
  suspend: (id: string) => api.patch(`/users/admin/${id}/suspend`).then(r => r.data),
  activate: (id: string) => api.patch(`/users/admin/${id}/activate`).then(r => r.data),
};
export const billingApi = {
  getPlans: () => api.get('/billing/plans').then(r => r.data),
  createOrder: (planId: string) => api.post('/billing/order', { planId }).then(r => r.data),
  verifyPayment: (d: any) => api.post('/billing/verify', d).then(r => r.data),
  getSubscription: () => api.get('/billing/subscription').then(r => r.data),
};
export const auditApi = {
  myHistory: (p: any) => api.get('/audit/me', { params: p }).then(r => r.data),
  systemHistory: (p: any) => api.get('/audit/system', { params: p }).then(r => r.data),
};
export const searchApi = { search: (q: string) => api.get('/search', { params: { q } }).then(r => r.data) };
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
  replay: (pid: string, id: string) => api.post(`/projects/${pid}/events/${id}/replay`).then(r => r.data),
  send: (pid: string, d: any) => api.post(`/projects/${pid}/events/send`, d).then(r => r.data),
  getDlq: (pid: string, p?: any) => api.get(`/projects/${pid}/events/dlq`, { params: p }).then(r => r.data),
  replayDlq: (pid: string) => api.post(`/projects/${pid}/events/dlq/replay-all`).then(r => r.data),
};
export const analyticsApi = {
  summary: (pid: string, p?: any) => api.get(`/projects/${pid}/analytics/summary`, { params: p }).then(r => r.data),
  timeSeries: (pid: string, p?: any) => api.get(`/projects/${pid}/analytics/time-series`, { params: p }).then(r => r.data),
  eventTypes: (pid: string, p?: any) => api.get(`/projects/${pid}/analytics/event-types`, { params: p }).then(r => r.data),
};
export const projectsApi = {
  list: () => api.get('/projects').then(r => r.data),
  create: (d: any) => api.post('/projects', d).then(r => r.data),
  get: (id: string) => api.get(`/projects/${id}`).then(r => r.data),
  update: (id: string, d: any) => api.put(`/projects/${id}`, d).then(r => r.data),
  delete: (id: string) => api.delete(`/projects/${id}`).then(r => r.data),
  addMember: (id: string, d: any) => api.post(`/projects/${id}/members`, d).then(r => r.data),
};
