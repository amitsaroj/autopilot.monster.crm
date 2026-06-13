import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoiceCampaign } from '../../database/entities/voice-campaign.entity';
import { VoiceCall } from '../../database/entities/voice-call.entity';

@Injectable()
export class VoiceCampaignService {
  private readonly logger = new Logger(VoiceCampaignService.name);

  constructor(
    @InjectRepository(VoiceCampaign)
    private readonly campaignRepo: Repository<VoiceCampaign>,
    @InjectRepository(VoiceCall)
    private readonly callRepo: Repository<VoiceCall>,
  ) {}

  async create(tenantId: string, dto: Partial<VoiceCampaign>): Promise<VoiceCampaign> {
    const campaign = this.campaignRepo.create({
      ...dto,
      tenantId,
      totalCalls: dto.targetList?.length || 0,
    } as any) as unknown as VoiceCampaign;
    return this.campaignRepo.save(campaign) as unknown as Promise<VoiceCampaign>;
  }

  async findAll(tenantId: string): Promise<VoiceCampaign[]> {
    return this.campaignRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async findOne(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.campaignRepo.findOne({ where: { id, tenantId } as any });
    if (!campaign) throw new NotFoundException('Voice campaign not found');
    return campaign;
  }

  async start(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    campaign.status = 'RUNNING';
    campaign.startedAt = new Date();
    this.logger.log(`Starting voice campaign ${id} with ${campaign.totalCalls} targets`);
    return this.campaignRepo.save(campaign) as unknown as Promise<VoiceCampaign>;
  }

  async pause(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    campaign.status = 'PAUSED';
    return this.campaignRepo.save(campaign) as unknown as Promise<VoiceCampaign>;
  }

  async cancel(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    campaign.status = 'CANCELLED';
    return this.campaignRepo.save(campaign) as unknown as Promise<VoiceCampaign>;
  }

  async getStats(tenantId: string, id: string) {
    const campaign = await this.findOne(tenantId, id);
    const calls = await this.callRepo.find({ where: { tenantId } as any });
    return {
      campaign,
      totalCalls: campaign.totalCalls,
      completedCalls: campaign.completedCalls,
      successfulCalls: campaign.successfulCalls,
      successRate: campaign.completedCalls > 0
        ? Math.round((campaign.successfulCalls / campaign.completedCalls) * 100)
        : 0,
      callsCount: calls.length,
    };
  }

  async update(tenantId: string, id: string, dto: Partial<VoiceCampaign>): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    Object.assign(campaign, dto);
    return this.campaignRepo.save(campaign) as unknown as Promise<VoiceCampaign>;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const campaign = await this.findOne(tenantId, id);
    await this.campaignRepo.softRemove(campaign);
  }
}
