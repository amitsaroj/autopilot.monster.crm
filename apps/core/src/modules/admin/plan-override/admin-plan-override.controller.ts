import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPlanOverrideService } from './admin-plan-override.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Plan Overrides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/plan-overrides')
export class AdminPlanOverrideController {
  constructor(private readonly planOverrideService: AdminPlanOverrideService) {}

  @Get()
  @ApiOperation({ summary: 'Get global plan-wide overrides' })
  async getSettings() {
    const data = await this.planOverrideService.getSettings();
    return { status: 200, message: 'Plan overrides retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global plan-wide overrides' })
  async updateSettings(@Body() settings: any) {
    const data = await this.planOverrideService.updateSettings(settings);
    return { status: 200, message: 'Plan overrides updated', error: false, data };
  }
}
