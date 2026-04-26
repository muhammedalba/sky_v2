'use client';

import React from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';

export default function SidebarHeader({ locale, onNavigate }: { locale: string; onNavigate?: () => void }) {
  const { sidebarCollapsed } = useUIStore();
  const appName = env.APP_NAME;
  const isCollapsed = sidebarCollapsed;

  return (
    <div className={cn("h-20 flex items-center transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-8")}>
      <Link 
        href={`/${locale}/dashboard`} 
        className="flex items-center gap-3 group overflow-hidden"
        onClick={onNavigate}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-info text-white font-black shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
           S
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
              {appName}
            </span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none mt-1">Admin Panel</span>
          </div>
        )}
      </Link>
    </div>
  );
}
