jest.mock('otplib', () => ({
  generateSecret: jest.fn(),
  generateURI: jest.fn(),
  verifySync: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthRepository } from '../../src/modules/auth/auth.repository';
import { MfaService } from '../../src/modules/auth/mfa.service';
import { EmailService } from '../../src/shared/email/email.service';
import { ConfigService } from '@nestjs/config';
import { PricingService } from '../../src/modules/pricing/pricing.service';

const TENANT_A = '11111111-1111-1111-1111-111111111111';

describe('Auth integration (service)', () => {
  let authService: AuthService;

  const mockAuthRepository = {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    createUser: jest.fn(),
    saveRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: { sign: jest.fn(), verify: jest.fn() } },
        { provide: MfaService, useValue: { generateSecret: jest.fn(), verifyToken: jest.fn() } },
        { provide: EmailService, useValue: { sendPasswordResetEmail: jest.fn() } },
        { provide: PricingService, useValue: { getTenantSubscription: jest.fn() } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'jwt') {
                return { secret: 'test', expiresIn: '1h', refreshExpiresIn: '7d' };
              }
              return undefined;
            },
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('rejects login for unknown user', async () => {
    mockAuthRepository.findUserByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'missing@example.com', password: 'secret' }, TENANT_A, '127.0.0.1'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
