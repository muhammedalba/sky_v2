
import type { Metadata } from 'next';
import DashboardContent from '@/components/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard | SkyGalaxy Admin',
  description: 'Manage your store and view detailed statistics.',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
