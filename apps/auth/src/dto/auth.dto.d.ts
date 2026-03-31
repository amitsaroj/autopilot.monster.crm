export declare class LoginDto {
    email: string;
    password: string;
    mfaCode?: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantName: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class EnableMfaDto {
    totpCode: string;
}
export declare class LogoutDto {
    allSessions?: boolean;
}
export declare class VerifyEmailDto {
    token: string;
}
