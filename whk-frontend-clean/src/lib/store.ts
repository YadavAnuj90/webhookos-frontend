import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from './api';

interface User { id: string; email: string; firstName: string; lastName: string; fullName?: string; role: string; plan: string; status: string; }
interface AuthStore {
  user: User | null; accessToken: string | null; refreshToken: string | null;
  login: (data: any) => void; logout: () => void; setUser: (u: User) => void; fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null, accessToken: null, refreshToken: null,
      login: (data) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
      },
      logout: () => {
        if (typeof window !== 'undefined') localStorage.clear();
        set({ user: null, accessToken: null, refreshToken: null });
      },
      setUser: (user) => set({ user }),
      fetchMe: async () => {
        try { const u = await authApi.getMe(); set({ user: u }); } catch { set({ user: null }); }
      },
    }),
    { name: 'whk-auth', partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
);

interface Notification { id: string; type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string; read: boolean; createdAt: Date; }
interface NotifStore {
  notifications: Notification[]; unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void; markAllRead: () => void; clear: () => void;
}

export const useNotifStore = create<NotifStore>()((set) => ({
  notifications: [], unreadCount: 0,
  addNotification: (n) => set(s => {
    const notif = { ...n, id: Math.random().toString(36).slice(2), read: false, createdAt: new Date() };
    return { notifications: [notif, ...s.notifications].slice(0, 50), unreadCount: s.unreadCount + 1 };
  }),
  markRead: (id) => set(s => ({
    notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    unreadCount: Math.max(0, s.unreadCount - 1),
  })),
  markAllRead: () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })), unreadCount: 0 })),
  clear: () => set({ notifications: [], unreadCount: 0 }),
}));
