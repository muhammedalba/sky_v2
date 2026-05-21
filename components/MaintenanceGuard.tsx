'use client';

import { usePathname } from 'next/navigation';
import Maintenance from '@/components/Maintenance';
import { ReactNode } from 'react';

interface MaintenanceGuardProps {
  isMaintenance: boolean;
  canBypassMaintenance: boolean;
  locale: string;
  children: ReactNode;
}

export default function MaintenanceGuard({
  isMaintenance,
  canBypassMaintenance,
  locale,
  children,
}: MaintenanceGuardProps) {
  const pathname = usePathname();

  // Check if current URL is a login or register page to skip maintenance mode
  const isMaintenancePage = [

    `/${locale}/auth/login`,
    `/${locale}/auth/forgot-password`,
  ].includes(pathname);

  // If maintenance is active, user cannot bypass, and it's not a login page, show Maintenance screen
  if (isMaintenance && !canBypassMaintenance && !isMaintenancePage) {
    return <Maintenance />;
  }

  return <>{children}</>;
}
