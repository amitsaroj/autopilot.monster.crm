import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPermissionsService } from './admin-permissions.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/permissions')
export class AdminPermissionsController {
  constructor(private readonly adminPermissionsService: AdminPermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  async findAll() {
    const data = await this.adminPermissionsService.findAll();
    return {
      status: 200,
      message: 'Permissions retrieved',
      error: false,
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  async create(@Body() body: any) {
    const data = await this.adminPermissionsService.create(body);
    return {
      status: 201,
      message: 'Permission created',
      error: false,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission' })
  async remove(@Param('id') id: string) {
    await this.adminPermissionsService.remove(id);
    return {
      status: 200,
      message: 'Permission deleted',
      error: false,
      data: null,
    };
  }
}
