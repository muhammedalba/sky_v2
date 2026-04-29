'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * Interface for navigation items in the sidebar.
 */
interface SidebarNavProps {
  /** List of navigation items to be displayed */
  navigation: {
    /** Name of the link displayed in the sidebar */
    name: string;
    /** URL path the link leads to */
    href: string;
    /** The icon associated with the link (Lucide icon key) */
    icon: keyof typeof Icons;
    /** Optional color indicator for the icon */
    color?: string;
  }[];
  /** Callback triggered when a navigation item is clicked (used on mobile to close the menu) */
  onNavigate?: () => void;
}

/**
 * SidebarNav Component
 * Renders the main navigation menu for the dashboard sidebar.
 * Handles active route detection and responsive layouts (collapsed/expanded).
 */

export default function SidebarNav({ navigation, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useUIStore();
  const isCollapsed = sidebarCollapsed;

  /**
   * Memoized logic to determine the active navigation link based on the current URL.
   * Ensures that the most specific route is highlighted (e.g., highlights 'Products' even when on 'Product Edit').
   */
  const activeHref = useMemo(() => {
    // Find all links that match the current pathname or are a parent of it
    const matches = navigation.filter(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/')
    );

    if (matches.length === 0) return '';

    // Choose the longest matching href as it represents the most specific route
    // e.g. between /dashboard and /dashboard/products, choose the longer one for precision.
    return matches.reduce((prev, current) =>
      prev.href.length > current.href.length ? prev : current
    ).href;
  }, [pathname, navigation]);



  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
      {navigation.map((item) => {
        const Icon = Icons[item.icon];

        // Highlight the item if it matches the current active calculated href
        const active = activeHref === item.href;

        const itemColorClass = `text-${item.color ?? 'success'} `;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={isCollapsed ? item.name : undefined}
            className={cn(
              'group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative border border-transparent',
              active
                ? 'bg-primary text-white shadow-lg shadow-primary/25 font-bold border'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              isCollapsed ? 'justify-center mx-1 px-0' : 'mx-2'
            )}
          >
            <div className={cn(
              "flex items-center justify-center transition-all duration-300",
              active ? "text-white" : itemColorClass
            )}>
              <Icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 " />
            </div>

            {!isCollapsed && (
              <span className="text-sm tracking-wide">
                {item.name}
              </span>
            )}

            {/* Active state indicator dot - using logical inset property for RTL/LTR compatibility */}
            {active && !isCollapsed && (
              <div className="absolute inset-e-3 w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            )}

            {!active && !isCollapsed && (
              <div className={cn(
                "absolute inset-e-3 w-1 h-1 rounded-full opacity-0 group-hover:opacity-40 transition-opacity",
                itemColorClass.replace('text', 'bg')
              )} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}