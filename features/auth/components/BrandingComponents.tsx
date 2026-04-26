import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---

export interface FeaturePillProps {
  icon?: LucideIcon;
  label: string;
  iconColor?: string;
  className?: string;
}

export interface PreviewStatCardProps {
  icon: LucideIcon;
  badgeText: string;
  value: string;
  label: string;
  color: 'success' | 'info' | 'warning' | 'primary';
  className?: string;
}

// --- Constants ---

export const STAT_CARD_COLORS = {
  success: { bg: 'from-success/20 to-success/20', border: 'border-success/20', text: 'text-success', badge: 'bg-success/10' },
  info: { bg: 'from-info/20 to-info/20', border: 'border-info/20', text: 'text-info', badge: 'bg-info/10' },
  warning: { bg: 'from-warning/20 to-warning/20', border: 'border-warning/20', text: 'text-warning', badge: 'bg-warning/10' },
  primary: { bg: 'from-primary/20 to-primary/20', border: 'border-primary/20', text: 'text-primary', badge: 'bg-primary/10' },
};

// --- Components ---

/**
 * BenefitItem - A simple list item with a checkmark icon.
 */
export function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 text-foreground/90">
      <span className="shrink-0 w-6 h-6 bg-success/20 rounded-full flex items-center justify-center text-success font-bold text-sm">
        ✓
      </span>
      <span className="text-sm font-medium leading-relaxed">{text}</span>
    </div>
  );
}

/**
 * FeaturePill - A pill-shaped badge with an optional icon.
 */
export function FeaturePill({ icon: Icon, label, iconColor = "", className = "" }: FeaturePillProps) {
  return (
    <div className={cn(
      "flex items-center gap-2  rounded-full hover:animate-gradient transition-all group",
      className
    )}>
      {Icon && <Icon className={cn("w-5 h-5 group-hover:scale-110 transition-transform", iconColor)} />}
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

/**
 * PreviewStatCard - A card displaying a statistic with an icon and badge.
 */
export function PreviewStatCard({ icon: Icon, badgeText, value, label, color, className = "" }: PreviewStatCardProps) {
  const styles = STAT_CARD_COLORS[color];

  return (
    <div className={cn(
      "p-5 rounded-2xl bg-foreground/5 backdrop-blur-sm hover:bg-foreground/10 transition-all group",
      className
    )}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className={cn(
          "w-8 h-8 rounded-xl bg-linear-to-br flex items-center justify-center border group-hover:scale-110 transition-transform",
          styles.bg,
          styles.border
        )}>
          <Icon className={cn("w-4 h-4", styles.text)} />
        </div>
        <span className={cn(
          "text-xs font-bold px-2 py-0.5 rounded-lg",
          styles.text,
          styles.badge
        )}>
          {badgeText}
        </span>
      </div>
      <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
      <p className="text-muted-foreground text-xs font-medium mt-1">{label}</p>
    </div>
  );
}
