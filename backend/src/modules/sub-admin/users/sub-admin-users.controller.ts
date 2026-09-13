import { Controller, Get, Post, Body, UseGuards, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminUsersService } from './sub-admin-users.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId, ResourcePermissions, CurrentUser } from '../../../common/decorators';
import type { IRequestContext } from '../../../common/interfaces/request-context.interface';
import { InviteUserDto } from '../../users/dto/users.dto';

@ApiTags('SubAdmin / Users')
@ApiBearerAuth()
@ResourcePermissions('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/users')
export class SubAdminUsersController {
  constructor(private readonly usersService: SubAdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users in tenant' })
  async findAll(@TenantId() tenantId: string) {
    return await this.usersService.findAll(tenantId);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite a new user to tenant' })
  async invite(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() dto: InviteUserDto,
  ) {
    return await this.usersService.invite(tenantId, actor.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove user from tenant' })
  async remove(@TenantId() tenantId: string, @Param('id') userId: string) {
    await this.usersService.remove(tenantId, userId);
    return null;
  }
}
