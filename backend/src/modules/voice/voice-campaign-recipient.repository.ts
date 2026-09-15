import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, Repository } from 'typeorm';

import { BaseRepository } from '../../database/base.repository';
import {
  VoiceCampaignRecipient,
  VoiceCampaignRecipientStatus,
} from '../../database/entities/voice-campaign-recipient.entity';

const ACTIVE_STATUSES = [
  VoiceCampaignRecipientStatus.PENDING,
  VoiceCampaignRecipientStatus.QUEUED,
  VoiceCampaignRecipientStatus.CALLING,
  VoiceCampaignRecipientStatus.RETRY_PENDING,
];

@Injectable()
export class VoiceCampaignRecipientRepository extends BaseRepository<VoiceCampaignRecipient> {
  constructor(
    @InjectRepository(VoiceCampaignRecipient)
    repo: Repository<VoiceCampaignRecipient>,
  ) {
    super(repo);
  }

  findByCampaign(
    tenantId: string,
    campaignId: string,
    options: { status?: VoiceCampaignRecipientStatus; page?: number; limit?: number } = {},
  ): Promise<[VoiceCampaignRecipient[], number]> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 50;
    return this.repository.findAndCount({
      where: {
        tenantId,
        campaignId,
        ...(options.status ? { status: options.status } : {}),
      } as never,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  countByStatus(
    tenantId: string,
    campaignId: string,
  ): Promise<Array<{ status: VoiceCampaignRecipientStatus; count: string }>> {
    return this.repository
      .createQueryBuilder('r')
      .select('r.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('r.tenant_id = :tenantId', { tenantId })
      .andWhere('r.campaign_id = :campaignId', { campaignId })
      .groupBy('r.status')
      .getRawMany();
  }

  /** Recipients whose scheduled retry/first attempt is due now — the pool the campaign should enqueue. */
  findDueNow(tenantId: string, campaignId: string): Promise<VoiceCampaignRecipient[]> {
    return this.repository.find({
      where: [
        { tenantId, campaignId, status: VoiceCampaignRecipientStatus.PENDING },
        {
          tenantId,
          campaignId,
          status: VoiceCampaignRecipientStatus.RETRY_PENDING,
          nextAttemptAt: LessThanOrEqual(new Date()),
        },
      ],
    });
  }

  findActive(tenantId: string, campaignId: string): Promise<VoiceCampaignRecipient[]> {
    return this.repository.find({
      where: { tenantId, campaignId, status: In(ACTIVE_STATUSES) as never },
    });
  }

  findByContactIds(
    tenantId: string,
    campaignId: string,
    contactIds: string[],
  ): Promise<VoiceCampaignRecipient[]> {
    if (contactIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.repository
      .createQueryBuilder('r')
      .where('r.tenant_id = :tenantId', { tenantId })
      .andWhere('r.campaign_id = :campaignId', { campaignId })
      .andWhere('r.contact_id IN (:...contactIds)', { contactIds })
      .getMany();
  }

  findByCallId(tenantId: string, callId: string): Promise<VoiceCampaignRecipient | null> {
    return this.repository.findOne({ where: { tenantId, callId } });
  }

  /** Unpaginated — for export only. */
  findAllByCampaign(tenantId: string, campaignId: string): Promise<VoiceCampaignRecipient[]> {
    return this.repository.find({
      where: { tenantId, campaignId },
      order: { createdAt: 'ASC' },
    });
  }

  save(recipient: VoiceCampaignRecipient): Promise<VoiceCampaignRecipient> {
    return this.repository.save(recipient);
  }

  createMany(
    rows: Array<Partial<VoiceCampaignRecipient>>,
  ): Promise<VoiceCampaignRecipient[]> {
    return this.repository.save(this.repository.create(rows));
  }
}
