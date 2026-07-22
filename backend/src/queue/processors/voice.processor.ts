import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';
import { VoiceCallService } from '../../modules/voice/voice-call.service';

export interface VoiceJobPayload {
  tenantId: string;
  to: string;
  wssUrl: string;
  voiceProfile?: string;
}

@Processor(QUEUE_NAMES.VOICE)
export class VoiceQueueProcessor {
  private readonly logger = new Logger(VoiceQueueProcessor.name);

  constructor(private readonly voiceCallService: VoiceCallService) {}

  @Process(JOB_NAMES.PROCESS_VOICE)
  async handleProcessVoice(job: Job<VoiceJobPayload>): Promise<{ callId: string }> {
    const { tenantId, to, wssUrl, voiceProfile } = job.data;
    this.logger.log(`Processing voice job ${job.id} to ${to} for tenant ${tenantId}`);

    const call = await this.voiceCallService.initiateOutbound(tenantId, {
      to,
      wssUrl,
      voiceProfile,
    });

    return { callId: call.id };
  }
}
