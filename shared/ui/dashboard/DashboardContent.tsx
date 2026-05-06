'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { useDashboardStats } from '@/features/dashboard/hooks/useDashboard';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { DashboardParams } from '@/lib/api/dashboard';
import { KpiGrid } from './KpiGrid';
import { TrendsSection } from './TrendsSection';
import { BreakdownSection } from './BreakdownSection';
import { ProductsSection } from './ProductsSection';
import { MarketingSection } from './MarketingSection';
import { DateRangeFilter } from '@/shared/ui/DateRangeFilter';
import { SectionWrapper } from '@/shared/ui/SectionWrapper';
import ErrorMessage from '../ErrorMessage';
import EntityPageHeader from './EntityPageHeader';
import { Icons } from '../Icons';
import { formatDate } from '@/lib/utils';

export default function DashboardContent() {
  const t = useTranslations('dashboard');
  const [params, setParams] = useState<DashboardParams>({});
  const { data: d, isLoading, error, refetch, isRefetching } = useDashboardStats(params);

  // ─── Derived values (memoized) ─────────────────────────────────────────────

  const isBusy = isLoading || isRefetching;

  const periodLabel = useMemo(
    () =>
      d?.dateRange
        ? `${formatDate(d.dateRange.start)} → ${formatDate(d.dateRange.end)}`
        : '',
    [d?.dateRange],
  );

  // ─── Handlers (memoized) ───────────────────────────────────────────────────

  const handleApply = useCallback(
    (p: DashboardParams) => setParams(p),
    [],
  );

  const handleReset = useCallback(() => setParams({}), []);

  const handleRefetch = useCallback(() => { void refetch(); }, [refetch]);

  // ─── Error state ───────────────────────────────────────────────────────────

  if (error) {
    const message = error instanceof Error ? error.message : String(error);
    return <ErrorMessage message={message} retry={handleRefetch} showIcon />;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={periodLabel}
        action={{
          label: t('refresh'),
          icon: <Icons.RefreshCw className="w-4 h-4" />,
          onClick: handleRefetch,
          disabled: isBusy,
        }}
      />

      {/* ── Date Range Filter ────────────────────────────────────────────────── */}
      <DateRangeFilter
        onApply={handleApply}
        onReset={handleReset}
        isLoading={isBusy}
      />

      {/* 1 ── KPIs ───────────────────────────────────────────────────────────── */}
      <SectionWrapper
        title={t('sections.overview.title')}
        desc={t('sections.overview.desc')}
      >
        <KpiGrid d={d} isLoading={isBusy} />
      </SectionWrapper>

      {/* 2 ── Activity Trends ────────────────────────────────────────────────── */}
      <SectionWrapper
        title={t('sections.trends.title')}
        desc={t('sections.trends.desc')}
      >
        <TrendsSection d={d} isLoading={isBusy} />
      </SectionWrapper>

      {/* 3 ── Breakdown Charts ───────────────────────────────────────────────── */}
      <SectionWrapper
        title={t('sections.breakdown.title')}
        desc={t('sections.breakdown.desc')}
      >
        {isBusy ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : (
          <BreakdownSection d={d} />
        )}
      </SectionWrapper>

      {/* 4 ── Products, Customers & Suppliers ───────────────────────────────── */}
      <SectionWrapper
        title={t('sections.products.title')}
        desc={t('sections.products.desc')}
      >
        {isBusy ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : (
          <ProductsSection d={d} />
        )}
      </SectionWrapper>

      {/* 5 ── Marketing ─────────────────────────────────────────────────────── */}
      <SectionWrapper
        title={t('sections.marketing.title')}
        desc={t('sections.marketing.desc')}
      >
        {isBusy ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : (
          <MarketingSection d={d} />
        )}
      </SectionWrapper>

    </div>
  );
}
