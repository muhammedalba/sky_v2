'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import { useCartStore } from '@/store/cart-store';
import { cn } from '@/lib/utils';
import CategoriesScroller, { type CategoryItem } from './CategoriesScroller';
import SearchBar from './SearchBar';
import UserAccountMenu from '@/widgets/layout/UserAccountMenu';
import TopbarActions from '@/widgets/layout/topbar/TopbarActions';
import { Icons } from '@/shared/ui/Icons';
import { isAdmin } from '@/lib/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSettings } from '@/app/providers/SettingsProvider';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { env } from '@/lib/env';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DesktopNavbarProps {
  categories: CategoryItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_NAME = env.APP_NAME;

// ─── Cart Icon with Badge ─────────────────────────────────────────────────────

const CartButton = memo(({ is_Admin, cartItemCount }: { is_Admin: boolean, cartItemCount: number }) => {
  const t = useTranslations('store.nav');

  const label = is_Admin
    ? (t.has('admin') ? t('admin') : 'Admin Panel')
    : (t.has('cart') ? t('cart') : 'Cart');

  return (
    <Link
      href={`/${is_Admin ? "dashboard" : "cart"}`}
      title={label}
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-all duration-300 group"
      aria-label={`${label} (${cartItemCount})`}
    >
      <div className="relative">
        {is_Admin ? (
          <Icons.Dashboard className="size-5 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
        ) : (
          <Icons.ShoppingCart className="size-5 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
        )}

        {cartItemCount > 0 && !is_Admin && (
          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full ring-2 ring-background animate-badge-pop shadow-sm">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </div>
      <span className="text-sm font-semibold text-foreground/70 group-hover:text-foreground hidden xl:inline transition-colors duration-300">
        {label}
      </span>
    </Link>
  );
});

CartButton.displayName = 'CartButton';

// ─── Main Component ───────────────────────────────────────────────────────────

function DesktopNavbar({ categories }: DesktopNavbarProps) {
  const t = useTranslations('store.nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const is_Admin = isAdmin();
    
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  const locale = useLocale();
  const settings = useSettings();

  // تحسين مراقب التمرير لمنع التكرار
  useEffect(() => {
    const handleScroll = () => {
      // React سيتجاهل التحديث (Bailout) تلقائياً إذا لم تتغير القيمة
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // مصفوفة فارغة لضمان التسجيل مرة واحدة فقط

  const navLinks = useMemo(() => [
    { label: t('home'), href: `/${locale}/home` },
    { label: t('products'), href: `/${locale}/products` },
    { label: t('contact'), href: `/${locale}/contact` },
  ], [t, locale]);

  return (
    <header
      id="desktop-navbar"
      className={cn(
        'hidden md:block fixed top-0 z-40 inset-x-0 transition-all duration-500 ease-in-out',
        scrolled
          ? 'bg-background/70 backdrop-blur-2xl border-b border-border/60 shadow-sm'
          : 'bg-transparent '
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Main Row */}
        <div className="flex items-center gap-8 h-14 justify-between">
          {/* Logo */}
          <Link
            href={`/home`}
            className="flex items-center  shrink-0 group"
          >
            <ImageWithFallback
              src={settings.logo || "/assets/images/auth-logo.png"}
              alt={`${settings.siteName?.[locale as 'ar' | 'en'] || APP_NAME} Logo`}
              width={40}
              height={40}
              className="object-contain mb-3"
            />
            <span className="text-md font-extrabold tracking-tight title-gradient">
              {settings.siteName?.[locale as 'ar' | 'en'] || APP_NAME}
            </span>
          </Link>

          {/* Search */}
          <SearchBar className="max-w-xl" />

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Language */}
            <TopbarActions />

            {/* Cart */}
            <CartButton is_Admin={is_Admin} cartItemCount={cartItemCount} />

            {/* User */}
            <UserAccountMenu iconOnly={true} dir="top" className="m-0" locale={locale} />
          </div>
        </div>

        {/* Nav Links + Categories Row */}
        <div className={cn(scrolled ? "border-t border-border/20 " : "")}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 h-10">
              {/* Page Links */}
              <nav className="flex items-center gap-1 shrink-0">
                {navLinks.map((link) => {
                  const isActive =
                    link.href === '/home'
                      ? pathname === '/home' || pathname === '/'
                      : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200',
                        isActive
                          ? 'text-white bg-primary/60'
                          : 'text-muted-foreground hover:text-primary hover:bg-accent/40'
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Divider */}
              {categories.length > 0 && (
                <div className="w-px h-6 bg-border/40 shrink-0" />
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex-1 min-w-0 ">
                  <CategoriesScroller categories={categories} variant="desktop" className="py-0" />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </header>
  );
}

// تغليف المكون الرئيسي بـ memo
export default memo(DesktopNavbar);