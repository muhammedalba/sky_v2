'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ApiResponse, Order } from '@/types';

export function useOrders(params?: { page?: number; limit?: number; status?: string, keywords?: string }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = (await api.orders.getAll(params)) as unknown as ApiResponse<Order[]>;
      return response;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = (await api.orders.getOne(id)) as unknown as ApiResponse<Order>;
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.orders.updateStatus(id, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
}
