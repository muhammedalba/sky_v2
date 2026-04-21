'use client';

import { useMe } from '@/hooks/api/useAuth';
import ProfileForm from '@/features/users/components/dashboard/ProfileForm';
import { Skeleton } from '@/shared/ui/Skeleton';
import ErrorMessage from '@/shared/ui/ErrorMessage';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { data, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <Skeleton className="h-[400px] w-full rounded-xl" />
             <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
          <div className="space-y-8">
             <Skeleton className="h-[350px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load profile data" />;
  }

  const user = data;

  if (!user) {
    return <ErrorMessage message="User not found" />;
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
