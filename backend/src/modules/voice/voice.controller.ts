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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

import { VoiceCallService } from './voice-call.service';
import { VoiceCampaignService } from './voice-campaign.service';
import { VoiceAiService } from './voice-ai.service';
import {
  CallDto,
  CloneVoiceDto,
  SynthesizeDto,
  TranscribeDto,
  TransferCallDto,
  UpdateVoiceSettingsDto,
} from './dto/voice.dto';
import { CreateVoiceCampaignDto, UpdateVoiceCampaignDto } from './dto/voice-campaign.dto';
import { ProvisionPhoneNumberDto, SearchAvailableNumbersDto } from './dto/voice-phone-number.dto';
import { VoicePhoneNumberService } from './voice-phone-number.service';
import { TwilioService } from './twilio.service';
import { JwtAuthGuard, TenantGuard } from '../../common/guards';
import { TenantId, PlanFeature, ResourcePermissions, Public } from '../../common/decorators';
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
    private readonly voiceAiService: VoiceAiService,
    private readonly configOrchestrator: ConfigOrchestratorService,
    private readonly tenantSettingsService: TenantSettingsService,
    private readonly twilioService: TwilioService,
  ) {}

  @Get('calls')
  @ApiOperation({ summary: 'List voice calls' })
  async listCalls(@TenantId() tenantId: string) {
    return await this.voiceCallService.findAll(tenantId);
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
    return await this.voiceCallService.initiateOutbound(tenantId, {
      to: dto.to,
      wssUrl,
      voiceProfile: dto.voice ?? defaultVoice,
    });
  }

  @Post('call')
  @ApiOperation({ summary: 'Initiate an outbound AI call (legacy path)' })
  async initiateCallLegacy(@TenantId() tenantId: string, @Body() dto: CallDto) {
    return this.initiateCall(tenantId, dto);
  }

  @Get('calls/:id')
  @ApiOperation({ summary: 'Get call details' })
  async getCall(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.voiceCallService.findOne(tenantId, id);
  }

  @Delete('calls/:id/hang-up')
  @ApiOperation({ summary: 'End an active call' })
  async hangUp(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.voiceCallService.hangUp(tenantId, id);
  }

  @Post('calls/:id/transfer')
  @ApiOperation({ summary: 'Transfer an active call to another number' })
  async transferCall(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: TransferCallDto,
  ) {
    return await this.voiceCallService.transferCall(tenantId, id, dto.to);
  }

  @Get('calls/:id/recording')
  @ApiOperation({ summary: 'Get call recording URL' })
  async getRecording(@TenantId() tenantId: string, @Param('id') id: string) {
    const call = await this.voiceCallService.findOne(tenantId, id);
    return this.voiceCallService.getRecordingUrl(call);
  }

  @Get('calls/:id/transcript')
  @ApiOperation({ summary: 'Get call transcript' })
  async getTranscript(@TenantId() tenantId: string, @Param('id') id: string) {
    const call = await this.voiceCallService.findOne(tenantId, id);
    return this.voiceCallService.getTranscript(call);
  }

  @Get('calls/:id/summary')
  @ApiOperation({ summary: 'Get AI call summary and sentiment' })
  async getSummary(@TenantId() tenantId: string, @Param('id') id: string) {
    const call = await this.voiceCallService.findOne(tenantId, id);
    return this.voiceCallService.getSummary(call);
  }

  @Post('synthesize')
  @ApiOperation({ summary: 'Convert text to speech' })
  async synthesize(@TenantId() tenantId: string, @Body() dto: SynthesizeDto) {
    return await this.voiceAiService.synthesize(tenantId, dto.text, dto.voice ?? 'alloy');
  }

  @Post('transcribe')
  @ApiOperation({ summary: 'Convert audio to text' })
  async transcribe(@TenantId() tenantId: string, @Body() dto: TranscribeDto) {
    return await this.voiceAiService.transcribe(tenantId, dto.audioUrl);
  }

  @Get('profiles')
  @ApiOperation({ summary: 'List available AI voice profiles' })
  async listProfiles(@TenantId() tenantId: string) {
    const defaultProfile = await this.configOrchestrator.get(
      tenantId,
      'voice_default_profile',
      'shimmer',
    );
    return { profiles: VOICE_PROFILES, defaultProfile };
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get tenant voice settings' })
  async getSettings(@TenantId() tenantId: string) {
    return {
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
    return await this.voiceCampaignService.findAll(tenantId);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create voice campaign' })
  async createCampaign(@TenantId() tenantId: string, @Body() dto: CreateVoiceCampaignDto) {
    return await this.voiceCampaignService.create(tenantId, dto);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get voice campaign detail' })
  async getCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.voiceCampaignService.findOne(tenantId, id);
  }

  @Patch('campaigns/:id')
  @ApiOperation({ summary: 'Update voice campaign' })
  async updateCampaign(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVoiceCampaignDto,
  ) {
    return await this.voiceCampaignService.update(tenantId, id, dto);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete voice campaign' })
  async deleteCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.voiceCampaignService.remove(tenantId, id);
    return null;
  }

  @Post('campaigns/:id/start')
  @ApiOperation({ summary: 'Start voice campaign' })
  async startCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.voiceCampaignService.start(tenantId, id);
  }

  @Post('campaigns/:id/pause')
  @ApiOperation({ summary: 'Pause voice campaign' })
  async pauseCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.voiceCampaignService.pause(tenantId, id);
  }

  @Post('campaigns/:id/resume')
  @ApiOperation({ summary: 'Resume voice campaign' })
  async resumeCampaign(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.voiceCampaignService.resume(tenantId, id);
  }

  @Get('campaigns/:id/stats')
  @ApiOperation({ summary: 'Get voice campaign stats' })
  async getCampaignStats(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.voiceCampaignService.getStats(tenantId, id);
  }

  @Get('phone-numbers/available')
  @ApiOperation({ summary: 'Search available phone numbers' })
  async searchAvailableNumbers(
    @TenantId() tenantId: string,
    @Query() query: SearchAvailableNumbersDto,
  ) {
    return await this.voicePhoneNumberService.searchAvailable(
      tenantId,
      query.country,
      query.areaCode,
    );
  }

  @Get('phone-numbers')
  @ApiOperation({ summary: 'List provisioned phone numbers' })
  async listPhoneNumbers(@TenantId() tenantId: string) {
    return await this.voicePhoneNumberService.findAll(tenantId);
  }

  @Post('phone-numbers')
  @ApiOperation({ summary: 'Provision phone number' })
  async provisionPhoneNumber(@TenantId() tenantId: string, @Body() dto: ProvisionPhoneNumberDto) {
    return await this.voicePhoneNumberService.provision(tenantId, dto);
  }

  @Delete('phone-numbers/:id')
  @ApiOperation({ summary: 'Release phone number' })
  async releasePhoneNumber(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.voicePhoneNumberService.release(tenantId, id);
    return null;
  }

  @Get('transcripts')
  @ApiOperation({ summary: 'List call transcripts' })
  async listTranscripts(@TenantId() tenantId: string) {
    return await this.voiceCallService.findTranscripts(tenantId);
  }

  @Get('transcripts/:id')
  @ApiOperation({ summary: 'Get transcript detail' })
  async getTranscriptDetail(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.voiceCallService.findTranscriptById(tenantId, id);
  }

  @Get('calls/:id/sentiment')
  @ApiOperation({ summary: 'Extract sentiment and keywords from a completed call' })
  async getSentiment(@TenantId() tenantId: string, @Param('id') id: string) {
    return await this.voiceAiService.analyzeSentiment(tenantId, id);
  }

  @Post('clone')
  @ApiOperation({ summary: 'Create a voice clone from sample audio' })
  async cloneVoice(@TenantId() tenantId: string, @Body() dto: CloneVoiceDto) {
    return await this.voiceAiService.cloneVoice(tenantId, dto.sampleUrl);
  }

  @Public()
  @Post('ivr-callback')
  @ApiOperation({ summary: 'Twilio IVR webhook callback' })
  async ivrCallback(@Body() body: Record<string, unknown>, @Res() res: Response) {
    // Generate IVR or route call
    const twiml = this.twilioService.generateIvrTwiml(body);
    res.type('text/xml').send(twiml);
  }
}
