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
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Users')
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
    const data = await this.adminUsersService.findAll({ search, tenantId });
    return {
      status: 200,
      message: 'Users retrieved',
      error: false,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  async findOne(@Param('id') id: string) {
    const data = await this.adminUsersService.findOne(id);
    return {
      status: 200,
      message: 'User retrieved',
      error: false,
      data,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() body: any) {
    const data = await this.adminUsersService.create(body);
    return {
      status: 201,
      message: 'User created',
      error: false,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user details' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.adminUsersService.update(id, body);
    return {
      status: 200,
      message: 'User updated',
      error: false,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    await this.adminUsersService.remove(id);
    return {
      status: 200,
      message: 'User deleted',
      error: false,
      data: null,
    };
  }
}
