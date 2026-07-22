import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { In, Repository } from 'typeorm';

import { VoiceCampaign, VoiceCampaignStatus } from '../../database/entities/voice-campaign.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Segment } from '../../database/entities/segment.entity';
import { CreateVoiceCampaignDto, UpdateVoiceCampaignDto } from './dto/voice-campaign.dto';
import { VoiceCallService } from './voice-call.service';
import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import { VoiceCall } from '../../database/entities/voice-call.entity';

interface VoiceJobPayload {
  tenantId: string;
  to: string;
  wssUrl: string;
  voiceProfile?: string;
  campaignId?: string;
}

const VOICE_DIAL_STAGGER_MS = 2000;

@Injectable()
export class VoiceCampaignService {
  constructor(
    @InjectRepository(VoiceCampaign)
    private readonly campaignRepository: Repository<VoiceCampaign>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Segment)
    private readonly segmentRepository: Repository<Segment>,
    @InjectRepository(VoiceCall)
    private readonly voiceCallRepository: Repository<VoiceCall>,
    @InjectQueue(QUEUE_NAMES.VOICE)
    private readonly voiceQueue: Queue<VoiceJobPayload>,
    private readonly voiceCallService: VoiceCallService,
  ) {}

  findAll(tenantId: string): Promise<VoiceCampaign[]> {
    return this.campaignRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id, tenantId } });
    if (!campaign) {
      throw new NotFoundException('Voice campaign not found');
    }
    return campaign;
  }

  create(tenantId: string, dto: CreateVoiceCampaignDto): Promise<VoiceCampaign> {
    return this.campaignRepository.save(
      this.campaignRepository.create({
        tenantId,
        name: dto.name,
        fromNumber: dto.fromNumber,
        script: dto.script,
        contactListId: dto.contactListId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: VoiceCampaignStatus.DRAFT,
      }),
    );
  }

  async update(tenantId: string, id: string, dto: UpdateVoiceCampaignDto): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    if (campaign.status === VoiceCampaignStatus.RUNNING) {
      throw new BadRequestException('Cannot update a running campaign');
    }

    if (dto.name !== undefined) campaign.name = dto.name;
    if (dto.fromNumber !== undefined) campaign.fromNumber = dto.fromNumber;
    if (dto.script !== undefined) campaign.script = dto.script;
    if (dto.contactListId !== undefined) campaign.contactListId = dto.contactListId;
    if (dto.scheduledAt !== undefined) campaign.scheduledAt = new Date(dto.scheduledAt);
    if (dto.totalContacts !== undefined) campaign.totalContacts = dto.totalContacts;

    return this.campaignRepository.save(campaign);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const campaign = await this.findOne(tenantId, id);
    if (campaign.status === VoiceCampaignStatus.RUNNING) {
      throw new BadRequestException('Cannot delete a running campaign');
    }
    await this.campaignRepository.softDelete({ id, tenantId });
  }

  async start(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);

    if (campaign.status === VoiceCampaignStatus.RUNNING) {
      return campaign;
    }
    if (campaign.status === VoiceCampaignStatus.COMPLETED) {
      throw new BadRequestException('Cannot start a completed campaign');
    }
    if (campaign.status === VoiceCampaignStatus.PAUSED) {
      throw new BadRequestException('Use resume to continue a paused campaign');
    }
    if (!campaign.contactListId) {
      throw new BadRequestException('Campaign requires a contact list (segment)');
    }

    const contacts = await this.resolveContactList(tenantId, campaign.contactListId);
    const dialable = contacts.filter(
      (contact) => !contact.doNotContact && Boolean(contact.mobile || contact.phone),
    );

    if (dialable.length === 0) {
      throw new BadRequestException('No dialable contacts in the contact list');
    }

    campaign.status = VoiceCampaignStatus.RUNNING;
    campaign.startedAt = new Date();
    campaign.totalContacts = dialable.length;
    campaign.callsMade = 0;
    campaign.callsAnswered = 0;
    campaign.callsFailed = 0;
    await this.campaignRepository.save(campaign);

    await this.enqueueCampaignContacts(campaign, dialable);
    return campaign;
  }

  async pause(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    if (campaign.status !== VoiceCampaignStatus.RUNNING) {
      throw new BadRequestException('Only running campaigns can be paused');
    }
    campaign.status = VoiceCampaignStatus.PAUSED;
    await this.removeQueuedJobsForCampaign(campaign.id);
    return this.campaignRepository.save(campaign);
  }

  async resume(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    if (campaign.status !== VoiceCampaignStatus.PAUSED) {
      throw new BadRequestException('Only paused campaigns can be resumed');
    }

    const dialable = await this.resolveDialableContacts(tenantId, campaign.contactListId);
    const attemptedCalls = await this.voiceCallRepository.find({
      select: ['to'],
      where: { tenantId, campaignId: campaign.id },
    });
    const attemptedNumbers = new Set(attemptedCalls.map((call) => call.to));
    const remaining = dialable.filter((contact) => {
      const phone = contact.mobile ?? contact.phone;
      return Boolean(phone) && !attemptedNumbers.has(phone as string);
    });

    campaign.totalContacts = dialable.length;
    if (remaining.length === 0) {
      campaign.status = VoiceCampaignStatus.COMPLETED;
      campaign.completedAt = new Date();
      return this.campaignRepository.save(campaign);
    }

    campaign.status = VoiceCampaignStatus.RUNNING;
    campaign.completedAt = undefined;
    const saved = await this.campaignRepository.save(campaign);
    await this.enqueueCampaignContacts(saved, remaining);
    return saved;
  }

  async cancel(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    await this.removeQueuedJobsForCampaign(campaign.id);
    campaign.status = VoiceCampaignStatus.COMPLETED;
    campaign.completedAt = new Date();
    return this.campaignRepository.save(campaign);
  }

  async recordCallOutcome(campaignId: string, callStatus: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
    if (!campaign) {
      return;
    }

    const normalized = callStatus.toUpperCase();
    campaign.callsMade = Math.min(campaign.callsMade + 1, Math.max(campaign.totalContacts, 0));

    if (normalized === 'COMPLETED') {
      campaign.callsAnswered += 1;
    } else if (['BUSY', 'NO-ANSWER', 'FAILED', 'CANCELED'].includes(normalized)) {
      campaign.callsFailed += 1;
    }

    if (
      campaign.totalContacts > 0 &&
      campaign.callsMade >= campaign.totalContacts &&
      campaign.status !== VoiceCampaignStatus.COMPLETED
    ) {
      campaign.status = VoiceCampaignStatus.COMPLETED;
      campaign.completedAt = new Date();
    }

    await this.campaignRepository.save(campaign);
  }

  async getStats(tenantId: string, id: string) {
    const campaign = await this.findOne(tenantId, id);
    const answerRate =
      campaign.callsMade > 0 ? (campaign.callsAnswered / campaign.callsMade) * 100 : 0;

    return {
      campaignId: campaign.id,
      status: campaign.status,
      totalContacts: campaign.totalContacts,
      callsMade: campaign.callsMade,
      callsAnswered: campaign.callsAnswered,
      callsFailed: campaign.callsFailed,
      answerRate,
    };
  }

  private async resolveContactList(tenantId: string, contactListId: string): Promise<Contact[]> {
    const segment = await this.segmentRepository.findOne({
      where: { id: contactListId, tenantId },
    });
    if (!segment) {
      throw new NotFoundException('Contact list (segment) not found');
    }

    let contacts = await this.contactRepository.find({ where: { tenantId } });
    const tagFilters = new Set<string>();
    const conditions = (segment.rules?.conditions ?? []) as Array<{
      field?: string;
      value?: string;
      operator?: string;
    }>;

    for (const condition of conditions) {
      if ((condition.field === 'tags' || condition.field === 'tag') && condition.value) {
        tagFilters.add(condition.value);
      }
      if (condition.field === 'status' && condition.value) {
        contacts = contacts.filter((contact) => contact.status === condition.value);
      }
      if (condition.field === 'ids' && condition.value) {
        const ids = condition.value
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);
        if (ids.length > 0) {
          contacts = await this.contactRepository.find({
            where: { tenantId, id: In(ids) },
          });
        }
      }
    }

    if (tagFilters.size > 0) {
      contacts = contacts.filter((contact) =>
        [...tagFilters].some((tag) => (contact.tags ?? []).includes(tag)),
      );
    }

    return contacts;
  }

  private async resolveDialableContacts(
    tenantId: string,
    contactListId?: string,
  ): Promise<Contact[]> {
    if (!contactListId) {
      throw new BadRequestException('Campaign requires a contact list (segment)');
    }
    const contacts = await this.resolveContactList(tenantId, contactListId);
    return contacts.filter(
      (contact) => !contact.doNotContact && Boolean(contact.mobile || contact.phone),
    );
  }

  private async enqueueCampaignContacts(
    campaign: VoiceCampaign,
    contacts: Contact[],
  ): Promise<void> {
    if (contacts.length === 0) {
      return;
    }
    const jobs = contacts.map((contact, index) => {
      const to = (contact.mobile ?? contact.phone) as string;
      const wssUrl = this.voiceCallService.buildStreamUrl(campaign.tenantId, {});
      return {
        name: JOB_NAMES.PROCESS_VOICE,
        data: {
          tenantId: campaign.tenantId,
          to,
          wssUrl,
          campaignId: campaign.id,
        } satisfies VoiceJobPayload,
        opts: {
          delay: index * VOICE_DIAL_STAGGER_MS,
          jobId: `voice-campaign:${campaign.id}:${to}`,
          removeOnComplete: true,
          removeOnFail: false,
        },
      };
    });
    await this.voiceQueue.addBulk(jobs);
  }

  private async removeQueuedJobsForCampaign(campaignId: string): Promise<void> {
    const jobs = await this.voiceQueue.getJobs(['waiting', 'delayed', 'paused']);
    for (const job of jobs) {
      if (job.data?.campaignId === campaignId) {
        await job.remove();
      }
    }
  }
}
