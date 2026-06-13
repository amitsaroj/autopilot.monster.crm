import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../../database/entities/lead.entity';

interface ScoringRule {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'exists';
  value: any;
  points: number;
}

@Injectable()
export class LeadScoringService {

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
  ) {}

  /** Apply rule-based scoring to a lead */
  async scoreLead(tenantId: string, leadId: string, rules: ScoringRule[]): Promise<{ leadId: string; score: number; breakdown: Array<{ rule: string; points: number }> }> {
    const lead = await this.leadRepo.findOne({ where: { id: leadId, tenantId } as any });
    if (!lead) return { leadId, score: 0, breakdown: [] };

    let totalScore = 0;
    const breakdown: Array<{ rule: string; points: number }> = [];

    for (const rule of rules) {
      const fieldValue = (lead as any)[rule.field];
      let matched = false;

      switch (rule.operator) {
        case 'equals': matched = fieldValue === rule.value; break;
        case 'contains': matched = typeof fieldValue === 'string' && fieldValue.includes(rule.value); break;
        case 'gt': matched = Number(fieldValue) > Number(rule.value); break;
        case 'lt': matched = Number(fieldValue) < Number(rule.value); break;
        case 'exists': matched = fieldValue != null && fieldValue !== ''; break;
      }

      if (matched) {
        totalScore += rule.points;
        breakdown.push({ rule: `${rule.field} ${rule.operator} ${rule.value}`, points: rule.points });
      }
    }

    lead.score = Math.min(100, Math.max(0, totalScore));
    await this.leadRepo.save(lead);

    return { leadId, score: lead.score, breakdown };
  }

  /** Batch score all leads for a tenant */
  async batchScore(tenantId: string, rules: ScoringRule[]): Promise<{ processed: number; avgScore: number }> {
    const leads = await this.leadRepo.find({ where: { tenantId } as any });
    let totalScore = 0;

    for (const lead of leads) {
      const result = await this.scoreLead(tenantId, lead.id, rules);
      totalScore += result.score;
    }

    return {
      processed: leads.length,
      avgScore: leads.length > 0 ? Math.round(totalScore / leads.length) : 0,
    };
  }

  /** Auto-assign leads based on score thresholds */
  async autoAssign(tenantId: string, thresholds: Array<{ minScore: number; maxScore: number; assigneeId: string }>): Promise<{ assigned: number }> {
    let assigned = 0;
    const leads = await this.leadRepo.find({ where: { tenantId } as any });

    for (const lead of leads) {
      for (const threshold of thresholds) {
        if (lead.score >= threshold.minScore && lead.score <= threshold.maxScore) {
          (lead as any).assignedTo = threshold.assigneeId;
          await this.leadRepo.save(lead);
          assigned++;
          break;
        }
      }
    }

    return { assigned };
  }

  /** Auto-update pipeline status based on score thresholds */
  async autoPipelineUpdate(tenantId: string, thresholds: Array<{ minScore: number; maxScore: number; targetStatus: string }>): Promise<{ updated: number }> {
    let updated = 0;
    const leads = await this.leadRepo.find({ where: { tenantId } as any });

    for (const lead of leads) {
      for (const threshold of thresholds) {
        if (lead.score >= threshold.minScore && lead.score <= threshold.maxScore) {
          if (lead.status !== threshold.targetStatus) {
            lead.status = threshold.targetStatus as any;
            await this.leadRepo.save(lead);
            updated++;
          }
          break;
        }
      }
    }

    return { updated };
  }
}
