import { apiClient } from './client';
import { env } from '../env';

export interface DashboardParams {
  startDate?: string;
  endDate?: string;
}

const ENDPOINTS = {
  CATEGORY_STATS: env.ENDPOINTS.CATEGORIES.STATS,
  SUB_CATEGORY_STATS: env.ENDPOINTS.SUP_CATEGORIES.STATS,
  BRAND_STATS: env.ENDPOINTS.BRANDS.STATS,
  SUPPLIER_STATS: env.ENDPOINTS.SUPPLIERS.STATS,
  USER_STATS: env.ENDPOINTS.USERS.STATS,
  ORDER_STATS: env.ENDPOINTS.ORDERS.STATS,
  PRODUCTS_STATS: env.ENDPOINTS.PRODUCTS.STATS,
  MARKETING_STATS: env.ENDPOINTS.ORDERS.MARKETING_STATS,
};

/** Convert YYYY-MM-DD → ISO datetime (start / end of day) */
function buildDateParams(params?: DashboardParams): Record<string, string> | undefined {
  if (!params?.startDate && !params?.endDate) return undefined;
  const query: Record<string, string> = {};
  if (params.startDate) query.startDate = new Date(`${params.startDate}T00:00:00`).toISOString();
  if (params.endDate)   query.endDate   = new Date(`${params.endDate}T23:59:59`).toISOString();
  return query;
}

export const dashboardApi = {
  getStats: async (params?: DashboardParams) => {
    const dateParams = buildDateParams(params);

    const [categories, subCategories, brands, suppliers, users, orders, MARKETING_STATS, productsStats] =
      await Promise.all([
        // Static stats — no date range needed
        apiClient.get(ENDPOINTS.CATEGORY_STATS),
        apiClient.get(ENDPOINTS.SUB_CATEGORY_STATS),
        apiClient.get(ENDPOINTS.BRAND_STATS),
        apiClient.get(ENDPOINTS.SUPPLIER_STATS),
        // Time-sensitive stats — pass date range
        apiClient.get(ENDPOINTS.USER_STATS,       { params: dateParams }),
        apiClient.get(ENDPOINTS.ORDER_STATS,      { params: dateParams }),
        apiClient.get(ENDPOINTS.MARKETING_STATS,  { params: dateParams }),
        apiClient.get(ENDPOINTS.PRODUCTS_STATS,   { params: dateParams }),
      ]);

    const productsStatsData = productsStats.data.data || productsStats.data;

    return {
      stats: {
        categories:    categories.data.data    || categories.data,
        subCategories: subCategories.data.data || subCategories.data,
        brands:        brands.data.data        || brands.data,
      },
      topProducts:   productsStatsData.topProducts || [],
      suppliers:     suppliers.data.data     || suppliers.data,
      users:         users.data.data         || users.data,
      orders:        orders.data.data        || orders.data,
      marketingStats: MARKETING_STATS.data.data || MARKETING_STATS.data,
    };
  },
};
