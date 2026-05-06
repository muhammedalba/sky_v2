'use client';
import { useState } from 'react';
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


export default function 
DashboardContent() {
  const t = useTranslations('dashboard');
  const [params, setParams] = useState<DashboardParams>({});
  const { data: d, isLoading, error, refetch, isRefetching } = useDashboardStats(params);

  const periodLabel = d?.dateRange
    ? `${formatDate(d.dateRange?.start)} → ${formatDate(d.dateRange?.end!)}`
    : '';

  if (error) {
    return <ErrorMessage message={(error as Error).message} retry={() => refetch()} showIcon />;
  }
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <EntityPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        totalResults={periodLabel}
        action={{
          label: t('refresh'),
          icon: <Icons.RefreshCw className="w-4 h-4" />,
          onClick: () => refetch(),
          disabled: isLoading

        }}
      />
      {/* ── Date Range Filter ─────────────────────────────────────────────── */}
      <DateRangeFilter
        onApply={(p) => setParams(p)}
        onReset={() => setParams({})}
        isLoading={isLoading || isRefetching}
      />

      {/* 1 ── KPIs */}
      <SectionWrapper
        title={t('sections.overview.title')}
        desc={t('sections.overview.desc')}
      >
        <KpiGrid d={d} isLoading={isLoading || isRefetching} />
      </SectionWrapper>

      {/* 2 ── Activity Trends */}
      <SectionWrapper
        title={t('sections.trends.title')}
        desc={t('sections.trends.desc')}
      >
        <TrendsSection d={d}
          isLoading={isLoading || isRefetching}
        />
      </SectionWrapper>

      {/* 3 ── Breakdown Charts */}
      <SectionWrapper
        title={t('sections.breakdown.title')}
        desc={t('sections.breakdown.desc')}
      >
        {isLoading || isRefetching ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : <BreakdownSection d={d} />}
      </SectionWrapper>

      {/* 4 ── Products, Customers & Suppliers */}
      <SectionWrapper
        title={t('sections.products.title')}
        desc={t('sections.products.desc')}
      >
        {isLoading || isRefetching ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : <ProductsSection d={d} />}
      </SectionWrapper>

      {/* 5 ── Marketing */}
      <SectionWrapper
        title={t('sections.marketing.title')}
        desc={t('sections.marketing.desc')}
      >
        {isLoading || isRefetching ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : <MarketingSection d={d} />}
      </SectionWrapper>

    </div>
  );
}
