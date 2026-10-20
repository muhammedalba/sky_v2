'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { BarChart3Icon, BarChartIcon, BrandsIcon, CategoriesIcon, CheckIcon, CouponsIcon, ShoppingBagIcon, UsersIcon } from "@/shared/ui/Icons";
import { StatCard, StatCardProps } from '@/shared/ui/StatCard';
import { Skeleton } from '@/shared/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import { useCan } from '@/components/auth/Can';
import { Permissions } from '@/features/roles/types';
import type { DashboardData } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiGridProps {
  d?: DashboardData;
  isLoading: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SKELETON_COUNT = 8;

/** Management page each card opens — only linked when the user may view it */
const LINKS = {
  orders:     { href: '/dashboard/orders',     permission: Permissions.VIEW_ORDERS },
  users:      { href: '/dashboard/users',      permission: Permissions.VIEW_USERS },
  coupons:    { href: '/dashboard/coupons',    permission: Permissions.VIEW_COUPONS },
  categories: { href: '/dashboard/categories', permission: Permissions.VIEW_CATEGORIES },
  brands:     { href: '/dashboard/brands',     permission: Permissions.VIEW_BRANDS },
} as const;

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

// ─── Component ────────────────────────────────────────────────────────────────

export function KpiGrid({ d, isLoading }: KpiGridProps) {
  const t = useTranslations('dashboard.kpiGrid');
  const locale = useLocale();
  const can = useCan();

  const oo = d?.orders?.overview;
  const uo = d?.users?.overview;
  const mo = d?.marketingStats?.overview;
  const st = d?.stats;


  // ─── Cards definition (memoized) ──────────────────────────────────────────

  const cards = useMemo(() => [
    {
      Icon: ShoppingBagIcon,
      label: t('totalOrders'),
      link: LINKS.orders,
      value: oo?.currentPeriodOrders ?? 0,
      sub: t('allOrders', { count: oo?.totalOrdersSystemWide ?? 0 }),
      badgeVariant: (oo?.currentPeriodOrders ?? 0) === 0 ? "destructive" : (oo?.currentPeriodOrders ?? 0) < 10 ? "default" : "success"
    },
    {
      Icon: BarChartIcon,
      label: t('totalRevenue'),
      link: LINKS.orders,
      value: formatCurrency(oo?.totalRevenue ?? 0, locale),
      sub: t('aov', { amount: formatCurrency(oo?.averageOrderValue ?? 0, locale) }),
      badgeVariant: (oo?.totalRevenue ?? 0) === 0 ? "destructive" : (oo?.totalRevenue ?? 0) < 1000 ? "default" : "success"
    },
    {
      Icon: CheckIcon,
      label: t('validOrders'),
      link: LINKS.orders,
      value: oo?.validOrdersCount ?? 0,
      badgeVariant: (oo?.validOrdersCount ?? 0) === 0 ? "destructive" : (oo?.validOrdersCount ?? 0) < 10 ? "default" : "success"
    },
    {
      Icon: UsersIcon,
      label: t('totalUsers'),
      link: LINKS.users,
      value: uo?.totalUsers ?? 0,
      allTime: true,
      sub: t('newUsers', { count: uo?.periodNewCustomers ?? 0 }),
      badgeVariant: (uo?.periodNewCustomers ?? 0) === 0 ? "destructive" : (uo?.periodNewCustomers ?? 0) < 5 ? "default" : "success"
    },
    {
      Icon: CouponsIcon,
      label: t('activeCoupons'),
      link: LINKS.coupons,
      value: mo?.activeCoupons ?? 0,
      allTime: true,
      sub: t('totalCoupons', { count: mo?.totalCoupons ?? 0 }),
      badgeVariant: (mo?.totalCoupons ?? 0) === 0 ? "destructive" : (mo?.totalCoupons ?? 0) < 5 ? "default" : "success"
    },
    {
      Icon: BarChart3Icon,
      label: t('marketingCost'),
      link: LINKS.coupons,
      value: formatCurrency(mo?.totalMarketingCost ?? 0, locale),
      badgeVariant: (mo?.totalMarketingCost ?? 0) === 0 ? "destructive" : (mo?.totalMarketingCost ?? 0) < 100 ? "default" : "success"
    },
    {
      Icon: CategoriesIcon,
      label: t('categories'),
      link: LINKS.categories,
      value: st?.categories ?? 0,
      allTime: true,
      sub: t('subCategories', { count: st?.subCategories ?? 0 }),
      badgeVariant: (st?.categories ?? 0) === 0 ? "destructive" : (st?.categories ?? 0) < 10 ? "default" : "success"
    },
    {
      Icon: BrandsIcon,
      label: t('brands'),
      link: LINKS.brands,
      value: st?.brands ?? 0,
      allTime: true,
      sub: t('suppliers', { count: d?.suppliers?.totalSuppliers ?? 0 }),
      badgeVariant: (st?.brands ?? 0) === 0 ? "destructive" : "success"
    },
  ], [oo, uo, mo, st, d?.suppliers, locale, t]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                description={c.allTime ? t('allTime') : undefined}
                colorFrom={a.from}
                colorBg={a.bg}
                colorIcon={a.icon}
                badgeVariant={c.badgeVariant as StatCardProps["badgeVariant"]}
                href={can(c.link.permission) ? c.link.href : undefined}
              />
            );
          })}
    </div>
  );
}
