import { Injectable } from '@nestjs/common';
import { LeadService } from './lead.service';
import { ContactService } from './contact.service';
import {
  ActivityRepository, 
  TaskCrmRepository, 
  NoteRepository, 
  ProductRepository, 
  QuoteRepository, 
  CampaignRepository,
  EmailRepository,
  TagRepository,
  SegmentRepository,
  CustomFieldRepository,
} from './crm-support.repository';
import { ContactRepository } from './contact.repository';
import { DealRepository } from './deal.repository';

@Injectable()
export class ActivityService {
  constructor(private readonly repo: ActivityRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class TaskCrmService {
  constructor(private readonly repo: TaskCrmRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class NoteService {
  constructor(private readonly repo: NoteRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class ProductService {
  constructor(private readonly repo: ProductRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  findOne(tid: string, id: string) {
    return this.repo.findById(tid, id);
  }
  update(tid: string, id: string, dto: any) {
    return this.repo.updateWithTenant(tid, id, dto);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class QuoteService {
  constructor(private readonly repo: QuoteRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  findOne(tid: string, id: string) {
    return this.repo.findById(tid, id);
  }
  update(tid: string, id: string, dto: any) {
    return this.repo.updateWithTenant(tid, id, dto);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class CampaignCrmService {
  constructor(private readonly repo: CampaignRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  findOne(tid: string, id: string) {
    return this.repo.findById(tid, id);
  }
  update(tid: string, id: string, dto: any) {
    return this.repo.updateWithTenant(tid, id, dto);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class AnalyticsCrmService {
  constructor(
    private readonly dealRepo: DealRepository,
    private readonly contactRepo: ContactRepository,
    private readonly leadService: LeadService,
  ) {}

  async getSummary(tid: string) {
    const deals = await this.dealRepo.findAll(tid);
    const leads = await this.leadService.findAll(tid);
    const contacts = await this.contactRepo.findAll(tid);

    const totalRevenue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const wonDeals = deals.filter(d => d.stageId?.toLowerCase() === 'won').length;

    return {
      totalDeals: deals.length,
      totalRevenue,
      totalLeads: leads.length,
      totalContacts: contacts.length,
      winRate: deals.length > 0 ? (wonDeals / deals.length) * 100 : 0,
    };
  }

  async getPipelineData(tid: string) {
    const deals = await this.dealRepo.findAll(tid);
    const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    return stages.map(s => ({
      name: s,
      value: deals.filter(d => d.stageId?.toLowerCase() === s.toLowerCase()).length,
      amount: deals.filter(d => d.stageId?.toLowerCase() === s.toLowerCase()).reduce((sum, d) => sum + (Number(d.value) || 0), 0),
    }));
  }

  async getLeadFunnels(tid: string) {
    const leads = await this.leadService.findAll(tid);
    const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'];
    return statuses.map(s => ({
      name: s,
      count: leads.filter(l => l.status === s).length,
    }));
  }

  async getRevenueTrend(tid: string) {
    const deals = await this.dealRepo.findAll(tid);
    // Group won deals by month
    const wonDeals = deals.filter(d => d.stageId?.toLowerCase() === 'won');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, idx) => {
       const monthlyDeals = wonDeals.filter(d => new Date(d.createdAt).getMonth() === idx);
       return {
          name: month,
          revenue: monthlyDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
       };
    });
  }

  async getAgentPerformance(tid: string) {
    const deals = await this.dealRepo.findAll(tid);
    const owners = Array.from(new Set(deals.map(d => d.ownerId).filter(id => !!id)));
    
    return owners.map(ownerId => {
       const userDeals = deals.filter(d => d.ownerId === ownerId);
       const won = userDeals.filter(d => d.stageId?.toLowerCase() === 'won');
       return {
          ownerId,
          totalDeals: userDeals.length,
          wonValue: won.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
          winRate: userDeals.length > 0 ? (won.length / userDeals.length) * 100 : 0,
       };
    });
  }
}

@Injectable()
export class EmailCrmService {
  constructor(private readonly repo: EmailRepository) {}

  findAll(tid: string) {
    return this.repo.findAll(tid);
  }

  findOne(tid: string, id: string) {
    return this.repo.findById(tid, id);
  }

  async sendEmail(tid: string, data: any) {
    return this.repo.create(tid, {
      ...data,
      direction: 'OUTBOUND' as any,
    });
  }

  async markAsRead(tid: string, id: string) {
    return this.repo.updateWithTenant(tid, id, { isRead: true });
  }

  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class BulkCrmService {
  constructor(
    private readonly leadService: LeadService,
    private readonly contactService: ContactService,
  ) {}

  async bulkUpdateStatus(tid: string, entityType: 'lead' | 'contact', ids: string[], status: string) {
    const service = entityType === 'lead' ? (this.leadService as any) : (this.contactService as any);
    return Promise.all(ids.map(id => service.update(tid, id, { status })));
  }

  async bulkDelete(tid: string, entityType: 'lead' | 'contact', ids: string[]) {
    const service = entityType === 'lead' ? (this.leadService as any) : (this.contactService as any);
    return Promise.all(ids.map(id => service.remove(tid, id)));
  }
}

@Injectable()
export class TagService {
  constructor(private readonly repo: TagRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class SegmentService {
  constructor(private readonly repo: SegmentRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}

@Injectable()
export class CustomFieldService {
  constructor(private readonly repo: CustomFieldRepository) {}
  create(tid: string, dto: any) {
    return this.repo.create(tid, dto);
  }
  findAll(tid: string) {
    return this.repo.findAll(tid);
  }
  findOne(tid: string, id: string) {
    return this.repo.findById(tid, id);
  }
  update(tid: string, id: string, dto: any) {
    return this.repo.updateWithTenant(tid, id, dto);
  }
  remove(tid: string, id: string) {
    return this.repo.delete(tid, id);
  }
}
