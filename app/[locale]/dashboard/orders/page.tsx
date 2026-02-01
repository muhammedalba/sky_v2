'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useOrders } from '@/hooks/api/useOrders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import Pagination from '@/components/ui/Pagination';
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
    <div className="space-y-8 animate-in fade-in duration-500">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            {t('orderList')}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <button className="px-5 py-2.5 bg-secondary/50 border border-border rounded-xl font-bold text-sm hover:bg-secondary transition-all flex items-center gap-2">
             <Icons.Menu className="w-4 h-4" /> {/* Filter/Export replacement */}
             Export CSV
           </button>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="font-bold">{t('orderNumber') || 'Order ID'}</TableHead>
                <TableHead className="font-bold">{t('fields.customer')}</TableHead>
                <TableHead className="font-bold">{t('fields.date')}</TableHead>
                <TableHead className="font-bold">{t('fields.total')}</TableHead>
                <TableHead className="font-bold">{t('fields.status')}</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data?.length ? (
                data.data.map((order: Order) => (
                  <TableRow key={order._id} className="group hover:bg-secondary/10 transition-colors">
                    <TableCell className="font-black text-sm text-foreground">
                      #{order._id?.slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center font-bold text-xs">
                             {order.user?.name?.charAt(0) || 'G'}
                          </div>
                          <span className="font-bold text-sm">{order.user?.name || 'Guest Customer'}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-medium">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="font-black text-sm">
                      {formatCurrency(order.totalOrderPrice || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter border-none", getStatusColor(order.status))}>
                        {order.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Link
                          href={`/${locale}/dashboard/orders/${order._id}`}
                          className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-xs transition-all"
                        >
                          View
                        </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                     <div className="flex flex-col items-center justify-center space-y-2">
                        <Icons.Orders className="w-10 h-10 text-muted-foreground/30" />
                        <p className="text-muted-foreground font-medium">No orders found in your store yet.</p>
                     </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer with Pagination */}
        {data?.metadata && data.metadata.numberOfPages > 1 && (
          <div className="p-4 border-t border-border bg-secondary/10 flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium">
               Displaying {data.data.length} orders
            </p>
            <Pagination
              currentPage={page}
              totalPages={data.metadata.numberOfPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
