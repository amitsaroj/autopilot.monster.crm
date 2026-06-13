import { Controller, Get, Post, Delete, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, Roles } from '../../common/decorators';

@ApiTags('Marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('v1/marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('apps')
  @ApiOperation({ summary: 'Get all marketplace apps' })
  async getApps(@TenantId() tenantId: string) {
    const apps = await this.marketplaceService.getApps(tenantId);
    return { status: 200, data: apps };
  }

  @Get('apps/:appId')
  @ApiOperation({ summary: 'Get marketplace app details' })
  async getAppDetails(@Param('appId') appId: string) {
    const app = await this.marketplaceService.getAppById(appId);
    return { status: 200, data: app };
  }

  @Get('installed')
  @ApiOperation({ summary: 'Get installed apps for tenant' })
  async getInstalledApps(@TenantId() tenantId: string) {
    const apps = await this.marketplaceService.getInstalledApps(tenantId);
    return { status: 200, data: apps };
  }

  @Post('install/:appId')
  @ApiOperation({ summary: 'Install a marketplace app' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async installApp(@TenantId() tenantId: string, @Param('appId') appId: string) {
    const result = await this.marketplaceService.installApp(tenantId, appId);
    return { status: 201, message: 'App installed successfully', data: result };
  }

  @Delete('uninstall/:appId')
  @ApiOperation({ summary: 'Uninstall a marketplace app' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async uninstallApp(@TenantId() tenantId: string, @Param('appId') appId: string) {
    await this.marketplaceService.uninstallApp(tenantId, appId);
    return { status: 200, message: 'App uninstalled successfully' };
  }

  @Patch(':appId/config')
  @ApiOperation({ summary: 'Update app configuration' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async updateConfig(
    @TenantId() tenantId: string,
    @Param('appId') appId: string,
    @Body() config: Record<string, any>,
  ) {
    const result = await this.marketplaceService.updateAppConfig(tenantId, appId, config);
    return { status: 200, data: result };
  }

  @Patch(':appId/toggle')
  @ApiOperation({ summary: 'Enable or disable an installed app' })
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async toggleApp(
    @TenantId() tenantId: string,
    @Param('appId') appId: string,
    @Body('enabled') enabled: boolean,
  ) {
    const result = await this.marketplaceService.toggleApp(tenantId, appId, enabled);
    return { status: 200, data: result };
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
