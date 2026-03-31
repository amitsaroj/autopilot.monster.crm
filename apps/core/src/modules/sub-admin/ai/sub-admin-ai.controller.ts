import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminAiService } from './sub-admin-ai.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/ai')
export class SubAdminAiController {
  constructor(private readonly aiService: SubAdminAiService) {}

  @Get('configs')
  @ApiOperation({ summary: 'Get AI configurations for tenant' })
  async findConfigs(@TenantId() tenantId: string) {
    const data = await this.aiService.findConfigs(tenantId);
    return { status: 200, message: 'AI manifold synchronized', error: false, data };
  }

  @Post('configs')
  @ApiOperation({ summary: 'Update AI configurations' })
  async updateConfig(@TenantId() tenantId: string, @Body() dto: any) {
    const data = await this.aiService.updateConfig(tenantId, dto);
    return { status: 200, message: 'AI vector recalibrated', error: false, data };
  }
}
