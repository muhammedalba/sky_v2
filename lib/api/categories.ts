import { apiClient } from './client';
import { ApiResponse, Category } from '@/types';
import { env } from '../env';

const ENDPOINTS = env.ENDPOINTS.CATEGORIES;

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
