'use client';

import { useParams } from 'next/navigation';
import UserForm from '@/features/users/components/dashboard/UserForm';
import { useUser } from '@/features/users/hooks/useUsers';

export default function EditUserPage() {
  const { id } = useParams() as { id: string };
  const { data: user, isLoading } = useUser(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return <UserForm mode="edit" editingUser={user} />;
}
