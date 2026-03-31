import { Test, TestingModule } from '@nestjs/testing';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn(() => 'mock-secret'),
    keyuri: jest.fn(() => 'mock-uri'),
    verify: jest.fn(() => true),
  },
}));

import { AuthController } from '../../src/auth.controller';
import { AuthService } from '../../src/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    changePassword: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    verifyEmail: jest.fn(),
    generateMfaSecret: jest.fn(),
    enableMfa: jest.fn(),
    disableMfa: jest.fn(),
    getSessions: jest.fn(),
    revokeSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call service.register', async () => {
      const dto = { email: 'test@test.com', password: 'pw', firstName: 'A', lastName: 'B', tenantName: 'T' };
      mockAuthService.register.mockResolvedValue({ user: {}, tenant: {} });
      await controller.register(dto, 'tenant-id');
      expect(service.register).toHaveBeenCalledWith(dto, 'tenant-id');
    });
  });

  describe('login', () => {
    it('should call service.login', async () => {
      const dto = { email: 'test@test.com', password: 'pw' };
      mockAuthService.login.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });
      await controller.login(dto, 'tenant-id', '127.0.0.1');
      expect(service.login).toHaveBeenCalledWith(dto, 'tenant-id', '127.0.0.1');
    });
  });

  describe('me', () => {
    it('should return context user', () => {
      const user = { 
        userId: 'u1', 
        tenantId: 't1', 
        email: 'test@test.com',
        roles: [], 
        permissions: [], 
        planId: '',
        correlationId: 'c1',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      };
      expect(controller.me(user)).toBe(user);
    });
  });
});
