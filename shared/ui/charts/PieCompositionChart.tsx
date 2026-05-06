'use client';

import { useEffect, useRef, useState } from 'react';
import { PieChart, Pie, Legend, Tooltip } from 'recharts';
import { CHART_TOOLTIP_STYLE, CHART_COLORS } from './ChartUtils';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PieCompositionChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  tooltipFormatter?: (value: any, name: any) => [any, any];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PieCompositionChart({
  data,
  height = 300,
  className,
  innerRadius = 60,
  outerRadius = 80,
  showLegend = true,
  tooltipFormatter,
}: PieCompositionChartProps) {
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

  // ─── Empty state ─────────────────────────────────────────────────────────

  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex items-center justify-center text-sm text-muted-foreground',
          'bg-secondary/10 rounded-xl border border-dashed border-border',
          className,
        )}
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  // ─── Chart data ──────────────────────────────────────────────────────────

  const chartData = data.map((entry, index) => ({
    ...entry,
    fill: entry.color ?? CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <div
      ref={containerRef}
      className={cn('w-full', className)}
      style={{ height }}
    >
      {chartWidth > 0 && (
        <PieChart width={chartWidth} height={height}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1000}
            stroke="transparent"
          />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={tooltipFormatter} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
            />
          )}
        </PieChart>
      )}
    </div>
  );
}
