import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { RbacRepository } from './rbac.repository';
import { CreateRoleDto, RoleFilterDto, PermissionFilterDto } from './dto/create-role.dto';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { IPaginatedResult } from '../../common/interfaces/pagination.interface';
import { EVENT_NAMES } from '../../events/event.constants';

@Injectable()
export class RbacService {
  constructor(
    private readonly rbacRepository: RbacRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createRole(
    tenantId: string,
    createRoleDto: CreateRoleDto,
    actorId?: string,
  ): Promise<Role> {
    const permissions = await this.rbacRepository.findPermissionsByIds(createRoleDto.permissionIds);
    const role = await this.rbacRepository.create(tenantId, {
      name: createRoleDto.name,
      description: createRoleDto.description,
      permissions,
    });
    this.eventEmitter.emit(EVENT_NAMES.ROLE_CREATED, {
      name: EVENT_NAMES.ROLE_CREATED,
      tenantId,
      actorId: actorId ?? null,
      payload: { roleId: role.id, name: role.name },
      occurredAt: new Date().toISOString(),
      correlationId: uuidv4(),
    });
    return role;
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
    actorId?: string,
  ): Promise<Role> {
    const role = await this.findRole(tenantId, id);
    if (updateRoleDto.permissionIds) {
      role.permissions = await this.rbacRepository.findPermissionsByIds(
        updateRoleDto.permissionIds,
      );
    }
    if (updateRoleDto.name) role.name = updateRoleDto.name;
    if (updateRoleDto.description) role.description = updateRoleDto.description;

    const updated = await this.rbacRepository.updateWithTenant(tenantId, id, role);
    this.eventEmitter.emit(EVENT_NAMES.ROLE_UPDATED, {
      name: EVENT_NAMES.ROLE_UPDATED,
      tenantId,
      actorId: actorId ?? null,
      payload: { roleId: id, changes: updateRoleDto },
      occurredAt: new Date().toISOString(),
      correlationId: uuidv4(),
    });
    return updated;
  }

  async removeRole(tenantId: string, id: string): Promise<void> {
    await this.findRole(tenantId, id);
    await this.rbacRepository.delete(tenantId, id);
  }

  async assignRole(
    tenantId: string,
    userId: string,
    roleId: string,
    actorId?: string,
  ): Promise<void> {
    await this.findRole(tenantId, roleId);
    if (!(await this.rbacRepository.userExistsInTenant(tenantId, userId))) {
      throw new NotFoundException('User not found');
    }
    await this.rbacRepository.assignRole(tenantId, userId, roleId, actorId);
    this.eventEmitter.emit(EVENT_NAMES.ROLE_ASSIGNED, {
      name: EVENT_NAMES.ROLE_ASSIGNED,
      tenantId,
      actorId: actorId ?? null,
      payload: { userId, roleId },
      occurredAt: new Date().toISOString(),
      correlationId: uuidv4(),
    });
  }

  async revokeRole(
    tenantId: string,
    userId: string,
    roleId: string,
    actorId?: string,
  ): Promise<void> {
    if (!(await this.rbacRepository.userExistsInTenant(tenantId, userId))) {
      throw new NotFoundException('User not found');
    }
    await this.findRole(tenantId, roleId);
    await this.rbacRepository.revokeRole(tenantId, userId, roleId);
    this.eventEmitter.emit(EVENT_NAMES.ROLE_REVOKED, {
      name: EVENT_NAMES.ROLE_REVOKED,
      tenantId,
      actorId: actorId ?? null,
      payload: { userId, roleId },
      occurredAt: new Date().toISOString(),
      correlationId: uuidv4(),
    });
  }

  async createPermission(data: any): Promise<Permission> {
    return this.rbacRepository.createPermission(data);
  }
}
