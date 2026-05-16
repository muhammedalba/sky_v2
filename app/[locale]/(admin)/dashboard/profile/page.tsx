'use client';

import { useMe } from '@/features/auth/hooks/useAuth';
import ProfileForm from '@/features/users/components/dashboard/ProfileForm';
import { Skeleton } from '@/shared/ui/Skeleton';
import ErrorMessage from '@/shared/ui/ErrorMessage';

export default function ProfilePage() {

  const { data: user, isLoading, error, isSuccess } = useMe();

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


  if (isSuccess && !user) {
    return <ErrorMessage message="User not found" />;
  }

  return (

    user && <ProfileForm user={user} />
  );
}
