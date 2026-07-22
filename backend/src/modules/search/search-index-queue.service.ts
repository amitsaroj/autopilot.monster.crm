import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import type { SearchIndexJobPayload } from '../../queue/processors/search-index.processor';

@Injectable()
export class SearchIndexQueueService {
  private readonly logger = new Logger(SearchIndexQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.SEARCH_INDEX)
    private readonly searchIndexQueue: Queue<SearchIndexJobPayload>,
  ) {}

  async enqueueIndex(
    tenantId: string,
    entityType: string,
    entityId: string,
    operation: SearchIndexJobPayload['operation'] = 'index',
    payload?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.searchIndexQueue.add(JOB_NAMES.INDEX_DOCUMENT, {
        tenantId,
        entityType,
        entityId,
        operation,
        payload,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to enqueue search-index job for ${entityType}/${entityId}: ${message}`,
      );
    }
  }
}
