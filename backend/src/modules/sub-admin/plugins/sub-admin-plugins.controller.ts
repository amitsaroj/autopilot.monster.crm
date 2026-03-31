import { Controller, Get, Post, UseGuards, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminPluginsService } from './sub-admin-plugins.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / Plugins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/plugins')
export class SubAdminPluginsController {
  constructor(private readonly pluginsService: SubAdminPluginsService) {}

  @Get()
  @ApiOperation({ summary: 'Get enabled plugins for tenant' })
  async findAll(@TenantId() tenantId: string) {
    const data = await this.pluginsService.findAll(tenantId);
    return { status: 200, message: 'Plugin manifold synchronized', error: false, data };
  }

  @Post(':id/enable')
  @ApiOperation({ summary: 'Enable a plugin for tenant' })
  async enable(@TenantId() tenantId: string, @Param('id') pluginId: string) {
    const data = await this.pluginsService.enable(tenantId, pluginId);
    return { status: 200, message: 'Plugin vector activated', error: false, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disable a plugin for tenant' })
  async disable(@TenantId() tenantId: string, @Param('id') pluginId: string) {
    await this.pluginsService.disable(tenantId, pluginId);
    return { status: 200, message: 'Plugin vector severed', error: false };
  }
}
