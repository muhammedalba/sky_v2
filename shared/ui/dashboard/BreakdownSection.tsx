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
import { Can } from '@/components/auth/Can';
import { Permissions } from '@/features/roles/types';
import { useReviewStats } from '@/features/reviews/hooks/useReviews';
import type { ReviewStatus } from '@/features/reviews/types';

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
  /** `color` overrides the name-based lookup (needed when `name` is a translated label) */
  data: { name: string; value: number; color?: string }[];
}

function DonutCard({ title, data }: DonutCardProps) {
  const chartData = useMemo(
    () =>
      data.map((item, i) => ({
        ...item,
        color:
          item.color ??
          STATUS_COLOR[item.name.toLowerCase()] ??
          CHART_COLORS[i % CHART_COLORS.length],
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

const REVIEW_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected'];
const REVIEW_STATUS_COLOR: Record<ReviewStatus, string> = {
  pending:  STATUS_COLOR.pending,
  approved: STATUS_COLOR.active,
  rejected: STATUS_COLOR.cancelled,
};

/** Review moderation breakdown — has its own query (GET /reviews/statistics). */
function ReviewStatusCard() {
  const t = useTranslations('dashboard.breakdownSection');
  const tStatus = useTranslations('reviews.admin.status');
  const { data: stats } = useReviewStats();

  const reviewData = useMemo(() => {
    if (!stats?.total) {
      return [{ name: t('noReviews'), value: 1, color: STATUS_COLOR.unverified }];
    }
    return REVIEW_STATUSES.filter((status) => stats[status] > 0).map((status) => ({
      name: tStatus(status),
      value: stats[status],
      color: REVIEW_STATUS_COLOR[status],
    }));
  }, [stats, t, tStatus]);

  return <DonutCard title={t('reviewStatus')} data={reviewData} />;
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
  ] as const, [t]);

  const tooltipFormatter = useCallback(
    (
      v: number | string | ReadonlyArray<number | string> | undefined,
      name: number | string | undefined,
    ): [string | number, string] => {
      const revenueName  = t('revenue');
      const discountName = t('discount');
      const formatted =
        name === revenueName || name === discountName
          ? formatCurrency(Number(v))
          : typeof v === 'number' ? v : String(v ?? '');
      return [formatted, String(name ?? '')];
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
      {/* auto-fit: 3 or 4 cards depending on whether the review card is visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
        <DonutCard title={t('userRoles')}   data={roleData} />
        <DonutCard title={t('userStatus')}  data={statusData} />
        <DonutCard title={t('orderStatus')} data={orderStatusWithFallback} />
        {/* The stats endpoint requires VIEW_REVIEWS — mount (and fetch) only when allowed */}
        <Can permission={Permissions.VIEW_REVIEWS}>
          <ReviewStatusCard />
        </Can>
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
