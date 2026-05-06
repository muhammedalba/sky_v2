'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { useTranslations } from 'next-intl';
import { PieCompositionChart } from '@/shared/ui/charts/PieCompositionChart';

interface CompositionChartProps {
  data: {
    simple: number;
    variable: number;
  };
}

export function CompositionChart({ data }: CompositionChartProps) {
  const t = useTranslations('products.statistics.charts');

  const chartData = [
    { name: t('simple'), value: data.simple, color: '#6366f1' },
    { name: t('variable'), value: data.variable, color: '#ec4899' },
  ];

  return (
    <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-secondary/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('composition')}</CardTitle>
      </CardHeader>
      <CardContent>
        <PieCompositionChart 
          data={chartData} 
          height={300}
        />
      </CardContent>
    </Card>
  );
}
