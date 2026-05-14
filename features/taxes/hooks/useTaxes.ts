import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient as api } from '@/lib/api/client';
import { ApiResponse } from '@/types';

export interface Tax {
  _id: string;
  name: string;
  percentage: number;
  country?: { _id: string; name: { ar: string; en: string } } | string;
  taxNumber?: string;
  isIncludedInPrice: boolean;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const taxKeys = {
  all: ['taxes'] as const,
  lists: () => [...taxKeys.all, 'list'] as const,
  list: (params: any) => [...taxKeys.lists(), params] as const,
};

export const useTaxes = (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) => {
  return useQuery({
    queryKey: taxKeys.list(params),
    queryFn: async () => {
      const response = await api.get<any, ApiResponse<Tax[]>>('/taxes', { params });
      return response;
    },
  });
};

export const useCreateTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Tax>) => {
      const response = await api.post<any, ApiResponse<Tax>>('/taxes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
    },
  });
};

export const useUpdateTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tax> }) => {
      const response = await api.patch<any, ApiResponse<Tax>>(`/taxes/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
    },
  });
};

export const useDeleteTax = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<any, ApiResponse<any>>(`/taxes/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] });
    },
  });
};
