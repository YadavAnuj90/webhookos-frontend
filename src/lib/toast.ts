/**
 * Centralized toast helper — wraps react-hot-toast with consistent
 * styling, durations, and convenience methods used across the app.
 *
 * Usage:
 *   import { t } from '@/lib/toast';
 *   t.ok('Endpoint saved');
 *   t.err('Failed to load');
 *   t.warn('Rate limit approaching');
 *   t.info('Syncing data…');
 *   await t.promise(api.save(), { loading: 'Saving…', success: 'Saved!', error: 'Save failed' });
 */

import toast, { type ToastOptions } from 'react-hot-toast';

// ── shared base options ──────────────────────────────────────────────────────
const BASE: ToastOptions = {
  duration: 3500,
  position: 'top-right',
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
};

const SUCCESS: ToastOptions = {
  ...BASE,
  duration: 3000,
  style: {
    ...BASE.style,
    borderColor: 'rgba(74,222,128,0.25)',
    background: 'linear-gradient(135deg,#0a1f14 0%,#0f1629 100%)',
  },
  iconTheme: { primary: '#4ade80', secondary: '#0a1f14' },
};

const ERROR: ToastOptions = {
  ...BASE,
  duration: 5000,
  style: {
    ...BASE.style,
    borderColor: 'rgba(248,113,113,0.25)',
    background: 'linear-gradient(135deg,#1f0a0a 0%,#0f1629 100%)',
  },
  iconTheme: { primary: '#f87171', secondary: '#1f0a0a' },
};

const WARN: ToastOptions = {
  ...BASE,
  duration: 4000,
  style: {
    ...BASE.style,
    borderColor: 'rgba(251,191,36,0.25)',
    background: 'linear-gradient(135deg,#1a150a 0%,#0f1629 100%)',
  },
  iconTheme: { primary: '#fbbf24', secondary: '#1a150a' },
};

const INFO: ToastOptions = {
  ...BASE,
  style: {
    ...BASE.style,
    borderColor: 'rgba(56,189,248,0.2)',
    background: 'linear-gradient(135deg,#0a1520 0%,#0f1629 100%)',
  },
  iconTheme: { primary: '#38bdf8', secondary: '#0a1520' },
};

const LOADING: ToastOptions = {
  ...BASE,
  duration: Infinity,
  style: {
    ...BASE.style,
    borderColor: 'rgba(129,140,248,0.2)',
  },
};

// ── public API ───────────────────────────────────────────────────────────────
export const t = {
  /** Green success toast — "Endpoint saved", "Copied!", etc. */
  ok: (msg: string, opts?: ToastOptions) =>
    toast.success(msg, { ...SUCCESS, ...opts }),

  /** Red error toast — shown on API failures */
  err: (msg: string, opts?: ToastOptions) =>
    toast.error(msg, { ...ERROR, ...opts }),

  /** Yellow warning toast — non-fatal issues */
  warn: (msg: string, opts?: ToastOptions) =>
    toast(msg, { ...WARN, icon: '⚠️', ...opts }),

  /** Blue info toast — neutral status messages */
  info: (msg: string, opts?: ToastOptions) =>
    toast(msg, { ...INFO, icon: 'ℹ️', ...opts }),

  /** Loading spinner toast — returns id so you can dismiss it */
  loading: (msg: string, opts?: ToastOptions) =>
    toast.loading(msg, { ...LOADING, ...opts }),

  /** Dismiss a specific toast by id */
  dismiss: (id?: string) => toast.dismiss(id),

  /**
   * Promise toast — shows loading → resolves to success or error.
   *
   * @example
   * await t.promise(endpointsApi.delete(id), {
   *   loading: 'Deleting endpoint…',
   *   success: 'Endpoint deleted',
   *   error:   (e) => e?.message ?? 'Delete failed',
   * });
   */
  promise: <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
    opts?: ToastOptions,
  ) =>
    toast.promise(promise, msgs, {
      loading: { ...LOADING, ...opts },
      success: { ...SUCCESS, ...opts },
      error:   { ...ERROR,   ...opts },
    }),

  /**
   * Copy-to-clipboard helper — copies text and shows a success toast.
   * Returns true if copy succeeded.
   */
  copy: async (text: string, label = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label, { ...SUCCESS, duration: 2000 });
      return true;
    } catch {
      toast.error('Failed to copy', { ...ERROR, duration: 2500 });
      return false;
    }
  },

  /**
   * API error helper — extracts a human-readable message from any
   * error shape (Axios, fetch, plain Error, string) and shows a red toast.
   */
  apiErr: (err: unknown, fallback = 'Something went wrong') => {
    const msg =
      (err as any)?.response?.data?.message ||
      (err as any)?.response?.data?.error  ||
      (err as any)?.message                ||
      (typeof err === 'string' ? err : fallback);
    return toast.error(msg, { ...ERROR });
  },
} as const;

// Re-export raw toast for edge cases
export { toast };
export default t;
