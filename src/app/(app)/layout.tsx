'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';
import AppShell from '@/components/layout/AppShell';
import Providers from '../providers';
import WelcomeAnimation from '@/components/ui/WelcomeAnimation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) { router.replace('/auth/login'); return; }
    if (!user) {
      import('@/lib/api').then(({ authApi }) => {
        authApi.getMe().then(u => { setUser(u); setReady(true); }).catch(() => { router.replace('/auth/login'); });
      });
    } else { setReady(true); }
  }, []);

  if (!ready) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
        <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#3a45d4,#5b6cf8)',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div className="spin" style={{ width:16,height:16,borderColor:'rgba(255,255,255,.3)',borderTopColor:'#fff' }}/>
        </div>
        <div style={{ fontFamily:'var(--mono)',fontSize:10,color:'var(--t3)' }}>Loading WebhookOS...</div>
      </div>
    </div>
  );

  return (
    <Providers>
      <WelcomeAnimation />
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
