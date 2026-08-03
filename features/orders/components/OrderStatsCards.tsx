'use client';

import { OrderStatsResponse } from '@/features/orders/types';
import { StatCard } from '@/shared/ui/StatCard';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { useTranslations } from 'next-intl';
import {
  OrdersIcon,
  ClockIcon,
  ShieldCheckIcon,
  DollarSignIcon,
  BarChart3Icon,
  ActivityIcon,
} from '@/shared/ui/Icons';

interface OrderStatsCardsProps {
  stats?: OrderStatsResponse;
  isLoading: boolean;
}

export default function OrderStatsCards({ stats, isLoading }: OrderStatsCardsProps) {
  const formatCurrency = useFormatCurrency();
  const t = useTranslations('orders.stats');

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 bg-card p-5 space-y-4 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-7 w-24 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const { overview, statusBreakdown } = stats;

  // Find the most active status
  const topStatus = Object.entries(statusBreakdown || {}).sort(
    ([, a], [, b]) => b - a,
  )[0];

  const cards = [
    {
      title: t('totalOrders'),
      value: overview.totalOrdersSystemWide?.toLocaleString() ?? '0',
      Icon: OrdersIcon,
      colorFrom: 'from-primary/5',
      colorBg: 'bg-primary/10 dark:bg-primary/20',
      colorIcon: 'text-primary',
      badge: t('badges.allTime'),
      badgeVariant: 'default' as const,
    },
    {
      title: t('periodOrders'),
      value: overview.currentPeriodOrders?.toLocaleString() ?? '0',
      Icon: ClockIcon,
      colorFrom: 'from-blue-500/5',
      colorBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      colorIcon: 'text-blue-500',
      badge: t('badges.thisMonth'),
      badgeVariant: 'default' as const,
    },
    {
      title: t('validOrders'),
      value: overview.validOrdersCount?.toLocaleString() ?? '0',
      Icon: ShieldCheckIcon,
      colorFrom: 'from-emerald-500/5',
      colorBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      colorIcon: 'text-emerald-500',
      badge: t('badges.successful'),
      badgeVariant: 'success' as const,
    },
    {
      title: t('revenue'),
      value: formatCurrency(overview.totalRevenue ?? 0),
      Icon: DollarSignIcon,
      colorFrom: 'from-green-500/5',
      colorBg: 'bg-green-500/10 dark:bg-green-500/20',
      colorIcon: 'text-green-600',
      badge: t('badges.thisMonth'),
      badgeVariant: 'success' as const,
    },
    {
      title: t('avgOrderValue'),
      value: formatCurrency(overview.averageOrderValue ?? 0),
      Icon: BarChart3Icon,
      colorFrom: 'from-purple-500/5',
      colorBg: 'bg-purple-500/10 dark:bg-purple-500/20',
      colorIcon: 'text-purple-500',
    },
    {
      title: t('topStatus'),
      value: topStatus ? `${topStatus[1]}` : '0',
      Icon: ActivityIcon,
      colorFrom: 'from-amber-500/5',
      colorBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      colorIcon: 'text-amber-500',
      badge: topStatus?.[0] || '—',
      badgeVariant: 'warning' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
