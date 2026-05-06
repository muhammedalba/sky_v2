'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { DashboardData } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketingSectionProps {
  d?: DashboardData;
}

interface CouponSummaryItem {
  label: string;
  value: string | number;
  color: string;
  bg: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MarketingSection({ d }: MarketingSectionProps) {
  const t = useTranslations('dashboard.marketingSection');
  const locale = useLocale();

  const mo     = d?.marketingStats?.overview;
  const period = d?.marketingStats?.period;
  const topCoupons = useMemo(
    () => d?.marketingStats?.topPerformingCoupons ?? [],
    [d?.marketingStats?.topPerformingCoupons],
  );

  // ─── Derived values (memoized) ──────────────────────────────────────────

  const periodStr = useMemo(
    () => period ? `${formatDate(period.start)} → ${formatDate(period.end)}` : '',
    [period],
  );

  const couponSummary = useMemo<CouponSummaryItem[]>(() => [
    { label: t('totalCoupons'), value: mo?.totalCoupons    ?? 0, color: 'text-foreground',   bg: 'bg-secondary/40'      },
    { label: t('active'),       value: mo?.activeCoupons   ?? 0, color: 'text-emerald-500',  bg: 'bg-emerald-500/10'    },
    { label: t('expired'),      value: mo?.expiredCoupons  ?? 0, color: 'text-amber-500',    bg: 'bg-amber-500/10'      },
    { label: t('mktgCost'),     value: formatCurrency(mo?.totalMarketingCost ?? 0, locale),  color: 'text-indigo-500',  bg: 'bg-indigo-500/10' },
  ], [mo, locale, t]);

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Coupon Summary ──────────────────────────────────────────────── */}
      <Card className="border-none shadow-md bg-background">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">{t('marketingOverview')}</CardTitle>
              {periodStr && <CardDescription>{periodStr}</CardDescription>}
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/10">
              <Icons.Coupons className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {couponSummary.map((item) => (
              <div key={item.label} className={cn(item.bg, 'rounded-2xl p-4 text-center')}>
                <p className={cn('text-2xl font-black', item.color)}>{item.value}</p>
                <p className="text-[11px] font-medium text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Top Performing Coupons ──────────────────────────────────────── */}
      <Card className="border-none shadow-md bg-background">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">{t('topPerformingCoupons')}</CardTitle>
          <CardDescription>{t('topPerformingCouponsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {topCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="p-3 rounded-full bg-secondary/50">
                <Icons.Coupons className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t('noUsage')}</p>
              <p className="text-xs text-muted-foreground/60">{t('createCoupons')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topCoupons.map((c, i) => (
                <div
                  key={c.code ?? i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <Badge variant="outline" className="font-mono text-xs shrink-0">
                    {c.code ?? `COUPON-${i + 1}`}
                  </Badge>
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {t('uses', { count: c.usageCount ?? 0 })}
                    </span>
                    {c.discount != null && (
                      <Badge variant="secondary" className="text-[10px] text-amber-600">
                        -{c.discount}
                      </Badge>
                    )}
                    {c.revenue != null && (
                      <span className="text-xs font-bold text-emerald-500">
                        {formatCurrency(c.revenue)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
