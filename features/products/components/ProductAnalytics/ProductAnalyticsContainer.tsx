'use client';

import { useState } from 'react';
import { useProductStats } from '@/features/products/hooks/useProductStats';
import { useTranslations } from 'next-intl';
import { StatCard } from './StatCard';
import { CompositionChart } from './CompositionChart';
import { CategoryChart } from './CategoryChart';
import { AdvancedFilters } from './AdvancedFilters';
import { RefreshCw, Package, AlertTriangle, BarChart3, TrendingUp, Activity, Box, Tag } from 'lucide-react';
import { Skeleton } from '@/shared/ui/Skeleton';
import ErrorMessage from '@/shared/ui/ErrorMessage';
import { Badge } from '@/shared/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { cn, formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductStats {
  summary: {
    totalProducts: number;
    currentPeriodProducts: number;
    lowStockCount: number;
    totalStock: number;
    statusBreakdown: Record<string, number>;
    composition: { simple: number; variable: number };
  };
  topProducts: { _id: string; name: string; totalSold: number; stockValue: number }[];
  brandPerformance: { _id: string | null; productCount: number; brandName: string }[];
  supplierStats: { supplierId: string | null; supplierName: string; totalItems: number; investmentValue: number }[];
  categoryStats: { name: string; value: number }[];
  subcategoryStats: { subCategoryId: string; name: string; value: number }[];
  dateRange: { start: string; end: string };
}

// ─── Palette ─────────────────────────────────────────────────────────────────
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#14b8a6', '#3b82f6'];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  borderRadius: '10px',
  border: '1px solid hsl(var(--border))',
  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
  fontSize: 12,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
    </div>
  );
}

function HorizontalBar({ label, value, max, color, sub }: {
  label: string; value: number; max: number; color: string; sub?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium truncate max-w-[60%]">{label}</span>
        <span className="font-black tabular-nums" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductAnalyticsContainer() {
  const t = useTranslations('products.statistics');
  const [params, setParams] = useState<{ startDate?: string; endDate?: string }>({});
  const { data: raw, isLoading, error, refetch, isRefetching } = useProductStats(params);

  const stats = raw as ProductStats | undefined;

  if (error) {
    return <ErrorMessage message={(error as Error).message} retry={() => refetch()} showIcon />;
  }

  const summary = stats?.summary;
  const periodLabel = stats?.dateRange
    ? `${new Date(stats.dateRange.start).toLocaleDateString()} – ${new Date(stats.dateRange.end).toLocaleDateString()}`
    : '';

  // Derived
  const maxBrand = Math.max(...(stats?.brandPerformance ?? []).map(b => b.productCount), 1);
  const maxSupplierItems = Math.max(...(stats?.supplierStats ?? []).map(s => s.totalItems), 1);
  const topProducts = stats?.topProducts ?? [];
  const maxSold = Math.max(...topProducts.map(p => p.totalSold), 1);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">{t('subtitle')}</p>
          {periodLabel && (
            <Badge variant="secondary" className="mt-2 text-xs">{periodLabel}</Badge>
          )}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border text-foreground/80 hover:bg-secondary/50 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={cn('w-4 h-4', (isLoading || isRefetching) && 'animate-spin')} />
          {isLoading || isRefetching ? '...' : t('refresh')}
        </button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <AdvancedFilters
        onApply={(p) => setParams(p)}
        onReset={() => setParams({})}
        isLoading={isLoading || isRefetching}
      />

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <section>
        <SectionTitle title={t('overview.title')} desc={t('sections.compositionDesc')} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : (
            <>
              <StatCard
                title={t('overview.totalProducts')}
                value={summary?.totalProducts ?? 0}
                icon={<Package className="w-5 h-5" />}
                description={t('overview.newThisPeriod', { count: summary?.currentPeriodProducts ?? 0 })}
              />
              <StatCard
                title={t('overview.activeProducts')}
                value={summary?.statusBreakdown?.['true'] ?? 0}
                icon={<Activity className="w-5 h-5" />}
                description={t('overview.activeProductsDesc')}
              />
              <StatCard
                title={t('overview.totalStock')}
                value={(summary?.totalStock ?? 0).toLocaleString()}
                icon={<Box className="w-5 h-5" />}
                description={t('overview.totalStockDesc')}
              />
              <StatCard
                title={t('overview.lowStockItems')}
                value={summary?.lowStockCount ?? 0}
                icon={<AlertTriangle className="w-5 h-5" />}
                description={t('overview.lowStockDesc')}
                className={(summary?.lowStockCount ?? 0) > 0 ? 'ring-2 ring-destructive/20' : ''}
              />
              <StatCard
                title={t('overview.simpleProducts')}
                value={summary?.composition?.simple ?? 0}
                icon={<Tag className="w-5 h-5" />}
                description={t('overview.simpleProductsDesc')}
              />
              <StatCard
                title={t('overview.variableProducts')}
                value={summary?.composition?.variable ?? 0}
                icon={<BarChart3 className="w-5 h-5" />}
                description={t('overview.variableProductsDesc')}
              />
              <StatCard
                title={t('overview.brands')}
                value={stats?.brandPerformance?.length ?? 0}
                icon={<TrendingUp className="w-5 h-5" />}
                description={t('overview.brandsDesc')}
              />
              <StatCard
                title={t('overview.suppliers')}
                value={stats?.supplierStats?.length ?? 0}
                icon={<Package className="w-5 h-5" />}
                description={t('overview.suppliersDesc')}
              />
            </>
          )}
        </div>
      </section>

      {/* ── Composition + Category ─────────────────────────────────────────── */}
      <section>
        <SectionTitle
          title={t('sections.compositionTitle')}
          desc={t('sections.compositionDesc')}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {isLoading ? (
            <>
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
            </>
          ) : (
            <>
              <CompositionChart data={summary?.composition ?? { simple: 0, variable: 0 }} />
              <CategoryChart data={stats?.categoryStats ?? []} />
            </>
          )}
        </div>
      </section>

      {/* ── Subcategory + Brand ────────────────────────────────────────────── */}
      <section>
        <SectionTitle
          title={t('sections.subcategoryTitle')}
          desc={t('sections.subcategoryDesc')}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {isLoading ? (
            <>
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </>
          ) : (
            <>
              {/* Subcategory Bar Chart */}
              <Card className="border-none shadow-md bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">{t('charts.subcategoryDistribution')}</CardTitle>
                  <CardDescription>{t('charts.subcategoryDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full" style={{ height: 224 }}>
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                      <BarChart
                        data={stats?.subcategoryStats ?? []}
                        layout="vertical"
                        margin={{ left: 10, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={120}
                          fontSize={11}
                          tick={{ fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="value" name={t('charts.subcategoryDistribution')} radius={[0, 6, 6, 0]} barSize={18}>
                          {(stats?.subcategoryStats ?? []).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Performance */}
              <Card className="border-none shadow-md bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">{t('charts.brandPerformance')}</CardTitle>
                  <CardDescription>{t('charts.brandDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  {(stats?.brandPerformance ?? []).map((b, i) => (
                    <HorizontalBar
                      key={b._id ?? 'unknown'}
                      label={b.brandName}
                      value={b.productCount}
                      max={maxBrand}
                      color={COLORS[i % COLORS.length]}
                    />
                  ))}
                  {(stats?.brandPerformance ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">{t('charts.noBrandData')}</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </section>

      {/* ── Supplier Stats ─────────────────────────────────────────────────── */}
      <section>
        <SectionTitle
          title={t('sections.supplierTitle')}
          desc={t('sections.supplierDesc')}
        />
        {isLoading ? (
          <Skeleton className="h-56 rounded-2xl mt-4" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Supplier bar by items */}
            <Card className="border-none shadow-md bg-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">{t('charts.stockBySupplier')}</CardTitle>
                <CardDescription>{t('charts.stockBySupplierDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {(stats?.supplierStats ?? []).map((s, i) => (
                  <HorizontalBar
                    key={s.supplierId ?? i}
                    label={s.supplierName}
                    value={s.totalItems}
                    max={maxSupplierItems}
                    color={COLORS[i % COLORS.length]}
                    sub={t('charts.investment', { value: formatCurrency(s.investmentValue) })}
                  />
                ))}
                {(stats?.supplierStats ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">{t('charts.noSupplierData')}</p>
                )}
              </CardContent>
            </Card>

            {/* Supplier investment pie */}
            <Card className="border-none shadow-md bg-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">{t('charts.investmentShare')}</CardTitle>
                <CardDescription>{t('charts.investmentShareDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full" style={{ height: 208 }}>
                  <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    <PieChart>
                      <Pie
                        data={(stats?.supplierStats ?? []).map(s => ({
                          name: s.supplierName,
                          value: s.investmentValue || 0,
                        }))}
                        cx="50%" cy="50%"
                        innerRadius={45} outerRadius={70}
                        paddingAngle={3} dataKey="value"
                      >
                        {(stats?.supplierStats ?? []).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
                      <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-foreground">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* ── Top Products ───────────────────────────────────────────────────── */}
      <section>
        <SectionTitle
          title={t('sections.topProductsTitle')}
          desc={t('sections.topProductsDesc')}
        />
        {isLoading ? (
          <Skeleton className="h-64 rounded-2xl mt-4" />
        ) : (
          <Card className="border-none shadow-md bg-background mt-4">
            <CardContent className="pt-4">
              {topProducts.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-10">{t('charts.noProductData')}</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, idx) => (
                    <div key={product._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-border/40">
                      <span className="text-sm font-black text-muted-foreground w-6 shrink-0">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500"
                              style={{ width: `${(product.totalSold / maxSold) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {t('charts.soldUnits', { count: product.totalSold })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-sm text-foreground">{formatCurrency(product.stockValue)}</p>
                        <p className="text-[10px] text-muted-foreground">{t('charts.stockValue')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* ── Low Stock Alert ─────────────────────────────────────────────────── */}
      {!isLoading && (summary?.lowStockCount ?? 0) > 0 && (
        <div className="rounded-2xl p-5 bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
          <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-amber-600">{t('alerts.inventoryAlert')}</h4>
            <p className="text-sm text-amber-600/80 mt-0.5">
              {t('alerts.lowStockMessage', { count: summary?.lowStockCount ?? 0 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
