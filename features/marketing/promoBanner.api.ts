import { env } from '@/lib/env';
import { PromoBanner } from '@/types';
import { createCrudApi } from '@/shared/api/factory';
import { apiClient } from '@/lib/api/client';

const ENDPOINTS = env.ENDPOINTS.PROMO_BANNER;

const baseApi = createCrudApi<PromoBanner>(ENDPOINTS.BASE, false);

export const promoBannerApi = {
  ...baseApi,
  getBanners: baseApi.getAll, // Alias for backward compatibility
  getActive: () => apiClient.get(ENDPOINTS.ACTIVE),
};

