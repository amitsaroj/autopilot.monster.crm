import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';

import { DealRepository } from './deal.repository';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { PipelineStage } from '../../database/entities/pipeline-stage.entity';
import { UserEntity } from '../auth/entities/user.entity';

export interface ForecastDealRow {
  id: string;
  name: string;
  ownerId: string | null;
  ownerName: string;
  stageId: string;
  stageName: string;
  value: number;
  probability: number;
  forecastedValue: number;
  expectedCloseDate: string | null;
  currency: string;
}

export interface ForecastSummary {
  totalPipeline: number;
  totalForecast: number;
  dealCount: number;
  onTrackCount: number;
  atRiskCount: number;
  currency: string;
  deals: ForecastDealRow[];
}

export interface ForecastStageGroup {
  stageId: string;
  stageName: string;
  pipeline: number;
  forecast: number;
  count: number;
}

export interface ForecastOwnerGroup {
  ownerId: string;
  ownerName: string;
  pipeline: number;
  forecast: number;
  count: number;
}

@Injectable()
export class ForecastService {
  constructor(
    private readonly dealRepository: DealRepository,
    @InjectRepository(PipelineStage)
    private readonly stageRepository: Repository<PipelineStage>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  private computeProbability(deal: Deal, stageMap: Map<string, PipelineStage>): number {
    if (deal.probability > 0) {
      return deal.probability;
    }
    const stage = stageMap.get(deal.stageId);
    return stage?.probability ?? 0;
  }

  private async buildStageMap(tenantId: string, deals: Deal[]): Promise<Map<string, PipelineStage>> {
    const stageIds = [...new Set(deals.map((deal) => deal.stageId))];
    if (stageIds.length === 0) {
      return new Map();
    }

    const stages = await this.stageRepository.find({
      where: { tenantId, id: In(stageIds) },
    });
    return new Map(stages.map((stage) => [stage.id, stage]));
  }

  private async buildOwnerMap(tenantId: string, ownerIds: string[]): Promise<Map<string, string>> {
    const uniqueIds = [...new Set(ownerIds)];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    const users = await this.userRepository.find({
      where: { tenantId, id: In(uniqueIds) },
    });
    return new Map(users.map((user) => [user.id, user.fullName]));
  }

  private async getOpenDeals(tenantId: string, pipelineId?: string): Promise<Deal[]> {
    const where: FindOptionsWhere<Deal> = { status: DealStatus.OPEN };
    if (pipelineId) {
      where.pipelineId = pipelineId;
    }

    return this.dealRepository.findAll(tenantId, {
      where,
      relations: ['stage'],
      order: { expectedCloseDate: 'ASC' },
    });
  }

  async getForecast(tenantId: string, pipelineId?: string): Promise<ForecastSummary> {
    const deals = await this.getOpenDeals(tenantId, pipelineId);
    const stageMap = await this.buildStageMap(tenantId, deals);
    const ownerIds = deals
      .map((deal) => deal.ownerId)
      .filter((ownerId): ownerId is string => ownerId !== undefined && ownerId !== null);
    const ownerMap = await this.buildOwnerMap(tenantId, ownerIds);

    const rows: ForecastDealRow[] = deals.map((deal) => {
      const probability = this.computeProbability(deal, stageMap);
      const value = Number(deal.value) || 0;
      const stage = stageMap.get(deal.stageId);

      return {
        id: deal.id,
        name: deal.name,
        ownerId: deal.ownerId ?? null,
        ownerName: deal.ownerId ? ownerMap.get(deal.ownerId) ?? 'Unassigned' : 'Unassigned',
        stageId: deal.stageId,
        stageName: stage?.name ?? 'Unknown',
        value,
        probability,
        forecastedValue: Math.round(value * (probability / 100)),
        expectedCloseDate: deal.expectedCloseDate
          ? new Date(deal.expectedCloseDate).toISOString().split('T')[0]
          : null,
        currency: deal.currency,
      };
    });

    const totalPipeline = rows.reduce((sum, row) => sum + row.value, 0);
    const totalForecast = rows.reduce((sum, row) => sum + row.forecastedValue, 0);

    return {
      totalPipeline,
      totalForecast,
      dealCount: rows.length,
      onTrackCount: rows.filter((row) => row.probability >= 50).length,
      atRiskCount: rows.filter((row) => row.probability < 30).length,
      currency: rows[0]?.currency ?? 'USD',
      deals: rows,
    };
  }

  async getByStage(tenantId: string, pipelineId?: string): Promise<ForecastStageGroup[]> {
    const summary = await this.getForecast(tenantId, pipelineId);
    const byStage = new Map<string, ForecastStageGroup>();

    for (const deal of summary.deals) {
      const existing = byStage.get(deal.stageId) ?? {
        stageId: deal.stageId,
        stageName: deal.stageName,
        pipeline: 0,
        forecast: 0,
        count: 0,
      };
      existing.pipeline += deal.value;
      existing.forecast += deal.forecastedValue;
      existing.count += 1;
      byStage.set(deal.stageId, existing);
    }

    return Array.from(byStage.values());
  }

  async getByOwner(tenantId: string, pipelineId?: string): Promise<ForecastOwnerGroup[]> {
    const summary = await this.getForecast(tenantId, pipelineId);
    const byOwner = new Map<string, ForecastOwnerGroup>();

    for (const deal of summary.deals) {
      const key = deal.ownerId ?? 'unassigned';
      const existing = byOwner.get(key) ?? {
        ownerId: key,
        ownerName: deal.ownerName,
        pipeline: 0,
        forecast: 0,
        count: 0,
      };
      existing.pipeline += deal.value;
      existing.forecast += deal.forecastedValue;
      existing.count += 1;
      byOwner.set(key, existing);
    }

    return Array.from(byOwner.values());
  }

  async getHistorical(tenantId: string) {
    const closedDeals = await this.dealRepository.findAll(tenantId, {
      where: { status: In([DealStatus.WON, DealStatus.LOST]) },
      order: { updatedAt: 'DESC' },
      take: 100,
    });

    const won = closedDeals.filter((deal) => deal.status === DealStatus.WON);
    const lost = closedDeals.filter((deal) => deal.status === DealStatus.LOST);
    const wonValue = won.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
    const forecastedAtClose = closedDeals.reduce((sum, deal) => {
      const value = Number(deal.value) || 0;
      const probability = deal.probability || 0;
      return sum + value * (probability / 100);
    }, 0);

    return {
      closedCount: closedDeals.length,
      wonCount: won.length,
      lostCount: lost.length,
      wonValue,
      winRate: closedDeals.length > 0 ? (won.length / closedDeals.length) * 100 : 0,
      forecastAccuracy: forecastedAtClose > 0 ? (wonValue / forecastedAtClose) * 100 : 0,
      recent: closedDeals.slice(0, 20).map((deal) => ({
        id: deal.id,
        name: deal.name,
        status: deal.status,
        value: Number(deal.value) || 0,
        probability: deal.probability,
        actualCloseDate: deal.actualCloseDate ?? null,
      })),
    };
  }
}
