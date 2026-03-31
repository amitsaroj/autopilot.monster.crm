export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING_VERIFICATION = "pending_verification"
}
export declare class UserEntity {
    id: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    status: UserStatus;
    isMfaEnabled: boolean;
    mfaSecret?: string;
    lastLoginAt?: Date;
    failedLoginAttempts: number;
    lockedUntil?: Date;
    emailVerifiedAt?: Date;
    avatarUrl?: string;
    verificationToken?: string;
    resetToken?: string;
    resetTokenExpiresAt?: Date;
    metadata?: Record<string, unknown>;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    get fullName(): string;
    get isActive(): boolean;
    get isLocked(): boolean;
}
