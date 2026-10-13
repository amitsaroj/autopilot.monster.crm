/** UI navigation only; API guards enforce authorization. */
export function roleHome(roles: string[] = []): string {
  if (roles.includes('SUPER_ADMIN')) return '/superadmin';
  if (roles.includes('TENANT_ADMIN')) return '/admin';
  if (roles.includes('ADMIN')) return '/sub-admin';
  return '/dashboard';
}

export function canAccessRoleRoute(path: string, roles: string[]): boolean {
  const within = (root: string) => path === root || path.startsWith(`${root}/`);
  if (within('/superadmin')) return roles.includes('SUPER_ADMIN');
  if (within('/sub-admin')) return roles.includes('ADMIN');
  if (within('/admin')) return roles.some((role) => ['SUPER_ADMIN', 'TENANT_ADMIN'].includes(role));
  return true;
}

export function hasUserPermission(
  user: { roles?: string[]; permissions?: string[] } | null,
  permission: string,
): boolean {
  if (user?.roles?.includes('SUPER_ADMIN')) return true;
  const permissions = user?.permissions ?? [];
  const [resource, action] = permission.split(':');
  return (
    permissions.includes(permission) ||
    permissions.includes(`${resource}:manage`) ||
    (action === 'read' && permissions.includes(`${resource}:view`))
  );
}
