'use client';

import { checkUserPermission } from '@/lib/auth';
import { useMe } from '@/features/auth/hooks/useAuth';
import React, { ReactNode } from 'react';

interface CanProps {
  permission: string | string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Returns a permission checker bound to the current user.
 * Use it when permissions are combined with other conditions or checked many times (e.g. per table row).
 *
 * @example
 * const can = useCan();
 * {can(Permissions.UPLOAD_BACKUP) && b.source === "uploaded" && <button>Delete</button>}
 */
export function useCan() {
  const { data: user } = useMe();
  return (permission: string | string[], requireAll = true) =>
    checkUserPermission(user || null, permission, requireAll);
}

/**
 * A component that conditionally renders its children based on user permissions.
 * Supports SuperAdmin level-100 bypass, legacy role string compatibility, and multiple permissions.
 * 
 * @example
 * <Can permission={["manage_users", "manage_roles"]} requireAll={true}>
 *   <button>Manage Access</button>
 * </Can>
 */
export const Can: React.FC<CanProps> = ({ permission, requireAll = true, children, fallback = null }) => {
  const { data: user, isLoading } = useMe();

  if (isLoading) return null; // Or a loader if needed

  const isAllowed = checkUserPermission(user || null, permission, requireAll);

  return isAllowed ? <>{children}</> : <>{fallback}</>;
};

export default Can;
