import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Developer - Webhooks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('developer/webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @ApiOperation({ summary: 'Register a webhook endpoint' })
  async create(@TenantId() tenantId: string, @Body() dto: any) {
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
    return this.webhookService.getDeliveries(tenantId, id, Number(page) || 1, Number(limit) || 20);
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
  async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.webhookService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a webhook' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.webhookService.remove(tenantId, id);
  }
}
