
import { Card, CardContent } from '@/shared/ui/Card';
import { cn } from '@/lib/utils';
import Badge from './Badge';

export interface StatCardProps {
  title: string;
  value: string | number;
  Icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
  colorFrom?: string;
  colorBg?: string;
  colorIcon?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "success" | "warning";
}

export function StatCard({
  title, value, Icon, badge, description, trend, className,
  colorFrom = 'from-primary/5', colorBg = 'bg-primary/10 dark:bg-primary/20', colorIcon = 'text-primary', badgeVariant
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden border-none shadow-md bg-background group hover:shadow-xl transition-all duration-300 flex flex-col", className)}>
      <div className={cn("absolute inset-0 bg-linear-to-br to-transparent pointer-events-none", colorFrom)} />
      <CardContent className="p-5 relative z-10 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("  p-2 rounded-full", colorBg, colorIcon)}>
           <Icon className="w-8 h-8"/> 
          </div>
          {badge && <Badge variant={badgeVariant}  >
            {badge}
          </Badge>}
        </div>
        <p className="text-xs py-4 font-medium title-gradient mt-1">{title}</p>
        <p className="text-2xl pb-1 font-black tracking-tight text-foreground">{value}</p>

        {(description || trend) && (
          <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-2">
            {trend && (
              <span className={cn(
                "flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                trend.isUp ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}>
                {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground leading-snug">{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
