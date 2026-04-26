'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none bg-white/50 backdrop-blur-md dark:bg-secondary/50 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </h3>
          </div>
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        </div>
        
        {(description || trend) && (
          <div className="mt-4 flex items-center gap-2">
            {trend && (
              <span className={cn(
                "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                trend.isUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
