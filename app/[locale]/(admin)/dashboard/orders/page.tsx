'use client';

import { use, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useOrders } from '@/features/orders/hooks/useOrders';
import EntityDataTable from '@/shared/ui/dashboard/EntityDataTable';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { Order } from '@/types';
import Link from 'next/link';
import { useQueryState } from '@/shared/hooks/useQueryState';
import EntityPageHeader from '@/shared/ui/dashboard/EntityPageHeader';
import { Permissions } from '@/features/roles/types';
import Can from '@/components/auth/Can';

export default function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { getQueryParam, setQueryParam } = useQueryState();
  
  const page = Number(getQueryParam('page', '1'));
  const t = useTranslations('orders');
  const formatCurrency = useFormatCurrency();

  const queryParams = useMemo(() => ({ page, limit: 10 }), [page]);
  const { data, isLoading } = useOrders(queryParams);
  const setPage = useCallback((val: number) => setQueryParam('page', val), [setQueryParam]);

  const columns = useMemo(() => [
    {
      header: t('orderNumber') || 'Order ID',
      className: "pl-6",
      render: (order: Order) => (
        <span className="font-black text-sm text-foreground font-mono">
          #{order._id?.slice(-8).toUpperCase()}
        </span>
      )
    },
    {
      header: t('fields.customer'),
      render: (order: Order) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-primary/20">
            {order.user?.name?.charAt(0) || 'G'}
          </div>
          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
            {order.user?.name || 'Guest Customer'}
          </span>
        </div>
      )
    },
    {
      header: t('fields.date'),
      render: (order: Order) => (
        <span className="text-muted-foreground text-sm font-bold lowercase tracking-tight italic">
          {formatDate(order.createdAt)}
        </span>
      )
    },
    {
      header: t('fields.total'),
      render: (order: Order) => (
        <span className="font-black text-sm text-foreground bg-muted/30 px-2 py-1 rounded-lg">
          {formatCurrency(order.totalOrderPrice || 0)}
        </span>
      )
    },
    {
      header: t('fields.status'),
      render: (order: Order) => (
        <Badge className={cn("rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider border-none shadow-sm", getStatusColor(order.status))}>
          {order.status || 'Pending'}
        </Badge>
      )
    },
    {
      header: "Actions",
      className: "pr-6 text-right",
      render: (order: Order) => (
        <div className="flex justify-end translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <Can permission={Permissions.VIEW_ORDERS}>
            <Link
              href={`/${locale}/dashboard/orders/${order._id}`}
              className="h-9 px-6 inline-flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              View
            </Link>
          </Can>
        </div>
      )
    }
  ], [t, formatCurrency, locale]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('orderList')}
        totalResults={t('totalOrders', { count: data?.meta?.pagination?.totalResults || 0 })}
        action={{
          label: 'Export CSV',
          icon: <Icons.Menu className="w-5 h-5" />,
          onClick: () => {
            // Future export CSV logic
          },
          permission: Permissions.VIEW_ORDERS,
          className: "bg-secondary text-secondary-foreground border border-border/60 hover:bg-secondary/80"
        }}
      />

      <EntityDataTable<Order>
        data={data?.data}
        isLoading={isLoading}
        pagination={data?.meta?.pagination}
        onPageChange={setPage}
        columns={columns}
        emptyState={{
          title: "No orders found",
          description: "Your shop's sales journey starts here. Promote your products to get sales!",
          icon: <Icons.Orders className="h-10 w-10 text-muted-foreground/40" />,
        }}
      />
    </div>
  );
}
