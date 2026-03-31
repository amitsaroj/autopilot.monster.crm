import { UserEntity } from './user.entity';
export declare class RefreshTokenEntity {
    id: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    userId: string;
    user?: UserEntity;
    tokenHash: string;
    sessionId?: string;
    isRevoked: boolean;
    expiresAt: Date;
    ipAddress?: string;
}
