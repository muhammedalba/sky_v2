'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, isAdmin } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        const locale = pathname.split('/')[1];
        router.push(`/${locale}/login`);
      } else if (!isAdmin()) {
        // If user is authenticated but not an admin/manager, redirect to home
        const locale = pathname.split('/')[1];
        router.push(`/${locale}/home`);
      } else {
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
