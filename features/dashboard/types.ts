import { Product } from '@/features/products/types';
import { Order } from '@/features/orders/types';

export interface DashboardStats {
  products: {
    totalProducts: number;
  };
  categories: {
    totalCategories: number;
  };
  users: {
    totalUsers: number;
  };
  orders: {
    totalOrders: number;
    totalRevenue: number;
  };
  recentOrders?: Order[];
  topProducts?: Product[];
}
