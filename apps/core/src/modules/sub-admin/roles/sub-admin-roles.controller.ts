import { Controller, Get, Post, Body, UseGuards, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminRolesService } from './sub-admin-roles.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/roles')
export class SubAdminRolesController {
  constructor(private readonly rolesService: SubAdminRolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles in tenant' })
  async findAll(@TenantId() tenantId: string) {
    const data = await this.rolesService.findAll(tenantId);
    return { status: 200, message: 'Tenant RBAC manifold synchronized', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom role' })
  async create(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.rolesService.create(tenantId, dto);
    return { status: 201, message: 'Custom RBAC node established', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a custom role' })
  async remove(@TenantId() tenantId: string, @Param('id') roleId: string) {
    await this.rolesService.remove(tenantId, roleId);
    return { status: 200, message: 'RBAC node evicted', error: false };
  }
}
