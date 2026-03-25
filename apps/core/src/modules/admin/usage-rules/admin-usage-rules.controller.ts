import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsageRulesService } from './admin-usage-rules.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Usage Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/usage-rules')
export class AdminUsageRulesController {
  constructor(private readonly usageRulesService: AdminUsageRulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get global usage rules' })
  async getSettings() {
    const data = await this.usageRulesService.getSettings();
    return { status: 200, message: 'Usage rules retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global usage rules' })
  async updateSettings(@Body() settings: any) {
    const data = await this.usageRulesService.updateSettings(settings);
    return { status: 200, message: 'Usage rules updated', error: false, data };
  }
}
