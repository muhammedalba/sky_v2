'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Badge } from '@/shared/ui/Badge';
import { useTranslations } from 'next-intl';
import { Calendar, Filter, RotateCcw, CheckCircle2 } from 'lucide-react';

interface AdvancedFiltersProps {
  onApply: (params: { startDate: string; endDate: string }) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function AdvancedFilters({ onApply, onReset, isLoading }: AdvancedFiltersProps) {
  const t = useTranslations('products.statistics.filters');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);

  const handleApply = () => {
    if (!startDate || !endDate) return;
    // Validate range
    if (new Date(startDate) > new Date(endDate)) return;
    onApply({ startDate, endDate });
    setIsActive(true);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setIsActive(false);
    onReset();
  };

  const isValid = startDate && endDate && new Date(startDate) <= new Date(endDate);

  return (
    <Card className="border-none bg-background shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">

          {/* Start Date */}
          <div className="space-y-1.5 flex-1 min-w-[180px]">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {t('startDate')}
            </label>
            <Input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (isActive) setIsActive(false);
              }}
              className="bg-background border-border"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5 flex-1 min-w-[180px]">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {t('endDate')}
            </label>
            <Input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (isActive) setIsActive(false);
              }}
              className="bg-background border-border"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pb-0.5">
            <Button
              onClick={handleApply}
              disabled={!isValid || isLoading}
              className="gap-2"
            >
              {isActive
                ? <CheckCircle2 className="w-4 h-4" />
                : <Filter className="w-4 h-4" />
              }
              {isLoading ? '...' : t('apply')}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!startDate && !endDate}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t('reset')}
            </Button>
          </div>

          {/* Active filter badge */}
          {isActive && startDate && endDate && (
            <Badge
              variant="secondary"
              className="self-end pb-2.5 bg-primary/10 text-primary border-primary/20 text-xs gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3" />
              {startDate} → {endDate}
            </Badge>
          )}
        </div>

        {/* Validation warning */}
        {startDate && endDate && new Date(startDate) > new Date(endDate) && (
          <p className="text-xs text-destructive mt-2 ms-1">
            ⚠ {t('invalidRange')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
