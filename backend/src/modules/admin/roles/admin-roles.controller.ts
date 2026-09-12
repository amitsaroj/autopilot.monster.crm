import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminRolesService } from './admin-roles.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Roles')
@ResourcePermissions('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/roles')
export class AdminRolesController {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  async findAll() {
    return await this.adminRolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role details' })
  async findOne(@Param('id') id: string) {
    return await this.adminRolesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async create(@Body() body: any) {
    return await this.adminRolesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.adminRolesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  async remove(@Param('id') id: string) {
    await this.adminRolesService.remove(id);
    return null;
  }
}
