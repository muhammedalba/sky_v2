'use client';

import  { memo, useTransition, useCallback } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useRouter, usePathname } from '@/navigation';
import { useParams } from 'next/navigation';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/lib/utils';

const TopbarActions = ({ showThemeSwitcher = true, showLocaleSwitcher = true, showBar = true }: { showThemeSwitcher?: boolean, showLocaleSwitcher?: boolean, showBar?: boolean }) => {
  // 1. استخراج القيم بشكل محدد لتحسين الأداء
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  const { locale } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // 2. تحصين دالة تغيير المظهر باستخدام useCallbackhem
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // 3. تحصين دالة تغيير اللغة باستخدام useCallback
  const switchLocale = useCallback((newLocale: 'en' | 'ar') => {
    if (newLocale === locale || isPending) return; // منع التغيير إذا كان هو المختار حالياً أو قيد المعالجة

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  }, [locale, isPending, pathname, router]);

  return (
    <div className="flex items-center gap-3 ">
      {/* Locale Switcher */}
      {showLocaleSwitcher && <div className={cn(
        "flex items-center bg-muted/40 rounded-lg p-1 border border-border/40 transition-opacity",
        isPending && "opacity-50 pointer-events-none" // تعتيم الأزرار أثناء الانتقال
      )}>
        {(['en', 'ar'] as const).map((l) => (
          <button
            key={l}
            type="button" // تحديد النوع لضمان عدم سلوكه كـ Submit
            onClick={() => switchLocale(l)}
            disabled={isPending}
            className={cn(
              "px-2.5 py-1 cursor-pointer active:scale-110 rounded-md text-[10px] uppercase font-bold transition-all",
              locale === l
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          > 
            {l}
          </button>
        ))}
      </div>}

      {showBar && <div className="h-4 w-px bg-border/60" />}
      {showThemeSwitcher && <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors text-foreground hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Icons.Moon className="h-4 w-4" />
        ) : (
          <Icons.Sun className="h-4 w-4" />
        )}
      </button>}
    </div>
  );
};

export default memo(TopbarActions);