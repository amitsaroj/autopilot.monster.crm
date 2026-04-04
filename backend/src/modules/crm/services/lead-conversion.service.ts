import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Lead } from '../../../database/entities/lead.entity';
import { Contact, ContactStatus } from '../../../database/entities/contact.entity';
import { Company } from '../../../database/entities/company.entity';
import { Deal, DealStatus } from '../../../database/entities/deal.entity';
import { Pipeline } from '../../../database/entities/pipeline.entity';

@Injectable()
export class LeadConversionService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
  ) {}

  async convertLead(leadId: string, options: { 
    tenantId: string; 
    createCompany?: boolean; 
    createDeal?: boolean;
    dealName?: string;
    pipelineId?: string;
  }) {
    const lead = await this.leadRepo.findOne({ 
       where: { id: leadId, tenantId: options.tenantId } 
    });

    if (!lead) throw new NotFoundException(`Lead Vector ${leadId} not materialized`);
    
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. Create Company if requested
      let companyId: string | undefined;
      if (options.createCompany) {
        const company = manager.create(Company, {
          name: lead.metadata?.company_name || `${lead.lastName}'s Organization`,
          industry: lead.metadata?.industry,
          website: lead.metadata?.website,
          tenantId: options.tenantId,
        });
        const savedCompany = await manager.save(company);
        companyId = savedCompany.id;
      }

      // 2. Create Contact
      const contact = manager.create(Contact, {
        firstName: lead.firstName,
        lastName: lead.lastName || '',
        email: lead.email || '',
        phone: lead.phone,
        companyId: companyId,
        status: ContactStatus.PROSPECT,
        leadSource: 'LEAD_CONVERSION',
        tenantId: options.tenantId,
      });
      const savedContact = await manager.save(contact);

      // 3. Create Deal if requested
      if (options.createDeal && options.pipelineId) {
        const pipeline = await manager.findOne(Pipeline, { 
           where: { id: options.pipelineId, tenantId: options.tenantId },
           relations: ['stages'] 
        });
        
        if (pipeline && pipeline.stages.length > 0) {
           const firstStage = pipeline.stages.sort((a, b) => a.order - b.order)[0];
           const deal = manager.create(Deal, {
             name: options.dealName || `${lead.firstName}'s Strategic Deal`,
             contactId: savedContact.id,
             companyId: companyId,
             pipelineId: pipeline.id,
             stageId: firstStage.id,
             currency: 'USD',
             status: DealStatus.OPEN,
             tenantId: options.tenantId,
           });
           const savedDeal = await manager.save(deal);
           this.eventEmitter.emit('deal.created', { deal: savedDeal, tenantId: options.tenantId });
        }
      }

      // 4. Finalize Lead (Soft Delete or Status change)
      await manager.update(Lead, lead.id, { status: 'CONVERTED' });
      this.eventEmitter.emit('contact.created', { contact: savedContact, tenantId: options.tenantId });

      return { contact: savedContact, companyId };
    });
  }
}
