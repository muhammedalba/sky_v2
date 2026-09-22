import Maintenance from '@/components/Maintenance';
import { ReactNode } from 'react';

interface MaintenanceGuardProps {
  isMaintenance: boolean;
  canBypassMaintenance: boolean;
  children: ReactNode;
}

export default function MaintenanceGuard({
  isMaintenance,
  canBypassMaintenance,
  children,
}: MaintenanceGuardProps) {
  if (isMaintenance && !canBypassMaintenance) {
    return <Maintenance />;
  }

  return <>{children}</>;
}
