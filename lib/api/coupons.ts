import { apiClient } from './client';
import { ApiResponse, Coupon } from '@/types';

const ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_ENDPOINT_COUPONS || '/coupons',
};

export const couponsApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Coupon[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post(ENDPOINTS.BASE, data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
};
