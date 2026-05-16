import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerUser, getAuthToken, checkUserPermission } from '@/lib/auth';
import DashboardLayout from '@/widgets/layout/DashboardLayout';

import { AsyncBoundary } from '@/shared/ui/boundaries/AsyncBoundary';

export default async function DashboardLayoutWrapper({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  
  // Server-side check
  const user = getServerUser(cookieStore);
  const token = cookieStore.get('auth_token')?.value;

  if (!token || !user) {
    redirect(`/${locale}/login`);
  }

  // Permission-based check
  const isAllowed = checkUserPermission(user, 'access_dashboard');

  if (!isAllowed) {
    redirect(`/${locale}/home`);
  }

  return (
    <DashboardLayout locale={locale}>
      <AsyncBoundary>
        {children}
      </AsyncBoundary>
    </DashboardLayout>
  );
}
