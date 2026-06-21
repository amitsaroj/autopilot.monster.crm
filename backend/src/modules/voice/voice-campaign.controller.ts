import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VoiceCampaignService } from './voice-campaign.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Voice Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('voice/campaigns')
export class VoiceCampaignController {
  constructor(private readonly campaignService: VoiceCampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Create outbound voice campaign' })
  async create(@TenantId() tenantId: string, @Body() dto: any) {
    return this.campaignService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all voice campaigns' })
  async findAll(@TenantId() tenantId: string) {
    return this.campaignService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign details' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.campaignService.findOne(tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get campaign statistics' })
  async getStats(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.campaignService.getStats(tenantId, id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a campaign' })
  async start(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.campaignService.start(tenantId, id);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause a running campaign' })
  async pause(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.campaignService.pause(tenantId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a campaign' })
  async cancel(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.campaignService.cancel(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign settings' })
  async update(@TenantId() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.campaignService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a campaign' })
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.campaignService.remove(tenantId, id);
  }
}
