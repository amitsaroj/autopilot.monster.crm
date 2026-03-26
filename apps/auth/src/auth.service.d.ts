import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserEntity } from './entities/user.entity';
import { AuthTokens } from './interfaces/auth-tokens.interface';
import { MfaService } from './mfa.service';
export declare class AuthService {
    private readonly authRepo;
    private readonly jwtService;
    private readonly configService;
    private readonly eventEmitter;
    private readonly mfaService;
    private readonly jwtConfig;
    constructor(authRepo: AuthRepository, jwtService: JwtService, configService: ConfigService, eventEmitter: EventEmitter2, mfaService: MfaService);
    validateCredentials(email: string, password: string, tenantId?: string): Promise<UserEntity | null>;
    login(dto: LoginDto, tenantId: string, ipAddress: string): Promise<AuthTokens>;
    register(dto: RegisterDto, _tenantId: string): Promise<{
        user: any;
        tenant: any;
    }>;
    refreshTokens(rawRefreshToken: string, tenantId: string, ipAddress: string): Promise<AuthTokens>;
    logout(userId: string, tenantId: string, allSessions: boolean): Promise<void>;
    changePassword(userId: string, tenantId: string, currentPassword: string, newPassword: string): Promise<void>;
    forgotPassword(email: string, tenantId: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    generateMfaSecret(userId: string, tenantId: string): Promise<{
        secret: string;
        qrCodeUrl: string;
    }>;
    enableMfa(userId: string, tenantId: string, token: string): Promise<void>;
    disableMfa(userId: string, tenantId: string): Promise<void>;
    getSessions(userId: string, tenantId: string): Promise<import(".").SessionEntity[]>;
    revokeSession(userId: string, tenantId: string, sessionId: string): Promise<void>;
    private generateTokens;
}
