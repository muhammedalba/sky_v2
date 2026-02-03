'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';

export default function StoreFooter() {
  const t = useTranslations('store.footer');
  const navT = useTranslations('store.nav');
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-black tracking-tight text-foreground mb-2">Sky Galaxy</h3>
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Sky Galaxy. {t('rights')}
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
             <Link href="/home" className="hover:text-primary transition-colors">{navT('home')}</Link>
             <Link href="/products" className="hover:text-primary transition-colors">{navT('products')}</Link>
             <Link href="/contact" className="hover:text-primary transition-colors">{navT('contact')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
