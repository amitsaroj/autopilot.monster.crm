import { Controller, Post, Get, Body, Param, Delete, Patch, UseGuards, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { VoiceCallService } from './voice-call.service';
import { VoiceCampaignService } from './voice-campaign.service';
import { CallDto, SynthesizeDto } from './dto/voice.dto';
import { CreateVoiceCampaignDto, UpdateVoiceCampaignDto } from './dto/voice-campaign.dto';
import { ProvisionPhoneNumberDto } from './dto/voice-phone-number.dto';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId } from '../../common/decorators';

@ApiTags('Voice Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('voice')
export class VoiceController {
  constructor(
    private readonly voiceCallService: VoiceCallService,
    private readonly voiceCampaignService: VoiceCampaignService,
    private readonly voicePhoneNumberService: VoicePhoneNumberService,
  ) {}

  @Get('calls')
  @ApiOperation({ summary: 'List voice calls' })
  async listCalls(@TenantId() tenantId: string) {
    const data = await this.voiceCallService.findAll(tenantId);
    return { status: 200, message: 'Calls retrieved', error: false, data };
  }

  @Post('calls')
  @ApiOperation({ summary: 'Initiate an outbound AI call' })
  async initiateCall(@TenantId() tenantId: string, @Body() dto: CallDto) {
    const wssUrl = `wss://api.autopilot.monster/voice/stream?tenantId=${tenantId}`;
    const data = await this.voiceCallService.initiateOutbound(tenantId, {
      to: dto.to,
      wssUrl,
    });
    return { status: 201, message: 'Call initiated', error: false, data };
  }

  @Post('call')
  @ApiOperation({ summary: 'Initiate an outbound AI call (legacy path)' })
  async initiateCallLegacy(@TenantId() tenantId: string, @Body() dto: CallDto) {
    return this.initiateCall(tenantId, dto);
  }

  @Get('calls/:id')
  @ApiOperation({ summary: 'Get call details' })
  async getCall(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.voiceCallService.findOne(tenantId, id);
    return { status: 200, message: 'Call retrieved', error: false, data };
  }

  @Delete('calls/:id/hang-up')
  @ApiOperation({ summary: 'End an active call' })
  async hangUp(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.voiceCallService.hangUp(tenantId, id);
    return { status: 200, message: 'Call ended', error: false, data };
  }

  @Get('calls/:id/recording')
  @ApiOperation({ summary: 'Get call recording URL' })
  async getRecording(@TenantId() tenantId: string, @Param('id') id: string) {
    const call = await this.voiceCallService.findOne(tenantId, id);
    const data = this.voiceCallService.getRecordingUrl(call);
    return { status: 200, message: 'Recording URL retrieved', error: false, data };
  }

  @Get('calls/:id/transcript')
  @ApiOperation({ summary: 'Get call transcript' })
  async getTranscript(@TenantId() tenantId: string, @Param('id') id: string) {
    const call = await this.voiceCallService.findOne(tenantId, id);
    const data = this.voiceCallService.getTranscript(call);
    return { status: 200, message: 'Transcript retrieved', error: false, data };
  }

  @Post('synthesize')
  @ApiOperation({ summary: 'Convert text to speech' })
  async synthesize(@Body() dto: SynthesizeDto, @Res() res: Response) {
    res.json({
      status: 200,
      message: 'Synthesis queued',
      error: false,
      data: { text: dto.text, voice: dto.voice ?? 'default' },
    });
  }

  @Post('transcribe')
  @ApiOperation({ summary: 'Convert audio to text' })
  async transcribe(@Body() dto: { audioUrl?: string }) {
    if (!dto.audioUrl) {
      throw new NotFoundException('audioUrl is required');
    }
    return {
      status: 200,
      message: 'Transcription pending',
      error: false,
      data: { text: null, audioUrl: dto.audioUrl },
    };
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'List voice campaigns' })
  async listCampaigns(@TenantId() tenantId: string) {
    const data = await this.voiceCampaignService.findAll(tenantId);
    return { status: 200, message: 'Campaigns retrieved', error: false, data };
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create voice campaign' })
  async createCampaign(@TenantId() tenantId: string, @Body() dto: CreateVoiceCampaignDto) {
    const data = await this.voiceCampaignService.create(tenantId, dto);
    return { status: 201, message: 'Campaign created', error: false, data };
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get voice campaign detail' })
  async getCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.voiceCampaignService.findOne(tenantId, id);
    return { status: 200, message: 'Campaign retrieved', error: false, data };
  }

  @Patch('campaigns/:id')
  @ApiOperation({ summary: 'Update voice campaign' })
  async updateCampaign(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVoiceCampaignDto,
  ) {
    const data = await this.voiceCampaignService.update(tenantId, id, dto);
    return { status: 200, message: 'Campaign updated', error: false, data };
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete voice campaign' })
  async deleteCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.voiceCampaignService.remove(tenantId, id);
    return { status: 200, message: 'Campaign deleted', error: false, data: null };
  }

  @Post('campaigns/:id/start')
  @ApiOperation({ summary: 'Start voice campaign' })
  async startCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.voiceCampaignService.start(tenantId, id);
    return { status: 200, message: 'Campaign started', error: false, data };
  }

  @Post('campaigns/:id/pause')
  @ApiOperation({ summary: 'Pause voice campaign' })
  async pauseCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.voiceCampaignService.pause(tenantId, id);
    return { status: 200, message: 'Campaign paused', error: false, data };
  }

  @Post('campaigns/:id/resume')
  @ApiOperation({ summary: 'Resume voice campaign' })
  async resumeCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.voiceCampaignService.resume(tenantId, id);
    return { status: 200, message: 'Campaign resumed', error: false, data };
  }

  @Get('campaigns/:id/stats')
  @ApiOperation({ summary: 'Get voice campaign stats' })
  async getCampaignStats(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.voiceCampaignService.getStats(tenantId, id);
    return { status: 200, message: 'Campaign stats retrieved', error: false, data };
  }

  @Get('phone-numbers')
  @ApiOperation({ summary: 'List provisioned phone numbers' })
  async listPhoneNumbers(@TenantId() tenantId: string) {
    const data = await this.voicePhoneNumberService.findAll(tenantId);
    return { status: 200, message: 'Phone numbers retrieved', error: false, data };
  }

  @Post('phone-numbers')
  @ApiOperation({ summary: 'Provision phone number' })
  async provisionPhoneNumber(@TenantId() tenantId: string, @Body() dto: ProvisionPhoneNumberDto) {
    const data = await this.voicePhoneNumberService.provision(tenantId, dto);
    return { status: 201, message: 'Phone number provisioned', error: false, data };
  }

  @Delete('phone-numbers/:id')
  @ApiOperation({ summary: 'Release phone number' })
  async releasePhoneNumber(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.voicePhoneNumberService.release(tenantId, id);
    return { status: 200, message: 'Phone number released', error: false, data: null };
  }
}
