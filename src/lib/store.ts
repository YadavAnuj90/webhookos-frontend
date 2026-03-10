import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string; _id?: string; email: string;
  firstName: string; lastName: string; role: string; plan: string; status: string;
  company?: string; avatarUrl?: string; preferences?: Record<string, any>;
}

interface AuthStore {
  user: AuthUser | null; accessToken: string | null; refreshToken: string | null;
  login: (data: any) => void; logout: () => void; setUser: (u: AuthUser) => void;
}

export const useAuth = create<AuthStore>()(
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
    }),
    { name: 'whk-auth', partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
);

// Aliases so AppShell and other components work
export const useAuthStore = useAuth;

// Notification store
interface Notif { message: string; type: 'success'|'error'|'info'; read: boolean; time?: string; }
interface NotifStore { notifs: Notif[]; add: (n: Notif) => void; markRead: (i: number) => void; clearAll: () => void; }
export const useNotifStore = create<NotifStore>()((set) => ({
  notifs: [],
  add: (n) => set((s) => ({ notifs: [n, ...s.notifs].slice(0, 50) })),
  markRead: (i) => set((s) => { const notifs = [...s.notifs]; notifs[i] = { ...notifs[i], read: true }; return { notifs }; }),
  clearAll: () => set({ notifs: [] }),
}));

// useProjectStore for pages that need a project context
interface ProjectStore { projectId: string; setProjectId: (id: string) => void; }
export const useProjectStore = create<ProjectStore>()((set) => ({
  projectId: 'default',
  setProjectId: (projectId) => set({ projectId }),
}));
