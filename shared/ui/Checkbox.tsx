import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';
import { Icons } from './Icons';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || React.useId();

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-input bg-background transition-all checked:bg-primary checked:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            ref={ref}
            {...props}
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
            <Icons.Check className="h-3.5 w-3.5 stroke-3" />
          </div>
        </div>
        {(label || description) && (
          <label
            htmlFor={checkboxId}
            className="flex flex-col cursor-pointer select-none"
          >
            {label && (
              <span className={cn(
                "text-sm font-medium leading-none",
                props.disabled ? "text-muted-foreground/40" : "text-foreground"
              )}>
                {label}
              </span>
            )}
            {description && (
              <span className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {description}
              </span>
            )}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
