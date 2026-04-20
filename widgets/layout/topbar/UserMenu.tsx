import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getServerUser } from '@/lib/auth';
import { Icons } from '@/shared/ui/Icons';
import LogoutButton from './LogoutButton';

const UserMenu = async ({ locale }: { locale: string }) => {
  const cookieStore = await cookies();
  const user = getServerUser(cookieStore);

  return (
    <div className="pl-2 relative group">
      <button className="flex items-center gap-2 outline-none cursor-default">
        <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-background shadow-sm">
          {user?.name?.charAt(0) || 'A'}
        </div>
      </button>

      {/* Hover Popover */}
      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/60 bg-popover p-2 shadow-lg shadow-black/5 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
        <div className="px-2 py-1.5 border-b border-border/40 mb-1">
          <p className="text-sm font-semibold">{user?.name || 'Admin User'}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@example.com'}</p>
        </div>
        <Link 
          href={`/${locale}/dashboard/profile`} 
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors text-foreground"
        >
          <Icons.Users className="h-4 w-4 text-muted-foreground" />
          Profile
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
};

export default UserMenu;
