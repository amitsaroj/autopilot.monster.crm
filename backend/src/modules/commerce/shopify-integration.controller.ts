import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser, Public, ResourcePermissions, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards';
import type { IRequestContext } from '../../common/interfaces/request-context.interface';
import { ConnectShopifyDto } from './shopify.dto';
import { ShopifyIntegrationService } from './shopify-integration.service';

@ApiTags('Commerce / Shopify')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles('TENANT_ADMIN')
@ResourcePermissions('settings')
@Controller('integrations/shopify')
export class ShopifyIntegrationController {
  constructor(private readonly shopify: ShopifyIntegrationService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get safe Shopify connection status for the current tenant' })
  status(@CurrentUser() user: IRequestContext) {
    return this.shopify.status(user.tenantId);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Start the Shopify authorization-code installation flow' })
  connect(@CurrentUser() user: IRequestContext, @Body() dto: ConnectShopifyDto) {
    return this.shopify.beginConnect(user.tenantId, dto.shop);
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Uninstall Shopify integration and erase stored credentials' })
  disconnect(@CurrentUser() user: IRequestContext) {
    return this.shopify.disconnect(user.tenantId);
  }

  @Post('sync-webhooks')
  @ApiOperation({ summary: 'Retry Shopify webhook subscription setup' })
  syncWebhooks(@CurrentUser() user: IRequestContext) {
    return this.shopify.syncWebhooks(user.tenantId);
  }
}

@Controller('integrations/shopify/callback')
export class ShopifyOAuthCallbackController {
  constructor(private readonly shopify: ShopifyIntegrationService) {}

  @Get()
  @Public()
  async callback(@Req() request: Request, @Res() response: Response): Promise<void> {
    const query = new URL(request.originalUrl, 'http://localhost').searchParams;
    response.redirect(await this.shopify.completeCallback(query));
  }
}
