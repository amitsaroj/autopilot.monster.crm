import { Controller, Get, Post, Delete, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions, Roles } from '../../common/decorators';
import { Public } from '../../common/decorators/public.decorator';
import { MarketplaceService } from './marketplace.service';

@ApiTags('Marketplace')
@ResourcePermissions('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Public app directory' })
  async listApps() {
    return await this.marketplaceService.listApps();
  }

  @Get('installed')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Installed apps for tenant' })
  async listInstalled(@TenantId() tenantId: string) {
    return await this.marketplaceService.listInstalled(tenantId);
  }

  @Get('apps')
  @Public()
  @ApiOperation({ summary: 'Get all marketplace apps (legacy path)' })
  async getApps() {
    return this.listApps();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'App detail' })
  async getApp(@Param('id') id: string) {
    return await this.marketplaceService.getApp(id);
  }

  @Post(':id/install')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiOperation({ summary: 'Install marketplace app' })
  async installApp(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.marketplaceService.install(tenantId, id);
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
    return null;
  }

  @Post('vendor/onboard')
  @ApiOperation({ summary: 'Onboard current workspace as a marketplace vendor' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async onboardVendor(
    @TenantId() tenantId: string,
    @Body() details: { companyName: string; contactEmail: string; stripeAccountId?: string },
  ) {
    return await this.marketplaceService.onboardVendor(tenantId, details);
  }

  @Get('vendor/details')
  @ApiOperation({ summary: 'Retrieve vendor details for current workspace' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getVendorDetails(@TenantId() tenantId: string) {
    return await this.marketplaceService.getVendorDetails(tenantId);
  }

  @Post('apps/:appId/purchase')
  @ApiOperation({ summary: 'Record a paid app purchase and allocate revenue share' })
  async recordPurchase(
    @TenantId() tenantId: string,
    @Param('appId') appId: string,
    @Body('amount') amount: number,
  ) {
    return await this.marketplaceService.recordPurchase(tenantId, appId, amount);
  }

  @Get('vendor/revenue')
  @ApiOperation({ summary: 'Get revenue share and payouts report for vendor' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getRevenueReport(@TenantId() tenantId: string) {
    return await this.marketplaceService.getRevenueReport(tenantId);
  }
}
