import { apiClient } from './client';
import { ApiResponse, Category } from '@/types';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_CATEGORIES || '/categories',
  STATS: process.env.NEXT_PUBLIC_ENDPOINT_CATEGORIES_STATS || '/categories/Statistics',
};

export const categoriesApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Category[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
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
