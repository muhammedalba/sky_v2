'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboard';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import type { DashboardData } from './types';
import type { DashboardParams } from '@/lib/api/dashboard';
import { KpiGrid } from './KpiGrid';
import { TrendsSection } from './TrendsSection';
import { BreakdownSection } from './BreakdownSection';
import { ProductsSection } from './ProductsSection';
import { MarketingSection } from './MarketingSection';
import { Calendar, Filter, RotateCcw, CheckCircle2 } from 'lucide-react';

function SectionWrapper({ title, desc, children }: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
      </div>
      <Skeleton className="h-80 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </div>
  );
}

function DateRangeFilter({ onApply, onReset }: {
  onApply: (p: DashboardParams) => void;
  onReset: () => void;
}) {
  const t = useTranslations('dashboard.dateFilter');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [isActive, setIsActive] = useState(false);

  const isValid = start && end && new Date(start) <= new Date(end);

  const handleApply = () => {
    if (!isValid) return;
    onApply({ startDate: start, endDate: end });
    setIsActive(true);
  };

  const handleReset = () => {
    setStart(''); setEnd('');
    setIsActive(false);
    onReset();
  };

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 rounded-2xl bg-background border border-border/50 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground me-1">
        <Calendar className="w-3.5 h-3.5" />
        {t('label')}
      </div>
      <div className="flex flex-wrap items-end gap-3 flex-1">
        <div className="space-y-1 min-w-[160px]">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('from')}</label>
          <Input
            type="date"
            value={start}
            max={end || undefined}
            onChange={(e) => { setStart(e.target.value); setIsActive(false); }}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1 min-w-[160px]">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('to')}</label>
          <Input
            type="date"
            value={end}
            min={start || undefined}
            onChange={(e) => { setEnd(e.target.value); setIsActive(false); }}
            className="h-9 text-sm"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Button size="sm" onClick={handleApply} disabled={!isValid} className="gap-1.5 h-9">
            {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Filter className="w-3.5 h-3.5" />}
            {t('apply')}
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset} disabled={!start && !end} className="gap-1.5 h-9">
            <RotateCcw className="w-3.5 h-3.5" />
            {t('reset')}
          </Button>
          {isActive && start && end && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {start} → {end}
            </Badge>
          )}
        </div>
      </div>
      {start && end && new Date(start) > new Date(end) && (
        <p className="w-full text-xs text-destructive mt-1">⚠ {t('invalidRange')}</p>
      )}
    </div>
  );
}

export default function DashboardContent() {
  const t = useTranslations('dashboard');
  const [params, setParams] = useState<DashboardParams>({});
  const { data, isLoading, error } = useDashboardStats(params);
  const d = data as DashboardData | undefined;

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 bg-destructive/10 text-destructive rounded-full">
          <Icons.Warning className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">{t('error.title')}</h2>
        <p className="text-muted-foreground text-sm">{t('error.desc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* ── Date Range Filter ─────────────────────────────────────────────── */}
      <DateRangeFilter
        onApply={(p) => setParams(p)}
        onReset={() => setParams({})}
      />

      {/* 1 ── KPIs */}
      <SectionWrapper
        title={t('sections.overview.title')}
        desc={t('sections.overview.desc')}
      >
        <KpiGrid d={d} />
      </SectionWrapper>

      {/* 2 ── Activity Trends */}
      <SectionWrapper
        title={t('sections.trends.title')}
        desc={t('sections.trends.desc')}
      >
        <TrendsSection d={d} />
      </SectionWrapper>

      {/* 3 ── Breakdown Charts */}
      <SectionWrapper
        title={t('sections.breakdown.title')}
        desc={t('sections.breakdown.desc')}
      >
        <BreakdownSection d={d} />
      </SectionWrapper>

      {/* 4 ── Products, Customers & Suppliers */}
      <SectionWrapper
        title={t('sections.products.title')}
        desc={t('sections.products.desc')}
      >
        <ProductsSection d={d} />
      </SectionWrapper>

      {/* 5 ── Marketing */}
      <SectionWrapper
        title={t('sections.marketing.title')}
        desc={t('sections.marketing.desc')}
      >
        <MarketingSection d={d} />
      </SectionWrapper>

    </div>
  );
}
