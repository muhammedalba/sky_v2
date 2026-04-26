import type { Metadata } from 'next';
import DashboardContent from '@/shared/ui/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard | SkyGalaxy Admin',
  description: 'Manage your store and view detailed statistics.',
};

export default function DashboardPage() {
  return (
    <DashboardContent />
  );
}

