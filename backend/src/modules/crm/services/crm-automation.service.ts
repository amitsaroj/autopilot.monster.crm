import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, ContactStatus } from '../../../database/entities/contact.entity';
import { Deal, DealStatus } from '../../../database/entities/deal.entity';
import { Task, TaskPriority } from '../../../database/entities/task.entity';
import { DealHistory } from '../../../database/entities/deal-history.entity';

@Injectable()
export class CrmAutomationService {
  private readonly logger = new Logger(CrmAutomationService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(DealHistory)
    private readonly dealHistoryRepo: Repository<DealHistory>,
  ) {}

  @OnEvent('contact.created')
  async handleContactCreated(payload: { contact: Contact; tenantId: string }) {
    this.logger.debug(`Automating for New Contact: ${payload.contact.email}`);
    
    // Auto-create welcome task for owner
    if (payload.contact.ownerId) {
      const task = this.taskRepo.create({
        title: `Initial Outreach: ${payload.contact.firstName} ${payload.contact.lastName}`,
        description: `Automated follow-up task for new contact.`,
        contactId: payload.contact.id,
        assigneeId: payload.contact.ownerId,
        priority: TaskPriority.MEDIUM,
        tenantId: payload.tenantId,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
      });
      await this.taskRepo.save(task);
    }
  }

  @OnEvent('deal.created')
  async handleDealCreated(payload: { deal: Deal; tenantId: string }) {
    this.logger.debug(`Automating for New Deal: ${payload.deal.name}`);
    
    // Auto-promote contact status if it was a LEAD
    if (payload.deal.contactId) {
      await this.contactRepo.update(
        { id: payload.deal.contactId, status: ContactStatus.LEAD },
        { status: ContactStatus.PROSPECT }
      );
    }

    // Initialize history
    const history = this.dealHistoryRepo.create({
      dealId: payload.deal.id,
      newStageId: payload.deal.stageId,
      valueAtChange: payload.deal.value,
      probabilityAtChange: payload.deal.probability,
      tenantId: payload.tenantId,
    });
    await this.dealHistoryRepo.save(history);
  }

  @OnEvent('deal.stage.changed')
  async handleDealStageChanged(payload: { 
    deal: Deal; 
    oldStageId: string; 
    newStageId: string; 
    tenantId: string;
    changedBy?: string;
  }) {
    this.logger.debug(`Tracking Stage Change for Deal: ${payload.deal.id}`);
    
    // Record in history flow
    const history = this.dealHistoryRepo.create({
      dealId: payload.deal.id,
      oldStageId: payload.oldStageId,
      newStageId: payload.newStageId,
      valueAtChange: payload.deal.value,
      probabilityAtChange: payload.deal.probability,
      tenantId: payload.tenantId,
      changedById: payload.changedBy,
    });
    
    await this.dealHistoryRepo.save(history);

    // Automation: If moved to WON, send notification/create onboarding task
    if (payload.deal.status === DealStatus.WON) {
       // Future: Trigger onboarding workflow
    }
  }
}
