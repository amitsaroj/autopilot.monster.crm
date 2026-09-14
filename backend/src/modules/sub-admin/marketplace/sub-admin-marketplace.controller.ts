import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminMarketplaceService } from './sub-admin-marketplace.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId, ResourcePermissions } from '../../../common/decorators';

@ApiTags('SubAdmin / Marketplace')
@ApiBearerAuth()
@ResourcePermissions('marketplace')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/marketplace')
export class SubAdminMarketplaceController {
  constructor(private readonly marketplaceService: SubAdminMarketplaceService) {}

  @Get('discover')
  @ApiOperation({ summary: 'Discover available marketplace items' })
  async discover(@TenantId() tenantId: string) {
    return await this.marketplaceService.discover(tenantId);
  }

  @Post('install/:itemId')
  @ApiOperation({ summary: 'Install a marketplace item' })
  async install(@TenantId() tenantId: string, @Param('itemId') itemId: string) {
    return await this.marketplaceService.install(tenantId, itemId);
  }
}
