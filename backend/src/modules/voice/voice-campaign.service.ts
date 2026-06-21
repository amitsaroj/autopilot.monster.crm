import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  VoiceCampaign,
  VoiceCampaignStatus,
} from '../../database/entities/voice-campaign.entity';
import { CreateVoiceCampaignDto, UpdateVoiceCampaignDto } from './dto/voice-campaign.dto';

@Injectable()
export class VoiceCampaignService {
  constructor(
    @InjectRepository(VoiceCampaign)
    private readonly campaignRepository: Repository<VoiceCampaign>,
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

    campaign.status = VoiceCampaignStatus.RUNNING;
    campaign.startedAt = new Date();
    return this.campaignRepository.save(campaign);
  }

  async pause(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    campaign.status = VoiceCampaignStatus.PAUSED;
    return this.campaignRepository.save(campaign);
  }

  async resume(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    campaign.status = VoiceCampaignStatus.RUNNING;
    return this.campaignRepository.save(campaign);
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
}
