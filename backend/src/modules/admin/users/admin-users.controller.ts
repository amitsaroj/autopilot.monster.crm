import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Users')
@ResourcePermissions('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users across all tenants' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tenantId', required: false })
  async findAll(@Query('search') search?: string, @Query('tenantId') tenantId?: string) {
    return await this.adminUsersService.findAll({ search, tenantId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  async findOne(@Param('id') id: string) {
    return await this.adminUsersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() body: any) {
    return await this.adminUsersService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user details' })
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.adminUsersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    await this.adminUsersService.remove(id);
    return null;
  }
}
