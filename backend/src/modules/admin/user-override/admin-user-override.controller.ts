import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUserOverrideService } from './admin-user-override.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / User Overrides')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/users/:id/overrides')
export class AdminUserOverrideController {
  constructor(private readonly overrideService: AdminUserOverrideService) {}

  @Get()
  @ApiOperation({ summary: 'Get current overrides for a user' })
  async getOverrides(@Param('id') userId: string) {
    return await this.overrideService.getOverrides(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Set overrides for a user' })
  async setOverrides(@Param('id') userId: string, @Body() overrides: any) {
    return await this.overrideService.setOverrides(userId, overrides);
  }
}
