import { Injectable, NotFoundException } from '@nestjs/common';
import { RbacRepository } from './rbac.repository';
import { CreateRoleDto, RoleFilterDto, PermissionFilterDto } from './dto/create-role.dto';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { IPaginatedResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class RbacService {
  constructor(private readonly rbacRepository: RbacRepository) {}

  async createRole(tenantId: string, createRoleDto: CreateRoleDto): Promise<Role> {
    const permissions = await this.rbacRepository.findPermissionsByIds(createRoleDto.permissionIds);
    return this.rbacRepository.create(tenantId, {
      name: createRoleDto.name,
      description: createRoleDto.description,
      permissions,
    });
  }

  async findAllRoles(tenantId: string, filter: RoleFilterDto): Promise<IPaginatedResult<Role>> {
    const [data, total] = await this.rbacRepository.findAllPaginated(tenantId, filter);
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  async findRole(tenantId: string, id: string): Promise<Role> {
    const role = await this.rbacRepository.findRoleWithPermissions(tenantId, id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async findAllPermissions(filter: PermissionFilterDto): Promise<IPaginatedResult<Permission>> {
    const [data, total] = await this.rbacRepository.findPermissions(filter);
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  async updateRole(
    tenantId: string,
    id: string,
    updateRoleDto: Partial<CreateRoleDto>,
  ): Promise<Role> {
    const role = await this.findRole(tenantId, id);
    if (updateRoleDto.permissionIds) {
      role.permissions = await this.rbacRepository.findPermissionsByIds(
        updateRoleDto.permissionIds,
      );
    }
    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.description) role.description = updateRoleDto.description;

    return this.rbacRepository.update(tenantId, id, role);
  }

  async removeRole(tenantId: string, id: string): Promise<void> {
    await this.findRole(tenantId, id);
    await this.rbacRepository.delete(tenantId, id);
  }

  async assignRole(tenantId: string, userId: string, roleId: string, actorId?: string): Promise<void> {
    await this.findRole(tenantId, roleId);
    await this.rbacRepository.assignRole(tenantId, userId, roleId, actorId);
  }

  async revokeRole(tenantId: string, userId: string, roleId: string): Promise<void> {
    await this.rbacRepository.revokeRole(tenantId, userId, roleId);
  }

  async createPermission(data: any): Promise<Permission> {
    return this.rbacRepository.createPermission(data);
  }
}
