'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useTranslations } from 'next-intl';
import { Calendar, Filter, RotateCcw } from 'lucide-react';

interface AdvancedFiltersProps {
  onApply: (params: { startDate: string; endDate: string }) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function AdvancedFilters({ onApply, onReset, isLoading }: AdvancedFiltersProps) {
  const t = useTranslations('products.statistics.filters');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApply = () => {
    if (startDate && endDate) {
      onApply({ startDate, endDate });
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    onReset();
  };

  return (
    <Card className="border-none bg-white/40 backdrop-blur-md dark:bg-slate-900/40 shadow-lg mb-8">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {t('startDate')}
            </label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/50 border-slate-200 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {t('endDate')}
            </label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/50 border-slate-200 focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleApply} 
              disabled={!startDate || !endDate || isLoading}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {t('apply')}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="gap-2 bg-white/50 hover:bg-white"
            >
              <RotateCcw className="w-4 h-4" />
              {t('reset')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
