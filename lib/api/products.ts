import { apiClient } from './client';
import { ApiResponse, Product } from '@/types';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_PRODUCTS || '/products',
  STATS: process.env.NEXT_PUBLIC_ENDPOINT_PRODUCTS_STATS || '/products/ProductsStatistics',
};

export const productsApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Product[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get<ApiResponse<Product>>(ENDPOINTS.BASE + '/' + id),
  create: (data: Record<string, unknown> | FormData) =>
    apiClient.post<ApiResponse<Product>>(ENDPOINTS.BASE, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),
  update: (id: string, data: Record<string, unknown> | FormData) =>
    apiClient.patch<ApiResponse<Product>>(ENDPOINTS.BASE + '/' + id, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),
  delete: (id: string) => apiClient.delete(ENDPOINTS.BASE + '/' + id),
  getStats: () => apiClient.get(ENDPOINTS.STATS),
};
