import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShippingRate, CreateShippingRateDto, UpdateShippingRateDto } from '../types';
import { apiClient } from '@/lib/api/client';
import { ApiResponse } from '@/types';

export const shippingRatesKeys = {
  all: ['shippingRates'] as const,
  lists: () => [...shippingRatesKeys.all, 'list'] as const,
  list: (params: Record<string, unknown> | undefined) => [...shippingRatesKeys.lists(), params] as const,
  details: () => [...shippingRatesKeys.all, 'detail'] as const,
  detail: (id: string) => [...shippingRatesKeys.details(), id] as const,
};

export function useShippingRates(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: shippingRatesKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ShippingRate[]>, ApiResponse<ShippingRate[]>>('/shipping/rates', { params });
      return response;
    },
  });
}

export function useShippingRate(id: string) {
  return useQuery({
    queryKey: shippingRatesKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ShippingRate>(`/shipping/rates/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateShippingRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateShippingRateDto) => {
      const { data } = await apiClient.post<ShippingRate>('/shipping/rates', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingRatesKeys.all });
    },
  });
}

export function useUpdateShippingRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateShippingRateDto }) => {
      const { data } = await apiClient.patch<ShippingRate>(`/shipping/rates/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingRatesKeys.all });
    },
  });
}

export function useDeleteShippingRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/shipping/rates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shippingRatesKeys.all });
    },
  });
}
