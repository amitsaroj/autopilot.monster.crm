import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminFeatureRulesService } from './admin-feature-rules.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Feature Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/feature-rules')
export class AdminFeatureRulesController {
  constructor(private readonly featureRulesService: AdminFeatureRulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get global feature rules' })
  async getSettings() {
    const data = await this.featureRulesService.getSettings();
    return { status: 200, message: 'Feature rules retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global feature rules' })
  async updateSettings(@Body() settings: any) {
    const data = await this.featureRulesService.updateSettings(settings);
    return { status: 200, message: 'Feature rules updated', error: false, data };
  }
}
