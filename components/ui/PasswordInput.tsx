'use client';

import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './Input';
import { Icons } from './Icons';

interface PasswordInputProps extends React.ComponentProps<typeof Input> {}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative w-full">
        <Input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-12', className)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[calc(50%+10px)] -translate-y-1/2 focus:outline-none text-muted-foreground hover:text-primary transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
             <Icons.Menu className="w-5 h-5" /> // Eye Off proxy
          ) : (
             <Icons.Menu className="w-5 h-5" /> // Eye proxy
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
