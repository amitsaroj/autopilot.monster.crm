import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubAdminMarketplaceService } from './sub-admin-marketplace.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, TenantId } from '../../../common/decorators';

@ApiTags('SubAdmin / Marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sub-admin/marketplace')
export class SubAdminMarketplaceController {
  constructor(private readonly marketplaceService: SubAdminMarketplaceService) {}

  @Get('discover')
  @ApiOperation({ summary: 'Discover available marketplace items' })
  async discover() {
    const data = await this.marketplaceService.discover();
    return { status: 200, message: 'Marketplace discovery synchronized', error: false, data };
  }

  @Post('install/:itemId')
  @ApiOperation({ summary: 'Install a marketplace item' })
  async install(@TenantId() tenantId: string, @Param('itemId') itemId: string) {
    const data = await this.marketplaceService.install(tenantId, itemId);
    return { status: 201, message: 'Marketplace vector deployed', error: false, data };
  }
}
