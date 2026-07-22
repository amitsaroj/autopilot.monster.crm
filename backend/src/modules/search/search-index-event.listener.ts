import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EVENT_NAMES } from '../../events/event.constants';
import { SearchIndexQueueService } from './search-index-queue.service';

@Injectable()
export class SearchIndexEventListener {
  constructor(private readonly searchIndexQueue: SearchIndexQueueService) {}

  @OnEvent(EVENT_NAMES.CONTACT_CREATED, { async: true })
  async onContactCreated(payload: { tenantId: string; contact: { id: string } }): Promise<void> {
    await this.searchIndexQueue.enqueueIndex(
      payload.tenantId,
      'contact',
      payload.contact.id,
      'index',
    );
  }

  @OnEvent(EVENT_NAMES.CONTACT_UPDATED, { async: true })
  async onContactUpdated(payload: { tenantId: string; contact: { id: string } }): Promise<void> {
    await this.searchIndexQueue.enqueueIndex(
      payload.tenantId,
      'contact',
      payload.contact.id,
      'reindex',
    );
  }

  @OnEvent(EVENT_NAMES.CONTACT_DELETED, { async: true })
  async onContactDeleted(payload: {
    tenantId: string;
    contact?: { id: string };
    contactId?: string;
  }): Promise<void> {
    const entityId = String(payload.contact?.id ?? payload.contactId ?? '');
    if (!entityId) {
      return;
    }
    await this.searchIndexQueue.enqueueIndex(payload.tenantId, 'contact', entityId, 'delete');
  }

  @OnEvent(EVENT_NAMES.CONTACT_MERGED, { async: true })
  async onContactMerged(payload: {
    tenantId: string;
    contact?: { id: string };
    primaryId?: string;
    secondaryId?: string;
  }): Promise<void> {
    const primaryId = String(payload.contact?.id ?? payload.primaryId ?? '');
    const secondaryId = payload.secondaryId ? String(payload.secondaryId) : '';
    if (primaryId) {
      await this.searchIndexQueue.enqueueIndex(payload.tenantId, 'contact', primaryId, 'reindex');
    }
    if (secondaryId) {
      await this.searchIndexQueue.enqueueIndex(payload.tenantId, 'contact', secondaryId, 'delete');
    }
  }

  @OnEvent(EVENT_NAMES.COMPANY_CREATED, { async: true })
  async onCompanyCreated(payload: { tenantId: string; company: { id: string } }): Promise<void> {
    await this.searchIndexQueue.enqueueIndex(
      payload.tenantId,
      'company',
      payload.company.id,
      'index',
    );
  }

  @OnEvent(EVENT_NAMES.COMPANY_UPDATED, { async: true })
  async onCompanyUpdated(payload: { tenantId: string; company: { id: string } }): Promise<void> {
    await this.searchIndexQueue.enqueueIndex(
      payload.tenantId,
      'company',
      payload.company.id,
      'reindex',
    );
  }

  @OnEvent(EVENT_NAMES.COMPANY_DELETED, { async: true })
  async onCompanyDeleted(payload: {
    tenantId: string;
    company?: { id: string };
    companyId?: string;
  }): Promise<void> {
    const entityId = String(payload.company?.id ?? payload.companyId ?? '');
    if (!entityId) {
      return;
    }
    await this.searchIndexQueue.enqueueIndex(payload.tenantId, 'company', entityId, 'delete');
  }

  @OnEvent(EVENT_NAMES.COMPANY_MERGED, { async: true })
  async onCompanyMerged(payload: {
    tenantId: string;
    company?: { id: string };
    primaryId?: string;
    secondaryId?: string;
  }): Promise<void> {
    const primaryId = String(payload.company?.id ?? payload.primaryId ?? '');
    const secondaryId = payload.secondaryId ? String(payload.secondaryId) : '';
    if (primaryId) {
      await this.searchIndexQueue.enqueueIndex(payload.tenantId, 'company', primaryId, 'reindex');
    }
    if (secondaryId) {
      await this.searchIndexQueue.enqueueIndex(payload.tenantId, 'company', secondaryId, 'delete');
    }
  }

  @OnEvent(EVENT_NAMES.DEAL_CREATED, { async: true })
  async onDealCreated(payload: { tenantId: string; deal: { id: string } }): Promise<void> {
    await this.searchIndexQueue.enqueueIndex(payload.tenantId, 'deal', payload.deal.id, 'index');
  }

  @OnEvent(EVENT_NAMES.DEAL_UPDATED, { async: true })
  async onDealUpdated(payload: { tenantId: string; deal: { id: string } }): Promise<void> {
    await this.searchIndexQueue.enqueueIndex(payload.tenantId, 'deal', payload.deal.id, 'reindex');
  }

  @OnEvent(EVENT_NAMES.DEAL_DELETED, { async: true })
  async onDealDeleted(payload: {
    tenantId: string;
    deal?: { id: string };
    dealId?: string;
  }): Promise<void> {
    const entityId = String(payload.deal?.id ?? payload.dealId ?? '');
    if (!entityId) {
      return;
    }
    await this.searchIndexQueue.enqueueIndex(payload.tenantId, 'deal', entityId, 'delete');
  }

  @OnEvent(EVENT_NAMES.DEAL_STAGE_CHANGED, { async: true })
  async onDealStageChanged(payload: { tenantId: string; deal: { id: string } }): Promise<void> {
    await this.searchIndexQueue.enqueueIndex(payload.tenantId, 'deal', payload.deal.id, 'reindex');
  }
}
