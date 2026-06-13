import {
  Controller, Get, Post, Delete, Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BroadcastService } from './broadcast.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('WhatsApp - Broadcasts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('whatsapp/broadcasts')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Post()
  @ApiOperation({ summary: 'Create a broadcast campaign' })
  async create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.broadcastService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all broadcasts' })
  async findAll(@TenantId() tenantId: string) {
    return this.broadcastService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get broadcast details' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.broadcastService.findOne(tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get broadcast delivery stats' })
  async getStats(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.broadcastService.getStats(tenantId, id);
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Schedule a broadcast' })
  async schedule(@TenantId() tenantId: string, @Param('id') id: string, @Body() body: { scheduledAt: string }) {
    return this.broadcastService.schedule(tenantId, id, new Date(body.scheduledAt));
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send a broadcast immediately' })
  async send(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.broadcastService.send(tenantId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a broadcast' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.broadcastService.remove(tenantId, id);
  }
}
