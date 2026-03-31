import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../../database/entities/subscription.entity';
import { Invoice } from '../../../database/entities/invoice.entity';

@Injectable()
export class SubAdminBillingService {
  constructor(
    @InjectRepository(Subscription) private readonly subRepo: Repository<Subscription>,
    @InjectRepository(Invoice) private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async getSubscription(tenantId: string) {
    return this.subRepo.findOne({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async getInvoices(tenantId: string) {
    return this.invoiceRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }
}
