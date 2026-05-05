import type { Metadata } from 'next';
import ExternalPlatformsCenter from '@/features/dashboard/components/ExternalPlatformsCenter';
import { env } from '@/lib/env';

export const metadata: Metadata = {
  title: `External Platforms | ${env.APP_NAME} - Admin`,
  description: 'Quick access to external tools and platforms required to manage your business.',
};

export default function ExternalPlatformsPage() {
  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <ExternalPlatformsCenter />
    </div>
  );
}
