'use client';

import { useMemo } from 'react';
import { Home, Package, ShoppingCart, User, LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import { useCartStore } from '@/store/cart-store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  key: string;
  href: string;
  icon: typeof Home;
  badge?: number;
}

// ─── Cart Badge ───────────────────────────────────────────────────────────────

function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  const display = count > 99 ? '99+' : String(count);

  return (
    <span
      className="
        absolute -top-1.5 -end-2.5
        min-w-[18px] h-[18px] px-1
        flex items-center justify-center
        text-[10px] font-bold leading-none
        text-white bg-red-500
        rounded-full
        ring-2 ring-background
        animate-badge-pop
        pointer-events-none
        select-none
      "
      aria-label={`${count} items in cart`}
    >
      {display}
    </span>
  );
}

// ─── Nav Item Button ──────────────────────────────────────────────────────────

function NavItemButton({
  item,
  isActive,
  label,
}: {
  item: NavItem;
  isActive: boolean;
  label: string;
}) {
  return (
    <Link
      href={item.href}
      className={`
        relative flex flex-col items-center justify-center
        gap-0.5 flex-1
        min-h-[56px] pt-1.5 pb-1
        transition-all duration-200 ease-out
        outline-none
        group
        select-none
        ${isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active indicator pill */}
      <span
        className={`
          absolute top-0 inset-x-auto
          h-[3px] rounded-full
          bg-primary
          transition-all duration-300 ease-out
          ${isActive ? 'w-8 opacity-100' : 'w-0 opacity-0'}
        `}
      />

      {/* Icon container */}
      <span
        className={`
          relative flex items-center justify-center
          w-6 h-6
          transition-transform duration-200 ease-out
          ${isActive
            ? 'scale-110'
            : 'scale-100 group-hover:scale-105 group-active:scale-95'
          }
        `}
      >
        <item.icon
          size={22}
          strokeWidth={isActive ? 2.5 : 1.8}
          className="transition-all duration-200"
        />
        {item.badge !== undefined && <CartBadge count={item.badge} />}
      </span>

      {/* Label */}
      <span
        className={`
          text-[10px] leading-tight tracking-wide
          transition-all duration-200
          ${isActive ? 'font-bold opacity-100' : 'font-medium opacity-70'}
        `}
      >
        {label}
      </span>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MobileBottomNav() {
  const t = useTranslations('store.nav');
  const pathname = usePathname();
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

  const navItems: NavItem[] = useMemo(
    () => [
      { key: 'home', href: '/home', icon: Home },
      { key: 'categories', href: '/products', icon: LayoutGrid },
      { key: 'cart', href: '/cart', icon: ShoppingCart, badge: cartItemCount },
      { key: 'orders', href: '/orders', icon: Package },
      { key: 'account', href: '/account', icon: User },
    ],
    [cartItemCount]
  );

  // Translation map for nav keys
  const labelMap: Record<string, string> = useMemo(
    () => ({
      home: t('home'),
      categories: t('products'),
      cart: t.has('cart') ? t('cart') : 'Cart',
      orders: t('orders'),
      account: t.has('account') ? t('account') : t('profile'),
    }),
    [t]
  );

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile navigation"
      className="
        mobile-bottom-nav
        fixed bottom-0 inset-x-0 z-50
        md:hidden
        bg-background/80 backdrop-blur-xl backdrop-saturate-150
        border-t border-border/50
        shadow-[0_-1px_12px_rgba(0,0,0,0.06)]
        dark:shadow-[0_-1px_12px_rgba(0,0,0,0.25)]
      "
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          // Match active state: exact for home, startsWith for others
          const isActive =
            item.href === '/home'
              ? pathname === '/home' || pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <NavItemButton
              key={item.key}
              item={item}
              isActive={isActive}
              label={labelMap[item.key] ?? item.key}
            />
          );
        })}
      </div>
    </nav>
  );
}
