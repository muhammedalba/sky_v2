'use client';

import Link from 'next/link';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';

export default function SidebarHeader({ locale, Collapsed, onNavigate, }: { locale: string; Collapsed: boolean; onNavigate?: () => void }) {
  const { sidebarCollapsed } = useUIStore();
  const appName = env.APP_NAME;
  const isCollapsed = Collapsed ? !Collapsed : sidebarCollapsed;

  return (
    <div className={cn("h-20 flex items-center transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-8")}>
      <Link
        href={`/${locale}/`}
        className="flex items-center gap-3 group "
        onClick={onNavigate}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-black shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
          <ImageWithFallback
            src="/images/auth-logo.png"
            alt={`${appName} Logo`}
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight whitespace-nowrap bg-clip-text text-transparent animate-gradient bg-linear-to-br from-info via-foreground/30 to-primary">
              {appName}
            </span>
            <span className="text-[10px] font-bold text-info uppercase tracking-[0.2em] leading-none mt-1 relative">
              E-commerce 
              <div className="absolute -inset-e-2  top-1/4 w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
