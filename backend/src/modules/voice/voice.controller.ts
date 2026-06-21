import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Res,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { VoiceCallService } from './voice-call.service';
import { VoiceCampaignService } from './voice-campaign.service';
import {
  CallDto,
  SynthesizeDto,
  TransferCallDto,
  UpdateVoiceSettingsDto,
} from './dto/voice.dto';
import { CreateVoiceCampaignDto, UpdateVoiceCampaignDto } from './dto/voice-campaign.dto';
import { ProvisionPhoneNumberDto, SearchAvailableNumbersDto } from './dto/voice-phone-number.dto';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, PlanFeature, ResourcePermissions } from '../../common/decorators';
import { ConfigOrchestratorService } from '../tenant-settings/config-orchestrator.service';
import { TenantSettingsService } from '../tenant-settings/tenant-settings.service';

const VOICE_PROFILES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'];

@ApiTags('Voice Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@ResourcePermissions('voice')
@PlanFeature('voice')
@Controller('voice')
export class VoiceController {
  constructor(
    private readonly voiceCallService: VoiceCallService,
    private readonly voiceCampaignService: VoiceCampaignService,
    private readonly voicePhoneNumberService: VoicePhoneNumberService,
    private readonly configOrchestrator: ConfigOrchestratorService,
    private readonly tenantSettingsService: TenantSettingsService,
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
    const defaultVoice = await this.configOrchestrator.get(
      tenantId,
      'voice_default_profile',
      'shimmer',
    );
    const wssUrl = this.voiceCallService.buildStreamUrl(tenantId, {
      agentId: dto.agentId,
      leadId: dto.leadId,
      voice: dto.voice ?? defaultVoice,
    });
    const data = await this.voiceCallService.initiateOutbound(tenantId, {
      to: dto.to,
      wssUrl,
      voiceProfile: dto.voice ?? defaultVoice,
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

  @Post('calls/:id/transfer')
  @ApiOperation({ summary: 'Transfer an active call to another number' })
  async transferCall(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: TransferCallDto,
  ) {
    const data = await this.voiceCallService.transferCall(tenantId, id, dto.to);
    return { status: 200, message: 'Call transfer initiated', error: false, data };
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

  @Get('calls/:id/summary')
  @ApiOperation({ summary: 'Get AI call summary and sentiment' })
  async getSummary(@TenantId() tenantId: string, @Param('id') id: string) {
    const call = await this.voiceCallService.findOne(tenantId, id);
    const data = this.voiceCallService.getSummary(call);
    return { status: 200, message: 'Call summary retrieved', error: false, data };
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

  @Get('profiles')
  @ApiOperation({ summary: 'List available AI voice profiles' })
  async listProfiles(@TenantId() tenantId: string) {
    const defaultProfile = await this.configOrchestrator.get(
      tenantId,
      'voice_default_profile',
      'shimmer',
    );
    return {
      status: 200,
      message: 'Voice profiles retrieved',
      error: false,
      data: { profiles: VOICE_PROFILES, defaultProfile },
    };
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get tenant voice settings' })
  async getSettings(@TenantId() tenantId: string) {
    const data = {
      twilio_account_sid: await this.configOrchestrator.get(tenantId, 'twilio_account_sid', ''),
      twilio_auth_token: await this.configOrchestrator.get(tenantId, 'twilio_auth_token', ''),
      twilio_phone_number: await this.configOrchestrator.get(tenantId, 'twilio_phone_number', ''),
      voice_default_profile: await this.configOrchestrator.get(
        tenantId,
        'voice_default_profile',
        'shimmer',
      ),
      voice_routing_number: await this.configOrchestrator.get(tenantId, 'voice_routing_number', ''),
    };
    return { status: 200, message: 'Voice settings retrieved', error: false, data };
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update tenant voice settings' })
  async updateSettings(@TenantId() tenantId: string, @Body() dto: UpdateVoiceSettingsDto) {
    const entries: Array<{ key: keyof UpdateVoiceSettingsDto; group: string }> = [
      { key: 'twilio_account_sid', group: 'voice' },
      { key: 'twilio_auth_token', group: 'voice' },
      { key: 'twilio_phone_number', group: 'voice' },
      { key: 'voice_default_profile', group: 'voice' },
      { key: 'voice_routing_number', group: 'voice' },
    ];

    for (const entry of entries) {
      const value = dto[entry.key];
      if (value !== undefined) {
        await this.tenantSettingsService.updateSetting(tenantId, {
          key: entry.key,
          value,
          group: entry.group,
        });
      }
    }

    return this.getSettings(tenantId);
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

  @Get('phone-numbers/available')
  @ApiOperation({ summary: 'Search available phone numbers' })
  async searchAvailableNumbers(
    @TenantId() tenantId: string,
    @Query() query: SearchAvailableNumbersDto,
  ) {
    const data = await this.voicePhoneNumberService.searchAvailable(
      tenantId,
      query.country,
      query.areaCode,
    );
    return { status: 200, message: 'Available numbers retrieved', error: false, data };
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

  @Get('transcripts')
  @ApiOperation({ summary: 'List call transcripts' })
  async listTranscripts(@TenantId() tenantId: string) {
    const data = await this.voiceCallService.findTranscripts(tenantId);
    return { status: 200, message: 'Transcripts retrieved', error: false, data };
  }

  @Get('transcripts/:id')
  @ApiOperation({ summary: 'Get transcript detail' })
  async getTranscriptDetail(@TenantId() tenantId: string, @Param('id') id: string) {
    const data = await this.voiceCallService.findTranscriptById(tenantId, id);
    return { status: 200, message: 'Transcript retrieved', error: false, data };
  }

  @Get('calls/:id/sentiment')
  @ApiOperation({ summary: 'Extract sentiment and keywords from a completed call' })
  async getSentiment(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.twilioService.extractSentimentStub(id, tenantId);
  }

  @Post('clone')
  @ApiOperation({ summary: 'Create a voice clone from sample audio' })
  async cloneVoice(@TenantId() tenantId: string, @Body() dto: { sampleUrl: string }) {
    const voiceId = await this.twilioService.cloneVoiceStub(tenantId, dto.sampleUrl);
    return { success: true, voiceId };
  }

  @Post('ivr-callback')
  @ApiOperation({ summary: 'Twilio IVR webhook callback' })
  async ivrCallback(@Body() body: Record<string, any>, @Res() res: Response) {
    // Generate IVR or route call
    const twiml = this.twilioService.generateIvrTwiml(body);
    res.type('text/xml').send(twiml);
  }
}
