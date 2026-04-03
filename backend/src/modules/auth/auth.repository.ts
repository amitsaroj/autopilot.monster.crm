import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { SessionEntity } from './entities/session.entity';
import { UserEntity, UserStatus, AuthProvider } from './entities/user.entity';
import { Tenant } from '../../database/entities/tenant.entity';
import { Role } from '../../database/entities/role.entity';
import { UserRole } from '../../database/entities/user-role.entity';

/**
 * AuthRepository — data access layer for auth module.
 * All queries include tenantId for strict tenant isolation.
 */
@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly tokenRepo: Repository<RefreshTokenEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  // ─── User ─────────────────────────────────────────────────────────────────

  async findUserByEmail(email: string, tenantId?: string): Promise<UserEntity | null> {
    const whereClause: any = { email };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    return this.userRepo.findOne({
      where: whereClause,
      select: [
        'id',
        'email',
        'passwordHash',
        'status',
        'tenantId',
        'isMfaEnabled',
        'failedLoginAttempts',
        'lockedUntil',
        'firstName',
        'lastName',
      ],
    });
  }

  async findUserByProvider(provider: AuthProvider, providerId: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { provider, providerId },
    });
  }

  async findUserById(id: string, tenantId: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { id, tenantId } });
  }

  async createUser(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenantRepo.create(data);
    return this.tenantRepo.save(tenant);
  }

  async findTenantById(id: string): Promise<Tenant | null> {
    return this.tenantRepo.findOne({ where: { id } });
  }

  async updateUser(id: string, tenantId: string, data: Partial<UserEntity>): Promise<UserEntity> {
    // Cast required: TypeORM's _QueryDeepPartialEntity struggles with jsonb Record<string, unknown>
    await this.userRepo.update(
      { id, tenantId },
      data as Parameters<typeof this.userRepo.update>[1],
    );
    const updated = await this.userRepo.findOne({ where: { id, tenantId } });
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async incrementFailedAttempts(id: string, tenantId: string): Promise<void> {
    await this.userRepo.increment({ id, tenantId }, 'failedLoginAttempts', 1);
  }

  async resetFailedAttempts(id: string, tenantId: string): Promise<void> {
    await this.userRepo.update(
      { id, tenantId },
      {
        failedLoginAttempts: 0,
        lockedUntil: undefined,
        lastLoginAt: new Date(),
      },
    );
  }

  async lockUser(id: string, tenantId: string, until: Date): Promise<void> {
    await this.userRepo.update({ id, tenantId }, { lockedUntil: until });
  }

  // ─── Refresh Tokens ────────────────────────────────────────────────────────

  async saveRefreshToken(
    userId: string,
    tenantId: string,
    rawToken: string,
    expiresAt: Date,
    ipAddress?: string,
  ): Promise<void> {
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const token = this.tokenRepo.create({
      userId,
      tenantId,
      tokenHash,
      expiresAt,
      ipAddress,
      isRevoked: false,
    });
    await this.tokenRepo.save(token);
  }

  async findValidRefreshToken(userId: string, tenantId: string): Promise<RefreshTokenEntity[]> {
    return this.tokenRepo.find({
      where: { userId, tenantId, isRevoked: false },
      select: ['id', 'tokenHash', 'expiresAt', 'sessionId'],
    });
  }

  async revokeRefreshToken(id: string, tenantId: string): Promise<void> {
    await this.tokenRepo.update({ id, tenantId }, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: string, tenantId: string): Promise<void> {
    await this.tokenRepo.update({ userId, tenantId }, { isRevoked: true });
  }

  // ─── Sessions ──────────────────────────────────────────────────────────────

  async createSession(data: Partial<SessionEntity>): Promise<SessionEntity> {
    const session = this.sessionRepo.create(data);
    return this.sessionRepo.save(session);
  }

  async deactivateSession(id: string, tenantId: string): Promise<void> {
    await this.sessionRepo.update({ id, tenantId }, { isActive: false });
  }

  async deactivateAllUserSessions(userId: string, tenantId: string): Promise<void> {
    await this.sessionRepo.update({ userId, tenantId }, { isActive: false });
  }

  async findActiveSessions(userId: string, tenantId: string): Promise<SessionEntity[]> {
    return this.sessionRepo.find({ where: { userId, tenantId, isActive: true } });
  }

  async updateUserStatus(id: string, tenantId: string, status: UserStatus): Promise<void> {
    await this.userRepo.update({ id, tenantId }, { status });
  }

  async findUserByVerificationToken(token: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { verificationToken: token } });
  }

  async findUserByResetToken(token: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { resetToken: token },
      select: ['id', 'email', 'tenantId', 'resetTokenExpiresAt'],
    });
  }

  // ─── RBAC ──────────────────────────────────────────────────────────────────

  async fetchUserRolesWithPermissions(userId: string, tenantId: string): Promise<Role[]> {
    const userRoles = await this.userRoleRepo.find({ where: { userId, tenantId } });
    if (userRoles.length === 0) return [];

    const roleIds = userRoles.map((ur) => ur.roleId);
    return this.roleRepo.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('role.id IN (:...roleIds)', { roleIds })
      .getMany();
  }
}
