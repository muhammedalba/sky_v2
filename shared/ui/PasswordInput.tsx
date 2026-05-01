'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './Input';
import { Icons } from './Icons';

interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const shouldFloat =  (props.value && props.value.length > 0);
   
    return (<div className="w-full">
      <div className="relative ">
        <Input
          {...props}
          label={label}
          icon={icon}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn(
            `appearance-none  `
          )}
          error={error}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={cn(
            "absolute inset-e-3 top-1/2 -translate-y-1/2 focus:outline-none transition-all duration-200",
            shouldFloat ? "opacity-100 text-muted-foreground hover:text-primary" : "opacity-0 pointer-events-none"
          )}
          tabIndex={-1}
        >
          {showPassword ? (
            <Icons.EyeOff className="w-5 h-5" />
          ) : (
            <Icons.Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>);
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
