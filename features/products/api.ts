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
  getStats: (params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<ProductStatisticsData>> => {
    const query: Record<string, string> = {};
    // Convert YYYY-MM-DD → ISO datetime for accurate range (start of day / end of day)
    if (params?.startDate) {
      query.startDate = new Date(`${params.startDate}T00:00:00`).toISOString();
    }
    if (params?.endDate) {
      query.endDate = new Date(`${params.endDate}T23:59:59`).toISOString();
    }
    return apiClient.get(ENDPOINTS.STATS, { params: Object.keys(query).length ? query : undefined });
  },
};

