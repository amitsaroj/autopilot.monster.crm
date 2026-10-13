import { describe, expect, it } from 'vitest';
import { roleHome, canAccessRoleRoute, hasUserPermission } from './role-access';

describe('role navigation and permissions', () => {
  it.each([
    ['SUPER_ADMIN', '/superadmin'],
    ['TENANT_ADMIN', '/admin'],
    ['ADMIN', '/sub-admin'],
    ['USER', '/dashboard'],
    ['AGENT', '/dashboard'],
  ])('routes %s to %s', (role, home) => {
    expect(roleHome([role])).toBe(home);
    expect(canAccessRoleRoute(home, [role])).toBe(true);
  });
  it.each(['USER', 'AGENT', 'ADMIN'])('denies %s tenant and platform administration', (role) => {
    expect(canAccessRoleRoute('/admin/users', [role])).toBe(false);
    expect(canAccessRoleRoute('/superadmin', [role])).toBe(false);
  });
  it('requires the explicit delegated admin role', () => {
    expect(canAccessRoleRoute('/sub-admin', ['TENANT_ADMIN'])).toBe(false);
    expect(canAccessRoleRoute('/sub-admin', ['SUPER_ADMIN'])).toBe(false);
  });
  it('matches backend manage, view, and super-admin permission rules', () => {
    expect(hasUserPermission({ roles: ['SUPER_ADMIN'] }, 'contacts:delete')).toBe(true);
    expect(hasUserPermission({ permissions: ['contacts:manage'] }, 'contacts:delete')).toBe(true);
    expect(hasUserPermission({ permissions: ['contacts:view'] }, 'contacts:read')).toBe(true);
    expect(hasUserPermission({ permissions: ['contacts:view'] }, 'contacts:delete')).toBe(false);
  });
});
