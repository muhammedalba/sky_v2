'use client';
import { useUIStore } from '@/store/ui-store';
import UserAccountMenu from '../UserAccountMenu';

export default function SidebarFooter() {
  const { sidebarCollapsed } = useUIStore();
  const isCollapsed = sidebarCollapsed;

  return (
    <div className=" border-t border-border/40 mt-auto bg-accent/5">
      {!isCollapsed ? (   <UserAccountMenu />
      ) : (
        <UserAccountMenu iconOnly={true} />
      )}
    </div>
  );
}

