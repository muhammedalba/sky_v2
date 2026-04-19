import { apiClient } from './client';
import { ApiResponse, Coupon } from '@/types';
import { env } from '../env';

const ENDPOINTS = env.ENDPOINTS.COUPONS;

export const couponsApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Coupon[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string, params?: Record<string, unknown>) => apiClient.get(`${ENDPOINTS.BASE}/${id}`, { params }),
  create: (data: Record<string, unknown>) => apiClient.post(ENDPOINTS.BASE, data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
};
