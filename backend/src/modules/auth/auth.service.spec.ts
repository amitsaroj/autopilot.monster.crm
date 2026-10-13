jest.mock('uuid', () => ({ v4: () => 'test-uuid' }));
jest.mock('./mfa.service', () => ({ MfaService: class {} }));
import { AuthService } from './auth.service';
import { UserStatus } from './entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

const roleNames = ['SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN', 'USER', 'AGENT'];

describe('Authentication across roles', () => {
  let repo: any;
  let service: AuthService;
  beforeEach(() => {
    repo = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      findUserByResetToken: jest.fn(),
      updateUser: jest.fn(),
      revokeAllUserTokens: jest.fn(),
      deactivateAllUserSessions: jest.fn(),
      findTenantById: jest.fn().mockResolvedValue({ status: 'ACTIVE' }),
      fetchUserRolesWithPermissions: jest.fn(),
      resetFailedAttempts: jest.fn(),
      saveRefreshToken: jest.fn(),
      createSession: jest.fn().mockResolvedValue({ id: 'session' }),
    };
    const config = {
      get: () => ({
        algorithm: 'HS256',
        secret: 'test-access',
        refreshSecret: 'test-refresh',
        expiresIn: '15m',
        refreshExpiresIn: '7d',
      }),
    };
    const jwt = {
      decode: (token: string) =>
        JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()),
    };
    service = new AuthService(
      repo,
      jwt as any,
      config as any,
      { emit: jest.fn() } as any,
      {} as any,
      { sendPasswordResetEmail: jest.fn() } as any,
      { getTenantSubscription: jest.fn().mockResolvedValue(null) } as any,
    );
  });

  it.each(roleNames)('logs in %s with the assigned permissions and unique tokens', async (role) => {
    repo.findUserByEmail.mockResolvedValue({
      id: 'user',
      tenantId: 'tenant',
      email: 'user@example.test',
      status: UserStatus.ACTIVE,
      isActive: true,
      validatePassword: async () => true,
    });
    repo.fetchUserRolesWithPermissions.mockResolvedValue([
      { name: role, permissions: [{ name: 'contacts:read' }] },
    ]);
    const first = await service.login(
      { email: 'user@example.test', password: 'password' },
      '',
      '127.0.0.1',
    );
    const second = await service.login(
      { email: 'user@example.test', password: 'password' },
      '',
      '127.0.0.1',
    );
    const payload = JSON.parse(
      Buffer.from(first.accessToken.split('.')[1], 'base64url').toString(),
    );
    expect(payload.roles).toEqual([role]);
    expect(payload.permissions).toEqual(['contacts:read']);
    expect(first.refreshToken).not.toBe(second.refreshToken);
    expect(first.accessToken).not.toBe(second.accessToken);
    expect(repo.saveRefreshToken).toHaveBeenCalledWith(
      'user',
      'tenant',
      expect.any(String),
      expect.any(Date),
      '127.0.0.1',
      'session',
    );
  });

  it('uses the resolved tenant when requesting a password reset without a tenant header', async () => {
    repo.findUserByEmail.mockResolvedValue({
      id: 'user',
      tenantId: 'tenant',
      email: 'user@example.test',
    });
    await service.forgotPassword('user@example.test', '');
    expect(repo.updateUser).toHaveBeenCalledWith(
      'user',
      'tenant',
      expect.objectContaining({ resetToken: expect.any(String) }),
    );
  });

  it('clears reset credentials with SQL null after reset', async () => {
    repo.findUserByResetToken.mockResolvedValue({
      id: 'user',
      tenantId: 'tenant',
      resetTokenExpiresAt: new Date(Date.now() + 10000),
    });
    await service.resetPassword('token', 'new-password');
    expect(repo.updateUser).toHaveBeenCalledWith('user', 'tenant', {
      passwordHash: 'new-password',
      resetToken: null,
      resetTokenExpiresAt: null,
    });
  });

  it.each([
    { isActive: false },
    { isActive: true, isLocked: true },
    { isActive: true, isMfaEnabled: true },
  ])('rejects restricted OAuth accounts %j', async (flags) => {
    await expect(
      service.oauthLogin({ id: 'user', tenantId: 'tenant', ...flags } as any, ''),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(repo.saveRefreshToken).not.toHaveBeenCalled();
  });
});
