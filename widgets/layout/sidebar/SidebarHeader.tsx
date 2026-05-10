'use client';

import Link from 'next/link';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useLocale } from 'next-intl';

export default function SidebarHeader({ Collapsed = false, onNavigate, }: { Collapsed?: boolean; onNavigate?: () => void }) {
  const locale = useLocale();
  const settings = useSettings();
  const { sidebarCollapsed } = useUIStore();
  const isCollapsed = sidebarCollapsed && Collapsed;

/** 
 * SidebarHeader Component
 * Unified header for admin and store sidebars
 */
  const siteName = settings.siteName?.en || env.APP_NAME;
  return (
    <div className={cn("h-20 flex w-full items-center transition-all duration-500", isCollapsed ? "justify-center px-0" : "px-3")}>
      <Link
        href={`/${locale}/`}
        className="flex items-center gap-2 group  "
        onClick={onNavigate}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center  group-hover:scale-110 transition-transform duration-500">
          <ImageWithFallback
            src={settings.logo || "/assets/images/auth-logo.png"}
            alt={`${siteName} Logo`}
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col ">
            <span className="font-black text-lg tracking-tight whitespace-nowrap title-gradient">
              {siteName}
            </span>
            <span className="text-[10px] relative font-bold text-info uppercase tracking-[0.2em] leading-none mt-1 ">
              E-commerce
              <div className="absolute -inset-e-1  top-1/4 w-1.5 h-1.5 rounded-full bg-success" />
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
