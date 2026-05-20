import { QueryClient } from '@tanstack/react-query';

/**
 * Browser-safe QueryClient singleton.
 *
 * - Server: creates a fresh client per request (never shared between users).
 * - Browser: reuses a single instance across the app lifetime (module singleton).
 *
 * Non-React code that needs to call queryClient.invalidateQueries() directly
 * (e.g. the SSE hook) should call getQueryClient() instead of importing
 * the legacy named export.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always a fresh instance so data is never shared between requests/users
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

// Legacy named export — kept for backward-compat with any direct import
// (e.g. useServerNotifications.ts). Points to browser singleton at runtime.
export const queryClient = getQueryClient();

