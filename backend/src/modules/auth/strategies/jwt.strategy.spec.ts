import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

describe('JWT authorization freshness', () => {
  const payload: JwtPayload = {
    sub: 'user',
    tenantId: 'tenant',
    email: 'user@example.test',
    roles: ['SUPER_ADMIN'],
    permissions: ['users:manage'],
    planId: '',
  };
  const repo = { findUserById: jest.fn(), fetchUserRolesWithPermissions: jest.fn() };
  const config = {
    get: () => ({ algorithm: 'HS256', secret: 'access-test' }),
  } as unknown as ConfigService;
  const strategy = new JwtStrategy(config, repo as any);

  it.each(['SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN', 'USER', 'AGENT'])(
    'uses current %s assignments instead of stale token privileges',
    async (role) => {
      repo.findUserById.mockResolvedValue({ id: 'user', tenantId: 'tenant', isActive: true });
      repo.fetchUserRolesWithPermissions.mockResolvedValue([
        { name: role, permissions: [{ name: 'contacts:read' }] },
      ]);
      const context = await strategy.validate(payload);
      expect(context.roles).toEqual([role]);
      expect(context.permissions).toEqual(['contacts:read']);
    },
  );

  it.each([null, { isActive: false }, { isActive: true, isLocked: true }])(
    'rejects missing or disabled accounts %j',
    async (user) => {
      repo.findUserById.mockResolvedValue(user);
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Account is not active or is locked',
      );
    },
  );
});
