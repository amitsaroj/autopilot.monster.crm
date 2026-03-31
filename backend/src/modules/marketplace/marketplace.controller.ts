import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';

@ApiTags('Marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('marketplace')
export class MarketplaceController {
  @Get('apps')
  @ApiOperation({ summary: 'Get all marketplace apps' })
  getApps() {
    return [];
  }

  @Post('install/:appId')
  @ApiOperation({ summary: 'Install a marketplace app' })
  installApp(@Param('appId') appId: string) {
    return { success: true, appId };
  }
}
