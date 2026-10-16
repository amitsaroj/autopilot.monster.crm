import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { ResourcePermissions, Roles, TenantId } from '../../common/decorators';
import { CreateWebhookDto, UpdateWebhookDto } from '../tenant-settings/dto/developer-settings.dto';

@ApiTags('Developer - Webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('settings')
@Roles('TENANT_ADMIN')
@Controller('developer/webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @ApiOperation({ summary: 'Register a webhook endpoint' })
  async create(@TenantId() tenantId: string, @Body() dto: CreateWebhookDto) {
    return this.webhookService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all webhook endpoints' })
  async findAll(@TenantId() tenantId: string) {
    return this.webhookService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook details' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.webhookService.findOne(tenantId, id);
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'Get webhook delivery history' })
  async getDeliveries(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.webhookService.getDeliveries(
      tenantId,
      id,
      page === undefined ? 1 : Number(page),
      limit === undefined ? 20 : Number(limit),
    );
  }

  @Post(':id/deliveries/:deliveryId/replay')
  @ApiOperation({ summary: 'Replay a delivery with a new delivery ID and retry budget' })
  async replay(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Param('deliveryId') deliveryId: string,
    @Headers('idempotency-key') replayRequestKey?: string,
  ) {
    return this.webhookService.replay(tenantId, id, deliveryId, replayRequestKey);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Send a test webhook' })
  async test(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.webhookService.test(tenantId, id);
  }

  @Post(':id/rotate-secret')
  @ApiOperation({ summary: 'Rotate webhook secret' })
  async rotateSecret(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.webhookService.rotateSecret(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a webhook' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWebhookDto,
  ) {
    return this.webhookService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a webhook' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.webhookService.remove(tenantId, id);
  }
}
