'use client';

import { Order } from '@/types';
import { Badge } from '@/shared/ui/Badge';
import { useFormatCurrency } from '@/shared/hooks/useFormatCurrency';
import { cn, formatRelativeTime } from '@/lib/utils';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';

interface OrderMobileCardProps {
  order: Order;
  onClick: () => void;
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending_payment: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  pending: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  shipped: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  delivered: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
  expired: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  INITIATED: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  PAID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  FAILED: 'bg-red-500/10 text-red-600 dark:text-red-400',
  CANCELLED: 'bg-red-500/10 text-red-600 dark:text-red-400',
  REFUNDED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  EXPIRED: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

export default function OrderMobileCard({ order, onClick }: OrderMobileCardProps) {
  const formatCurrency = useFormatCurrency();

  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl border border-border/40 bg-card shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] space-y-4"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono font-bold text-xs text-foreground bg-muted/50 px-2 py-1 rounded-md">
          #{order._id?.slice(0, 8).toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(order.createdAt, 'en-US')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full shrink-0 overflow-hidden relative bg-muted/30">
          <ImageWithFallback
            src={order.user?.avatar || ''}
            alt={order.user?.name || 'Guest'}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {order.user?.name || 'Guest'}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {order.user?.email || ''}
          </p>
        </div>
        <div className="text-end shrink-0">
          <p className="text-sm font-bold text-foreground">
            {formatCurrency(order.grandTotal || order.totalPrice || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {order.totalQuantity ?? order.items?.length ?? 0} items
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/10">
        <Badge
          className={cn(
            'rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider border-none',
            ORDER_STATUS_STYLES[order.status] || 'bg-muted text-muted-foreground',
          )}
        >
          {order.status?.replace('_', ' ') || 'Unknown'}
        </Badge>
        <Badge
          className={cn(
            'rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider border-none',
            PAYMENT_STATUS_STYLES[order.paymentStatus || ''] || 'bg-muted text-muted-foreground',
          )}
        >
          {order.paymentStatus || '—'}
        </Badge>
      </div>
    </div>
  );
}
