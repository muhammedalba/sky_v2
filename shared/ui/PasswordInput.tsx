'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './Input';
import { Icons } from './Icons';
import { PasswordStrength } from '@/features/auth/components/AuthClientComponents';
import ErrorMessage from './ErrorMessage';

interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  showStrength?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, icon, showStrength = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (<div className="w-full">
      <div className="relative mb-2">
        <Input
          {...props}
          label={label}
          icon={icon}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn(
            `appearance-none`
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-e-3 top-1/2 -translate-y-1/2 focus:outline-none transition-all duration-200 text-muted-foreground/50 hover:text-primary"
          tabIndex={-1}
        >
          {showPassword ? (
            <Icons.EyeOff className="w-5 h-5" />
          ) : (
            <Icons.Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {props.name === "password" && showStrength && <PasswordStrength name="password" />}
      {error && <ErrorMessage message={error} />}
    </div>);
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
