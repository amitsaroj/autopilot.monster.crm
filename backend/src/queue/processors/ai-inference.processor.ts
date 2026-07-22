import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { RagService } from '../../modules/ai/rag.service';
import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';

export interface AiInferenceJobPayload {
  tenantId: string;
  prompt: string;
  model?: string;
  context?: Record<string, unknown>;
}

@Processor(QUEUE_NAMES.AI_INFERENCE)
export class AiInferenceQueueProcessor {
  private readonly logger = new Logger(AiInferenceQueueProcessor.name);

  constructor(private readonly ragService: RagService) {}

  @Process(JOB_NAMES.RUN_INFERENCE)
  async handleRunInference(job: Job<AiInferenceJobPayload>): Promise<{ status: string; reply?: string | null }> {
    const { tenantId, prompt, model, context } = job.data;
    this.logger.log(
      `Processing AI inference job ${job.id} for tenant ${tenantId} (model: ${model ?? 'default'})`,
    );

    const reply = await this.ragService.generate(tenantId, prompt, { model, ...context });
    return { status: 'completed', reply };
  }
}
