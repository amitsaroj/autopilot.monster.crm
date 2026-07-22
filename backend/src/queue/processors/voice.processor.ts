import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';
import { VoiceCallService } from '../../modules/voice/voice-call.service';
import { VoiceCampaignService } from '../../modules/voice/voice-campaign.service';
import { VoiceCampaignStatus } from '../../database/entities/voice-campaign.entity';

export interface VoiceJobPayload {
  tenantId: string;
  to: string;
  wssUrl: string;
  voiceProfile?: string;
  campaignId?: string;
}

@Processor(QUEUE_NAMES.VOICE)
export class VoiceQueueProcessor {
  private readonly logger = new Logger(VoiceQueueProcessor.name);

  constructor(
    private readonly voiceCallService: VoiceCallService,
    private readonly voiceCampaignService: VoiceCampaignService,
  ) {}

  @Process(JOB_NAMES.PROCESS_VOICE)
  async handleProcessVoice(
    job: Job<VoiceJobPayload>,
  ): Promise<{ callId?: string; skipped?: boolean }> {
    const { tenantId, to, wssUrl, voiceProfile, campaignId } = job.data;
    this.logger.log(`Processing voice job ${job.id} to ${to} for tenant ${tenantId}`);

    if (campaignId) {
      const campaign = await this.voiceCampaignService.findOne(tenantId, campaignId);
      if (campaign.status === VoiceCampaignStatus.PAUSED) {
        this.logger.log(`Skipping voice job ${job.id} because campaign ${campaignId} is paused`);
        return { skipped: true };
      }
      if (campaign.status !== VoiceCampaignStatus.RUNNING) {
        this.logger.log(
          `Skipping voice job ${job.id} because campaign ${campaignId} is ${campaign.status}`,
        );
        return { skipped: true };
      }
    }

    const call = await this.voiceCallService.initiateOutbound(tenantId, {
      to,
      wssUrl,
      voiceProfile,
      campaignId,
    });

    return { callId: call.id };
  }
}
