"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const error_codes_constants_1 = require("../../core/src/common/constants/error-codes.constants");
const event_constants_1 = require("../../core/src/events/event.constants");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
const auth_repository_1 = require("./auth.repository");
const user_entity_1 = require("./entities/user.entity");
const mfa_service_1 = require("./mfa.service");
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
let AuthService = class AuthService {
    constructor(authRepo, jwtService, configService, eventEmitter, mfaService) {
        this.authRepo = authRepo;
        this.jwtService = jwtService;
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.mfaService = mfaService;
        const cfg = this.configService.get('jwt');
        if (cfg === undefined)
            throw new Error('JWT config missing');
        this.jwtConfig = cfg;
    }
    async validateCredentials(email, password, tenantId = '') {
        const user = await this.authRepo.findUserByEmail(email, tenantId);
        if (user === null)
            return null;
        if (user.isLocked) {
            throw new common_1.UnauthorizedException({
                message: 'Account is temporarily locked. Please try again later.',
                code: error_codes_constants_1.ERROR_CODES.UNAUTHORIZED,
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
    async login(dto, tenantId, ipAddress) {
        const user = await this.validateCredentials(dto.email, dto.password, tenantId);
        if (user === null) {
            throw new common_1.UnauthorizedException({
                message: 'Invalid email or password',
                code: error_codes_constants_1.ERROR_CODES.UNAUTHORIZED,
            });
        }
        if (user.status !== user_entity_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException({ message: 'Account is not active', code: error_codes_constants_1.ERROR_CODES.UNAUTHORIZED });
        }
        if (user.isMfaEnabled) {
            if (!dto.mfaCode) {
                throw new common_1.UnauthorizedException({ message: 'MFA code required', code: error_codes_constants_1.ERROR_CODES.UNAUTHORIZED });
            }
            const isValid = this.mfaService.verifyToken(dto.mfaCode, user.mfaSecret);
            if (!isValid) {
                throw new common_1.UnauthorizedException({ message: 'Invalid MFA code', code: error_codes_constants_1.ERROR_CODES.UNAUTHORIZED });
            }
        }
        const tokens = await this.generateTokens(user, ipAddress);
        this.eventEmitter.emit(event_constants_1.EVENT_NAMES.USER_LOGIN, {
            name: event_constants_1.EVENT_NAMES.USER_LOGIN, tenantId: user.tenantId, actorId: user.id,
            payload: { userId: user.id, email: user.email },
            occurredAt: new Date().toISOString(), correlationId: (0, uuid_1.v4)(),
        });
        return tokens;
    }
    async register(dto, _tenantId) {
        const existing = await this.authRepo.findUserByEmail(dto.email, '');
        if (existing !== null) {
            throw new common_1.ConflictException({ message: 'Email already registered', code: error_codes_constants_1.ERROR_CODES.CONFLICT });
        }
        const slugBase = dto.tenantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const slug = `${slugBase}-${(0, uuid_1.v4)().split('-')[0]}`;
        const tenant = await this.authRepo.createTenant({
            name: dto.tenantName,
            slug,
            status: 'TRIAL',
        });
        const token = (0, uuid_1.v4)();
        const user = await this.authRepo.createUser({
            email: dto.email,
            passwordHash: dto.password,
            firstName: dto.firstName,
            lastName: dto.lastName,
            tenantId: tenant.id,
            status: user_entity_1.UserStatus.PENDING_VERIFICATION,
            verificationToken: token,
        });
        this.eventEmitter.emit(event_constants_1.EVENT_NAMES.USER_REGISTERED, {
            name: event_constants_1.EVENT_NAMES.USER_REGISTERED,
            tenantId: tenant.id,
            actorId: user.id,
            payload: { userId: user.id, email: user.email, token, tenantId: tenant.id },
            occurredAt: new Date().toISOString(),
            correlationId: (0, uuid_1.v4)(),
        });
        return { user, tenant };
    }
    async refreshTokens(rawRefreshToken, tenantId, ipAddress) {
        let payload;
        try {
            payload = this.jwtService.verify(rawRefreshToken, { secret: this.jwtConfig.refreshSecret });
        }
        catch {
            throw new common_1.UnauthorizedException({ message: 'Invalid or expired refresh token', code: error_codes_constants_1.ERROR_CODES.TOKEN_EXPIRED });
        }
        const user = await this.authRepo.findUserById(payload.sub, tenantId);
        if (user === null || !user.isActive) {
            throw new common_1.UnauthorizedException({ code: error_codes_constants_1.ERROR_CODES.UNAUTHORIZED });
        }
        return this.generateTokens(user, ipAddress);
    }
    async logout(userId, tenantId, allSessions) {
        if (allSessions) {
            await this.authRepo.revokeAllUserTokens(userId, tenantId);
            await this.authRepo.deactivateAllUserSessions(userId, tenantId);
        }
        this.eventEmitter.emit(event_constants_1.EVENT_NAMES.USER_LOGOUT, {
            name: event_constants_1.EVENT_NAMES.USER_LOGOUT, tenantId, actorId: userId,
            payload: { userId, allSessions },
            occurredAt: new Date().toISOString(), correlationId: (0, uuid_1.v4)(),
        });
    }
    async changePassword(userId, tenantId, currentPassword, newPassword) {
        const user = await this.authRepo.findUserById(userId, tenantId);
        if (user === null)
            throw new common_1.BadRequestException('User not found');
        const valid = await user.validatePassword(currentPassword);
        if (!valid)
            throw new common_1.UnauthorizedException({ code: error_codes_constants_1.ERROR_CODES.UNAUTHORIZED });
        await this.authRepo.updateUser(userId, tenantId, { passwordHash: newPassword });
    }
    async forgotPassword(email, tenantId) {
        const user = await this.authRepo.findUserByEmail(email, tenantId);
        if (!user)
            return;
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + 3600000);
        await this.authRepo.updateUser(user.id, tenantId, {
            resetToken: token,
            resetTokenExpiresAt: expiresAt,
        });
        this.eventEmitter.emit(event_constants_1.EVENT_NAMES.PASSWORD_RESET, {
            name: event_constants_1.EVENT_NAMES.PASSWORD_RESET, tenantId, actorId: user.id,
            payload: { userId: user.id, email: user.email, token },
            occurredAt: new Date().toISOString(), correlationId: (0, uuid_1.v4)(),
        });
    }
    async resetPassword(token, newPassword) {
        const user = await this.authRepo.findUserByResetToken(token);
        if (!user || (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date())) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        await this.authRepo.updateUser(user.id, user.tenantId, {
            passwordHash: newPassword,
            resetToken: undefined,
            resetTokenExpiresAt: undefined,
        });
    }
    async verifyEmail(token) {
        const user = await this.authRepo.findUserByVerificationToken(token);
        if (!user)
            throw new common_1.BadRequestException('Invalid verification token');
        await this.authRepo.updateUser(user.id, user.tenantId, {
            status: user_entity_1.UserStatus.ACTIVE,
            verificationToken: undefined,
            emailVerifiedAt: new Date(),
        });
        this.eventEmitter.emit(event_constants_1.EVENT_NAMES.USER_VERIFIED, {
            name: event_constants_1.EVENT_NAMES.USER_VERIFIED, tenantId: user.tenantId, actorId: user.id,
            payload: { userId: user.id, email: user.email },
            occurredAt: new Date().toISOString(), correlationId: (0, uuid_1.v4)(),
        });
    }
    async generateMfaSecret(userId, tenantId) {
        const user = await this.authRepo.findUserById(userId, tenantId);
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const secret = this.mfaService.generateSecret();
        const qrCodeUrl = this.mfaService.generateQrCodeUrl(user.email, 'Autopilot Monster', secret);
        await this.authRepo.updateUser(userId, tenantId, { mfaSecret: secret });
        return { secret, qrCodeUrl };
    }
    async enableMfa(userId, tenantId, token) {
        const user = await this.authRepo.findUserById(userId, tenantId);
        if (!user || !user.mfaSecret)
            throw new common_1.BadRequestException('MFA not initiated');
        const isValid = this.mfaService.verifyToken(token, user.mfaSecret);
        if (!isValid)
            throw new common_1.UnauthorizedException('Invalid MFA token');
        await this.authRepo.updateUser(userId, tenantId, { isMfaEnabled: true });
        this.eventEmitter.emit(event_constants_1.EVENT_NAMES.USER_MFA_ENABLED, {
            name: event_constants_1.EVENT_NAMES.USER_MFA_ENABLED, tenantId, actorId: userId,
            payload: { userId },
            occurredAt: new Date().toISOString(), correlationId: (0, uuid_1.v4)(),
        });
    }
    async disableMfa(userId, tenantId) {
        await this.authRepo.updateUser(userId, tenantId, {
            isMfaEnabled: false,
            mfaSecret: undefined,
        });
        this.eventEmitter.emit(event_constants_1.EVENT_NAMES.USER_MFA_DISABLED, {
            name: event_constants_1.EVENT_NAMES.USER_MFA_DISABLED, tenantId, actorId: userId,
            payload: { userId },
            occurredAt: new Date().toISOString(), correlationId: (0, uuid_1.v4)(),
        });
    }
    async getSessions(userId, tenantId) {
        return this.authRepo.findActiveSessions(userId, tenantId);
    }
    async revokeSession(userId, tenantId, sessionId) {
        console.log(`Revoking session ${sessionId} for user ${userId} in tenant ${tenantId}`);
        await this.authRepo.deactivateSession(sessionId, tenantId);
    }
    async generateTokens(user, _ipAddress) {
        const rolesWithPermissions = await this.authRepo.fetchUserRolesWithPermissions(user.id, user.tenantId);
        const roles = rolesWithPermissions.map((r) => r.name);
        const permissions = Array.from(new Set(rolesWithPermissions.flatMap((r) => r.permissions.map((p) => p.name))));
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            roles,
            permissions,
            planId: '',
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { secret: this.jwtConfig.secret, expiresIn: this.jwtConfig.expiresIn }),
            this.jwtService.signAsync(payload, { secret: this.jwtConfig.refreshSecret, expiresIn: this.jwtConfig.refreshExpiresIn }),
        ]);
        return { accessToken, refreshToken, expiresIn: 900, tokenType: 'Bearer' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository,
        jwt_1.JwtService,
        config_1.ConfigService,
        event_emitter_1.EventEmitter2,
        mfa_service_1.MfaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map