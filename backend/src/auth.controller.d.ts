import type { IRequestContext } from '@autopilot/core/common/interfaces/request-context.interface';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto, LogoutDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, EnableMfaDto } from './dto/auth.dto';
import type { AuthTokens } from './interfaces/auth-tokens.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, tenantId: string): Promise<{
        user: any;
        tenant: any;
    }>;
    login(dto: LoginDto, tenantId: string, ip: string): Promise<AuthTokens>;
    refresh(dto: RefreshTokenDto, tenantId: string, ip: string): Promise<AuthTokens>;
    logout(user: IRequestContext, dto: LogoutDto): Promise<void>;
    changePassword(user: IRequestContext, dto: ChangePasswordDto): Promise<void>;
    me(user: IRequestContext): IRequestContext;
    forgotPassword(dto: ForgotPasswordDto, tenantId: string): Promise<void>;
    resetPassword(dto: ResetPasswordDto): Promise<void>;
    verifyEmail(dto: VerifyEmailDto): Promise<void>;
    enableMfa(user: IRequestContext): Promise<{
        secret: string;
        qrCodeUrl: string;
    }>;
    verifyMfa(user: IRequestContext, dto: EnableMfaDto): Promise<void>;
    disableMfa(user: IRequestContext): Promise<void>;
    getSessions(user: IRequestContext): Promise<import(".").SessionEntity[]>;
    revokeSession(user: IRequestContext, sessionId: string): Promise<void>;
}
