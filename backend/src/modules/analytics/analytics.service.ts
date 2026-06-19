import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DashboardMetric } from '../../database/entities/dashboard-metric.entity';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Lead } from '../../database/entities/lead.entity';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { UsageRecord } from '../../database/entities/usage-record.entity';
import { Message } from '../../database/entities/message.entity';
import { ForecastService } from '../crm/forecast.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(DashboardMetric)
    private readonly metricRepo: Repository<DashboardMetric>,
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(VoiceCall)
    private readonly voiceCallRepo: Repository<VoiceCall>,
    @InjectRepository(WhatsAppMessage)
    private readonly whatsappRepo: Repository<WhatsAppMessage>,
    @InjectRepository(UsageRecord)
    private readonly usageRepo: Repository<UsageRecord>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly forecastService: ForecastService,
  ) {}

  async getMetrics(tenantId: string, metricName: string, period: string) {
    return this.metricRepo.find({
      where: { tenantId, metricName, period } as Record<string, string>,
      order: { capturedAt: 'DESC' },
      take: 30,
    });
  }

  async captureMetric(
    tenantId: string,
    name: string,
    value: number,
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY',
  ) {
    const metric = this.metricRepo.create({
      tenantId,
      metricName: name,
      value,
      period,
      capturedAt: new Date(),
    } as Partial<DashboardMetric>);
    return this.metricRepo.save(metric);
  }

  async getOverview(tenantId: string) {
    const [contacts, leads, deals, calls, messages] = await Promise.all([
      this.contactRepo.count({ where: { tenantId } }),
      this.leadRepo.count({ where: { tenantId } }),
      this.dealRepo.find({ where: { tenantId } }),
      this.voiceCallRepo.count({ where: { tenantId } }),
      this.whatsappRepo.count({ where: { tenantId } }),
    ]);

    const openDeals = deals.filter((deal) => deal.status === DealStatus.OPEN);
    const wonDeals = deals.filter((deal) => deal.status === DealStatus.WON);
    const pipelineValue = openDeals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
    const wonValue = wonDeals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);

    return {
      contacts,
      leads,
      openDeals: openDeals.length,
      wonDeals: wonDeals.length,
      pipelineValue,
      wonValue,
      calls,
      whatsappMessages: messages,
    };
  }

  async getCrmAnalytics(tenantId: string) {
    const [contacts, leads, deals] = await Promise.all([
      this.contactRepo.count({ where: { tenantId } }),
      this.leadRepo.count({ where: { tenantId } }),
      this.dealRepo.find({ where: { tenantId } }),
    ]);

    const convertedLeads = await this.leadRepo.count({
      where: { tenantId, status: 'CONVERTED' },
    });

    return {
      contacts,
      leads,
      deals: deals.length,
      conversionRate: leads > 0 ? (convertedLeads / leads) * 100 : 0,
    };
  }

  async getRevenueAnalytics(tenantId: string) {
    const deals = await this.dealRepo.find({ where: { tenantId, status: DealStatus.WON } });
    const mrr = deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);
    return {
      mrr,
      arr: mrr * 12,
      wonDealCount: deals.length,
    };
  }

  async getPipelineAnalytics(tenantId: string) {
    const deals = await this.dealRepo.find({
      where: { tenantId, status: DealStatus.OPEN },
      relations: ['stage'],
    });

    const byStage = new Map<string, { count: number; value: number }>();
    for (const deal of deals) {
      const stageName = deal.stage?.name ?? 'Unknown';
      const existing = byStage.get(stageName) ?? { count: 0, value: 0 };
      existing.count += 1;
      existing.value += Number(deal.value || 0);
      byStage.set(stageName, existing);
    }

    return Array.from(byStage.entries()).map(([stage, stats]) => ({
      stage,
      ...stats,
    }));
  }

  async getTeamAnalytics(tenantId: string) {
    const deals = await this.dealRepo.find({ where: { tenantId } });
    const owners = new Map<string, { deals: number; won: number; value: number }>();

    for (const deal of deals) {
      const ownerId = deal.ownerId ?? 'unassigned';
      const existing = owners.get(ownerId) ?? { deals: 0, won: 0, value: 0 };
      existing.deals += 1;
      if (deal.status === DealStatus.WON) {
        existing.won += 1;
        existing.value += Number(deal.value || 0);
      }
      owners.set(ownerId, existing);
    }

    return Array.from(owners.entries()).map(([ownerId, stats]) => ({
      ownerId,
      ...stats,
      winRate: stats.deals > 0 ? (stats.won / stats.deals) * 100 : 0,
    }));
  }

  async getVoiceAnalytics(tenantId: string) {
    const calls = await this.voiceCallRepo.find({ where: { tenantId } });
    const completed = calls.filter((call) => call.status === 'COMPLETED');
    const inbound = calls.filter((call) => call.direction === 'INBOUND').length;
    const outbound = calls.filter((call) => call.direction === 'OUTBOUND').length;
    const missed = calls.filter((call) =>
      ['NO-ANSWER', 'BUSY', 'FAILED', 'CANCELED'].includes(call.status),
    ).length;
    const totalDuration = completed.reduce((sum, call) => sum + call.durationSeconds, 0);
    const totalCost = calls.reduce((sum, call) => sum + Number(call.costAmount || 0), 0);
    const sentimentCounts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
    for (const call of calls) {
      if (call.sentiment) {
        sentimentCounts[call.sentiment] += 1;
      }
    }
    const analyzed = sentimentCounts.POSITIVE + sentimentCounts.NEUTRAL + sentimentCounts.NEGATIVE;

    return {
      totalCalls: calls.length,
      completedCalls: completed.length,
      inboundCalls: inbound,
      outboundCalls: outbound,
      missedCalls: missed,
      averageDuration: completed.length > 0 ? totalDuration / completed.length : 0,
      totalCost,
      sentiment: {
        positive: analyzed > 0 ? (sentimentCounts.POSITIVE / analyzed) * 100 : 0,
        neutral: analyzed > 0 ? (sentimentCounts.NEUTRAL / analyzed) * 100 : 0,
        negative: analyzed > 0 ? (sentimentCounts.NEGATIVE / analyzed) * 100 : 0,
      },
    };
  }

  async getWhatsappAnalytics(tenantId: string) {
    const messages = await this.whatsappRepo.find({ where: { tenantId } });
    const inbound = messages.filter((message) => message.direction === 'INBOUND').length;
    const outbound = messages.filter((message) => message.direction === 'OUTBOUND').length;
    return { total: messages.length, inbound, outbound };
  }

  async getAiUsageAnalytics(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usageRecords = await this.usageRepo.find({
      where: { tenantId, periodStart: startOfMonth },
    });

    const aiMetrics = usageRecords.filter((record) =>
      ['ai_tokens', 'ai_messages', 'ai_calls'].includes(record.metric),
    );

    const tokensUsed = Number(
      aiMetrics.find((record) => record.metric === 'ai_tokens')?.quantity ?? 0,
    );
    const messagesSent = Number(
      aiMetrics.find((record) => record.metric === 'ai_messages')?.quantity ?? 0,
    );
    const totalCost = aiMetrics.reduce((sum, record) => sum + Number(record.totalCost || 0), 0);

    const assistantMessages = await this.messageRepo.count({
      where: { tenantId, role: 'ASSISTANT' },
    });

    return {
      tokensUsed,
      messagesSent: messagesSent || assistantMessages,
      totalCost,
      periodStart: startOfMonth.toISOString(),
    };
  }

  async getForecastAnalytics(tenantId: string, pipelineId?: string) {
    return this.forecastService.getForecast(tenantId, pipelineId);
  }
}
