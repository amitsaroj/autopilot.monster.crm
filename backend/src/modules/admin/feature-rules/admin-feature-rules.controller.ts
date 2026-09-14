import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminFeatureRulesService } from './admin-feature-rules.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Feature Rules')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/feature-rules')
export class AdminFeatureRulesController {
  constructor(private readonly featureRulesService: AdminFeatureRulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get global feature rules' })
  async getSettings() {
    return await this.featureRulesService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global feature rules' })
  async updateSettings(@Body() settings: any) {
    return await this.featureRulesService.updateSettings(settings);
  }
}
