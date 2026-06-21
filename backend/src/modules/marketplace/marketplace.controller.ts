import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, ResourcePermissions } from '../../common/decorators';
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
  @Public()
  @ApiOperation({ summary: 'Get all marketplace apps (legacy path)' })
  async getApps() {
    return this.listApps();
  }

  @Get(':id')
  @Public()
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

  @Post('vendor/onboard')
  @ApiOperation({ summary: 'Onboard current workspace as a marketplace vendor' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async onboardVendor(
    @TenantId() tenantId: string,
    @Body() details: { companyName: string; contactEmail: string; stripeAccountId?: string },
  ) {
    const result = await this.marketplaceService.onboardVendor(tenantId, details);
    return { status: 200, message: 'Vendor onboarding complete', data: result };
  }

  @Get('vendor/details')
  @ApiOperation({ summary: 'Retrieve vendor details for current workspace' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getVendorDetails(@TenantId() tenantId: string) {
    const result = await this.marketplaceService.getVendorDetails(tenantId);
    return { status: 200, data: result };
  }

  @Post('apps/:appId/purchase')
  @ApiOperation({ summary: 'Record a paid app purchase and allocate revenue share' })
  async recordPurchase(
    @TenantId() tenantId: string,
    @Param('appId') appId: string,
    @Body('amount') amount: number,
  ) {
    const result = await this.marketplaceService.recordPurchase(tenantId, appId, amount);
    return { status: 200, message: 'Purchase registered and revenue share allocated', data: result };
  }

  @Get('vendor/revenue')
  @ApiOperation({ summary: 'Get revenue share and payouts report for vendor' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async getRevenueReport(@TenantId() tenantId: string) {
    const result = await this.marketplaceService.getRevenueReport(tenantId);
    return { status: 200, data: result };
  }
}
