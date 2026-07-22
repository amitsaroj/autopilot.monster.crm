import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

import { SearchService } from '../../modules/search/search.service';
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

  constructor(private readonly searchService: SearchService) {}

  @Process(JOB_NAMES.INDEX_DOCUMENT)
  async handleIndexDocument(
    job: Job<SearchIndexJobPayload>,
  ): Promise<{ status: string; documentId?: string }> {
    const { tenantId, entityType, entityId, operation, payload } = job.data;
    this.logger.log(
      `Processing search-index job ${job.id} (${operation} ${entityType}/${entityId}) for tenant ${tenantId}`,
    );

    if (operation === 'delete') {
      await this.searchService.remove(tenantId, entityType, entityId);
      return { status: 'DELETED', documentId: entityId };
    }

    const result = await this.searchService.index(tenantId, entityType, entityId, payload ?? {});

    if (!result.indexed) {
      this.logger.warn(
        `Search index job ${job.id} could not resolve ${entityType}/${entityId} for tenant ${tenantId}`,
      );
      return { status: 'SKIPPED' };
    }

    return { status: 'INDEXED', documentId: result.document?.id ?? entityId };
  }
}
