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
import type { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserEntity, UserStatus } from './entities/user.entity';
import type { AuthTokens } from './interfaces/auth-tokens.interface';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

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
    const tokens = await this.generateTokens(user, ipAddress);
    this.eventEmitter.emit(EVENT_NAMES.USER_LOGIN, {
      name: EVENT_NAMES.USER_LOGIN, tenantId: user.tenantId, actorId: user.id,
      payload: { userId: user.id, email: user.email },
      occurredAt: new Date().toISOString(), correlationId: uuidv4(),
    });
    return tokens;
  }

  async register(dto: RegisterDto, tenantId: string): Promise<{ userId: string }> {
    const existing = await this.authRepo.findUserByEmail(dto.email, tenantId);
    if (existing !== null) {
      throw new ConflictException({ message: 'Email already registered', code: ERROR_CODES.CONFLICT });
    }
    const user = await this.authRepo.createUser({
      email: dto.email, passwordHash: dto.password,
      firstName: dto.firstName, lastName: dto.lastName,
      tenantId, status: UserStatus.PENDING_VERIFICATION,
    });
    this.eventEmitter.emit(EVENT_NAMES.USER_REGISTERED, {
      name: EVENT_NAMES.USER_REGISTERED, tenantId, actorId: user.id,
      payload: { userId: user.id, email: user.email },
      occurredAt: new Date().toISOString(), correlationId: uuidv4(),
    });
    return { userId: user.id };
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

  private async generateTokens(user: UserEntity, _ipAddress: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id, email: user.email, tenantId: user.tenantId,
      roles: [], permissions: [], planId: '',
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: this.jwtConfig.secret, expiresIn: this.jwtConfig.expiresIn }),
      this.jwtService.signAsync(payload, { secret: this.jwtConfig.refreshSecret, expiresIn: this.jwtConfig.refreshExpiresIn }),
    ]);
    return { accessToken, refreshToken, expiresIn: 900, tokenType: 'Bearer' };
  }
}
