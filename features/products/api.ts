import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { ApiResponse, Product } from '@/types';
import { ProductStatisticsData } from './statistics.types';
import { createCrudApi } from '@/shared/api/factory';

const ENDPOINTS = env.ENDPOINTS.PRODUCTS;
const baseCrud = createCrudApi<Product>(ENDPOINTS.BASE);

export const productsApi = {
  ...baseCrud,
  restore: (id: string) => apiClient.patch(`${ENDPOINTS.BASE}/${id}/restore`),
  hardDelete: (id: string) => apiClient.delete(`${ENDPOINTS.BASE}/${id}/permanent`),
  getStats: (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<ProductStatisticsData>> => 
    apiClient.get(ENDPOINTS.STATS, { params }),
};
