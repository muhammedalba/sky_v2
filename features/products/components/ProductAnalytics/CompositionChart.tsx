'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { useTranslations } from 'next-intl';

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
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
