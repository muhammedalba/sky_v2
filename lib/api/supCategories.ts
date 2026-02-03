import { apiClient } from './client';
import { ApiResponse, SubCategory } from '@/types';
import { env } from '../env';

const ENDPOINTS = env.ENDPOINTS.SUP_CATEGORIES;

export const supCategoriesApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<SubCategory[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get<ApiResponse<SubCategory>>(ENDPOINTS.BASE + '/' + id),
  create: (data: FormData | Record<string, unknown>) => apiClient.post<ApiResponse<SubCategory>>(ENDPOINTS.BASE, data),
  update: (id: string, data: FormData | Record<string, unknown>) => apiClient.patch<ApiResponse<SubCategory>>(ENDPOINTS.BASE + '/' + id, data),
  delete: (id: string) => apiClient.delete(ENDPOINTS.BASE + '/' + id),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
