'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { useTranslations } from 'next-intl';
import { AreaTrendChart } from '@/shared/ui/charts/AreaTrendChart';

interface TrendChartProps {
  data: {
    date: string;
    count: number;
  }[];
}

export function TrendChart({ data }: TrendChartProps) {
  const t = useTranslations('products.statistics.charts');

  return (
    <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-secondary/50 shadow-xl lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('trends')}</CardTitle>
      </CardHeader>
      <CardContent>
        <AreaTrendChart 
          data={data} 
          dataKey="count" 
          height={300}
        />
      </CardContent>
    </Card>
  );
}
