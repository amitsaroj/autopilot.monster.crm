import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPermissionsService } from './admin-permissions.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Permissions')
@ResourcePermissions('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/permissions')
export class AdminPermissionsController {
  constructor(private readonly adminPermissionsService: AdminPermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  async findAll() {
    return await this.adminPermissionsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  async create(@Body() body: any) {
    return await this.adminPermissionsService.create(body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission' })
  async remove(@Param('id') id: string) {
    await this.adminPermissionsService.remove(id);
    return null;
  }
}
