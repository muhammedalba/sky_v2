import { apiClient } from '@/lib/api';
import { env } from '@/lib/env';
import { ApiResponse, Brand } from '@/types';

const ENDPOINTS = env.ENDPOINTS.BRANDS;

export const brandsApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Brand[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string, params?: Record<string, unknown>) => apiClient.get(`${ENDPOINTS.BASE}/${id}`, { params }),
  create: (data: FormData) => apiClient.post(ENDPOINTS.BASE, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
