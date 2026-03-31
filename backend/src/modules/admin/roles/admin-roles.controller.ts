import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminRolesService } from './admin-roles.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/roles')
export class AdminRolesController {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  async findAll() {
    const data = await this.adminRolesService.findAll();
    return {
      status: 200,
      message: 'Roles retrieved',
      error: false,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role details' })
  async findOne(@Param('id') id: string) {
    const data = await this.adminRolesService.findOne(id);
    return {
      status: 200,
      message: 'Role retrieved',
      error: false,
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async create(@Body() body: any) {
    const data = await this.adminRolesService.create(body);
    return {
      status: 201,
      message: 'Role created',
      error: false,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.adminRolesService.update(id, body);
    return {
      status: 200,
      message: 'Role updated',
      error: false,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  async remove(@Param('id') id: string) {
    await this.adminRolesService.remove(id);
    return {
      status: 200,
      message: 'Role deleted',
      error: false,
      data: null,
    };
  }
}
