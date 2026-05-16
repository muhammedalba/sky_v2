'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { hasPermission, getUser } from '@/lib/auth';

interface CanProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions.
 * Supports SuperAdmin level-100 bypass and legacy role string compatibility.
 * 
 * @example
 * <Can permission="manage_users">
 *   <button>Delete User</button>
 * </Can>
 */
export const Can: React.FC<CanProps> = ({ permission, children, fallback = null }) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    // We check in useEffect to avoid hydration mismatch if localStorage/Cookies 
    // differ between server and client during first render
    setIsAllowed(hasPermission(permission));
    
    // Listen for auth changes to re-evaluate
    const handleAuthChange = () => {
      setIsAllowed(hasPermission(permission));
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [permission]);

  if (isAllowed === null) return null; // Or a loader if needed

  return isAllowed ? <>{children}</> : <>{fallback}</>;
};

export default Can;
