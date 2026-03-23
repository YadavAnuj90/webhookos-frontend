'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
  }));

  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster
        position="top-right"
        gutter={10}
        containerStyle={{ top: 16, right: 16 }}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f1629',
            border: '1px solid rgba(99,102,241,0.18)',
            color: '#e2e8f0',
            fontFamily: 'var(--sans, Inter, sans-serif)',
            fontSize: '13px',
            fontWeight: 500,
            padding: '11px 14px',
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(99,102,241,0.06)',
            maxWidth: '360px',
            lineHeight: '1.5',
          },
          success: {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg,#0a1f14 0%,#0f1629 100%)',
              borderColor: 'rgba(74,222,128,0.25)',
            },
            iconTheme: { primary: '#4ade80', secondary: '#0a1f14' },
          },
          error: {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg,#1f0a0a 0%,#0f1629 100%)',
              borderColor: 'rgba(248,113,113,0.25)',
            },
            iconTheme: { primary: '#f87171', secondary: '#1f0a0a' },
          },
          loading: {
            style: {
              background: 'linear-gradient(135deg,#0d1225 0%,#0f1629 100%)',
              borderColor: 'rgba(129,140,248,0.2)',
            },
            iconTheme: { primary: '#818cf8', secondary: '#0d1225' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
