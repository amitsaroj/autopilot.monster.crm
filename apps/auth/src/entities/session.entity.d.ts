import { UserEntity } from './user.entity';
export declare class SessionEntity {
    id: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    userId: string;
    user?: UserEntity;
    ipAddress: string;
    userAgent?: string;
    deviceType?: string;
    isActive: boolean;
    expiresAt: Date;
    lastActivityAt?: Date;
}
