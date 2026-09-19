import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';
import { VoiceCallService } from '../../modules/voice/voice-call.service';
import { VoiceCampaignService } from '../../modules/voice/voice-campaign.service';
import { VoiceCampaignRecipientRepository } from '../../modules/voice/voice-campaign-recipient.repository';
import { VoiceCampaignRecipientStatus } from '../../database/entities/voice-campaign-recipient.entity';
import { VoiceCampaignStatus } from '../../database/entities/voice-campaign.entity';

export interface VoiceJobPayload {
  tenantId: string;
  campaignId: string;
  recipientId: string;
}

/** Re-check interval when a campaign is already at its concurrency cap. */
const CONCURRENCY_BACKOFF_MS = 5000;

/**
 * All bulk-campaign calls flow through here (single ad-hoc AI calls dial out
 * directly from VoiceController and never touch this queue). One recipient
 * row per job — the concurrency cap and retry scheduling both live in
 * VoiceCampaignService so this processor stays a thin dispatcher.
 */
@Processor(QUEUE_NAMES.VOICE)
export class VoiceQueueProcessor {
  private readonly logger = new Logger(VoiceQueueProcessor.name);

  constructor(
    private readonly voiceCallService: VoiceCallService,
    private readonly voiceCampaignService: VoiceCampaignService,
    private readonly recipientRepository: VoiceCampaignRecipientRepository,
  ) {}

  @Process({ name: JOB_NAMES.PROCESS_VOICE, concurrency: 25 })
  async handleProcessVoice(
    job: Job<VoiceJobPayload>,
  ): Promise<{ callId?: string; skipped?: boolean; requeued?: boolean }> {
    const { tenantId, campaignId, recipientId } = job.data;

    const campaign = await this.voiceCampaignService.findOne(tenantId, campaignId).catch(() => null);
    if (!campaign) {
      return { skipped: true };
    }

    if (campaign.status === VoiceCampaignStatus.PAUSED) {
      this.logger.log(`Skipping recipient ${recipientId}: campaign ${campaignId} is paused`);
      return { skipped: true };
    }
    if (campaign.status !== VoiceCampaignStatus.RUNNING) {
      this.logger.log(
        `Skipping recipient ${recipientId}: campaign ${campaignId} is ${campaign.status}`,
      );
      return { skipped: true };
    }

    const recipient = await this.recipientRepository.findById(tenantId, recipientId);
    if (
      !recipient ||
      ![VoiceCampaignRecipientStatus.QUEUED, VoiceCampaignRecipientStatus.RETRY_PENDING].includes(
        recipient.status,
      )
    ) {
      // Already handled (skipped/cancelled/retried elsewhere) — nothing to do.
      return { skipped: true };
    }

    const acquired = await this.voiceCampaignService.tryAcquireConcurrencySlot(
      campaignId,
      campaign.concurrency,
    );
    if (!acquired) {
      await job.queue.add(job.name, job.data, {
        delay: CONCURRENCY_BACKOFF_MS,
        jobId: `voice-recipient-wait:${recipient.id}:${Date.now()}`,
        removeOnComplete: true,
        removeOnFail: true,
      });
      return { requeued: true };
    }

    recipient.status = VoiceCampaignRecipientStatus.CALLING;
    recipient.attempts += 1;
    recipient.lastAttemptAt = new Date();
    await this.recipientRepository.save(recipient);

    const wssUrl = await this.voiceCallService.buildStreamUrl(tenantId, {
      contactId: recipient.contactId,
      agentId: campaign.agentId,
      script: campaign.script,
      humanTransferNumber: campaign.humanTransferNumber,
    });

    const call = await this.voiceCallService.initiateOutbound(tenantId, {
      to: recipient.phone,
      wssUrl,
      campaignId,
      recipientId: recipient.id,
      // Bulk campaigns dial contacts who never asked for an AI conversation
      // with their voicemail — detect it and, per the campaign's configured
      // voicemailAction, hang up rather than talk to an answering machine.
      machineDetection: true,
    });

    // A provider-side rejection (bad credentials, invalid number, outage)
    // never gets a status webhook — that only fires for calls the provider
    // actually placed — so this is the only place campaign stats find out
    // about it. Anything that did reach the provider updates asynchronously
    // via TwilioController's webhook -> recordCallOutcome instead, which is
    // also where the concurrency slot this call is holding gets released.
    if (call.status === 'FAILED') {
      await this.voiceCampaignService.recordCallOutcome(campaignId, 'FAILED', recipient.id);
    }

    return { callId: call.id };
  }
}
