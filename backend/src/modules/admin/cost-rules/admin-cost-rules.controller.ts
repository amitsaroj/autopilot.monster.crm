import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminCostRulesService } from './admin-cost-rules.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Cost Rules')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/settings/cost-rules')
export class AdminCostRulesController {
  constructor(private readonly costRulesService: AdminCostRulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get global cost/markup rules' })
  async getSettings() {
    return await this.costRulesService.getSettings();
  }

  @Post()
  @ApiOperation({ summary: 'Update global cost/markup rules' })
  async updateSettings(@Body() settings: any) {
    return await this.costRulesService.updateSettings(settings);
  }
}
