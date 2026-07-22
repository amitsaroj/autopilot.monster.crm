import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Lead } from '../../database/entities/lead.entity';
import { VoiceCall } from '../../database/entities/voice-call.entity';
import { Campaign } from '../../database/entities/campaign.entity';
import { ForecastService } from '../crm/forecast.service';

@Injectable()
export class AdvancedAnalyticsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(VoiceCall)
    private readonly callRepo: Repository<VoiceCall>,
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    private readonly forecastService: ForecastService,
  ) {}

  async getRevenueSummary(tenantId: string, startDate: string, endDate: string) {
    const deals = await this.dealRepo
      .createQueryBuilder('d')
      .select([
        "DATE_TRUNC('day', d.actual_close_date) as date",
        'SUM(d.value) as revenue',
        'COUNT(*) as deal_count',
      ])
      .where('d.tenant_id = :tenantId', { tenantId })
      .andWhere('d.status = :status', { status: DealStatus.WON })
      .andWhere('d.actual_close_date BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy("DATE_TRUNC('day', d.actual_close_date)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return deals;
  }

  async getPipelineAnalytics(tenantId: string) {
    const stages = await this.dealRepo
      .createQueryBuilder('d')
      .leftJoin('d.stage', 'stage')
      .select(['stage.name as stage_name', 'COUNT(*) as count', 'SUM(d.value) as total_value'])
      .where('d.tenant_id = :tenantId', { tenantId })
      .andWhere('d.deleted_at IS NULL')
      .andWhere('d.status = :status', { status: DealStatus.OPEN })
      .groupBy('stage.name')
      .getRawMany();

    const totalDeals = stages.reduce((sum: number, stageRow) => sum + Number(stageRow.count), 0);
    return stages.map((stageRow) => ({
      stage: stageRow.stage_name ?? 'Unknown',
      count: Number(stageRow.count),
      totalValue: Number(stageRow.total_value || 0),
      percentage: totalDeals > 0 ? Math.round((Number(stageRow.count) / totalDeals) * 100) : 0,
    }));
  }

  async getCrmOverview(tenantId: string) {
    const [contactCount, leadCount, dealCount, wonDeals] = await Promise.all([
      this.contactRepo.count({ where: { tenantId } }),
      this.leadRepo.count({ where: { tenantId } }),
      this.dealRepo.count({ where: { tenantId } }),
      this.dealRepo.count({ where: { tenantId, status: DealStatus.WON } }),
    ]);

    return {
      contacts: contactCount,
      leads: leadCount,
      deals: dealCount,
      wonDeals,
      conversionRate: dealCount > 0 ? Math.round((wonDeals / dealCount) * 100) : 0,
    };
  }

  async getVoiceAnalytics(tenantId: string, startDate: string, endDate: string) {
    const calls = await this.callRepo
      .createQueryBuilder('c')
      .select([
        "DATE_TRUNC('day', c.created_at) as date",
        'COUNT(*) as call_count',
        'AVG(c.duration_seconds) as avg_duration',
      ])
      .where('c.tenant_id = :tenantId', { tenantId })
      .andWhere('c.created_at BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy("DATE_TRUNC('day', c.created_at)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return calls;
  }

  async getTeamPerformance(tenantId: string) {
    const performance = await this.dealRepo
      .createQueryBuilder('d')
      .select([
        'd.owner_id as user_id',
        'COUNT(*) as total_deals',
        'SUM(CASE WHEN d.status = :wonStatus THEN 1 ELSE 0 END) as won_deals',
        'SUM(CASE WHEN d.status = :wonStatus THEN d.value ELSE 0 END) as revenue',
      ])
      .where('d.tenant_id = :tenantId', { tenantId })
      .andWhere('d.owner_id IS NOT NULL')
      .andWhere('d.deleted_at IS NULL')
      .setParameter('wonStatus', DealStatus.WON)
      .groupBy('d.owner_id')
      .orderBy('revenue', 'DESC')
      .getRawMany();

    return performance.map((row) => ({
      userId: row.user_id,
      totalDeals: Number(row.total_deals),
      wonDeals: Number(row.won_deals),
      revenue: Number(row.revenue || 0),
      winRate:
        Number(row.total_deals) > 0
          ? Math.round((Number(row.won_deals) / Number(row.total_deals)) * 100)
          : 0,
    }));
  }

  async getForecast(tenantId: string) {
    return this.forecastService.getForecast(tenantId);
  }

  async buildCustomReport(_tenantId: string, config: Record<string, unknown>) {
    return {
      name: config.name ?? 'Custom Report',
      data: [{ metric: 'Sample', value: 100 }],
      generatedAt: new Date(),
    };
  }

  async getDashboardWidgets(_tenantId: string) {
    return [
      { id: 'widget_1', type: 'REVENUE_CHART', position: { x: 0, y: 0, w: 6, h: 4 } },
      { id: 'widget_2', type: 'PIPELINE_FUNNEL', position: { x: 6, y: 0, w: 6, h: 4 } },
      { id: 'widget_3', type: 'TOP_AGENTS', position: { x: 0, y: 4, w: 4, h: 4 } },
    ];
  }

  async scheduleReport(_tenantId: string, config: Record<string, unknown>) {
    return {
      reportId: 'rep_123',
      schedule: config.schedule ?? '0 0 * * 1',
      status: 'SCHEDULED',
    };
  }

  async getRoiReport(tenantId: string) {
    const campaigns = await this.campaignRepo.find({ where: { tenantId } });
    const deals = await this.dealRepo.find({ where: { tenantId, status: DealStatus.WON } });

    const totalRevenue = deals.reduce((sum, deal) => sum + Number(deal.value || 0), 0);

    if (campaigns.length === 0) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalRevenue,
        netProfit: totalRevenue,
        roiPercentage: 0,
        campaignBreakdown: [],
        generatedAt: new Date(),
      };
    }

    let totalBudget = 0;
    let totalSpent = 0;
    const campaignBreakdown = campaigns.map((campaign) => {
      totalBudget += Number(campaign.budget || 0);
      totalSpent += Number(campaign.spent || 0);
      return {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        budget: Number(campaign.budget || 0),
        spent: Number(campaign.spent || 0),
        leads: campaign.totalLeads,
        qualified: campaign.qualifiedLeads,
      };
    });

    const netProfit = totalRevenue - totalSpent;
    const roiPercentage =
      totalSpent > 0 ? (netProfit / totalSpent) * 100 : totalRevenue > 0 ? 100 : 0;

    return {
      totalBudget,
      totalSpent,
      totalRevenue,
      netProfit,
      roiPercentage: Math.round(roiPercentage * 100) / 100,
      campaignBreakdown,
      generatedAt: new Date(),
    };
  }

  async getAiVsHumanReport(tenantId: string) {
    const calls = await this.callRepo.find({ where: { tenantId } });

    if (calls.length === 0) {
      return {
        ai: {
          totalCalls: 0,
          avgDurationSeconds: 0,
          totalCost: 0,
          avgCostPerCall: 0,
          successRate: 0,
          conversionRate: 0,
        },
        human: {
          totalCalls: 0,
          avgDurationSeconds: 0,
          totalCost: 0,
          avgCostPerCall: 0,
          successRate: 0,
          conversionRate: 0,
        },
        savings: {
          totalSaved: 0,
          efficiencyGainMultiplier: 0,
        },
        generatedAt: new Date(),
      };
    }

    let aiCallsCount = 0;
    let humanCallsCount = 0;
    let aiDurationSum = 0;
    let humanDurationSum = 0;
    let aiCostSum = 0;
    let humanCostSum = 0;
    let aiSuccessCount = 0;
    let humanSuccessCount = 0;

    for (const call of calls) {
      const isAi = Boolean(call.transcript?.includes('AI:')) || Number(call.costAmount) < 0.2;
      if (isAi) {
        aiCallsCount += 1;
        aiDurationSum += call.durationSeconds || 0;
        aiCostSum += Number(call.costAmount || 0);
        if (call.status === 'COMPLETED' && (call.durationSeconds || 0) > 20) {
          aiSuccessCount += 1;
        }
      } else {
        humanCallsCount += 1;
        humanDurationSum += call.durationSeconds || 0;
        const simulatedCost = ((call.durationSeconds || 0) / 60) * 0.4;
        humanCostSum += simulatedCost;
        if (call.status === 'COMPLETED' && (call.durationSeconds || 0) > 30) {
          humanSuccessCount += 1;
        }
      }
    }

    const totalSaved = humanCostSum - aiCostSum;

    return {
      ai: {
        totalCalls: aiCallsCount,
        avgDurationSeconds: aiCallsCount > 0 ? Math.round(aiDurationSum / aiCallsCount) : 0,
        totalCost: Math.round(aiCostSum * 100) / 100,
        avgCostPerCall: aiCallsCount > 0 ? Math.round((aiCostSum / aiCallsCount) * 100) / 100 : 0,
        successRate: aiCallsCount > 0 ? Math.round((aiSuccessCount / aiCallsCount) * 100) : 0,
        conversionRate: 0,
      },
      human: {
        totalCalls: humanCallsCount,
        avgDurationSeconds:
          humanCallsCount > 0 ? Math.round(humanDurationSum / humanCallsCount) : 0,
        totalCost: Math.round(humanCostSum * 100) / 100,
        avgCostPerCall:
          humanCallsCount > 0 ? Math.round((humanCostSum / humanCallsCount) * 100) / 100 : 0,
        successRate:
          humanCallsCount > 0 ? Math.round((humanSuccessCount / humanCallsCount) * 100) : 0,
        conversionRate: 0,
      },
      savings: {
        totalSaved: Math.round(totalSaved * 100) / 100,
        efficiencyGainMultiplier:
          humanCallsCount > 0 ? Math.round((aiCallsCount / humanCallsCount) * 10) / 10 : 0,
      },
      generatedAt: new Date(),
    };
  }

  private generatePDFBytes(title: string, data: unknown): Buffer {
    const lines = [
      `Title: ${title}`,
      `Generated At: ${new Date().toISOString()}`,
      `---------------------------------------`,
      '',
    ];

    if (Array.isArray(data)) {
      for (const item of data) {
        lines.push(JSON.stringify(item));
      }
    } else if (data && typeof data === 'object') {
      for (const [key, val] of Object.entries(data)) {
        if (val && typeof val === 'object') {
          lines.push(`${key.toUpperCase()}:`);
          for (const [nestedKey, nestedVal] of Object.entries(val as Record<string, unknown>)) {
            lines.push(`  ${nestedKey}: ${nestedVal}`);
          }
        } else {
          lines.push(`${key.toUpperCase()}: ${val}`);
        }
      }
    }

    let streamContent = 'BT\n/F1 12 Tf\n14 TL\n50 750 Td\n';
    for (const line of lines) {
      const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      streamContent += `(${escaped}) Tj T*\n`;
    }
    streamContent += 'ET';

    const object1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const object2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
    const object3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>\nendobj\n`;
    const object4 = `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

    const body =
      `%PDF-1.4\n` +
      object1 +
      object2 +
      object3 +
      object4 +
      `xref\n` +
      `0 5\n` +
      `0000000000 65535 f\n` +
      `0000000009 00000 n\n` +
      `0000000058 00000 n\n` +
      `0000000115 00000 n\n` +
      `0000000282 00000 n\n` +
      `trailer\n` +
      `<< /Size 5 /Root 1 0 R >>\n` +
      `startxref\n` +
      `350\n` +
      `%%EOF`;

    return Buffer.from(body, 'utf-8');
  }

  async exportReportPdf(tenantId: string, reportType: string): Promise<Buffer> {
    let title = 'Analytics Report';
    let data: unknown;

    if (reportType === 'roi') {
      title = 'ROI & Campaign Performance Report';
      data = await this.getRoiReport(tenantId);
    } else if (reportType === 'ai-vs-human') {
      title = 'AI vs Human Agent Comparison Report';
      data = await this.getAiVsHumanReport(tenantId);
    } else if (reportType === 'revenue') {
      title = 'Revenue Summary Report';
      data = await this.getRevenueSummary(
        tenantId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString(),
      );
    } else if (reportType === 'pipeline') {
      title = 'Sales Pipeline Analytics Report';
      data = await this.getPipelineAnalytics(tenantId);
    } else {
      title = 'General Analytics Report';
      data = await this.getCrmOverview(tenantId);
    }

    return this.generatePDFBytes(title, data);
  }
}
