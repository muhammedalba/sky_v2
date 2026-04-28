'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Menu, Search, X, Sun, Moon } from 'lucide-react';
import { useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import LanguageSwitcher from '@/widgets/layout/LanguageSwitcher';
import CategoriesScroller, { type CategoryItem } from './CategoriesScroller';
import SideDrawer from './SideDrawer';
import { useDebounce } from '@/shared/hooks/use-debounce';


// ─── Types ────────────────────────────────────────────────────────────────────

interface MobileTopBarProps {
  categories: CategoryItem[];
}

// ─── Search Input ─────────────────────────────────────────────────────────────

function MobileSearchInput() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const t = useTranslations('store.nav');
  const debouncedQuery = useDebounce(query, 400);


  useEffect(() => {
    if (debouncedQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(debouncedQuery.trim())}`);
    }
  }, [debouncedQuery, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };


  const clearSearch = () => {
    setQuery('');
  };


  return (
    <form onSubmit={handleSubmit} className="flex-1 relative">
      <div
        className={cn(
          'flex items-center gap-2',
          'h-10 rounded-xl',
          'bg-muted/60 border',
          'px-3',
          'transition-all duration-200',
          isFocused
            ? 'border-primary/50 bg-background shadow-sm shadow-primary/10'
            : 'border-border/40'
        )}
      >
        <Search size={16} className="text-muted-foreground shrink-0" />
        <input
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t.has('search') ? t('search') : 'Search products...'}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none min-w-0"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MobileTopBar({ categories }: MobileTopBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, setTheme } = useUIStore();

  return (
    <>
      <header
        id="mobile-top-bar"
        className={cn(
          'sticky top-0 z-40',
          'md:hidden',
          'bg-background/95 backdrop-blur-md',
          'border-b border-border/40',
          'shadow-sm'
        )}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Row 1: Hamburger + Search + Actions */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              'shrink-0',
              'w-10 h-10 rounded-xl',
              'flex items-center justify-center',
              'bg-muted/50 hover:bg-accent',
              'text-foreground/70 hover:text-foreground',
              'transition-all duration-200',
              'active:scale-95'
            )}
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={2} />
          </button>

          <MobileSearchInput />

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
              'shrink-0',
              'w-9 h-9 rounded-xl',
              'flex items-center justify-center',
              'bg-muted/50 hover:bg-accent',
              'text-foreground/70 hover:text-foreground',
              'transition-all duration-200',
              'active:scale-95'
            )}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon size={18} strokeWidth={1.8} />
            ) : (
              <Sun size={18} strokeWidth={1.8} />
            )}
          </button>

          {/* Language Switcher */}
          <div className="shrink-0">
            <LanguageSwitcher className="h-9 w-9 rounded-xl bg-muted/50 hover:bg-accent px-0 text-xs" />
          </div>
        </div>

        {/* Row 2: Categories Scroller */}
        {categories.length > 0 && (
          <div className="px-3 pb-2.5">
            <CategoriesScroller categories={categories} className='py-0' />
          </div>
        )}
      </header>

      {/* Side Drawer */}
      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
      />
    </>
  );
}
