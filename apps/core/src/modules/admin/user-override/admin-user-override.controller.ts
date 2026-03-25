import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUserOverrideService } from './admin-user-override.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / User Overrides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/users/:id/overrides')
export class AdminUserOverrideController {
  constructor(private readonly overrideService: AdminUserOverrideService) {}

  @Get()
  @ApiOperation({ summary: 'Get current overrides for a user' })
  async getOverrides(@Param('id') userId: string) {
    const data = await this.overrideService.getOverrides(userId);
    return { status: 200, message: 'Overrides retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Set overrides for a user' })
  async setOverrides(@Param('id') userId: string, @Body() overrides: any) {
    const data = await this.overrideService.setOverrides(userId, overrides);
    return { status: 200, message: 'Overrides saved', error: false, data };
  }
}
