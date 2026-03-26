"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const typeorm_2 = require("typeorm");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
const session_entity_1 = require("./entities/session.entity");
const user_entity_1 = require("./entities/user.entity");
const tenant_entity_1 = require("../../core/src/database/entities/tenant.entity");
const role_entity_1 = require("../../core/src/database/entities/role.entity");
const user_role_entity_1 = require("../../core/src/database/entities/user-role.entity");
let AuthRepository = class AuthRepository {
    constructor(userRepo, tokenRepo, sessionRepo, tenantRepo, roleRepo, userRoleRepo) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.sessionRepo = sessionRepo;
        this.tenantRepo = tenantRepo;
        this.roleRepo = roleRepo;
        this.userRoleRepo = userRoleRepo;
    }
    async findUserByEmail(email, tenantId) {
        return this.userRepo.findOne({
            where: { email, tenantId },
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
    async findUserById(id, tenantId) {
        return this.userRepo.findOne({ where: { id, tenantId } });
    }
    async createUser(data) {
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }
    async createTenant(data) {
        const tenant = this.tenantRepo.create(data);
        return this.tenantRepo.save(tenant);
    }
    async findTenantById(id) {
        return this.tenantRepo.findOne({ where: { id } });
    }
    async updateUser(id, tenantId, data) {
        await this.userRepo.update({ id, tenantId }, data);
    }
    async incrementFailedAttempts(id, tenantId) {
        await this.userRepo.increment({ id, tenantId }, 'failedLoginAttempts', 1);
    }
    async resetFailedAttempts(id, tenantId) {
        await this.userRepo.update({ id, tenantId }, {
            failedLoginAttempts: 0,
            lockedUntil: undefined,
            lastLoginAt: new Date(),
        });
    }
    async lockUser(id, tenantId, until) {
        await this.userRepo.update({ id, tenantId }, { lockedUntil: until });
    }
    async saveRefreshToken(userId, tenantId, rawToken, expiresAt, ipAddress) {
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
    async findValidRefreshToken(userId, tenantId) {
        return this.tokenRepo.find({
            where: { userId, tenantId, isRevoked: false },
            select: ['id', 'tokenHash', 'expiresAt', 'sessionId'],
        });
    }
    async revokeRefreshToken(id, tenantId) {
        await this.tokenRepo.update({ id, tenantId }, { isRevoked: true });
    }
    async revokeAllUserTokens(userId, tenantId) {
        await this.tokenRepo.update({ userId, tenantId }, { isRevoked: true });
    }
    async createSession(data) {
        const session = this.sessionRepo.create(data);
        return this.sessionRepo.save(session);
    }
    async deactivateSession(id, tenantId) {
        await this.sessionRepo.update({ id, tenantId }, { isActive: false });
    }
    async deactivateAllUserSessions(userId, tenantId) {
        await this.sessionRepo.update({ userId, tenantId }, { isActive: false });
    }
    async findActiveSessions(userId, tenantId) {
        return this.sessionRepo.find({ where: { userId, tenantId, isActive: true } });
    }
    async updateUserStatus(id, tenantId, status) {
        await this.userRepo.update({ id, tenantId }, { status });
    }
    async findUserByVerificationToken(token) {
        return this.userRepo.findOne({ where: { verificationToken: token } });
    }
    async findUserByResetToken(token) {
        return this.userRepo.findOne({
            where: { resetToken: token },
            select: ['id', 'email', 'tenantId', 'resetTokenExpiresAt'],
        });
    }
    async fetchUserRolesWithPermissions(userId, tenantId) {
        const userRoles = await this.userRoleRepo.find({ where: { userId, tenantId } });
        if (userRoles.length === 0)
            return [];
        const roleIds = userRoles.map((ur) => ur.roleId);
        return this.roleRepo.createQueryBuilder('role')
            .leftJoinAndSelect('role.permissions', 'permission')
            .where('role.id IN (:...roleIds)', { roleIds })
            .getMany();
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshTokenEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(session_entity_1.SessionEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(4, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(5, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRole)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map