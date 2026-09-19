import { hasUserPermission } from '../lib/role-access';
import { useAuth } from './use-auth';

export function usePermission() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: string) => {
    if (!isAuthenticated || !user?.roles) return false;
    return user.roles.includes(role);
  };

  const hasPermission = (permission: string) => {
    return isAuthenticated && hasUserPermission(user, permission);
  };

  const hasAnyPermission = (permissions: string[]) => {
    return isAuthenticated && permissions.some((p) => hasUserPermission(user, p));
  };

  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
  };
}
