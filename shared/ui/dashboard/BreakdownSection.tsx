'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CHART_COLORS } from './types';
import type { DashboardData } from './types';
import { PieCompositionChart } from '@/shared/ui/charts/PieCompositionChart';
import { BarGroupChart } from '@/shared/ui/charts/BarGroupChart';
import { useTranslations } from 'next-intl';


const STATUS_COLOR: Record<string, string> = {
  active: '#22c55e',
  inactive: '#f59e0b',
  pending: '#f59e0b',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  processing: '#6366f1',
  shipped: '#14b8a6',
  returned: '#ec4899',
  unverified: '#94a3b8',
};

function DonutCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  const chartData = data.map((d, i) => ({
    ...d,
    color: STATUS_COLOR[d.name.toLowerCase()] ?? CHART_COLORS[i % CHART_COLORS.length]
  }));

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

export function BreakdownSection({ d }: { d?: DashboardData }) {
  const t = useTranslations('dashboard.breakdownSection');

  const roleData = Object.entries(d?.users?.roleBreakdown ?? {}).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(d?.users?.statusBreakdown ?? {})
    .map(([name, value]) => ({ name: name === 'null' ? 'unverified' : name, value }));
  const orderStatusData = Object.entries(d?.orders?.statusBreakdown ?? {})
    .map(([name, value]) => ({ name, value }));

  const salesData = d?.marketingStats?.salesBreakdown
    ? [
      {
        name: t('organic'),
        orders: d.marketingStats.salesBreakdown.organic.orders,
        revenue: d.marketingStats.salesBreakdown.organic.revenue,
        discount: d.marketingStats.salesBreakdown.organic.discount,
      },
      {
        name: t('marketing'),
        orders: d.marketingStats.salesBreakdown.marketing.orders,
        revenue: d.marketingStats.salesBreakdown.marketing.revenue,
        discount: d.marketingStats.salesBreakdown.marketing.discount,
      },
    ]
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DonutCard title={t('userRoles')} data={roleData} />
        <DonutCard title={t('userStatus')} data={statusData} />
        <DonutCard title={t('orderStatus')} data={orderStatusData.length > 0 ? orderStatusData : [{ name: t('noOrders'), value: 1 }]} />
      </div>


      <Card className="border-none shadow-md bg-background">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">{t('salesChannelsTitle')}</CardTitle>
          <CardDescription>
                {t('salesChannelsDesc')}
                {d?.marketingStats?.period && (
                  <span className="ms-2 text-[11px] text-muted-foreground">
                    ({formatDate(d.marketingStats.period.start)} → {formatDate(d.marketingStats.period.end)})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarGroupChart
                data={salesData}
                xAxisKey="name"
                height={250}
                bars={[
                  { dataKey: 'orders', name: t('orders'), color: '#6366f1' },
                  { dataKey: 'revenue', name: t('revenue'), color: '#22c55e' },
                  { dataKey: 'discount', name: t('discount'), color: '#f59e0b' },
                ]}
                tooltipFormatter={(v, name) => [
                  name === t('revenue') || name === t('discount') ? formatCurrency(Number(v)) : v, name
                ]}
              />
            </CardContent>
          </Card>

    </div>
  );
}
