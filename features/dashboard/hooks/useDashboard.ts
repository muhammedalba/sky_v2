'use client';

import { dashboardApi, DashboardParams } from '@/lib/api/dashboard';
import { useQuery } from '@tanstack/react-query';

export function useDashboardStats(params?: DashboardParams) {
  return useQuery({
    queryKey: ['dashboard', 'stats', params],
    queryFn: async () => {
      return await dashboardApi.getStats(params);
    },
    throwOnError: true,
  });
}
