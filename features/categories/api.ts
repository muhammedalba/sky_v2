import { apiClient } from '@/lib/api';
import { env } from '@/lib/env';
import { ApiResponse, Category } from '@/types';

const ENDPOINTS = env.ENDPOINTS.CATEGORIES;

export const categoriesApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Category[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string, params?: Record<string, unknown>) => apiClient.get(`${ENDPOINTS.BASE}/${id}`, { params }),
  create: (data: Record<string, unknown> | FormData) =>
    apiClient.post(ENDPOINTS.BASE, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),
  update: (id: string, data: Record<string, unknown> | FormData) =>
    apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
