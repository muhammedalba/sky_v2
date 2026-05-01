'use client';

import { ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/utils';
import Badge from '../Badge';
import { Icons } from '../Icons';

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
  totalResults?: string;
}

export default function EntityPageHeader({
  title,
  subtitle,
  action,
  className,
  totalResults,
}: EntityPageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6", className)}>
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight title-gradient">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm font-medium">
            {subtitle}
          </p>
        )}
        <div className="text-sm font-medium text-muted-foreground">
          {totalResults && <Badge variant="success" className="rounded-full text-green-700 bg-green-100 hover:bg-green-300 font-bold text-xs gap-1.5 flex items-center w-fit group/badge transition-all duration-300">
            <Icons.Products className="w-4 h-4 group-hover/badge:rotate-12 transition-transform duration-500" />
            {totalResults}
          </Badge>}  
        </div> 
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
