'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import { useCartStore } from '@/store/cart-store';
import { cn } from '@/lib/utils';
import CategoriesScroller, { type CategoryItem } from './CategoriesScroller';
import SearchBar from './SearchBar';
import UserAccountMenu from '@/widgets/layout/UserAccountMenu';
import TopbarActions from '@/widgets/layout/topbar/TopbarActions';
import { DashboardIcon, MenuIcon, ShoppingCartIcon } from "@/shared/ui/Icons";
import { checkUserPermission } from '@/lib/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSettings } from '@/app/providers/SettingsProvider';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { env } from '@/lib/env';
import SideDrawer from './SideDrawer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DesktopNavbarProps {
  categories: CategoryItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_NAME = env.APP_NAME;

// ─── Cart Icon with Badge ─────────────────────────────────────────────────────

const CartButton = memo(({ is_Admin, cartItemCount, className }: { is_Admin: boolean, cartItemCount: number, className?: string }) => {
  const t = useTranslations('store.nav');
  const openCartDrawer = useCartStore((state) => state.openCartDrawer);

  const label = is_Admin
    ? (t.has('admin') ? t('admin') : 'Admin Panel')
    : (t.has('cart') ? t('cart') : 'Cart');

  const content = (
      <div className="relative cursor-pointer">
        {is_Admin ? (
          <DashboardIcon className="size-4 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
        ) : (
          <ShoppingCartIcon className="size-4 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
        )}

        {cartItemCount > 0 && !is_Admin && (
          <span className="absolute -top-3  -right-4 min-w-4.5 h-4.5 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full  animate-badge-pop shadow-sm">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </div>
  );

  const wrapperClass = cn("relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-all duration-300 group", className);

  if (is_Admin) {
    return (
      <Link href="/dashboard" title={label} className={wrapperClass} aria-label={`${label} (${cartItemCount})`}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      onClick={openCartDrawer} 
      title={label} 
      className={wrapperClass} 
      aria-label={`${label} (${cartItemCount})`}
    >
      {content}
    </button>
  );
});

CartButton.displayName = 'CartButton';

// ─── Main Component ───────────────────────────────────────────────────────────

function DesktopNavbar({ categories }: DesktopNavbarProps) {
  const t = useTranslations('store.nav');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  // Admin check is derived from the server-verified user object — no localStorage needed
  const is_Admin = checkUserPermission(user ?? null, 'access_dashboard');

  const cartItemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const locale = useLocale();
  const settings = useSettings();
  const siteName = settings.siteName?.[locale as 'ar' | 'en'] || 'Sky Galaxy';
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
    { label: t('home'), href: `/home` },
    { label: t('products'), href: `/products` },
    { label: t('contact'), href: `/contact` },
  ], [t]);
// استخدام useCallback لمنع إعادة إنشاء الدوال في كل دورة تصيير
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  return (<>
    <header
      id="desktop-navbar"
      className={cn(
        'block fixed top-(--promo-banner-height,0px) z-40 inset-x-0 transition-all duration-500 ease-in-out',
        scrolled
          ? 'bg-background/70 backdrop-blur-2xl border-b border-border/60 shadow-sm'
          : 'bg-transparent '
      )}
    >
        {/* desktop navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Main Row */}
        <div className="flex items-center gap-8 h-14 justify-between">
       
          {/* Logo */}
          <Link
            href={`/home`}
            className="flex  items-center  shrink-0 group"
          >
            <ImageWithFallback
              src={settings.logo || "/assets/images/auth-logo.png"}
              alt={`${siteName || APP_NAME} Logo`}
              width={40}
              height={40}
              className="object-contain mb-3"
            />
            <span className="hidden sm:flex text-md font-extrabold tracking-tight title-gradient">
              {siteName || APP_NAME}
            </span>
          </Link>

          {/* Search */}
          <SearchBar useLiveSearch={true} className="hidden md:block w-1/6 " />
          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Language */}
            <TopbarActions />
            {/* Cart */}
            <CartButton   className="hidden sm:block " is_Admin={is_Admin} cartItemCount={Number(cartItemCount)} />
            {/* User */}
            <UserAccountMenu iconOnly={true} dir="top" className="hidden sm:block m-0" />
          
           {/* Menu Button */}
          <button
            onClick={openDrawer}
            className={cn(
              'sm:hidden shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300',
              'bg-muted/50 hover:bg-accent text-foreground/70 active:scale-90 shadow-sm border border-border/20'
            )}
            aria-label="Open menu"
          >
            <MenuIcon className='size-5' />
          </button>
          </div>
        </div>

        {/* Nav Links + Categories Row */}
        <div className={cn(scrolled ? "border-t border-border/20 " : "")}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 h-10">
              {/* Page Links */}
              <nav className="hidden sm:flex items-center gap-1 shrink-0">
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
                <div className="hidden sm:flex w-px h-6 bg-border/40 shrink-0" />
              )}

              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex-1 min-w-0 ">
                  <CategoriesScroller categories={categories}  className="py-0" />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </header>
   {/* Side Drawer */}
      <SideDrawer 
        isOpen={drawerOpen}
        onClose={closeDrawer}
        categories={categories}
      />
 </>);
}

// تغليف المكون الرئيسي بـ memo
export default memo(DesktopNavbar);