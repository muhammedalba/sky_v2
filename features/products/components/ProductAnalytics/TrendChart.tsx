'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { useTranslations } from 'next-intl';

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
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                fontSize={12}
                tick={{ fill: '#64748b' }}
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
