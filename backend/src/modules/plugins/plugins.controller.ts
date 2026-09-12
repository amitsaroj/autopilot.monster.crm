import { Controller, Get, Post, Param, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions } from '../../common/decorators';
import { PluginsService } from './plugins.service';

@ApiTags('Plugins')
@ResourcePermissions('plugins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get()
  @ApiOperation({ summary: 'Get installed plugins' })
  async getPlugins(@TenantId() tenantId: string) {
    return await this.pluginsService.listInstalled(tenantId);
  }

  @Post('enable/:id')
  @ApiOperation({ summary: 'Enable a plugin' })
  async enablePlugin(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.pluginsService.enable(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disable a plugin' })
  async removePlugin(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.pluginsService.disable(tenantId, id);
    return null;
  }
}
