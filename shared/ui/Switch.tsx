import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    // توليد ID فريد إذا لم يوجد لربط الليبل بالمدخل
    const switchId = id || React.useId();

    return (
      <div className={cn("group flex items-center justify-between gap-4", className)}>
        {(label || description) && (
          <label
            htmlFor={switchId}
            className="flex flex-col cursor-pointer select-none"
          >
            {label && (
              <span className={cn(
                "text-sm font-semibold transition-colors duration-200",
                props.disabled ? "text-muted-foreground/40" :
                  props.checked ? "text-foreground" : "text-muted-foreground/50"
              )}>
                {label}
              </span>
            )}
            {description && (
              <span className={cn(
                "text-xs font-medium leading-relaxed transition-colors duration-200",
                props.disabled ? "text-muted-foreground/30" : "text-muted-foreground/70"
              )}>
                {description}
              </span>
            )}
          </label>
        )}

        <label className={cn(
          "relative inline-flex items-center cursor-pointer shrink-0 transition-transform duration-200 active:scale-95",
          props.disabled && "cursor-not-allowed opacity-50"
        )}>
          <input
            id={switchId}
            type="checkbox"
            className="sr-only peer"
            ref={ref}
            {...props}
          />

          <div className={cn(
            "w-11 h-6 rounded-full transition-all duration-300 ease-in-out",
            "bg-muted border-2 border-transparent", // الحالة الافتراضية
            "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background", // Focus احترافي
            "peer-checked:bg-success peer-checked:border-success/10", // حالة التفعيل
            "after:content-[''] after:absolute after:top-[2px] after:inset-s-[2px]",
            "after:bg-white after:shadow-sm after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300",
            "peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5", // حركة الزر
            "peer-hover:after:scale-105" // تأثير صغير عند التحويم
          )}>
          </div>
        </label>
      </div>
    );
  }
);

Switch.displayName = 'Switch';