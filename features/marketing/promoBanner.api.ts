import { apiClient } from '@/lib/api';
import { env } from '@/lib/env';
import { ApiResponse, PromoBanner } from '@/types';

const ENDPOINTS = env.ENDPOINTS.PROMO_BANNER;

export const promoBannerApi = {
  getBanners: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<PromoBanner[]>>(ENDPOINTS.BASE, { params }),
  getActive: () => apiClient.get(ENDPOINTS.ACTIVE),
  getOne: (id: string, params?: Record<string, unknown>) => apiClient.get(`${ENDPOINTS.BASE}/${id}`, { params }),
  create: (data: Record<string, unknown>) => apiClient.post(ENDPOINTS.BASE, data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
};
