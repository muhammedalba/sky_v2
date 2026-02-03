import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerUser, getAuthToken } from '@/lib/auth';
import DashboardLayout from '@/components/layout/DashboardLayout';

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

  const isAdmin = user.role === 'admin' || user.role === 'manager';
  if (!isAdmin) {
    redirect(`/${locale}/home`);
  }

  return (
    <DashboardLayout locale={locale}>
      {children}
    </DashboardLayout>
  );
}
