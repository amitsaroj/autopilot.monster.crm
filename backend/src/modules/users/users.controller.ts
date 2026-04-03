import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, InviteUserDto } from './dto/users.dto';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards';
import { Roles, TenantId, CurrentUser } from '../../common/decorators';
import { IRequestContext } from '../../common/interfaces/request-context.interface';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all team members' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async findAll(@TenantId() tenantId: string) {
    const data = await this.usersService.findAll(tenantId);
    return {
      status: 200,
      message: 'Team members retrieved',
      error: false,
      data,
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@TenantId() tenantId: string, @CurrentUser() user: IRequestContext) {
    const data = await this.usersService.findOne(user.userId, tenantId);
    return {
      status: 200,
      message: 'Profile retrieved',
      error: false,
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.usersService.findOne(id, tenantId);
    return {
      status: 200,
      message: 'User retrieved',
      error: false,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile/status' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.usersService.update(id, tenantId, updateUserDto);
    return {
      status: 200,
      message: 'User updated successfully',
      error: false,
      data,
    };
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite a new member' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async invite(
    @TenantId() tenantId: string,
    @CurrentUser() actor: IRequestContext,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    const data = await this.usersService.inviteUser(tenantId, actor.userId, inviteUserDto);
    return {
      status: 201,
      message: 'Invitation sent successfully',
      error: false,
      data,
    };
  }

  // --- Team Groups ---
  @Get('groups')
  @ApiOperation({ summary: 'Get all team groups' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getGroups(@TenantId() tenantId: string) {
    const data = await this.usersService.findAllGroups(tenantId);
    return {
      status: 200,
      message: 'Team groups retrieved',
      error: false,
      data,
    };
  }

  @Post('groups')
  @ApiOperation({ summary: 'Create team group' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async createGroup(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.usersService.createGroup(tenantId, dto);
    return {
      status: 201,
      message: 'Team group created',
      error: false,
      data,
    };
  }

  @Get('groups/:id')
  @ApiOperation({ summary: 'Get team group details' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN', 'USER')
  async getGroup(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.usersService.findOneGroup(id, tenantId);
    return {
      status: 200,
      message: 'Team group retrieved',
      error: false,
      data,
    };
  }

  @Patch('groups/:id')
  @ApiOperation({ summary: 'Update team group' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateGroup(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    const data = await this.usersService.updateGroup(id, tenantId, dto);
    return {
      status: 200,
      message: 'Team group updated',
      error: false,
      data,
    };
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'Delete team group' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async removeGroup(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.usersService.removeGroup(id, tenantId);
    return {
      status: 200,
      message: 'Team group deleted',
      error: false,
      data: null,
    };
  }
}
