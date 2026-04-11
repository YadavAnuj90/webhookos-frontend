import type { Metadata } from 'next';
import './globals.css';
import { DevConsoleFilter } from '@/components/DevConsoleFilter';
export const metadata: Metadata = { title: 'WebhookOS -- Reliable Webhook Delivery', description: 'Enterprise webhook delivery platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><DevConsoleFilter />{children}</body></html>;
}
