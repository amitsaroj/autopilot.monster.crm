import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleAssignmentDto } from './dto/role-assignment.dto';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards';
import { Roles, TenantId, CurrentUser } from '../../common/decorators';
import { IRequestContext } from '../../common/interfaces/request-context.interface';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  @ApiOperation({ summary: 'Get all available permissions' })
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Post('roles')
  @ApiOperation({ summary: 'Create a custom role' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  createRole(@TenantId() tenantId: string, @Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(tenantId, createRoleDto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles for the tenant' })
  findAllRoles(@TenantId() tenantId: string) {
    return this.rbacService.findAllRoles(tenantId);
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  findRole(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.rbacService.findRole(tenantId, id);
  }

  @Patch('roles/:id')
  @ApiOperation({ summary: 'Update role' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  updateRole(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateRoleDto: Partial<CreateRoleDto>,
  ) {
    return this.rbacService.updateRole(tenantId, id, updateRoleDto);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Delete role' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  removeRole(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.rbacService.removeRole(tenantId, id);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign role to user' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  assignRole(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() dto: RoleAssignmentDto,
  ) {
    return this.rbacService.assignRole(tenantId, dto.userId, dto.roleId, actor.userId);
  }

  @Post('revoke')
  @ApiOperation({ summary: 'Revoke role from user' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  revokeRole(@TenantId() tenantId: string, @Body() dto: RoleAssignmentDto) {
    return this.rbacService.revokeRole(tenantId, dto.userId, dto.roleId);
  }
}
