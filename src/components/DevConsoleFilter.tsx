'use client';
import { useEffect } from 'react';

/**
 * Silences noisy Next.js dev-mode console spam
 * ([Fast Refresh], [HMR], hot-reloader) in the browser.
 * Only active in development — zero overhead in production.
 */
export function DevConsoleFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const NOISE = /\[Fast Refresh\]|\[HMR\]|hot-reloader|rebuilding|done in \d+ms/i;

    const origLog  = console.log;
    const origInfo = console.info;
    const origWarn = console.warn;

    const quiet = (orig: typeof console.log) =>
      (...args: unknown[]) => {
        if (args.some(a => typeof a === 'string' && NOISE.test(a))) return;
        orig(...args);
      };

    console.log  = quiet(origLog);
    console.info = quiet(origInfo);
    console.warn = quiet(origWarn);

    return () => {
      console.log  = origLog;
      console.info = origInfo;
      console.warn = origWarn;
    };
  }, []);

  return null;
}
