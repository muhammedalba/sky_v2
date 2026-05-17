'use client';

import { ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/utils';
import Badge from '../Badge';
import { Icons } from '../Icons';
import Can from '@/components/auth/Can';

interface EntityPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: {
    label: ReactNode;
    icon?: ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
    permission?: string | string[];
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
  const renderActionButton = () => (
    <Button variant="default"
      onClick={action!.onClick}
      disabled={action!.disabled}
      className={cn(
        "h-11 px-6 font-bold flex flex-1 sm:flex-0 items-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95",
        action!.className
      )}
    >
      {action!.icon}
      {action!.label}
    </Button>
  );

  return (
    <div className={cn("flex  items-center flex-wrap justify-between gap-6", className)}>
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight title-gradient">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm font-medium">
            {subtitle}
          </p>
        )}
        <div className="text-sm font-medium text-muted-foreground group/badge">
          {totalResults && <Badge variant="success" className="gap-1.5 flex items-center w-fit ">
            <Icons.Products className="w-4 h-4 group-hover/badge:rotate-18 transition-transform duration-500" />
            {totalResults}
          </Badge>}
        </div>
      </div>
      {action && (
        action.permission ? (
          <Can permission={action.permission}>
            {renderActionButton()}
          </Can>
        ) : (
          renderActionButton()
        )
      )}
    </div>
  );
}
