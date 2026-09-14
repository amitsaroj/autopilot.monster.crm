import { Controller, Get, Post, Body, UseGuards, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminIntegrationsService } from './sub-admin-integrations.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId, ResourcePermissions } from '../../../common/decorators';

@ApiTags('SubAdmin / Integrations')
@ApiBearerAuth()
@ResourcePermissions('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/integrations')
export class SubAdminIntegrationsController {
  constructor(private readonly integrationsService: SubAdminIntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active integrations for tenant' })
  async findAll(@TenantId() tenantId: string) {
    return await this.integrationsService.findAll(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Enable a new integration' })
  async create(@TenantId() tenantId: string, @Body() dto: any) {
    return await this.integrationsService.upsert(tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate an integration' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.integrationsService.remove(tenantId, id);
    return null;
  }
}
