import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { JOB_NAMES, QUEUE_NAMES } from '../queue.constants';

export interface SearchIndexJobPayload {
  tenantId: string;
  entityType: string;
  entityId: string;
  operation: 'index' | 'delete' | 'reindex';
  payload?: Record<string, unknown>;
}

@Processor(QUEUE_NAMES.SEARCH_INDEX)
export class SearchIndexQueueProcessor {
  private readonly logger = new Logger(SearchIndexQueueProcessor.name);

  @Process(JOB_NAMES.INDEX_DOCUMENT)
  async handleIndexDocument(job: Job<SearchIndexJobPayload>): Promise<{ status: string }> {
    const { tenantId, entityType, entityId, operation } = job.data;
    this.logger.log(
      `Processing search-index job ${job.id} (${operation} ${entityType}/${entityId}) for tenant ${tenantId}`,
    );

    // Qdrant indexing is not wired to the queue yet; acknowledge so jobs do not stall.
    return { status: 'DEFERRED' };
  }
}
