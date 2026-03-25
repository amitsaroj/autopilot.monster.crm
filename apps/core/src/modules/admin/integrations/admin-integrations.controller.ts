import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminIntegrationsService } from './admin-integrations.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';

@ApiTags('Admin / Global Integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/integrations')
export class AdminIntegrationsController {
  constructor(private readonly integrationsService: AdminIntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all global integrations' })
  async findAll() {
    const data = await this.integrationsService.findAll();
    return { status: 200, message: 'Integrations retrieved', error: false, data };
  }

  @Post(':id/config')
  @ApiOperation({ summary: 'Update integration configuration' })
  async updateConfig(@Param('id') id: string, @Body() config: any) {
    const data = await this.integrationsService.updateConfig(id, config);
    return { status: 200, message: 'Configuration updated', error: false, data };
  }
}
