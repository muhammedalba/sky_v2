import { apiClient } from './client';

const ENDPOINTS = {
  PRODUCT_STATS: process.env.NEXT_PUBLIC_ENDPOINT_PRODUCTS_STATS || '/products/ProductsStatistics',
  CATEGORY_STATS: process.env.NEXT_PUBLIC_ENDPOINT_CATEGORIES_STATS || '/categories/Statistics',
  USER_STATS: process.env.NEXT_PUBLIC_ENDPOINT_USERS_STATS || '/users/statistics',
  ORDER_STATS: process.env.NEXT_PUBLIC_ENDPOINT_ORDERS_STATS || '/order/statistics',
  RECENT_ORDERS: '/order/allOrders?limit=5', // Manual override if not in env
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
