import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPlanOverrideService } from './admin-plan-override.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Plan Overrides')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/plan-overrides')
export class AdminPlanOverrideController {
  constructor(private readonly planOverrideService: AdminPlanOverrideService) {}

  @Get()
  @ApiOperation({ summary: 'Get global plan-wide overrides' })
  async getSettings() {
    return await this.planOverrideService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global plan-wide overrides' })
  async updateSettings(@Body() settings: any) {
    return await this.planOverrideService.updateSettings(settings);
  }
}
