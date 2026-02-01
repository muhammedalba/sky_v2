'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/ui/Icons';
import { getUser } from '@/lib/auth';

interface SidebarProps {
  mode?: 'desktop' | 'mobile';
  className?: string;
  onNavigate?: () => void;
}

export default function Sidebar({ mode = 'desktop', className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { locale } = useParams();
  const t = useTranslations('navigation');
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Sky Galaxy';
  const user = getUser();

  const isMobile = mode === 'mobile';
  // Mobile is never collapsed in the desktop sense (it's a drawer)
  const isCollapsed = !isMobile && sidebarCollapsed;

  const navigation = [
    { name: t('dashboard'), href: `/${locale}/dashboard`, icon: Icons.Dashboard },
    { name: t('products'), href: `/${locale}/dashboard/products`, icon: Icons.Products },
    { name: t('categories'), href: `/${locale}/dashboard/categories`, icon: Icons.Categories },
    { name: 'Sub Categories', href: `/${locale}/dashboard/sub-categories`, icon: Icons.Menu }, // Fallback icon
    { name: 'Brands', href: `/${locale}/dashboard/brands`, icon: Icons.Menu },
    { name: 'Suppliers', href: `/${locale}/dashboard/suppliers`, icon: Icons.Users },
    { name: 'Coupons', href: `/${locale}/dashboard/coupons`, icon: Icons.Menu },
    { name: 'Carousel', href: `/${locale}/dashboard/carousel`, icon: Icons.Menu },
    { name: 'Promo Banners', href: `/${locale}/dashboard/promo-banners`, icon: Icons.Menu },
    { name: t('orders'), href: `/${locale}/dashboard/orders`, icon: Icons.Orders },
    { name: t('users'), href: `/${locale}/dashboard/users`, icon: Icons.Users },
    { name: t('profile'), href: `/${locale}/dashboard/profile`, icon: Icons.Users },
    { name: t('settings'), href: `/${locale}/dashboard/settings`, icon: Icons.Settings },
  ];

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-background transition-all duration-300 ease-in-out',
        !isMobile && 'border-r border-border/60 fixed top-0 start-0 z-40 h-screen',
        !isMobile && (isCollapsed ? 'w-20' : 'w-64'),
        isMobile && 'w-full',
        className
      )}
    >
      {/* Header / Logo */}
      <div className={cn("h-16 flex items-center border-b border-border/40", isCollapsed ? "justify-center px-0" : "px-6")}>
        <Link 
          href={`/${locale}/dashboard`} 
          className="flex items-center gap-2 group overflow-hidden"
          onClick={onNavigate}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm group-hover:bg-primary/90 transition-colors">
             S
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">
              {appName}
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${locale}/dashboard` && pathname.startsWith(item.href));
          return (
            <SidebarItem
              key={item.href}
              item={item}
              isActive={isActive}
              isCollapsed={isCollapsed}
              onClick={onNavigate}
            />
          );
        })}
      </nav>

      {/* Footer / Toggle & User */}
      <div className="p-3 border-t border-border/40 mt-auto">
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className={cn(
               "flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
               !isCollapsed && "justify-end px-3"
            )}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
             <Icons.Menu className={cn("h-4 w-4 transition-transform", isCollapsed ? "rotate-0" : "rotate-180")} />
          </button>
        )}

        {!isCollapsed && !isMobile && (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/30 p-3">
             <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0) || 'U'}
             </div>
             <div className="flex flex-col min-w-0">
               <span className="text-xs font-semibold truncate text-foreground">{user?.name || 'User'}</span>
               <span className="text-[10px] text-muted-foreground truncate">{user?.role || 'Admin'}</span>
             </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarItem({ item, isActive, isCollapsed, onClick }: any) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={isCollapsed ? item.name : undefined}
      className={cn(
        'group flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
        isActive
          ? 'bg-primary/10 text-primary font-medium shadow-none'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        isCollapsed ? 'justify-center' : ''
      )}
    >
      <Icon className={cn(
        "h-5 w-5 shrink-0 transition-colors",
        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      )} />
      
      {!isCollapsed && (
        <span className="text-sm truncate">
          {item.name}
        </span>
      )}
    </Link>
  );
}
