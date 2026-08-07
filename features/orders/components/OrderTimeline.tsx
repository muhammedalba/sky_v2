'use client';

import { useMemo } from 'react';
import { Order } from '@/features/orders/types';
import { cn, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarIcon,
  StoreIcon,
  WalletIcon,
  ClockIcon,
  TruckIcon,
  PackageIcon,
  CheckIcon,
  XIcon,
} from '@/shared/ui/Icons';

interface OrderTimelineProps {
  order: Order;
}

export default function OrderTimeline({ order }: OrderTimelineProps) {
  const t = useTranslations('orders');
  const locale = useLocale();

  const timelineSteps = useMemo(() => {
    if (!order) return [];

    const steps = [
      {
        key: 'pending_payment',
        label: t('orderCreated'),
        icon: CalendarIcon,
        time: order.createdAt,
        isCompleted: !!order.createdAt,
      },
      {
        key: 'pending_payment',
        label: t('status.pending_payment'),
        icon: CalendarIcon,
        time: order.createdAt,
        isCompleted: !!order.createdAt,
      },
      
      {
        key: 'paid',
        label: t('paymentPaid'),
        icon: WalletIcon,
        time: order.paidAt,
        isCompleted: !!order.paidAt || order.paymentStatus === 'PAID',
      },
      {
        key: 'pending',
        label: t('status.pending'),
        icon: StoreIcon,
        time: order.checkedOutAt,
        isCompleted:
          !!order.checkedOutAt ||
          ['pending', 'processing', 'shipped', 'delivered', 'completed'].includes(
            order.status
          ),
      },
      {
        key: 'processing',
        label: t('status.processing'),
        icon: ClockIcon,
        time: order.processingAt,
        isCompleted:
          !!order.processingAt ||
          ['processing', 'shipped', 'delivered', 'completed'].includes(
            order.status
          ),
      },
      {
        key: 'shipped',
        label: t('status.shipped'),
        icon: TruckIcon,
        time: order.shippedAt,
        isCompleted:
          !!order.shippedAt ||
          ['shipped', 'delivered', 'completed'].includes(order.status),
      },
      {
        key: 'delivered',
        label: t('status.delivered'),
        icon: PackageIcon,
        time: order.deliveredAt,
        isCompleted:
          !!order.deliveredAt ||
          ['delivered', 'completed'].includes(order.status),
      },
    ];

    if (order.status === 'cancelled' || order.status === 'expired') {
      steps.push({
        key: order.status,
        label: t(`status.${order.status}`),
        icon: XIcon,
        time: order.cancelledAt || order.updatedAt,
        isCompleted: true,
      });
    } else {
      steps.push({
        key: 'completed',
        label: t('status.completed'),
        icon: CheckIcon,
        time: order.completedAt,
        isCompleted: order.status === 'completed' || !!order.completedAt,
      });
    }

    // Determine current step (the latest completed milestone)
    let lastCompletedIdx = -1;
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].isCompleted) {
        lastCompletedIdx = i;
        break;
      }
    }

    return steps.map((step, idx) => {
      const isCurrent = idx === lastCompletedIdx;
      return {
        ...step,
        statusLabel: isCurrent
          ? locale.startsWith('ar')
            ? 'الحالة الحالية'
            : 'Current'
          : undefined,
      };
    });
  }, [order, t, locale]);

  const currentStepText = locale.startsWith('ar') ? 'الحالة الحالية' : 'Current';

  return (
    <Card className="border border-border/50 shadow-sm bg-card rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="py-4 px-6 border-b border-border/30 bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary" />
            {t('timeline')}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <div className="relative space-y-8 sm:space-y-10">
          {timelineSteps.map((step, idx) => {
            const isCompleted = step.isCompleted;
            const isCurrent = step.statusLabel === currentStepText;
            const isCancelledOrExpired =
              step.key === 'cancelled' || step.key === 'expired';

            return (
              <div
                key={idx}
                className="relative flex items-start gap-4 sm:gap-6 group"
              >
                {/* Connecting Line */}
                {idx < timelineSteps.length - 1 && (
                  <div
                    className={cn(
                      'absolute start-5 sm:start-[22px] top-10 sm:top-11 -bottom-8 sm:-bottom-10 w-0.5 -translate-x-1/2 transition-all duration-500 rounded-full',
                      isCompleted && timelineSteps[idx + 1]?.isCompleted
                        ? 'bg-primary/70'
                        : isCompleted
                        ? 'bg-gradient-to-b from-primary/70 via-primary/30 to-border/40'
                        : 'bg-border/40'
                    )}
                  />
                )}

                {/* Milestone Icon Container */}
                <div className="relative shrink-0 z-10">
                  <div
                    className={cn(
                      'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-2xs',
                      isCancelledOrExpired
                        ? 'bg-destructive/10 text-destructive border-destructive/30 shadow-destructive/10'
                        : isCurrent
                        ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 ring-4 ring-primary/15'
                        : isCompleted
                        ? 'bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30'
                        : 'bg-muted/40 text-muted-foreground/40 border-border/40'
                    )}
                  >
                    <step.icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Corner Status Badge Dot */}
                  <div
                    className={cn(
                      'absolute -bottom-1 -end-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-card transition-transform duration-300 group-hover:scale-110 shadow-xs',
                      isCancelledOrExpired
                        ? 'bg-destructive text-destructive-foreground'
                        : isCurrent
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground border-muted'
                    )}
                  >
                    {isCancelledOrExpired ? (
                      <XIcon className="w-2.5 h-2.5 stroke-[3]" />
                    ) : isCompleted ? (
                      <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                </div>

                {/* Milestone Content Details */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                    {/* Title and Badge */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4
                        className={cn(
                          'text-xs sm:text-sm font-semibold tracking-tight transition-colors',
                          isCurrent
                            ? 'text-primary font-bold'
                            : isCompleted
                            ? 'text-foreground font-semibold'
                            : 'text-muted-foreground/60'
                        )}
                      >
                        {step.label}
                      </h4>

                      {/* Current Step Pill Badge */}
                      {step.statusLabel && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-2xs animate-fade-in">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                          </span>
                          {step.statusLabel}
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    {step.time && (
                      <time className="text-[11px] sm:text-xs text-muted-foreground font-medium shrink-0">
                        {formatDate(step.time, locale)}
                      </time>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
