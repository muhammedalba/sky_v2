'use client';

import { Link } from '@/navigation';
import { useSelectedLayoutSegment, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/ui-store';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { getUser, isAuthenticated, logout } from '@/lib/auth';
import Image from 'next/image';

export default function StoreNavbar() {
  const t = useTranslations('store.nav');
  const segment = useSelectedLayoutSegment();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useUIStore();
  
  // Load user state only on client-side to avoid hydration errors
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = isAuthenticated() ? getUser() : null;
    setUser(userData);
    setIsLoggedIn(!!userData);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
    };
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [userMenuOpen]);

  const navItems = [
    { name: t('home'), href: '/home', active: segment === 'home' || !segment },
    { name: t('products'), href: '/products', active: segment === 'products' },
    { name: t('contact'), href: '/contact', active: segment === 'contact' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5'
          : 'bg-background/80 backdrop-blur-md border-b border-border/30'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2.5 group select-none flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary via-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/30 backdrop-blur-sm" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Sky Galaxy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative text-sm font-semibold transition-colors duration-200 group',
                  item.active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.name}
                {item.active && (
                  <span className="absolute -bottom-7 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
                {!item.active && (
                  <span className="absolute -bottom-7 left-0 right-0 h-0.5 bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Search"
            >
              <Icons.Menu className="h-4 w-4" />
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher className="hidden sm:inline-flex" />

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Icons.Moon className="h-4 w-4" />
              ) : (
                <Icons.Sun className="h-4 w-4" />
              )}
            </button>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <Icons.Menu className="h-4 w-4" />
              {/* Cart Badge */}
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                0
              </span>
            </Link>

            <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

            {/* User Menu or Login */}
            {!mounted ? (
              // Show skeleton during hydration
              <div className="w-24 h-9 bg-accent/50 rounded-full animate-pulse" />
            ) : isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center gap-2 sm:gap-3 hover:bg-accent rounded-full p-1 pr-2 sm:pr-3 transition-colors group"
                >
                  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary transition-all">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || 'User'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-foreground">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <Icons.Menu className="hidden sm:block h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:rotate-180" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-2xl shadow-xl shadow-black/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* User Info */}
                    <div className="p-4 border-b border-border bg-accent/50">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-border">
                          {user?.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name || 'User'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold">
                              {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                      >
                        <Icons.Users className="w-4 h-4 text-muted-foreground" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                      >
                        <Icons.Menu className="w-4 h-4 text-muted-foreground" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                      >
                        <Icons.Menu className="w-4 h-4 text-muted-foreground" />
                        <span>Dashboard</span>
                      </Link>
                    </div>

                    <div className="p-2 border-t border-border">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-sm font-medium text-red-600 dark:text-red-400"
                      >
                        <Icons.Menu className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex font-semibold rounded-full px-5">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="font-bold shadow-lg shadow-primary/20 rounded-full px-4 sm:px-6 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Button - can be added later */}
    </nav>
  );
}
