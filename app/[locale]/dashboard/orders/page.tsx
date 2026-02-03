'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useOrders } from '@/hooks/api/useOrders';
import EntityDataTable from '@/components/dashboard/EntityDataTable';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icons';
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils';
import { Order } from '@/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';

export default function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const [page, setPage] = useState(1);
  const t = useTranslations('orders');

  const { data, isLoading } = useOrders({ page, limit: 10 });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {t('orderList')}
          </p>
        </div>
        <Button className="h-11 px-6 font-bold flex items-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 bg-secondary text-secondary-foreground border border-border/60">
          <Icons.Menu className="w-5 h-5" /> 
          Export CSV
        </Button>
      </div>

      <EntityDataTable<Order>
        data={data?.data}
        isLoading={isLoading}
        metadata={data?.metadata}
        page={page}
        onPageChange={setPage}
        columns={[
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
                <Link
                  href={`/${locale}/dashboard/orders/${order._id}`}
                  className="h-9 px-6 inline-flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 font-bold text-xs transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                  View
                </Link>
              </div>
            )
          }
        ]}
        emptyState={{
          title: "No orders found",
          description: "Your shop's sales journey starts here. Promote your products to get sales!",
          icon: <Icons.Orders className="h-10 w-10 text-muted-foreground/40" />,
        }}
      />
    </div>
  );
}
