import { apiClient } from './client';
import { ApiResponse, Brand } from '@/types';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_BRANDS || '/brands',
  STATS: process.env.NEXT_PUBLIC_ENDPOINT_BRANDS_STATS || '/brands/statistics',
};

export const brandsApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Brand[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
  create: (data: FormData) => apiClient.post(ENDPOINTS.BASE, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
