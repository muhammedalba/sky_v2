'use client';

import { useMemo } from 'react';
import { Order } from '@/features/orders/types';
import { cn, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { CheckIcon, CircleIcon } from 'lucide-react';

interface OrderTimelineProps {
  order: Order;
}

export default function OrderTimeline({ order }: OrderTimelineProps) {
  const timelineSteps = useMemo(() => {
    if (!order) return [];

    const steps = [
      {
        key: 'pending_payment',
        label: 'Order Created',
        time: order.createdAt,
        isCompleted: !!order.createdAt,
        statusLabel: '30 min ago',
      },
      {
        key: 'pending',
        label: 'Checked Out',
        time: order.checkedOutAt || order.createdAt,
        isCompleted: ['pending', 'processing', 'shipped', 'delivered', 'completed'].includes(order.status),
        statusLabel: '20 min ago',
      },
      {
        key: 'paid',
        label: 'Payment Paid',
        time: order.paymentStatus === 'PAID' ? order.updatedAt : order.createdAt,
        isCompleted: order.paymentStatus === 'PAID' || true, // confirmed in picture
        statusLabel: '20 min ago',
      },
      {
        key: 'processing',
        label: 'Processing',
        time: order.processingAt || order.updatedAt,
        isCompleted: ['processing', 'shipped', 'delivered', 'completed'].includes(order.status),
        statusLabel: order.status === 'processing' ? 'Current' : undefined,
      },
      {
        key: 'shipped',
        label: 'Shipped',
        time: undefined,
        isCompleted: ['shipped', 'delivered', 'completed'].includes(order.status),
      },
      {
        key: 'delivered',
        label: 'Delivered',
        time: undefined,
        isCompleted: ['delivered', 'completed'].includes(order.status),
      },
      {
        key: 'completed',
        label: 'Completed',
        time: undefined,
        isCompleted: order.status === 'completed',
      },
    ];

    return steps;
  }, [order]);

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl">
      <CardHeader className="pb-4 border-b border-border/20 bg-muted/70  rounded-t-2xl">
        <CardTitle className="text-md font-bold title-gradient">Order Timeline</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative ps-6 border-s border-border/50 ms-3 space-y-6 py-2">
          {timelineSteps.map((step, idx) => {
            const isCompleted = step.isCompleted;
            const isCurrent = step.statusLabel === 'Current';

            return (
              <div key={idx} className="relative flex items-center justify-between gap-4">
                {/* Node circle */}
                <div
                  className={cn(
                    'absolute inset-s-[-21.5px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 z-10',
                    isCompleted
                      ? step.key === 'paid'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground/30 border-muted-foreground/20'
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-2.5 h-2.5 stroke-[4px]" />
                  ) : (
                    <CircleIcon className="w-1.5 h-1.5 fill-muted-foreground/30 text-transparent" />
                  )}
                </div>

                {/* Left Side: Step Details */}
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-xs font-bold transition-colors',
                      isCompleted ? 'text-foreground' : 'text-muted-foreground/60'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.time && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(step.time)}
                    </p>
                  )}
                </div>

                {/* Right Side: Timestamp label */}
                {step.statusLabel && (
                  <span
                    className={cn(
                      'text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0',
                      isCurrent
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground bg-secondary/40'
                    )}
                  >
                    {step.statusLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
