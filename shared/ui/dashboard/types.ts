export interface TopProduct {
  _id: string;
  title: string | { en?: string; ar?: string };
  imageCover?: string;
  priceRange?: { min: number; max: number };
  totalSold?: number;
  stockSummary?: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isUnlimitedStock?: boolean;
  variantCount?: number;
}

export interface DashboardData {
  stats: { brands: number; categories: number; subCategories: number };
  topProducts: TopProduct[];
  suppliers: {
    totalSuppliers: number;
    suppliersByStatus: { _id: boolean; count: number }[];
    suppliersWithProducts: { supplierName: string; totalProducts: number; supplierId: string }[];
  };
  users: {
    overview: { totalUsers: number; periodNewCustomers: number };
    roleBreakdown: Record<string, number>;
    statusBreakdown: Record<string, number>;
    dailyRegistrations: { date: string; count: number }[];
    dateRange: { start: string; end: string };
  };
  orders: {
    overview: {
      averageOrderValue: number;
      currentPeriodOrders: number;
      totalOrdersSystemWide: number;
      totalRevenue: number;
      validOrdersCount: number;
    };
    dailyOrders: { date: string; count: number }[];
    statusBreakdown: Record<string, number>;
    topProducts: TopProduct[];
    topCustomers: { name: string; orders: number; revenue?: number }[];
    dateRange: { start: string; end: string };
  };
  marketingStats: {
    overview: {
      activeCoupons: number;
      expiredCoupons: number;
      totalCoupons: number;
      totalMarketingCost: number;
    };
    period: { start: string; end: string };
    salesBreakdown: {
      marketing: { orders: number; revenue: number; discount: number };
      organic: { orders: number; revenue: number; discount: number };
    };
    topPerformingCoupons: {
      code?: string;
      usageCount?: number;
      discount?: number;
      revenue?: number;
    }[];
  };
}

export const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#14b8a6'];
export const GRADIENT_FROM = '#6366f1';
export const GRADIENT_TO = '#8b5cf6';

export function getProductTitle(title: TopProduct['title']): string {
  if (typeof title === 'string') return title;
  return title?.en || title?.ar || '';
}
