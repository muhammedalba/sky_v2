'use client';

import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Legend, Tooltip 
} from 'recharts';
import { CHART_TOOLTIP_STYLE, CHART_COLORS } from './ChartUtils';
import { cn } from '@/lib/utils';

interface PieCompositionChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number | string;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  tooltipFormatter?: (value: any, name: any) => [any, any];
}

export function PieCompositionChart({
  data,
  height = 300,
  className,
  innerRadius = 60,
  outerRadius = 80,
  showLegend = true,
  tooltipFormatter,
}: PieCompositionChartProps) {
  
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div 
        className={cn("flex items-center justify-center text-sm text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border", className)}
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={data.map((entry, index) => ({
              ...entry,
              fill: entry.color || CHART_COLORS[index % CHART_COLORS.length]
            }))}
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
      </ResponsiveContainer>
    </div>
  );
}
