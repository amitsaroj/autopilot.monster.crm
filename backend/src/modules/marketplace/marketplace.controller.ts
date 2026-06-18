import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';
import { MarketplaceService } from './marketplace.service';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  @ApiOperation({ summary: 'Public app directory' })
  async listApps() {
    const data = await this.marketplaceService.listApps();
    return { status: 200, message: 'Apps retrieved', error: false, data };
  }

  @Get('installed')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Installed apps for tenant' })
  async listInstalled(@TenantId() tenantId: string) {
    const data = await this.marketplaceService.listInstalled(tenantId);
    return { status: 200, message: 'Installed apps retrieved', error: false, data };
  }

  @Get('apps')
  @ApiOperation({ summary: 'Get all marketplace apps (legacy path)' })
  async getApps() {
    return this.listApps();
  }

  @Get(':id')
  @ApiOperation({ summary: 'App detail' })
  async getApp(@Param('id') id: string) {
    const data = await this.marketplaceService.getApp(id);
    return { status: 200, message: 'App retrieved', error: false, data };
  }

  @Post(':id/install')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Install marketplace app' })
  async installApp(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.marketplaceService.install(tenantId, id);
    return { status: 201, message: 'App installed', error: false, data };
  }

  @Post('install/:appId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Install marketplace app (legacy path)' })
  async installAppLegacy(@TenantId() tenantId: string, @Param('appId') appId: string) {
    return this.installApp(tenantId, appId);
  }

  @Delete(':id/uninstall')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Uninstall marketplace app' })
  async uninstallApp(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.marketplaceService.uninstall(tenantId, id);
    return { status: 200, message: 'App uninstalled', error: false, data: null };
  }
}
