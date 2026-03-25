import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminCostRulesService } from './admin-cost-rules.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Cost Rules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/cost-rules')
export class AdminCostRulesController {
  constructor(private readonly costRulesService: AdminCostRulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get global cost/markup rules' })
  async getSettings() {
    const data = await this.costRulesService.getSettings();
    return { status: 200, message: 'Cost rules retrieved', error: false, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update global cost/markup rules' })
  async updateSettings(@Body() settings: any) {
    const data = await this.costRulesService.updateSettings(settings);
    return { status: 200, message: 'Cost rules updated', error: false, data };
  }
}
