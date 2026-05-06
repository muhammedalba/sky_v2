'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Rectangle } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryChartProps {
  data: { name: string; value: number }[];
}

interface BarShapeProps {
  index?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const CHART_HEIGHT = 300;
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryChart({ data }: CategoryChartProps) {
  const t = useTranslations('products.statistics.charts');

  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setChartWidth(w);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Card className="border-none bg-white/50 backdrop-blur-md dark:bg-secondary/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('categories')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full" style={{ height: CHART_HEIGHT }}>
          {chartWidth > 0 && (
            <BarChart
              width={chartWidth}
              height={CHART_HEIGHT}
              data={data}
              layout="vertical"
              margin={{ left: 20, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                fontSize={12}
                tick={{ fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar
                dataKey="value"
                radius={[0, 4, 4, 0]}
                barSize={20}
                shape={(props: BarShapeProps) => (
                  <Rectangle
                    {...props}
                    fill={COLORS[(props.index ?? 0) % COLORS.length]}
                  />
                )}
              />
            </BarChart>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
