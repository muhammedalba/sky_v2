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
    // No client staleTime (same as the orders list): new orders come from other users,
    // so refetch on every visit. The server cache absorbs the load and is cleared on
    // place-order / order updates.
    throwOnError: false,
  });
}
