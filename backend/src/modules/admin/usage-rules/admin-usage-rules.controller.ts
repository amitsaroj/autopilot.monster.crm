import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsageRulesService } from './admin-usage-rules.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Usage Rules')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/usage-rules')
export class AdminUsageRulesController {
  constructor(private readonly usageRulesService: AdminUsageRulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get global usage rules' })
  async getSettings() {
    return await this.usageRulesService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global usage rules' })
  async updateSettings(@Body() settings: any) {
    return await this.usageRulesService.updateSettings(settings);
  }
}
