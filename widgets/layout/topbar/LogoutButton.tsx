'use client';

import { logout } from '@/lib/auth';
import { Icons } from '@/shared/ui/Icons';
import { useTranslations } from 'next-intl';

export default function LogoutButton() {
  const t = useTranslations('navigation');

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
    >
      <Icons.Menu className="h-4 w-4" /> 
      {t('logout')}
    </button>
  );
}
