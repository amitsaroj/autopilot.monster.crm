import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, InviteUserDto } from './dto/users.dto';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards';
import { Roles, TenantId, CurrentUser, ResourcePermissions } from '../../common/decorators';
import { IRequestContext } from '../../common/interfaces/request-context.interface';

@ApiTags('Users')
@ResourcePermissions('users')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all team members' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async findAll(@TenantId() tenantId: string) {
    return await this.usersService.findAll(tenantId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@TenantId() tenantId: string, @CurrentUser() user: IRequestContext) {
    return await this.usersService.findOne(user.userId, tenantId);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite a new member' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async invite(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    return await this.usersService.inviteUser(tenantId, actor.userId, inviteUserDto);
  }

  // --- Team Groups (static paths MUST precede :id) ---
  @Get('groups')
  @ApiOperation({ summary: 'Get all team groups' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getGroups(@TenantId() tenantId: string) {
    return await this.usersService.findAllGroups(tenantId);
  }

  @Post('groups')
  @ApiOperation({ summary: 'Create team group' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createGroup(@TenantId() tenantId: string, @Body() dto: any) {
    return await this.usersService.createGroup(tenantId, dto);
  }

  @Get('groups/:id')
  @ApiOperation({ summary: 'Get team group details' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getGroup(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.usersService.findOneGroup(id, tenantId);
  }

  @Patch('groups/:id')
  @ApiOperation({ summary: 'Update team group' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateGroup(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return await this.usersService.updateGroup(id, tenantId, dto);
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'Delete team group' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async removeGroup(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.usersService.removeGroup(id, tenantId);
    return null;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.usersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile/status' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async update(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, tenantId, updateUserDto, actor.userId);
  }
}
