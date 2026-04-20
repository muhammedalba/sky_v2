'use client';

import { ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/utils';

interface EntityPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: {
    label: ReactNode;
    icon?: ReactNode;
    onClick: () => void;
    className?: string;
  };
  className?: string;
}

export default function EntityPageHeader({
  title,
  subtitle,
  action,
  className,
}: EntityPageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6", className)}>
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Button 
          onClick={action.onClick}
          className={cn(
            "h-11 px-6 font-bold flex items-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95",
            action.className
          )}
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  );
}
