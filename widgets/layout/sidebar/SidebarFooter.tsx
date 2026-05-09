'use client';
import { useUIStore } from '@/store/ui-store';
import UserAccountMenu from '../UserAccountMenu';
import { useLocale } from 'next-intl';

export default function SidebarFooter() {
  const { sidebarCollapsed } = useUIStore();
  const isCollapsed = sidebarCollapsed;
  const locale = useLocale();

  return (
    <div className=" border-t border-border/40 mt-auto bg-accent/5">
      {!isCollapsed ? (   <UserAccountMenu locale={locale} />
      ) : (
        <UserAccountMenu iconOnly={true} locale={locale} />
      )}
    </div>
  );
}

