'use client';

import { dashboardApi } from '@/lib/api/dashboard';
import { useQuery } from '@tanstack/react-query';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      return await dashboardApi.getStats();
    },
    throwOnError: true,
  });
}

