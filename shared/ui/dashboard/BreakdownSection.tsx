'use client';

import { useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { PieCompositionChart } from '@/shared/ui/charts/PieCompositionChart';
import { BarGroupChart } from '@/shared/ui/charts/BarGroupChart';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CHART_COLORS } from './types';
import type { DashboardData } from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  active:      '#22c55e',
  inactive:    '#f59e0b',
  pending:     '#f59e0b',
  delivered:   '#22c55e',
  cancelled:   '#ef4444',
  processing:  '#6366f1',
  shipped:     '#14b8a6',
  returned:    '#ec4899',
  unverified:  '#94a3b8',
};

const BAR_COLORS = {
  orders:   '#6366f1',
  revenue:  '#22c55e',
  discount: '#f59e0b',
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DonutCardProps {
  title: string;
  data: { name: string; value: number }[];
}

function DonutCard({ title, data }: DonutCardProps) {
  const chartData = useMemo(
    () =>
      data.map((item, i) => ({
        ...item,
        color: STATUS_COLOR[item.name.toLowerCase()] ?? CHART_COLORS[i % CHART_COLORS.length],
      })),
    [data],
  );

  return (
    <Card className="border-none shadow-md bg-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <PieCompositionChart
          data={chartData}
          height={200}
          innerRadius={50}
          outerRadius={70}
        />
        <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
          {chartData.map((r) => (
            <Badge key={r.name} variant="secondary" className="text-[10px] capitalize gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: r.color }} />
              {r.name}: {r.value}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface BreakdownSectionProps {
  d?: DashboardData;
}

export function BreakdownSection({ d }: BreakdownSectionProps) {
  const t = useTranslations('dashboard.breakdownSection');

  // ─── Derived data (memoized) ─────────────────────────────────────────────

  const roleData = useMemo(
    () => Object.entries(d?.users?.roleBreakdown ?? {}).map(([name, value]) => ({ name, value })),
    [d?.users?.roleBreakdown],
  );

  const statusData = useMemo(
    () =>
      Object.entries(d?.users?.statusBreakdown ?? {}).map(([name, value]) => ({
        name: name === 'null' ? 'unverified' : name,
        value,
      })),
    [d?.users?.statusBreakdown],
  );

  const orderStatusData = useMemo(
    () => Object.entries(d?.orders?.statusBreakdown ?? {}).map(([name, value]) => ({ name, value })),
    [d?.orders?.statusBreakdown],
  );

  const orderStatusWithFallback = useMemo(
    () => orderStatusData.length > 0 ? orderStatusData : [{ name: t('noOrders'), value: 1 }],
    [orderStatusData, t],
  );

  const salesData = useMemo(() => {
    const sb = d?.marketingStats?.salesBreakdown;
    if (!sb) return [];
    return [
      {
        name:     t('organic'),
        orders:   sb.organic.orders,
        revenue:  sb.organic.revenue,
        discount: sb.organic.discount,
      },
      {
        name:     t('marketing'),
        orders:   sb.marketing.orders,
        revenue:  sb.marketing.revenue,
        discount: sb.marketing.discount,
      },
    ];
  }, [d?.marketingStats?.salesBreakdown, t]);

  const bars = useMemo(() => [
    { dataKey: 'orders',   name: t('orders'),   color: BAR_COLORS.orders   },
    { dataKey: 'revenue',  name: t('revenue'),  color: BAR_COLORS.revenue  },
    { dataKey: 'discount', name: t('discount'), color: BAR_COLORS.discount },
  ], [t]);

  const tooltipFormatter = useCallback(
    (v: number | string, name: string): [string | number, string] => {
      const revenueName  = t('revenue');
      const discountName = t('discount');
      const formatted =
        name === revenueName || name === discountName
          ? formatCurrency(Number(v))
          : v;
      return [formatted, name];
    },
    [t],
  );

  // ─── Derived period label ────────────────────────────────────────────────

  const period = d?.marketingStats?.period;
  const periodLabel = useMemo(
    () => period ? `${formatDate(period.start)} → ${formatDate(period.end)}` : null,
    [period],
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DonutCard title={t('userRoles')}   data={roleData} />
        <DonutCard title={t('userStatus')}  data={statusData} />
        <DonutCard title={t('orderStatus')} data={orderStatusWithFallback} />
      </div>

      <Card className="border-none shadow-md bg-background">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">{t('salesChannelsTitle')}</CardTitle>
          <CardDescription>
            {t('salesChannelsDesc')}
            {periodLabel && (
              <span className="ms-2 text-[11px] text-muted-foreground">
                ({periodLabel})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarGroupChart
            data={salesData}
            xAxisKey="name"
            height={250}
            bars={bars}
            tooltipFormatter={tooltipFormatter}
          />
        </CardContent>
      </Card>
    </div>
  );
}
