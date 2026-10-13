import { ForbiddenException } from '@nestjs/common';

const RESERVED_ROLES = ['SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN', 'USER', 'AGENT'];

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
