import { ForbiddenException } from '@nestjs/common';

const RESERVED_ROLES = ['SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN', 'USER', 'AGENT'];

/** Permission resources that grant platform (cross-tenant) power. */
export const PLATFORM_PERMISSION_RESOURCES = ['admin', 'platform'];

/** Roles only a platform SUPER_ADMIN may hand out. */
const PLATFORM_ROLES = ['SUPER_ADMIN'];
/** Tenant-administrator roles; may be granted by SUPER_ADMIN or TENANT_ADMIN only. */
const TENANT_ADMIN_ROLES = ['TENANT_ADMIN', 'ADMIN'];

const isSuperAdmin = (actorRoles: readonly string[]): boolean =>
  actorRoles.includes('SUPER_ADMIN');

/** Rejects platform-level permissions on a role unless the actor is SUPER_ADMIN. */
export function assertGrantablePermissions(
  permissions: readonly { resource: string; name?: string }[],
  actorRoles: readonly string[],
): void {
  if (isSuperAdmin(actorRoles)) return;
  const platform = permissions.find((p) => PLATFORM_PERMISSION_RESOURCES.includes(p.resource));
  if (platform) {
    throw new ForbiddenException(
      `Platform permission "${platform.name ?? platform.resource}" cannot be granted by tenant administrators`,
    );
  }
}

/** Rejects assigning/revoking platform or tenant-admin roles by insufficiently privileged actors. */
export function assertAssignableRole(
  role: { name: string; permissions?: readonly { resource: string; name?: string }[] },
  actorRoles: readonly string[],
): void {
  const forbidden = () =>
    new ForbiddenException(
      'Platform roles cannot be assigned or revoked through tenant role management',
    );
  if (PLATFORM_ROLES.includes(role.name)) throw forbidden();
  if (isSuperAdmin(actorRoles)) return;
  if (TENANT_ADMIN_ROLES.includes(role.name) && !actorRoles.includes('TENANT_ADMIN')) {
    throw forbidden();
  }
  assertGrantablePermissions(role.permissions ?? [], actorRoles);
}

export function assertCustomRoleName(name: string): void {
  if (RESERVED_ROLES.includes(name.trim().toUpperCase())) {
    throw new ForbiddenException('Built-in role names are reserved');
  }
}

export function assertMutableRole(role: { name: string; isSystem?: boolean }): void {
  if (role.isSystem || RESERVED_ROLES.includes(role.name)) {
    throw new ForbiddenException('Built-in roles cannot be changed through tenant role management');
  }
}
