'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function StoreNavbar({ locale }: { locale: string }) {
  const t = useTranslations('store.nav');
  const segment = useSelectedLayoutSegment();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: t('home'), href: `/${locale}/home`, active: segment === 'home' || !segment },
    { name: t('products'), href: `/${locale}/products`, active: segment === 'products' },
    { name: t('contact'), href: `/${locale}/contact`, active: segment === 'contact' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 border-b',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-border/60 shadow-sm'
          : 'bg-transparent border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href={`/${locale}/home`} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <span className="text-primary-foreground font-black text-lg">S</span>
            </div>
            <span className={cn(
               "text-xl font-bold tracking-tight transition-colors",
               scrolled ? "text-foreground" : "text-foreground" // Always foreground relying on bg
            )}>
              Sky Galaxy
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-secondary/50 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
             <Link href={`/${locale}/login`}>
               <Button variant="ghost" className="font-medium text-muted-foreground hover:text-primary">
                 {t('login')}
               </Button>
             </Link>
             <Link href={`/${locale}/dashboard`}>
               <Button className="font-semibold shadow-lg shadow-primary/20 rounded-full px-6">
                 {t('admin')}
               </Button>
             </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
