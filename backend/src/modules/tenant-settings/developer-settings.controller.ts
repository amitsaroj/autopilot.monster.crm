import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { DeveloperSettingsService } from './developer-settings.service';
import { CreateApiKeyDto, CreateWebhookDto, UpdateWebhookDto, CreateOAuthAppDto } from './dto/developer-settings.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards';
import { IRequestContext } from '../../common/interfaces/request-context.interface';

@ApiTags('Settings / Developer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles('TENANT_ADMIN')
@Controller('settings')
export class DeveloperSettingsController {
  constructor(private readonly developerSettingsService: DeveloperSettingsService) {}

  @Get('api-keys')
  @ApiOperation({ summary: 'List API keys for the workspace' })
  async listApiKeys(@CurrentUser() user: IRequestContext) {
    const data = await this.developerSettingsService.listApiKeys(user.tenantId);
    return { status: 200, message: 'API keys retrieved', error: false, data };
  }

  @Post('api-keys')
  @ApiOperation({ summary: 'Create a new API key' })
  async createApiKey(@CurrentUser() user: IRequestContext, @Body() dto: CreateApiKeyDto) {
    const data = await this.developerSettingsService.createApiKey(
      user.tenantId,
      user.userId,
      dto,
    );
    return { status: 201, message: 'API key created', error: false, data };
  }

  @Delete('api-keys/:id')
  @ApiOperation({ summary: 'Revoke an API key' })
  async revokeApiKey(@CurrentUser() user: IRequestContext, @Param('id') id: string) {
    await this.developerSettingsService.revokeApiKey(user.tenantId, id);
    return { status: 200, message: 'API key revoked', error: false, data: null };
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'List outbound webhooks' })
  async listWebhooks(@CurrentUser() user: IRequestContext) {
    const data = await this.developerSettingsService.listWebhooks(user.tenantId);
    return { status: 200, message: 'Webhooks retrieved', error: false, data };
  }

  @Post('webhooks')
  @ApiOperation({ summary: 'Create an outbound webhook' })
  async createWebhook(@CurrentUser() user: IRequestContext, @Body() dto: CreateWebhookDto) {
    const data = await this.developerSettingsService.createWebhook(user.tenantId, dto);
    return { status: 201, message: 'Webhook created', error: false, data };
  }

  @Patch('webhooks/:id')
  @ApiOperation({ summary: 'Update a webhook' })
  async updateWebhook(
    @CurrentUser() user: IRequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
  ) {
    const data = await this.developerSettingsService.updateWebhook(user.tenantId, id, dto);
    return { status: 200, message: 'Webhook updated', error: false, data };
  }

  @Delete('webhooks/:id')
  @ApiOperation({ summary: 'Delete a webhook' })
  async deleteWebhook(@CurrentUser() user: IRequestContext, @Param('id') id: string) {
    await this.developerSettingsService.deleteWebhook(user.tenantId, id);
    return { status: 200, message: 'Webhook deleted', error: false, data: null };
  }

  @Post('webhooks/:id/test')
  @ApiOperation({ summary: 'Send a test payload to a webhook' })
  async testWebhook(@CurrentUser() user: IRequestContext, @Param('id') id: string) {
    const data = await this.developerSettingsService.testWebhook(user.tenantId, id);
    return { status: 200, message: 'Webhook test completed', error: false, data };
  }

  @Get('oauth-apps')
  @ApiOperation({ summary: 'List OAuth applications' })
  async listOAuthApps(@CurrentUser() user: IRequestContext) {
    const data = await this.developerSettingsService.listOAuthApps(user.tenantId);
    return { status: 200, message: 'OAuth apps retrieved', error: false, data };
  }

  @Post('oauth-apps')
  @ApiOperation({ summary: 'Create OAuth application' })
  async createOAuthApp(@CurrentUser() user: IRequestContext, @Body() dto: CreateOAuthAppDto) {
    const data = await this.developerSettingsService.createOAuthApp(user.tenantId, dto);
    return { status: 201, message: 'OAuth app created', error: false, data };
  }

  @Delete('oauth-apps/:id')
  @ApiOperation({ summary: 'Revoke OAuth application' })
  async revokeOAuthApp(@CurrentUser() user: IRequestContext, @Param('id') id: string) {
    await this.developerSettingsService.revokeOAuthApp(user.tenantId, id);
    return { status: 200, message: 'OAuth app revoked', error: false, data: null };
  }
}
