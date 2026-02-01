'use client';

import { forwardRef, useState } from 'react';
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
  ({ className,  label, error,icon,...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
const IconComponent = icon;
    return (<>
      <div className="relative w-full space-y-2 mt-5">
        {label && (
                  <label 
                    htmlFor={props.name} 
                    className={cn(
                      ` pointer-events-none absolute start-1 flex items-center gap-x-1 rounded-2xl bg-background z-10 px-2 py-1 text-sm transition-all duration-500  ` ,
                      props.value && props.value.length > 0 
                        ? '-top-4 text-xs text-foreground/80  w-fit ' 
                        : 'top-1/2 -translate-y-1/2 text-sm text-gray-400 w-1/2 bg-transparent ',
                        
                      props.labelClassName
                    )}
                  >
                 
                     {IconComponent && (
                    <IconComponent className={` ${props.value && props.value.length > 0 ? 'text-blue-700' : 'text-gray-400'} inline h-4 text-blue-500`} />
                )}  {label}
                  </label>
                )}
        <Input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn(
                      `w-full rounded-lg border px-4 py-3 text-lg leading-relaxed  focus:outline-none px-4 rounded-xl border-border/50 bg-secondary/30 transition-all duration-200 focus:border-primary/50 group-hover:border-primary/30 ${error ? 'focus:border-destructive' : ''}`,
                      className
                    )}
        />
        {props.value && <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute end-3 top-1/2 -translate-y-1/2 focus:outline-none text-muted-foreground hover:text-primary transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
             <Icons.EyeOff className="w-5 h-5" />
          ) : (
             <Icons.Eye className="w-5 h-5" />
          )}
        </button>}
      </div>
      {error && <ErrorMessage message={error} className="" />}
   </> );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
