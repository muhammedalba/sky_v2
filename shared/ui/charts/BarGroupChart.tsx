'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  CHART_TOOLTIP_STYLE, 
  CHART_AXIS_STYLE, 
  CHART_GRID_STYLE,
  CHART_COLORS
} from './ChartUtils';
import { cn } from '@/lib/utils';

interface BarGroupChartProps {
  data: any[];
  xAxisKey: string;
  bars: { dataKey: string; name: string; color?: string }[];
  height?: number | string;
  className?: string;
  showGrid?: boolean;
  tooltipFormatter?: (value: any, name: any) => [any, any];
}

export function BarGroupChart({
  data,
  xAxisKey,
  bars,
  height = 300,
  className,
  showGrid = true,
  tooltipFormatter,
}: BarGroupChartProps) {
  
  if (!data || data.length === 0) {
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
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          {showGrid && <CartesianGrid {...CHART_GRID_STYLE} vertical={false} />}
          
          <XAxis 
            dataKey={xAxisKey} 
            {...CHART_AXIS_STYLE}
            axisLine={false} 
            tickLine={false}
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
            formatter={tooltipFormatter}
            cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
          />
          
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '10px' }}
          />
          
          {bars.map((bar, i) => (
            <Bar 
              key={bar.dataKey}
              dataKey={bar.dataKey} 
              name={bar.name} 
              fill={bar.color || CHART_COLORS[i % CHART_COLORS.length]} 
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
