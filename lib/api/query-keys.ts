/**
 * Query Key Factory
 * Centralizes all query keys to ensure consistency and avoid "magic strings".
 * This makes it easier to manage cache invalidation across the app.
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  dashboard: {
    all: ['dashboard'] as const,
    stats: (params: Record<string, any>) => [...queryKeys.dashboard.all, 'stats', params] as const,
  }
} as const;
