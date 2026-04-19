import React, { forwardRef } from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className = '', label, description, ...props }, ref) => {

    return (
      <div className={`flex items-center justify-between ${className}`}>
        {(label || description) && (
          <div className="flex flex-col gap-1 pr-4 rtl:pr-0 rtl:pl-4">
            {label && <label className="text-sm font-bold">{label}</label>}
            {description && <p className="text-xs font-semibold text-muted-foreground">{description}</p>}
          </div>
        )}
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input  type="checkbox" className="sr-only peer" ref={ref} {...props} />
          <div className="w-11 h-6 bg-secondary/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors"></div>
        </label>
      </div>
    );
  }
);
Switch.displayName = 'Switch';
