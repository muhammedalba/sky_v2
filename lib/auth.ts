import { User, Role } from '@/types';

// Server-side safe helpers
export const checkUserPermission = (user: User | null, permission: string | string[], requireAll: boolean = true): boolean => {
  if (!user || !user.role) return false;


  // SuperAdmins (level 100) always have all permissions
  if (typeof user.role === 'object' && user.role !== null && 'level' in user.role && Number(user.role.level) === 100) {
    return true;
  }
  // Check permissions array if role is an object
  if (typeof user.role === 'object' && user.role !== null && 'permissions' in user.role && Array.isArray(user.role.permissions)) {
    const userPerms = user.role.permissions;
    if (Array.isArray(permission)) {
      return requireAll
        ? permission.every((p) => userPerms.includes(p))
        : permission.some((p) => userPerms.includes(p));
    }


    return userPerms.includes(permission);

  }

  return false;
};

// Server-side safe helpers
export const getServerUserFromToken = (token: string): Partial<User> | null => {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonPayload);

    return {
      _id: payload.user_id,
      name: payload.name || '',
      email: payload.email,
      role: {
        _id: payload.role, // assuming role is string id in jwt
        name: payload.role,
        level: payload.level,
        description: '',
        permissions: payload.permissions || [],
        isSystemDefined: false
      } as unknown as Role
    };
  } catch {
    return null;
  }
};
