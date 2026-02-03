'use client';

import { useUIStore } from '@/store/ui-store';
import { Icons } from '@/components/ui/Icons';

export default function SidebarToggle() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <button
      onClick={toggleSidebar}
      className="w-10 h-10 hidden md:flex rounded-xl flex items-center justify-center bg-muted/40 border border-border/50 hover:bg-accent hover:text-primary transition-all duration-300 shadow-sm group active:scale-95"
      aria-label="Toggle Sidebar"
    >
      {sidebarCollapsed ? (
        <Icons.PanelLeftOpen className="h-5 w-5 animate-in fade-in zoom-in duration-300" />
      ) : (
        <Icons.PanelLeftClose className="h-5 w-5 animate-in fade-in zoom-in duration-300" />
      )}
    </button>
  );
}
