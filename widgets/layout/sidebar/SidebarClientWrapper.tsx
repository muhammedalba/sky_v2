'use client';

import React, { ReactNode } from 'react';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

interface SidebarClientWrapperProps {
  children: ReactNode;
  mode?: 'desktop' | 'mobile';
  className?: string;
}

export default function SidebarClientWrapper({
  children,
  mode = 'desktop',
  className,
}: SidebarClientWrapperProps) {
  const { sidebarCollapsed } = useUIStore();
  const isMobile = mode === 'mobile';
  const isCollapsed = !isMobile && sidebarCollapsed;

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-background transition-all duration-300 ease-in-out  ',
        !isMobile && 'border-e border-border/60 fixed top-0 inset-s-0 z-40 h-screen',
        !isMobile && (isCollapsed ? 'w-20' : 'w-64'),
        isMobile && 'w-full',
        className
      )}
    > 
      {children}
    </aside>
  );
}
