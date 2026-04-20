import { apiClient } from '@/lib/api';
import { env } from '@/lib/env';
import { ApiResponse, Product } from '@/types';

const ENDPOINTS = env.ENDPOINTS.PRODUCTS;

export const productsApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Product[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string, params?: Record<string, string>) =>
    apiClient.get<ApiResponse<Product>>(ENDPOINTS.BASE + '/' + id, { params }),
  create: (data: Record<string, unknown> | FormData) =>
    apiClient.post<ApiResponse<Product>>(ENDPOINTS.BASE, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),
  update: (id: string, data: Record<string, unknown> | FormData) =>
    apiClient.patch<ApiResponse<Product>>(ENDPOINTS.BASE + '/' + id, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),
  delete: (id: string) => apiClient.delete(ENDPOINTS.BASE + '/' + id),
  restore: (id: string) => apiClient.patch(ENDPOINTS.BASE + '/' + id + '/restore'),
  hardDelete: (id: string) => apiClient.delete(ENDPOINTS.BASE + '/' + id + '/permanent'),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
