import { Product } from './types';

export interface ProductStatisticsData {
  totalProducts: number;
  statusBreakdown: Record<string, number>;
  currentPeriodProducts: number;
  dailyNewProducts: { date: string; count: number }[];
  last30DaysProducts: { date: string; count: number }[];
  composition: {
    simple: number;
    variable: number;
  };
  categoryDistribution: { name: string; value: number }[];
  topProducts: any[];
  lowStockCount: number;
  lowStockProducts: any[];
  inventoryStats: {
    totalVariants: number;
    totalStock: number;
    totalSold: number;
    totalValue: number;
    avgPrice: number;
    stockHealth: number;
  };
  dateRange: { start: string; end: string };
  sortedBy: string;
  lang: string;
}
