'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Icons } from '@/shared/ui/Icons';
import { useDebounce } from '@/shared/hooks/use-debounce';

interface SearchBarProps {
  className?: string;
  useLiveSearch?: boolean;
}

export default function SearchBar({ className, useLiveSearch = false }: SearchBarProps) {
  const pathname = usePathname();
  const isProductsPage = pathname.startsWith('/products');

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const t = useTranslations('store.nav');
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (useLiveSearch && debouncedQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(debouncedQuery.trim())}`);
    }
  }, [debouncedQuery, router, useLiveSearch]);

  if (!isProductsPage) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex-1 relative', className)}>
      <div
        className={cn(
          'flex items-center gap-2',
          'h-10 sm:h-11 rounded-xl',
          'bg-muted/40 border',
          'px-3 sm:px-4',
          'transition-all duration-300',
          isFocused
            ? 'border-primary/50 bg-background shadow-md shadow-primary/5 ring-2 ring-primary/10'
            : 'border-border/40 hover:border-border/60'
        )}
      >
        <Icons.Search className="size-5 text-muted-foreground shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t.has('search') ? t('search') : 'Search products...'}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none min-w-0"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <Icons.X className="size-4" />
          </button>
        )}
      </div>
    </form>
  );
}
