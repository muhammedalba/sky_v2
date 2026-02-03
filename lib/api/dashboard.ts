import { apiClient } from './client';
import { env } from '../env';

const ENDPOINTS = {
  PRODUCT_STATS: env.ENDPOINTS.PRODUCTS.STATS,
  CATEGORY_STATS: env.ENDPOINTS.CATEGORIES.STATS,
  USER_STATS: env.ENDPOINTS.USERS.STATS,
  ORDER_STATS: env.ENDPOINTS.ORDERS.STATS,
  RECENT_ORDERS: '/order/allOrders?limit=5',
  TOP_PRODUCTS: '/products/allProducts?limit=5&sort=-sold',
};

export const dashboardApi = {
  getStats: async () => {
    const [products, categories, users, orders, recentOrders, topProducts] = await Promise.all([
      apiClient.get(ENDPOINTS.PRODUCT_STATS),
      apiClient.get(ENDPOINTS.CATEGORY_STATS),
      apiClient.get(ENDPOINTS.USER_STATS),
      apiClient.get(ENDPOINTS.ORDER_STATS),
      apiClient.get(ENDPOINTS.RECENT_ORDERS),
      apiClient.get(ENDPOINTS.TOP_PRODUCTS),
    ]);
    return {
      products: products.data.data || products.data,
      categories: categories.data.data || categories.data,
      users: users.data.data || users.data,
      orders: orders.data.data || orders.data,
      recentOrders: recentOrders.data.data,
      topProducts: topProducts.data.data,
    };
  },
};
