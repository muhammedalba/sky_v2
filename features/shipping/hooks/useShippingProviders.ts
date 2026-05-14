import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient as api } from '@/lib/api/client';
import { ApiResponse } from '@/types';
import { ShippingProvider, CreateShippingProviderDto, UpdateShippingProviderDto } from '../types';

export function useShippingProviders(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['shipping-providers', params],
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<ShippingProvider[]>>('/shipping/providers', { params });
      return response.data;
    },
  });
}

export function useCreateShippingProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateShippingProviderDto) => {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // If the value is a boolean, convert to string (standard for FormData)
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value as string | Blob);
          }
        }
      });

      const response = await api.post<ApiResponse<ShippingProvider>>('/shipping/providers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-providers'] });
    },
  });
}

export function useUpdateShippingProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateShippingProviderDto }) => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value as string | Blob);
          }
        }
      });

      const response = await api.patch<ApiResponse<ShippingProvider>>(`/shipping/providers/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-providers'] });
    },
  });
}

export function useDeleteShippingProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse<null>>(`/shipping/providers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-providers'] });
    },
  });
}
