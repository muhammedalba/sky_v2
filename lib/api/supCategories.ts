import { apiClient } from './client';
import { ApiResponse, SubCategory } from '@/types';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_SUP_CATEGORIES || '/sup-category',
  STATS: process.env.NEXT_PUBLIC_ENDPOINT_SUP_CATEGORIES_STATS || '/sup-category/Statistics',
};

export const supCategoriesApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<SubCategory[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get<ApiResponse<SubCategory>>(ENDPOINTS.BASE + '/' + id),
  create: (data: FormData | Record<string, unknown>) => apiClient.post<ApiResponse<SubCategory>>(ENDPOINTS.BASE, data),
  update: (id: string, data: FormData | Record<string, unknown>) => apiClient.patch<ApiResponse<SubCategory>>(ENDPOINTS.BASE + '/' + id, data),
  delete: (id: string) => apiClient.delete(ENDPOINTS.BASE + '/' + id),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
