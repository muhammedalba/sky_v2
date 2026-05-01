'use client';

import { ReactNode, useState } from 'react';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet/Sheet';
import { Icons } from '@/shared/ui/Icons';

interface DashboardClientLayoutProps {
  sidebar: ReactNode;
  mobileSidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
  isRTL: boolean;
}

export default function DashboardClientLayout({
  sidebar,
  mobileSidebar,
  topbar,
  children,
  isRTL,
}: DashboardClientLayoutProps) {
  const { sidebarCollapsed } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          {sidebar}
        </div>

        {/* Mobile Sidebar (Sheet) */}
        <SheetContent side={isRTL ? "right" : "left"} className="p-0 border-none w-72">
          {/* Note: In a real app, you might want to wrap mobileSidebar to handle onNavigate */}
          <div onClick={() => setMobileOpen(false)}>
            {mobileSidebar}
          </div>
        </SheetContent>

        <div
          className={cn(
            'transition-all duration-500',
            sidebarCollapsed ? 'md:ms-20' : 'md:ms-64',
            'ms-0'
          )}
        >
          {/* Topbar Wrapper with Mobile Trigger */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border ps-4 md:ps-0">
            <div className="flex items-center">
              <SheetTrigger className="md:hidden p-2 me-2 text-muted-foreground hover:bg-secondary rounded-lg">
                <Icons.Menu className="w-6 h-6" />
              </SheetTrigger>
              <div className="flex-1">
                 {topbar}
              </div>
            </div>
          </div>

          <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {children}
          </main>
        </div>
      </div>
    </Sheet> 
  );
}
