'use client';

import { memo, useMemo } from 'react';

import { useTranslations, useLocale } from 'next-intl';
// السحر هنا: نستخدم usePathname الخاصة بـ next-intl والتي تتجاهل لغة الرابط تلقائياً
import { Link, usePathname } from '@/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/shared/ui/Icons';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { checkUserPermission } from '@/lib/auth';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

interface NavItem {
  key: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isCTA?: boolean;
}

// ─────────────────────────────────────────────────────────
// Nav Item Component
// ─────────────────────────────────────────────────────────

const BottomNavItem = memo(function BottomNavItem({
  item,
  label,
  isActive,
}: {
  item: NavItem;
  label: string;
  isActive: boolean;
}) {
  const Icon = item.icon;

  if (item.isCTA) {
    return (
      <Link
        href={item.href}
        aria-label={label}
        className="relative flex flex-1 items-center justify-center outline-none"
      >
        <button
          className={cn(
            'relative flex h-[62px] w-[62px]',
            'items-center justify-center',
            '-translate-y-6',
            'rounded-[24px]',
            'bg-linear-to-br from-primary to-primary/80',
            'border border-white/20',
            'shadow-[0_10px_30px_rgba(var(--primary-rgb),0.4)]',
            'backdrop-blur-xl',
            // Spring Animation
            'transition-all duration-500 ease-[cubic-bezier(0.34,1.15,0.64,1)]',
            'active:scale-90 hover:scale-105 hover:-translate-y-7'
          )}
        >
          <div
            className={cn(
              'absolute inset-0 rounded-[24px]',
              'bg-primary/40 blur-xl mix-blend-screen'
            )}
          />

          <div className="relative z-10 flex flex-col items-center justify-center">
            <Icon
              className="size-6 text-white drop-shadow-md"
            />
            <span className=" text-[10px] font-bold text-white tracking-wide">
              {label}
            </span>
          </div>
        </button>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      aria-label={label}
      className={cn(
        'relative z-10 flex h-full flex-1 items-center justify-center',
        'select-none outline-none active:scale-95 transition-transform duration-300',
        "hover:scale-105 hover:-translate-y-1 group",

      )}
    >
      <div
        className={cn(
          'relative z-10 flex flex-col items-center justify-center gap-1',
          'transition-all duration-500 ease-[cubic-bezier(0.34,1.15,0.64,1)]',
          'will-change-transform',
          isActive ? '-translate-y-1.5' : 'translate-y-0'
        )}
      >
        <div className="relative flex items-center justify-center ">
          <div
            className={cn(
              'absolute inset-0 rounded-full blur-md',
              'transition-all duration-500 ease-[cubic-bezier(0.34,1.15,0.64,1)]',
              isActive ? 'scale-150 opacity-100 bg-primary/20' : 'scale-0 opacity-0'
            )}
          />

          <Icon
            className={cn(
              'relative z-10 transition-colors duration-300 group-hover:text-primary',
              'size-[22px]',
              isActive ? 'text-primary' : 'text-muted-foreground/70'
            )}
          />
        </div>

        <span
          className={cn(
            'text-[10px] font-bold tracking-wide',
            'transition-all duration-500 ease-[cubic-bezier(0.34,1.15,0.64,1)]',
            isActive
              ? 'text-primary opacity-100 scale-100'
              : 'text-muted-foreground/70 opacity-0 scale-75 absolute -bottom-4 pointer-events-none'
          )}
        >
          {label}
        </span>

        <div
          className={cn(
            'absolute bottom-[-12px]',
            'h-[4px] rounded-full bg-primary',
            'transition-all duration-500 ease-[cubic-bezier(0.34,1.15,0.64,1)]',
            isActive ? 'w-[16px] opacity-100' : 'w-0 opacity-0'
          )}
        />
      </div>
    </Link>
  );
});

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

export default function MobileBottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('store.nav');
  const { user, isAuthenticated: is_auth } = useAuth();
  const is_Admin = checkUserPermission(user ?? null, 'access_dashboard') ||
    (typeof user?.role === 'object' && user.role !== null && 'level' in user.role && Number((user.role as { level: number }).level) >= 50);

  const isRtl = locale === 'ar'; 

  const navItems = useMemo<NavItem[]>(
    () => [
      // 💡 ملاحظة: إذا كانت صفحتك الرئيسية مسارها الفعلي هو /home، قم بتغيير href إلى /home لمنع إعادة التحميل
      { key: 'home', href: '/', icon: Icons.Home },
      { key: 'store', href: '/products', icon: Icons.Store },
      { key: 'quote', href: '/request-quote', icon: Icons.MessageSquareQuote, isCTA: true },
      { key: 'dashboard-or-cart', href: `/${is_Admin ? "dashboard" : "cart"}`, icon: is_Admin ? Icons.Dashboard : Icons.ShoppingCart },
      { key: 'account-or-login', href: is_auth ? '/account' : '/login', icon: Icons.User },
    ],
    [is_Admin, is_auth]
  );

  const labels = useMemo(
    () => ({
      home: t('home'),
      store: t('products'),
      quote: 'عرض سعر',
      cart: is_Admin ? t('admin') : t('cart'),
      account: is_auth ? t('account') : t('login'),
    }),
    [t, is_Admin, is_auth]
  );

  // تحديث ذكي لتحديد الصفحة النشطة وتجاوز مشكلة الرئيسية
  const activeIndex = navItems.findIndex((item) => {
    // إذا كان الرابط هو الرئيسية، نتحقق من / أو /home 
    if (item.href === '/' || item.href === '/home') {
      return pathname === '/' || pathname === '/home';
    }
    return pathname.startsWith(item.href);
  });

  const safeActiveIndex = activeIndex !== -1 ? activeIndex : 0;
  const hideBubble = activeIndex === -1 || navItems[activeIndex]?.isCTA;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes navEntry {
          0% { transform: translateY(120px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-nav-entry {
          animation: navEntry 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}} />

      <div
        className={cn(
          'fixed inset-x-0 bottom-6 z-100',
          'flex justify-center px-4 md:hidden',
          'pointer-events-none'
        )}
      >
        <nav
          className={cn(
            'animate-nav-entry pointer-events-auto relative',
            'flex h-[76px] w-full max-w-[420px]',
            'items-center justify-between px-2',
            'bg-transparent',
            'backdrop-blur-sm bg-background/40',
            'rounded-full',
            'shadow-2xl shadow-muted-foreground/30',
            'overflow-visible'
          )}
        >
          <div
            className={cn(
              'pointer-events-none absolute inset-0 opacity-[0.03] rounded-[2.5rem]',
              '[background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27%3E%3Cg fill=%27white%27 fill-opacity=%271%27%3E%3Ccircle cx=%272%27 cy=%272%27 r=%271%27/%3E%3C/g%3E%3C/svg%3E")]'
            )}
          />

          <div
            className={cn(
              'absolute top-2 bottom-2 inset-s-1.5 z-0 pointer-events-none',
              'transition-all duration-500 ease-[cubic-bezier(0.34,1.15,0.64,1)]',
              'will-change-transform',
              hideBubble ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
            )}
            style={{
              width: '20%',
              transform: `translateX(${isRtl ? -(safeActiveIndex * 96.5) : safeActiveIndex * 96.5}%)`,
            }}
          >
            <div
              className={cn(
                'relative h-full mx-1.5 rounded-2xl',
                'bg-linear-to-b from-primary/15 to-primary/5 dark:from-primary/20 dark:to-primary/5',
                'border border-primary/20',
                'shadow-[0_4px_16px_rgba(var(--primary-rgb),0.1)]'
              )}
            />
          </div>

          <div className="relative flex h-full w-full items-center justify-around">
            {navItems.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <BottomNavItem
                  key={item.key}
                  item={item}
                  label={labels[item.key as keyof typeof labels]}
                  isActive={isActive}
                />
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}