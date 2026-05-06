'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import type { DashboardData } from './types';
import { AreaTrendChart } from '@/shared/ui/charts/AreaTrendChart';
import { useTranslations } from 'next-intl';
import { Skeleton } from '../Skeleton';
import { formatDate } from '@/lib/utils';

function AreaCard({
  title, desc, data, dataKey, color,
  isLoading
}: {
  title: string; desc: string;
  data: { date: string; count: number }[];
  dataKey: string; color: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-56 rounded-2xl" />;
  }
  return (
    <Card className="border-none shadow-md bg-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <AreaTrendChart
          data={data}
          dataKey={dataKey}
          color={color}
          height={200}
        />
      </CardContent>
    </Card>
  );
}

export function TrendsSection({ d, isLoading }: { d?: DashboardData, isLoading: boolean }) {
  const t = useTranslations('dashboard.trendsSection');

  const periodLabel = d?.orders?.dateRange
    ? `${formatDate(d.orders.dateRange.start)} → ${formatDate(d.orders.dateRange.end)}`
    : t('currentPeriod');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AreaCard
        title={t('dailyOrders')}
        desc={periodLabel}
        data={d?.orders?.dailyOrders ?? []}
        dataKey="count"
        color="#6366f1"
        isLoading={isLoading}
      />
      <AreaCard
        title={t('userRegistrations')}
        desc={d?.users?.dateRange
          ? `${formatDate(d.users.dateRange.start)} → ${formatDate(d.users.dateRange.end)}`
          : t('currentPeriod')}
        data={d?.users?.dailyRegistrations ?? []}
        dataKey="count"
        color="#22c55e"
        isLoading={isLoading}
      />
    </div>
  );
}
