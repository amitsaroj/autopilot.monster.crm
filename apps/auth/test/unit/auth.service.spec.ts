import { ConflictException, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../../src/auth.service';
import { UserStatus } from '../../src/entities/user.entity';

const mockUser = {
  id: 'user-001',
  email: 'autopilot.monster@gmail.com',
  tenantId: 'tenant-001',
  status: UserStatus.ACTIVE,
  failedLoginAttempts: 0,
  isMfaEnabled: false,
  isActive: true,
  isLocked: false,
  validatePassword: jest.fn(),
  hashPassword: jest.fn(),
} as ReturnType<typeof jest.mocked<never>>;

const mockRepo = {
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  createUser: jest.fn(),
  incrementFailedAttempts: jest.fn(),
  resetFailedAttempts: jest.fn(),
  lockUser: jest.fn(),
  revokeAllUserTokens: jest.fn(),
  deactivateAllUserSessions: jest.fn(),
  updateUser: jest.fn(),
  saveRefreshToken: jest.fn(),
  createTenant: jest.fn(),
  findTenantById: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock-token'),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue({
    secret: 'test-secret',
    refreshSecret: 'test-refresh-secret',
    expiresIn: '15m',
    refreshExpiresIn: '7d',
  }),
};

const mockEventEmitter = { emit: jest.fn() };

const mockMfaService = {
  generateSecret: jest.fn(),
  generateQrCodeUrl: jest.fn(),
  verifyToken: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      mockRepo as never,
      mockJwtService as never,
      mockConfigService as never,
      mockEventEmitter as never,
      mockMfaService as never,
    );
  });

  // ─── register ──────────────────────────────────────────────────────────────
  describe('register', () => {
    it('should create a new user and emit USER_REGISTERED event', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);
      mockRepo.createTenant.mockResolvedValue({ id: 'tenant-001', name: 'My Workspace', slug: 'my-workspace' });
      mockRepo.createUser.mockResolvedValue({ ...mockUser, id: 'new-user' });

      const result = await service.register(
        {
          email: 'autopilot.monster@gmail.com',
          password: 'Password1!',
          firstName: 'John',
          lastName: 'Doe',
          tenantName: 'My Workspace',
        },
        'any-tenant-id',
      );

      expect(result.user.id).toBe('new-user');
      expect(result.tenant.id).toBe('tenant-001');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.registered',
        expect.objectContaining({ name: 'user.registered' }),
      );
    });

    it('should throw ConflictException if email already registered', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      await expect(
        service.register(
          { 
            email: 'autopilot.monster@gmail.com', 
            password: 'pw', 
            firstName: 'A', 
            lastName: 'B',
            tenantName: 'Workspace' 
          },
          'tenant-001',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── validateCredentials ───────────────────────────────────────────────────
  describe('validateCredentials', () => {
    it('should return null when user not found', async () => {
      mockRepo.findUserByEmail.mockResolvedValue(null);
      const result = await service.validateCredentials(
        'autopilot.monster@gmail.com',
        'pw',
        'tenant-001',
      );
      expect(result).toBeNull();
    });

    it('should return null and increment attempts on wrong password', async () => {
      mockUser.validatePassword = jest.fn().mockResolvedValue(false);
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      const result = await service.validateCredentials(
        'autopilot.monster@gmail.com',
        'wrong',
        'tenant-001',
      );
      expect(result).toBeNull();
      expect(mockRepo.incrementFailedAttempts).toHaveBeenCalledWith(mockUser.id, mockUser.tenantId);
    });

    it('should return user on valid credentials', async () => {
      mockUser.validatePassword = jest.fn().mockResolvedValue(true);
      mockRepo.findUserByEmail.mockResolvedValue(mockUser);
      const result = await service.validateCredentials(
        'autopilot.monster@gmail.com',
        'correct',
        'tenant-001',
      );
      expect(result).toBe(mockUser);
      expect(mockRepo.resetFailedAttempts).toHaveBeenCalledWith(mockUser.id, mockUser.tenantId);
    });

    it('should throw UnauthorizedException when account is locked', async () => {
      const lockedUser = { ...mockUser, isLocked: true };
      mockRepo.findUserByEmail.mockResolvedValue(lockedUser);
      await expect(
        service.validateCredentials('autopilot.monster@gmail.com', 'pw', 'tenant-001'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── logout ────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('should revoke all tokens and sessions when allSessions=true', async () => {
      await service.logout('user-001', 'tenant-001', true);
      expect(mockRepo.revokeAllUserTokens).toHaveBeenCalledWith('user-001', 'tenant-001');
      expect(mockRepo.deactivateAllUserSessions).toHaveBeenCalledWith('user-001', 'tenant-001');
    });

    it('should not revoke tokens when allSessions=false', async () => {
      await service.logout('user-001', 'tenant-001', false);
      expect(mockRepo.revokeAllUserTokens).not.toHaveBeenCalled();
    });
  });
});
