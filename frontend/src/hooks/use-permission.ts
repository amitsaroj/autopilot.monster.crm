import { useAuth } from './use-auth';

export function usePermission() {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: string) => {
    if (!isAuthenticated || !user?.roles) return false;
    return user.roles.includes(role);
  };

  const hasPermission = (permission: string) => {
    if (!isAuthenticated || !user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]) => {
    if (!isAuthenticated || !user?.permissions) return false;
    return permissions.some((p) => user.permissions.includes(p));
  };

  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
  };
}
