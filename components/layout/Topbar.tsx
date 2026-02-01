'use client';

import { useUIStore } from '@/store/ui-store';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { logout, getUser } from '@/lib/auth';
import { Icons } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function Topbar() {
  const { theme, setTheme, setLocale } = useUIStore();
  const { locale } = useParams();
  const t = useTranslations('navigation');
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const switchLocale = (newLocale: 'en' | 'ar') => {
    setLocale(newLocale);
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const handleLogout = () => {
    logout();
  };

  const breadcrumbs = pathname
    .split('/')
    .filter((s) => s && s !== locale && s !== 'dashboard')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border/60 supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 gap-4">
        
        {/* Breadcrumbs */}
        <div className="flex-1 flex items-center gap-2 overflow-hidden mr-4">
          <span className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0">
            Dashboard
          </span>
          {breadcrumbs.length > 0 && (
            <>
              <span className="text-muted-foreground/40">/</span>
              <div className="flex items-center gap-1 overflow-hidden">
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-1 whitespace-nowrap">
                    <span 
                      className={cn(
                        "text-sm font-medium transition-colors",
                        i === breadcrumbs.length - 1 
                          ? "text-foreground font-semibold" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {crumb}
                    </span>
                    {i < breadcrumbs.length - 1 && <span className="text-muted-foreground/40">/</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Center Search - Mobile Hidden */}
        <div className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <Icons.Menu className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full h-9 rounded-lg bg-muted/50 pl-9 pr-4 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all border-none outline-none placeholder:text-muted-foreground/70"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border/50">⌘K</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          
          {/* Locale Switcher (Mini) */}
          <div className="flex items-center bg-muted/40 rounded-lg p-1 border border-border/40">
            {(['en', 'ar'] as const).map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] uppercase font-bold transition-all",
                  locale === l ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border/60" />

          {/* Theme & Notifications */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Icons.Moon className="h-4 w-4" />
            ) : (
              <Icons.Sun className="h-4 w-4" />
            )}
          </button>

          <button className="relative p-2 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground">
            <Icons.Menu className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-background" />
          </button>

          {/* Profile Dropdown */}
          <div className="pl-2 relative group">
            <button className="flex items-center gap-2 outline-none">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-background shadow-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </button>

            {/* Hover Popover */}
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/60 bg-popover p-2 shadow-lg shadow-black/5 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
              <div className="px-2 py-1.5 border-b border-border/40 mb-1">
                <p className="text-sm font-semibold">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@example.com'}</p>
              </div>
              <Link href={`/${locale}/dashboard/profile`} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors">
                <Icons.Users className="h-4 w-4 text-muted-foreground" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <Icons.Menu className="h-4 w-4" /> 
                {t('logout')}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
}
