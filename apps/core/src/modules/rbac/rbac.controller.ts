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
  async findAllPermissions() {
    const data = await this.rbacService.findAllPermissions();
    return {
      status: 200,
      message: 'Permissions retrieved',
      error: false,
      data,
    };
  }
  
  @Post('permissions')
  @ApiOperation({ summary: 'Create a new global permission' })
  @Roles('SUPER_ADMIN')
  async createPermission(@Body() data: any) {
    const result = await this.rbacService.createPermission(data);
    return {
      status: 201,
      message: 'Permission created',
      error: false,
      data: result,
    };
  }

  @Post('roles')
  @ApiOperation({ summary: 'Create a custom role' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createRole(@TenantId() tenantId: string, @Body() createRoleDto: CreateRoleDto) {
    const data = await this.rbacService.createRole(tenantId, createRoleDto);
    return {
      status: 201,
      message: 'Role created',
      error: false,
      data,
    };
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles for the tenant' })
  async findAllRoles(@TenantId() tenantId: string) {
    const data = await this.rbacService.findAllRoles(tenantId);
    return {
      status: 200,
      message: 'Roles retrieved',
      error: false,
      data,
    };
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  async findRole(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.rbacService.findRole(tenantId, id);
    return {
      status: 200,
      message: 'Role retrieved',
      error: false,
      data,
    };
  }

  @Patch('roles/:id')
  @ApiOperation({ summary: 'Update role' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateRole(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateRoleDto: Partial<CreateRoleDto>,
  ) {
    const data = await this.rbacService.updateRole(tenantId, id, updateRoleDto);
    return {
      status: 200,
      message: 'Role updated',
      error: false,
      data,
    };
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Delete role' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async removeRole(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.rbacService.removeRole(tenantId, id);
    return {
      status: 200,
      message: 'Role deleted',
      error: false,
      data: null,
    };
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign role to user' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async assignRole(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() dto: RoleAssignmentDto,
  ) {
    await this.rbacService.assignRole(tenantId, dto.userId, dto.roleId, actor.userId);
    return {
      status: 200,
      message: 'Role assigned successfully',
      error: false,
      data: null,
    };
  }

  @Post('revoke')
  @ApiOperation({ summary: 'Revoke role from user' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async revokeRole(@TenantId() tenantId: string, @Body() dto: RoleAssignmentDto) {
    await this.rbacService.revokeRole(tenantId, dto.userId, dto.roleId);
    return {
      status: 200,
      message: 'Role revoked successfully',
      error: false,
      data: null,
    };
  }
}
