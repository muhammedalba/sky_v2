'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './Input';
import { Icons } from './Icons';
import ErrorMessage from './ErrorMessage';

interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const IconComponent = icon;
    const [isFocused, setIsFocused] = React.useState(false);
    const shouldFloat = isFocused || (props.value && props.value.length > 0);
    return (<div className="w-full">
      <div className="relative ">
        {label && (
          <label
            htmlFor={props.name}
            className={cn(
              ` pointer-events-none absolute inset-s-1flex items-center gap-x-1 rounded-2xl bg-background z-10 px-2 py-1 text-sm transition-all duration-500  `,
              shouldFloat
                ? '-top-4 text-xs text-foreground/80 w-fit '
                : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground  bg-transparent w-auto',

              props.labelClassName
            )}
          >

            {IconComponent && (
              <IconComponent className={` ${props.value && props.value.length > 0 ? 'text-primary' : 'text-muted-foreground'} inline h-4 text-primary`} />
            )}  {label}
          </label>
        )}
        <Input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            `w-full border py-3 text-lg leading-relaxed  focus:outline-none px-4 rounded-xl border-border/50 bg-secondary/30 transition-all duration-200 focus:border-primary/50 group-hover:border-primary/30 ${error ? 'focus:border-destructive' : ''}`,
            className
          )}
        />
        {shouldFloat && <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-e-3 top-1/2 -translate-y-1/2 focus:outline-none text-muted-foreground hover:text-primary transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <Icons.EyeOff className="w-5 h-5" />
          ) : (
            <Icons.Eye className="w-5 h-5" />
          )}
        </button>}
      </div>
      {error && <ErrorMessage message={error} />}
    </div>);
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
