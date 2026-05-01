'use client';

import { useState } from 'react';
import { useProductStats } from '@/features/products/hooks/useProductStats';
import { useTranslations } from 'next-intl';
import { StatCard } from './StatCard';
import { CompositionChart } from './CompositionChart';
import { CategoryChart } from './CategoryChart';
import { TrendChart } from './TrendChart';
import { TopProductsTable } from './TopProductsTable';
import { AdvancedFilters } from './AdvancedFilters';
import {
  Package,
  BarChart3,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Skeleton } from '@/shared/ui/Skeleton';
import ErrorMessage from '@/shared/ui/ErrorMessage';
import { cn } from '@/lib/utils';

export function ProductAnalyticsContainer() {
  const t = useTranslations('products.statistics');
  const [params, setParams] = useState<{ startDate?: string; endDate?: string }>({});

  const { data: stats, isLoading, error, refetch, isRefetching } = useProductStats(params);

  if (error) {
    return <ErrorMessage message={error.message} retry={() => refetch()} showIcon />;
  }

  const inventoryStats = stats?.inventoryStats || {
    totalVariants: 0,
    totalStock: 0,
    totalSold: 0,
    totalValue: 0,
    avgPrice: 0,
    stockHealth: 0
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-info bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200 text-foreground/80 hover:bg-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", (isLoading || isRefetching) && "animate-spin")} />
          {isLoading || isRefetching ? '...' : 'Refresh'}
        </button>
      </div>

      <AdvancedFilters
        onApply={(p) => setParams(p)}
        onReset={() => setParams({})}
        isLoading={isLoading || isRefetching}
      />

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))
        ) : (
          <>
            <StatCard
              title={t('overview.totalProducts')}
              value={stats?.totalProducts || 0}
              icon={<Package className="w-6 h-6" />}
              description="Across all categories"
            />
            <StatCard
              title={t('overview.stockValue')}
              value={`${inventoryStats.totalValue.toLocaleString()}`}
              icon={<DollarSign className="w-6 h-6" />}
              description="Current inventory worth"
            />
            <StatCard
              title={t('overview.unitsSold')}
              value={inventoryStats.totalSold.toLocaleString()}
              icon={<TrendingUp className="w-6 h-6" />}
              description="Life-time performance"
            />
            <StatCard
              title={t('overview.stockHealth')}
              value={`${Math.round(inventoryStats.stockHealth)}%`}
              icon={<Activity className="w-6 h-6" />}
              trend={{ value: 12, isUp: true }}
              description="Efficiency score"
              className={inventoryStats.stockHealth < 30 ? "ring-2 ring-destructive/20" : ""}
            />
          </>
        )}
      </div>

      {/* Charts Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <>
            <Skeleton className="h-[400px] rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
          </>
        ) : (
          <>
            <CompositionChart data={stats?.composition || { simple: 0, variable: 0 }} />
            <CategoryChart data={stats?.categoryDistribution || []} />
          </>
        )}
      </div>

      {/* Second Row: Trend & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {isLoading ? (
          <>
            <Skeleton className="h-[400px] rounded-3xl lg:col-span-2" />
            <Skeleton className="h-[400px] rounded-3xl lg:col-span-3" />
          </>
        ) : (
          <>
            <TrendChart data={stats?.last30DaysProducts || []} />
            <TopProductsTable products={stats?.topProducts || []} />
          </>
        )}
      </div>

      {/* Warning Area for Low Stock */}
      {!isLoading && stats && stats.lowStockCount > 0 && (
        <div className="rounded-3xl p-6 bg-warning/10 border border-warning/20 flex items-start gap-4">
          <div className="p-3 bg-warning/20 rounded-2xl text-warning">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-warning">{t('alerts.inventoryAlert')}</h4>
            <p className="text-warning/80">
              {t('alerts.lowStockMessage', { count: stats.lowStockCount })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
