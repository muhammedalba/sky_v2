'use client';

import { Icons } from '@/shared/ui/Icons';
import { StatCard } from '@/shared/ui/StatCard';
import { formatCurrency } from '@/lib/utils';
import type { DashboardData } from './types';
import { Skeleton } from '../Skeleton';
import { useLocale, useTranslations } from 'next-intl';

// here we define a colors map for the stat cards
const accentMap = [
  { from: 'from-indigo-500/5', icon: 'text-indigo-500', bg: 'bg-indigo-500/5' },
  { from: 'from-violet-500/5', icon: 'text-violet-500', bg: 'bg-violet-500/10 ' },
  { from: 'from-emerald-500/5', icon: 'text-emerald-500', bg: 'bg-emerald-500/5' },
  { from: 'from-amber-500/5', icon: 'text-amber-500', bg: 'bg-amber-500/5' },
  { from: 'from-sky-500/5', icon: 'text-sky-500', bg: 'bg-sky-500/5' },
  { from: 'from-rose-500/5', icon: 'text-rose-500', bg: 'bg-rose-500/5' },
  { from: 'from-teal-500/5', icon: 'text-teal-500', bg: 'bg-teal-500/5' },
  { from: 'from-pink-500/5', icon: 'text-pink-500', bg: 'bg-pink-500/10' },
];



export function KpiGrid({ d, isLoading }: { d?: DashboardData, isLoading: boolean }) {
  const t = useTranslations('dashboard.kpiGrid');
  const locale = useLocale();
  const oo = d?.orders?.overview;
  const uo = d?.users?.overview;
  const mo = d?.marketingStats?.overview;
  const st = d?.stats;

  const cards = [
    { Icon: Icons.Orders, label: t('totalOrders'), value: oo?.currentPeriodOrders ?? 0, sub: t('allOrders', { count: oo?.totalOrdersSystemWide ?? 0 }) },
    { Icon: Icons.BarChart, label: t('totalRevenue'), value: formatCurrency(oo?.totalRevenue ?? 0,locale), sub: t('aov', { amount: formatCurrency(oo?.averageOrderValue ?? 0,locale) }) },
    { Icon: Icons.Check, label: t('validOrders'), value: oo?.validOrdersCount ?? 0, sub: undefined },
    { Icon: Icons.Users, label: t('totalUsers'), value: uo?.totalUsers ?? 0, sub: t('newUsers', { count: uo?.periodNewCustomers ?? 0 }) },
    { Icon: Icons.Coupons, label: t('activeCoupons'), value: mo?.activeCoupons ?? 0, sub: t('totalCoupons', { count: mo?.totalCoupons ?? 0 }) },
    { Icon: Icons.BarChart3, label: t('marketingCost'), value: formatCurrency(mo?.totalMarketingCost ?? 0,locale), sub: undefined },
    { Icon: Icons.Categories, label: t('categories'), value: st?.categories ?? 0, sub: t('subCategories', { count: st?.subCategories ?? 0 }) },
    { Icon: Icons.Brands, label: t('brands'), value: st?.brands ?? 0, sub: t('suppliers', { count: d?.suppliers?.totalSuppliers ?? 0 }) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading ? (
        Array(cards.length || 8).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
      ) :
        cards.map((c, i) => {
          const a = accentMap[i % accentMap.length];
          return (
            <StatCard
              key={i}
              title={c.label}
              value={c.value}
              Icon={c.Icon}
              badge={c.sub}
              colorFrom={a.from}
              colorBg={a.bg}
              colorIcon={a.icon}
            />
          );
        })}
    </div>
  );
}
