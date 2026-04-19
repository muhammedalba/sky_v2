import { apiClient } from './client';
import { ApiResponse, Carousel } from '@/types';
import { env } from '../env';

const ENDPOINTS = env.ENDPOINTS.CAROUSEL;

export const carouselApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get<ApiResponse<Carousel[]>>(ENDPOINTS.BASE, { params }),
  getOne: (id: string, params?: Record<string, unknown>) => apiClient.get<ApiResponse<Carousel>>(ENDPOINTS.BASE + '/' + id, { params }),
  create: (data: FormData) => apiClient.post<ApiResponse<Carousel>>(ENDPOINTS.BASE, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: FormData) => apiClient.patch<ApiResponse<Carousel>>(ENDPOINTS.BASE + '/' + id, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id: string) => apiClient.delete(ENDPOINTS.BASE + '/' + id),
};
