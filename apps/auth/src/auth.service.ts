import { ERROR_CODES } from '@autopilot/core/common/constants/error-codes.constants';
import type { JwtConfig } from '@autopilot/core/config/jwt.config';
import { EVENT_NAMES } from '@autopilot/core/events/event.constants';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserEntity, UserStatus } from './entities/user.entity';
import { AuthTokens } from './interfaces/auth-tokens.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { MfaService } from './mfa.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly jwtConfig: JwtConfig;

  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mfaService: MfaService,
  ) {
    const cfg = this.configService.get<JwtConfig>('jwt');
    if (cfg === undefined) throw new Error('JWT config missing');
    this.jwtConfig = cfg;
  }

  async validateCredentials(email: string, password: string, tenantId = ''): Promise<UserEntity | null> {
    const user = await this.authRepo.findUserByEmail(email, tenantId);
    if (user === null) return null;

    if (user.isLocked) {
      throw new UnauthorizedException({
        message: 'Account is temporarily locked. Please try again later.',
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }

    const valid = await user.validatePassword(password);
    if (!valid) {
      await this.authRepo.incrementFailedAttempts(user.id, user.tenantId);
      if (user.failedLoginAttempts + 1 >= MAX_FAILED_ATTEMPTS) {
        const until = new Date(Date.now() + LOCKOUT_DURATION_MS);
        await this.authRepo.lockUser(user.id, user.tenantId, until);
      }
      return null;
    }

    await this.authRepo.resetFailedAttempts(user.id, user.tenantId);
    return user;
  }

  async login(dto: LoginDto, tenantId: string, ipAddress: string): Promise<AuthTokens> {
    const user = await this.validateCredentials(dto.email, dto.password, tenantId);
    if (user === null) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        code: ERROR_CODES.UNAUTHORIZED,
      });
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({ message: 'Account is not active', code: ERROR_CODES.UNAUTHORIZED });
    }

    if (user.isMfaEnabled) {
       if (!dto.mfaCode) {
           throw new UnauthorizedException({ message: 'MFA code required', code: ERROR_CODES.UNAUTHORIZED });
       }
       const isValid = this.mfaService.verifyToken(dto.mfaCode, user.mfaSecret!);
       if (!isValid) {
           throw new UnauthorizedException({ message: 'Invalid MFA code', code: ERROR_CODES.UNAUTHORIZED });
       }
    }

    const tokens = await this.generateTokens(user, ipAddress);
    this.eventEmitter.emit(EVENT_NAMES.USER_LOGIN, {
      name: EVENT_NAMES.USER_LOGIN, tenantId: user.tenantId, actorId: user.id,
      payload: { userId: user.id, email: user.email },
      occurredAt: new Date().toISOString(), correlationId: uuidv4(),
    });
    return tokens;
  }

  async register(dto: RegisterDto, _tenantId: string): Promise<{ user: any; tenant: any }> {
    const existing = await this.authRepo.findUserByEmail(dto.email, '');
    if (existing !== null) {
      throw new ConflictException({ message: 'Email already registered', code: ERROR_CODES.CONFLICT });
    }

    const slugBase = dto.tenantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const slug = `${slugBase}-${uuidv4().split('-')[0]}`;

    const tenant = await this.authRepo.createTenant({
      name: dto.tenantName,
      slug,
      status: 'TRIAL' as any,
    });

    const token = uuidv4();
    const user = await this.authRepo.createUser({
      email: dto.email,
      passwordHash: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      tenantId: tenant.id,
      status: UserStatus.PENDING_VERIFICATION,
      verificationToken: token,
    });

    this.eventEmitter.emit(EVENT_NAMES.USER_REGISTERED, {
      name: EVENT_NAMES.USER_REGISTERED,
      tenantId: tenant.id,
      actorId: user.id,
      payload: { userId: user.id, email: user.email, token, tenantId: tenant.id },
      occurredAt: new Date().toISOString(),
      correlationId: uuidv4(),
    });

    return { user, tenant };
  }

  async refreshTokens(rawRefreshToken: string, tenantId: string, ipAddress: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(rawRefreshToken, { secret: this.jwtConfig.refreshSecret });
    } catch {
      throw new UnauthorizedException({ message: 'Invalid or expired refresh token', code: ERROR_CODES.TOKEN_EXPIRED });
    }
    const user = await this.authRepo.findUserById(payload.sub, tenantId);
    if (user === null || !user.isActive) {
      throw new UnauthorizedException({ code: ERROR_CODES.UNAUTHORIZED });
    }
    return this.generateTokens(user, ipAddress);
  }

  async logout(userId: string, tenantId: string, allSessions: boolean): Promise<void> {
    if (allSessions) {
      await this.authRepo.revokeAllUserTokens(userId, tenantId);
      await this.authRepo.deactivateAllUserSessions(userId, tenantId);
    }
    this.eventEmitter.emit(EVENT_NAMES.USER_LOGOUT, {
      name: EVENT_NAMES.USER_LOGOUT, tenantId, actorId: userId,
      payload: { userId, allSessions },
      occurredAt: new Date().toISOString(), correlationId: uuidv4(),
    });
  }

  async changePassword(userId: string, tenantId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.authRepo.findUserById(userId, tenantId);
    if (user === null) throw new BadRequestException('User not found');
    const valid = await user.validatePassword(currentPassword);
    if (!valid) throw new UnauthorizedException({ code: ERROR_CODES.UNAUTHORIZED });
    await this.authRepo.updateUser(userId, tenantId, { passwordHash: newPassword });
  }

  async forgotPassword(email: string, tenantId: string): Promise<void> {
    const user = await this.authRepo.findUserByEmail(email, tenantId);
    if (!user) return;

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour
    await this.authRepo.updateUser(user.id, tenantId, {
      resetToken: token,
      resetTokenExpiresAt: expiresAt,
    });

    this.eventEmitter.emit(EVENT_NAMES.PASSWORD_RESET, {
      name: EVENT_NAMES.PASSWORD_RESET, tenantId, actorId: user.id,
      payload: { userId: user.id, email: user.email, token },
      occurredAt: new Date().toISOString(), correlationId: uuidv4(),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.authRepo.findUserByResetToken(token);
    if (!user || (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date())) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.authRepo.updateUser(user.id, user.tenantId, {
      passwordHash: newPassword,
      resetToken: undefined,
      resetTokenExpiresAt: undefined,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.authRepo.findUserByVerificationToken(token);
    if (!user) throw new BadRequestException('Invalid verification token');

    await this.authRepo.updateUser(user.id, user.tenantId, {
      status: UserStatus.ACTIVE,
      verificationToken: undefined,
      emailVerifiedAt: new Date(),
    });

    this.eventEmitter.emit(EVENT_NAMES.USER_VERIFIED, {
        name: EVENT_NAMES.USER_VERIFIED, tenantId: user.tenantId, actorId: user.id,
        payload: { userId: user.id, email: user.email },
        occurredAt: new Date().toISOString(), correlationId: uuidv4(),
    });
  }

  async generateMfaSecret(userId: string, tenantId: string) {
    const user = await this.authRepo.findUserById(userId, tenantId);
    if (!user) throw new BadRequestException('User not found');

    const secret = this.mfaService.generateSecret();
    const qrCodeUrl = this.mfaService.generateQrCodeUrl(user.email, 'Autopilot Monster', secret);

    await this.authRepo.updateUser(userId, tenantId, { mfaSecret: secret });

    return { secret, qrCodeUrl };
  }

  async enableMfa(userId: string, tenantId: string, token: string): Promise<void> {
    const user = await this.authRepo.findUserById(userId, tenantId);
    if (!user || !user.mfaSecret) throw new BadRequestException('MFA not initiated');

    const isValid = this.mfaService.verifyToken(token, user.mfaSecret);
    if (!isValid) throw new UnauthorizedException('Invalid MFA token');

    await this.authRepo.updateUser(userId, tenantId, { isMfaEnabled: true });

    this.eventEmitter.emit(EVENT_NAMES.USER_MFA_ENABLED, {
        name: EVENT_NAMES.USER_MFA_ENABLED, tenantId, actorId: userId,
        payload: { userId },
        occurredAt: new Date().toISOString(), correlationId: uuidv4(),
    });
  }

  async disableMfa(userId: string, tenantId: string): Promise<void> {
    await this.authRepo.updateUser(userId, tenantId, {
      isMfaEnabled: false,
      mfaSecret: undefined,
    });

    this.eventEmitter.emit(EVENT_NAMES.USER_MFA_DISABLED, {
        name: EVENT_NAMES.USER_MFA_DISABLED, tenantId, actorId: userId,
        payload: { userId },
        occurredAt: new Date().toISOString(), correlationId: uuidv4(),
    });
  }

  async getSessions(userId: string, tenantId: string) {
    return this.authRepo.findActiveSessions(userId, tenantId);
  }

  async revokeSession(userId: string, tenantId: string, sessionId: string) {
    console.log(`Revoking session ${sessionId} for user ${userId} in tenant ${tenantId}`);
    await this.authRepo.deactivateSession(sessionId, tenantId);
  }

  private async generateTokens(user: UserEntity, _ipAddress: string): Promise<AuthTokens> {
    const rolesWithPermissions = await this.authRepo.fetchUserRolesWithPermissions(user.id, user.tenantId);
    
    const roles = rolesWithPermissions.map((r) => r.name);
    const permissions = Array.from(
      new Set(rolesWithPermissions.flatMap((r) => r.permissions.map((p) => p.name)))
    );

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles,
      permissions,
      planId: '',
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: this.jwtConfig.secret, expiresIn: this.jwtConfig.expiresIn as any }),
      this.jwtService.signAsync(payload, { secret: this.jwtConfig.refreshSecret, expiresIn: this.jwtConfig.refreshExpiresIn as any }),
    ]);
    return { accessToken, refreshToken, expiresIn: 900, tokenType: 'Bearer' };
  }
}
