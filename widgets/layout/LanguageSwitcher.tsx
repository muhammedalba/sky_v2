'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/lib/utils';
import { useTransition } from 'react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  className?: string;
}

export default function LanguageSwitcher({ variant = 'ghost', className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    startTransition(() => {
      // TypeScript might complain about specific route types depending on next-intl setup, but generic string is usually fine or we need strict typed routes
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={toggleLocale}
      disabled={isPending}
      className={cn("gap-2 min-w-[40px] px-3 font-semibold transition-all duration-300", className)}
      aria-label={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      {/* <Icons.Languages className="w-4 h-4" /> */}
      <span className="uppercase">{locale}</span>
    </Button>
  );
}
