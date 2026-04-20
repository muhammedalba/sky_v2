'use client';

import React, { memo, useTransition } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useRouter, usePathname } from '@/navigation';
import { useParams } from 'next/navigation';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/lib/utils';

const TopbarActions = () => {
  const { theme, setTheme } = useUIStore();
  const { locale } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const switchLocale = (newLocale: 'en' | 'ar') => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      {/* Locale Switcher */}
      <div className="flex items-center bg-muted/40 rounded-lg p-1 border border-border/40">
        {(['en', 'ar'] as const).map((l) => (
          <button
            key={l}
            onClick={() => switchLocale(l)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[10px] uppercase font-bold transition-all",
              locale === l ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-border/60" />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Icons.Moon className="h-4 w-4" />
        ) : (
          <Icons.Sun className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default memo(TopbarActions);
