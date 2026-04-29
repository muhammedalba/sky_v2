'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Package, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { useCartStore } from '@/store/cart-store';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import LanguageSwitcher from '@/widgets/layout/LanguageSwitcher';
import { Icons } from '@/shared/ui/Icons';
import Image from 'next/image';
import CategoriesScroller, { type CategoryItem } from './CategoriesScroller';
import UserAccountMenu from '@/widgets/layout/UserAccountMenu';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DesktopNavbarProps {
  categories: CategoryItem[];
}

// ─── Desktop Search Bar ───────────────────────────────────────────────────────

function DesktopSearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const t = useTranslations('store.nav');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-xl relative">
      <div
        className={cn(
          'flex items-center gap-2',
          'h-11 rounded-xl',
          'bg-muted/40 border',
          'px-4',
          'transition-all duration-300',
          isFocused
            ? 'border-primary/50 bg-background shadow-md shadow-primary/5 ring-2 ring-primary/10'
            : 'border-border/40 hover:border-border/60'
        )}
      >
        <Search size={18} className="text-muted-foreground shrink-0" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t.has('search') ? t('search') : 'Search products...'}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X  size={14} />
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Cart Icon with Badge ─────────────────────────────────────────────────────

function CartButton() {
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  const t = useTranslations('store.nav');

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
      aria-label={`${t.has('cart') ? t('cart') : 'Cart'} (${cartItemCount})`}
    >
      <div className="relative">
        <ShoppingCart
          size={20}
          strokeWidth={1.8}
          className="text-foreground/70 group-hover:text-foreground transition-colors"
        />
        {cartItemCount > 0 && (
          <span className="absolute -top-2 -inset-e-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-background animate-badge-pop">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </div>
      <span className="text-sm font-semibold text-foreground/70 group-hover:text-foreground hidden xl:inline">
        {t.has('cart') ? t('cart') : 'Cart'}
      </span>
    </Link>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────

export default function DesktopNavbar({ categories }: DesktopNavbarProps) {
  const t = useTranslations('store.nav');
  const pathname = usePathname();
  const { theme, setTheme } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SkyGalaxy';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('home'), href: '/home' },
    { label: t('products'), href: '/products' },
    { label: t('contact'), href: '/contact' },
  ];

  return (
    <header
      id="desktop-navbar"
      className={cn(
        'hidden md:block',
        'sticky top-0 z-40',
        'transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm'
          : 'bg-background border-b border-border/20'
      )}
    >
      {/* Main Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-16 justify-between">
          {/* Logo */}
          <Link
            href="/home"
            className="flex items-center  shrink-0 group"
          >
            <Image
              src="/images/auth-logo.png"
              alt={`${appName} Logo`}
              width={40}
              height={40}
              className="object-contain mb-3"
              priority
            />
            <span className="text-md font-extrabold tracking-tight bg-clip-text text-transparent animate-gradient bg-linear-to-br from-info via-foreground/30 to-primary">
              {appName}
            </span>
          </Link>

          {/* Search */}
          <DesktopSearchBar />

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Icons.Moon className="h-[18px] w-[18px]" />
              ) : (
                <Icons.Sun className="h-[18px] w-[18px]" />
              )}
            </button>

            {/* Language */}
            <LanguageSwitcher />

            {/* Orders */}
            <Link
              href="/orders"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
            >
              <Package
                size={20}
                strokeWidth={1.8}
                className="text-foreground/70 group-hover:text-foreground transition-colors"
              />
              <span className="text-sm font-semibold text-foreground/70 group-hover:text-foreground hidden xl:inline">
                {t('orders')}
              </span>
            </Link>

            {/* Cart */}
            <CartButton />

            {/* User */}
            <UserAccountMenu iconOnly={true} dir="top" />
          </div>
        </div>
      </div>

      {/* Nav Links + Categories Row */}
      <div className="border-t border-border/20">
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
                        ? 'text-primary bg-primary/8'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Divider */}
            {categories.length > 0 && (
              <div className="w-px h-5 bg-border/50 shrink-0" />
            )}

            {/* Categories (with scroll arrows and hover flyouts) */}
            {categories.length > 0 && (
              <div className="flex-1 min-w-0">
                <CategoriesScroller categories={categories} variant="desktop" className="py-0" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
