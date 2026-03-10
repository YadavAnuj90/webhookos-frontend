'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }));
  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster position="top-right" toastOptions={{
        style: { background: '#0f0f1e', border: '1px solid rgba(99,102,241,0.2)', color: '#f1f5f9', fontFamily: 'DM Sans, sans-serif', fontSize: '13px' },
        success: { iconTheme: { primary: '#10b981', secondary: '#0f0f1e' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#0f0f1e' } },
      }} />
    </QueryClientProvider>
  );
}
