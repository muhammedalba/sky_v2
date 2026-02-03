import { apiClient } from './client';
import { ApiResponse, Supplier } from '@/types';
import { env } from '../env';

const ENDPOINTS = env.ENDPOINTS.SUPPLIERS;

export const suppliersApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Supplier[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get<ApiResponse<Supplier>>(ENDPOINTS.BASE + '/' + id),
  create: (data: FormData) => apiClient.post<ApiResponse<Supplier>>(ENDPOINTS.BASE, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => apiClient.patch<ApiResponse<Supplier>>(ENDPOINTS.BASE + '/' + id, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => apiClient.delete(ENDPOINTS.BASE + '/' + id),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
