import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerUserFromToken, checkUserPermission } from '@/lib/auth';
import { User } from '@/types';
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

  // Server-side check using JWT from HttpOnly cookie
  const token = cookieStore.get('access_token')?.value;
  console.log("token in layout", token);
  const user = token ? getServerUserFromToken(token) : null;
  console.log("user in layout", user);
  if (!token || !user) {
    redirect(`/${locale}/login`);
  }
  // Permission-based check
  // Note: JWT payload has user.level which checkUserPermission uses.
  const isAllowed = checkUserPermission(user as unknown as User, 'access_dashboard');
  console.log("isAllowed in layout", isAllowed);


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
