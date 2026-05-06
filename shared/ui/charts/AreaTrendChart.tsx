'use client';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  CHART_TOOLTIP_STYLE, 
  CHART_AXIS_STYLE, 
  CHART_GRID_STYLE, 
  formatChartDate 
} from './ChartUtils';
import { cn } from '@/lib/utils';

interface AreaTrendChartProps {
  data: { date: string; [key: string]: any }[];
  dataKey: string;
  color?: string;
  height?: number | string;
  className?: string;
  showGrid?: boolean;
}

export function AreaTrendChart({
  data,
  dataKey,
  color = '#6366f1',
  height = 300,
  className,
  showGrid = true,
}: AreaTrendChartProps) {
  const gradId = `grad-${dataKey}`;

  if (!data || data.length === 0) {
    return (
      <div 
        className={cn("flex items-center justify-center text-sm text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border", className)}
        style={{ height }}
      >
        No data available for the selected period
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          
          {showGrid && <CartesianGrid {...CHART_GRID_STYLE} vertical={false} />}
          
          <XAxis 
            dataKey="date" 
            {...CHART_AXIS_STYLE}
            axisLine={false} 
            tickLine={false} 
            tickFormatter={formatChartDate}
            dy={10}
          />
          
          <YAxis 
            {...CHART_AXIS_STYLE}
            axisLine={false} 
            tickLine={false} 
            dx={-10}
          />
          
          <Tooltip 
            contentStyle={CHART_TOOLTIP_STYLE}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3} 
            fillOpacity={1} 
            fill={`url(#${gradId})`} 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
