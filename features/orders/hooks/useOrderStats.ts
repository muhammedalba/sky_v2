'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/features/orders/api';
import { OrderStatsResponse } from '@/features/orders/types';

interface StatsParams {
  startDate?: string;
  endDate?: string;
}

export function useOrderStats(params?: StatsParams) {
  return useQuery({
    queryKey: ['order-stats', params],
    queryFn: async () => {
      const response = (await ordersApi.getStats(params)) as unknown as { data: OrderStatsResponse };
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — matches server cache TTL
    throwOnError: false,
  });
}
