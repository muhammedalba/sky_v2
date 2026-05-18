import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient instance shared across the application.
 * Using a module-level singleton allows non-React code (like the SSE hook)
 * to call queryClient.invalidateQueries() directly without prop-drilling.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
