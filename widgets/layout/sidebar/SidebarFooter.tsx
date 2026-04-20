'use client';

import React from 'react';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { User } from '@/types';

export default function SidebarFooter({ user }: { user: User | null }) {
  const { sidebarCollapsed } = useUIStore();
  const isCollapsed = sidebarCollapsed;

  return (
    <div className="p-4 border-t border-border/40 mt-auto bg-accent/5">
      {!isCollapsed ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/50 p-3 shadow-sm hover:border-primary/30 transition-colors group">
           <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-indigo-600 p-[2px] shadow-lg shadow-primary/20">
              <div className="h-full w-full rounded-[10px] bg-background flex items-center justify-center text-primary text-sm font-black">
                {user?.name?.charAt(0) || 'U'}
              </div>
           </div>
           <div className="flex flex-col min-w-0">
             <span className="text-sm font-bold truncate text-foreground leading-tight">{user?.name || 'User'}</span>
             <span className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-wider">{user?.role || 'Administrator'}</span>
           </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-primary/20 hover:scale-110 transition-transform cursor-pointer">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      )}
    </div>
  );
}
