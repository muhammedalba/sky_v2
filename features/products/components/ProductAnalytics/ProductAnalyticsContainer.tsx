'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Rectangle,
} from 'recharts';

import { useProductStats } from '@/features/products/hooks/useProductStats';
import { StatCard, StatCardProps } from '@/shared/ui/StatCard';
import { CompositionChart } from './CompositionChart';
import { CategoryChart } from './CategoryChart';
import { DateRangeFilter } from '@/shared/ui/DateRangeFilter';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { PieCompositionChart } from '@/shared/ui/charts/PieCompositionChart';
import { CHART_TOOLTIP_STYLE, CHART_COLORS } from '@/shared/ui/charts/ChartUtils';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import { Icons } from '@/shared/ui/Icons';
import { formatCurrency, formatDate } from '@/lib/utils';

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

type BadgeVariant = StatCardProps['badgeVariant'];

interface CardDef {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub: string;
  badgeVariant: BadgeVariant;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SKELETON_COUNT = 8;

const ACCENT_MAP = [
  { from: 'from-indigo-500/5',  icon: 'text-indigo-500',  bg: 'bg-indigo-500/5'  },
  { from: 'from-violet-500/5',  icon: 'text-violet-500',  bg: 'bg-violet-500/10' },
  { from: 'from-emerald-500/5', icon: 'text-emerald-500', bg: 'bg-emerald-500/5'  },
  { from: 'from-amber-500/5',   icon: 'text-amber-500',   bg: 'bg-amber-500/5'   },
  { from: 'from-sky-500/5',     icon: 'text-sky-500',     bg: 'bg-sky-500/5'     },
  { from: 'from-rose-500/5',    icon: 'text-rose-500',    bg: 'bg-rose-500/5'    },
  { from: 'from-teal-500/5',    icon: 'text-teal-500',    bg: 'bg-teal-500/5'    },
  { from: 'from-pink-500/5',    icon: 'text-pink-500',    bg: 'bg-pink-500/10'   },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface HorizontalBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  sub?: string;
}

function HorizontalBar({ label, value, max, color, sub }: HorizontalBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium truncate max-w-[60%]">{label}</span>
        <span className="font-black tabular-nums" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Custom Bar Shape ─────────────────────────────────────────────────────────

interface BarShapeProps {
  index?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

function ColoredBar(props: BarShapeProps) {
  return (
    <Rectangle
      {...props}
      fill={CHART_COLORS[(props.index ?? 0) % CHART_COLORS.length]}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductAnalyticsContainer() {
  const t = useTranslations('products.statistics');
  const locale = useLocale();

  const [params, setParams] = useState<{ startDate?: string; endDate?: string }>({});
  const [isMounted, setIsMounted] = useState(false);

  const { data: raw, isLoading, error, refetch, isRefetching } = useProductStats(params);

  // Chart dimension tracking
  const subcatRef = useRef<HTMLDivElement>(null);
  const [subcatWidth, setSubcatWidth] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track subcategory chart width
  useEffect(() => {
    const el = subcatRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setSubcatWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stats = raw as ProductStats | undefined;
  const summary = stats?.summary;

  // ─── Derived values (memoized) ─────────────────────────────────────────────

  const periodLabel = useMemo(
    () =>
      stats?.dateRange
        ? `${formatDate(stats.dateRange.start)} → ${formatDate(stats.dateRange.end)}`
        : '',
    [stats?.dateRange],
  );

  const topProducts = useMemo(() => stats?.topProducts ?? [], [stats?.topProducts]);

  const maxBrand = useMemo(
    () => Math.max(...(stats?.brandPerformance ?? []).map((b) => b.productCount), 1),
    [stats?.brandPerformance],
  );

  const maxSupplierItems = useMemo(
    () => Math.max(...(stats?.supplierStats ?? []).map((s) => s.totalItems), 1),
    [stats?.supplierStats],
  );

  const maxSold = useMemo(
    () => Math.max(...topProducts.map((p) => p.totalSold), 1),
    [topProducts],
  );

  const supplierPieData = useMemo(
    () =>
      (stats?.supplierStats ?? []).map((s, i) => ({
        name: s.supplierName,
        value: s.investmentValue || 0,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [stats?.supplierStats],
  );

  const cards = useMemo<CardDef[]>(() => [
    {
      Icon: Icons.Package,
      label: t('overview.totalProducts'),
      value: summary?.totalProducts ?? 0,
      sub: t('overview.newThisPeriod', { count: summary?.currentPeriodProducts ?? 0 }),
      badgeVariant: (summary?.currentPeriodProducts ?? 0) > 0 ? 'default' : 'destructive',
    },
    {
      Icon: Icons.Activity,
      label: t('overview.activeProducts'),
      value: summary?.statusBreakdown?.['true'] ?? 0,
      sub: t('overview.activeProductsDesc'),
      badgeVariant: (summary?.statusBreakdown?.['true'] ?? 0) > 0 ? 'success' : 'destructive',
    },
    {
      Icon: Icons.Box,
      label: t('overview.totalStock'),
      value: (summary?.totalStock ?? 0).toLocaleString(),
      sub: t('overview.totalStockDesc'),
      badgeVariant: (summary?.totalStock ?? 0) > 0 ? 'success' : 'destructive',
    },
    {
      Icon: Icons.AlertTriangle,
      label: t('overview.lowStockItems'),
      value: summary?.lowStockCount ?? 0,
      sub: t('overview.lowStockDesc'),
      badgeVariant: (summary?.lowStockCount ?? 0) > 0 ? 'destructive' : 'success',
    },
    {
      Icon: Icons.BarChart3,
      label: t('overview.simpleProducts'),
      value: summary?.composition?.simple ?? 0,
      sub: t('overview.simpleProductsDesc'),
      badgeVariant: (summary?.composition?.simple ?? 0) > 0 ? 'success' : 'secondary',
    },
    {
      Icon: Icons.BarChart3,
      label: t('overview.variableProducts'),
      value: summary?.composition?.variable ?? 0,
      sub: t('overview.variableProductsDesc'),
      badgeVariant: (summary?.composition?.variable ?? 0) > 0 ? 'success' : 'secondary',
    },
    {
      Icon: Icons.TrendingUp,
      label: t('overview.brands'),
      value: stats?.brandPerformance?.length ?? 0,
      sub: t('overview.brandsDesc'),
      badgeVariant: (stats?.brandPerformance?.length ?? 0) > 0 ? 'success' : 'secondary',
    },
    {
      Icon: Icons.Package,
      label: t('overview.suppliers'),
      value: stats?.supplierStats?.length ?? 0,
      sub: t('overview.suppliersDesc'),
      badgeVariant: (stats?.supplierStats?.length ?? 0) > 0 ? 'success' : 'secondary',
    },
  ], [summary, stats?.brandPerformance, stats?.supplierStats, t]);

  // ─── Handlers (memoized) ───────────────────────────────────────────────────

  const handleApply = useCallback(
    (p: { startDate?: string; endDate?: string }) => setParams(p),
    [],
  );

  const handleReset = useCallback(() => setParams({}), []);

  const handleRefetch = useCallback(() => { void refetch(); }, [refetch]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={periodLabel}
        action={{
          label: t('refresh'),
          icon: <Icons.RefreshCw className="w-4 h-4" />,
          onClick: handleRefetch,
          disabled: isLoading || isRefetching,
        }}
      />

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <DateRangeFilter
        onApply={handleApply}
        onReset={handleReset}
        isLoading={isLoading || isRefetching}
      />

      {/* ── Error Banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-2xl p-4 bg-destructive/10 border border-destructive/20 flex items-center gap-3">
          <Icons.AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">
            {t('alerts.fetchError')}
          </p>
        </div>
      )}

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <SectionWrapper title={t('overview.title')} desc={t('sections.compositionDesc')}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))
            : cards.map((c, i) => {
                const a = ACCENT_MAP[i % ACCENT_MAP.length];
                return (
                  <StatCard
                    key={c.label}
                    title={c.label}
                    value={c.value}
                    Icon={c.Icon}
                    badge={c.sub}
                    colorFrom={a.from}
                    colorBg={a.bg}
                    colorIcon={a.icon}
                    badgeVariant={c.badgeVariant ?? 'success'}
                  />
                );
              })}
        </div>
      </SectionWrapper>

      {/* ── Composition + Category ───────────────────────────────────────────── */}
      <SectionWrapper
        title={t('sections.compositionTitle')}
        desc={t('sections.compositionDesc')}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 min-w-0">
          {isLoading ? (
            <>
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
            </>
          ) : (
            <>
              {isMounted && <CompositionChart data={summary?.composition ?? { simple: 0, variable: 0 }} />}
              {isMounted && <CategoryChart data={stats?.categoryStats ?? []} />}
            </>
          )}
        </div>
      </SectionWrapper>

      {/* ── Subcategory + Brand ──────────────────────────────────────────────── */}
      <SectionWrapper
        title={t('sections.subcategoryTitle')}
        desc={t('sections.subcategoryDesc')}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 min-w-0">
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
                  <div ref={subcatRef} className="w-full" style={{ height: 224 }}>
                    {subcatWidth > 0 && (
                      <BarChart
                        width={subcatWidth}
                        height={224}
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
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                        <Bar
                          dataKey="value"
                          name={t('charts.subcategoryDistribution')}
                          radius={[0, 6, 6, 0]}
                          barSize={18}
                          shape={<ColoredBar />}
                        />
                      </BarChart>
                    )}
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
                      color={CHART_COLORS[i % CHART_COLORS.length]}
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
      </SectionWrapper>

      {/* ── Supplier Stats ───────────────────────────────────────────────────── */}
      <SectionWrapper
        title={t('sections.supplierTitle')}
        desc={t('sections.supplierDesc')}
      >
        {isLoading ? (
          <Skeleton className="h-56 rounded-2xl mt-4" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4 min-w-0">
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
                    color={CHART_COLORS[i % CHART_COLORS.length]}
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
                  {isMounted && (
                    <PieCompositionChart
                      data={supplierPieData}
                      height={208}
                      innerRadius={45}
                      outerRadius={70}
                      tooltipFormatter={(v) => [formatCurrency(Number(v)), 'Investment']}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </SectionWrapper>

      {/* ── Top Products ─────────────────────────────────────────────────────── */}
      <SectionWrapper
        title={t('sections.topProductsTitle')}
        desc={t('sections.topProductsDesc')}
      >
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
                    <div
                      key={product._id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-border/40"
                    >
                      <span className="text-sm font-black text-muted-foreground w-6 shrink-0">
                        #{idx + 1}
                      </span>
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
                        <p className="font-black text-sm text-foreground">
                          {formatCurrency(product.stockValue, locale)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{t('charts.stockValue')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </SectionWrapper>

      {/* ── Low Stock Alert ──────────────────────────────────────────────────── */}
      {!isLoading && (summary?.lowStockCount ?? 0) > 0 && (
        <div className="rounded-2xl p-5 bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
          <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-600 shrink-0">
            <Icons.AlertTriangle className="w-5 h-5" />
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
