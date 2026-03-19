import { useQuery } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { AiProviderStatus } from '@/lib/types';

const FALLBACK: AiProviderStatus = { provider: 'none', label: 'None', configured: false };

/**
 * Fetches AI provider status once per session (staleTime = Infinity).
 * Returns a stable object — all AI components can call this freely.
 */
export function useAiStatus() {
  const { data, isLoading } = useQuery<AiProviderStatus>({
    queryKey: ['ai-status'],
    queryFn: () => aiApi.status(),
    staleTime: Infinity,      // never re-fetch automatically
    retry: 1,
    // If the endpoint doesn't exist yet, fall back gracefully
    throwOnError: false,
  });

  return {
    status: data ?? FALLBACK,
    isLoading,
  };
}
