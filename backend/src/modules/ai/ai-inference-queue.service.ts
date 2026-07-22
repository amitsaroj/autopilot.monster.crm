import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import { AiInferenceJobPayload } from '../../queue/processors/ai-inference.processor';

@Injectable()
export class AiInferenceQueueService {
  constructor(
    @InjectQueue(QUEUE_NAMES.AI_INFERENCE)
    private readonly aiInferenceQueue: Queue<AiInferenceJobPayload>,
  ) {}

  enqueue(
    tenantId: string,
    prompt: string,
    options?: { model?: string; context?: Record<string, unknown> },
  ) {
    return this.aiInferenceQueue.add(JOB_NAMES.RUN_INFERENCE, {
      tenantId,
      prompt,
      model: options?.model,
      context: options?.context,
    });
  }
}
