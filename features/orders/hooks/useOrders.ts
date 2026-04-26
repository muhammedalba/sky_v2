'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse, Order } from '@/types';
import { ordersApi } from '@/features/orders/api';

export function useOrders(params?: { page?: number; limit?: number; status?: string, keywords?: string }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = (await ordersApi.getAll(params)) as unknown as ApiResponse<Order[]>;
      return response;
    },
    throwOnError: true,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = (await ordersApi.getOne(id)) as unknown as ApiResponse<Order>;
      return response.data;
    },
    enabled: !!id,
    throwOnError: true,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await ordersApi.updateStatus(id, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
}
