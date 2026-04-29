'use client';

import { logout } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Icons } from '@/shared/ui/Icons';
import { useTranslations } from 'next-intl';

export default function LogoutButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const t = useTranslations('navigation');

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className={cn("group flex  items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200", !iconOnly ? "w-full" : "")}
    >
      <div className="flex items-center justify-center transition-transform duration-200 group-hover:-translate-x-1 rtl:group-hover:translate-x-1">
        <Icons.Logout className="h-5 w-5 cursor-pointer" />
      </div>

      {!iconOnly && t('logout')}
    </button>
  );
}
