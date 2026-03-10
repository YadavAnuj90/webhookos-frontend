'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import AppShell from '@/components/layout/AppShell';
import Providers from '../providers';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, fetchMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/auth/login'); return; }
    if (!user) fetchMe().then(() => {
      if (!useAuthStore.getState().user) router.push('/auth/login');
    });
  }, []);

  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
