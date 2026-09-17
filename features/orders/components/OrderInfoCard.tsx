"use client";

import { Card, CardContent } from "@/shared/ui/Card";
import { cn } from "@/lib/utils";

interface OrderInfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  /** Overrides the Card's own classes (border/background). */
  className?: string;
  /** Overrides the icon container's shape/background (color stays text-primary). */
  iconWrapperClassName?: string;
}

/**
 * Shared "icon + title + content" shell used across order-detail views
 * (admin drawer, customer order page). Only the structure is shared — each
 * caller supplies its own content and, if needed, its own shape/background
 * via className/iconWrapperClassName to match its surrounding design system.
 */
export default function OrderInfoCard({
  icon: Icon,
  title,
  children,
  className,
  iconWrapperClassName,
}: OrderInfoCardProps) {
  return (
    <Card className={cn("border-border/30 bg-secondary/10", className)}>
      
      <CardContent className="p-4 flex gap-3">
        <div
          className={cn(
            "h-10 w-10 shrink-0 flex items-center justify-center text-primary",
            iconWrapperClassName ?? "rounded-full bg-muted/40",
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
