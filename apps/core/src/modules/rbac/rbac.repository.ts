import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { UserRole } from '../../database/entities/user-role.entity';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class RbacRepository extends BaseRepository<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {
    super(roleRepository);
  }

  async assignRole(tenantId: string, userId: string, roleId: string, assignedBy?: string): Promise<UserRole> {
    const userRole = this.userRoleRepository.create({ tenantId, userId, roleId, assignedBy });
    return this.userRoleRepository.save(userRole);
  }

  async revokeRole(tenantId: string, userId: string, roleId: string): Promise<void> {
    await this.userRoleRepository.delete({ tenantId, userId, roleId });
  }

  async findUserRoles(tenantId: string, userId: string): Promise<UserRole[]> {
    return this.userRoleRepository.find({ where: { tenantId, userId } });
  }

  async findAllPaginated(tenantId: string, filter: any = {}): Promise<[Role[], number]> {
    const { page = 1, limit = 10, search } = filter;
    const query = this.roleRepository.createQueryBuilder('role')
      .where('role.tenantId = :tenantId', { tenantId });

    if (search) {
      query.andWhere('(role.name ILIKE :search OR role.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('role.created_at', 'DESC');

    return query.getManyAndCount();
  }

  async findPermissions(filter: any = {}): Promise<[Permission[], number]> {
    const { page = 1, limit = 20, search } = filter;
    const query = this.permissionRepository.createQueryBuilder('permission');

    if (search) {
      query.andWhere('(permission.name ILIKE :search OR permission.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('permission.module', 'ASC')
      .addOrderBy('permission.name', 'ASC');

    return query.getManyAndCount();
  }

  async findPermissionsByIds(ids: string[]): Promise<Permission[]> {
    return this.permissionRepository.find({ where: { id: In(ids) } });
  }

  async findRoleWithPermissions(tenantId: string, id: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id, tenantId } as any,
      relations: ['permissions'],
    });
  }

  async createPermission(data: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepository.create(data);
    return this.permissionRepository.save(permission);
  }
}
