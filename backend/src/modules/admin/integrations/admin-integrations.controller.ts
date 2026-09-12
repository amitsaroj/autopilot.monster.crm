import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminIntegrationsService } from './admin-integrations.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, ResourcePermissions } from '../../../common/decorators';

@ApiTags('Admin / Global Integrations')
@ResourcePermissions('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('admin/integrations')
export class AdminIntegrationsController {
  constructor(private readonly integrationsService: AdminIntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all global integrations' })
  async findAll() {
    return await this.integrationsService.findAll();
  }

  @Post(':id/config')
  @ApiOperation({ summary: 'Update integration configuration' })
  async updateConfig(@Param('id') id: string, @Body() config: any) {
    return await this.integrationsService.updateConfig(id, config);
  }
}
