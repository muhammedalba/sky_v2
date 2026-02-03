import { apiClient } from './client';
import { ApiResponse, PromoBanner } from '@/types';
import { env } from '../env';

const ENDPOINTS = env.ENDPOINTS.PROMO_BANNER;

export const promoBannerApi = {
  getBanners: () => apiClient.get<ApiResponse<PromoBanner[]>>(ENDPOINTS.BASE),
  getActive: () => apiClient.get(ENDPOINTS.ACTIVE),
  getOne: (id: string) => apiClient.get(`${ENDPOINTS.BASE}/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post(ENDPOINTS.BASE, data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`${ENDPOINTS.BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}`),
};
