import { Controller, Get, Post, Body, UseGuards, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminUsersService } from './sub-admin-users.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/users')
export class SubAdminUsersController {
  constructor(private readonly usersService: SubAdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users in tenant' })
  async findAll(@TenantId() tenantId: string) {
    const data = await this.usersService.findAll(tenantId);
    return { status: 200, message: 'Tenant users retrieved', error: false, data };
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite a new user to tenant' })
  async invite(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.usersService.invite(tenantId, dto);
    return { status: 201, message: 'User invitation dispatched', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove user from tenant' })
  async remove(@TenantId() tenantId: string, @Param('id') userId: string) {
    await this.usersService.remove(tenantId, userId);
    return { status: 200, message: 'User evicted from tenant boundary', error: false };
  }
}
