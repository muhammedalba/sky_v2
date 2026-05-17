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
