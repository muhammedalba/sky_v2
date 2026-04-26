'use client';

import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';
import { useCallback } from 'react';

interface EntitySearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export default function EntitySearchBar({
  placeholder = 'Search...',
  defaultValue,
  onSearch,
  debounceMs = 500,
  className,
}: EntitySearchBarProps) {
  const handleSearch = useCallback(
    debounce((value: string) => {
      onSearch(value);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  return (
    <div
      className={cn(
        'flex items-center gap-4 bg-background/50 backdrop-blur-sm p-1 rounded-2xl border border-border/40 shadow-sm w-full max-w-2xl',
        className
      )}
    >
      <div className="relative flex-1 group">
        <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="pl-11 h-12 w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
