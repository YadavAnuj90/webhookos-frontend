import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'WebhookOS -- Reliable Webhook Delivery', description: 'Enterprise webhook delivery platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
