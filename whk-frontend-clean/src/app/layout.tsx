import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebhookOS — Webhook Delivery Platform',
  description: 'Enterprise webhook delivery with retry, analytics, and RBAC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
