import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../database/entities/subscription.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { Payment } from '../../database/entities/payment.entity';
import { UsageRecord } from '../../database/entities/usage-record.entity';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(UsageRecord)
    private readonly usageRepo: Repository<UsageRecord>,
  ) {}

  async getSubscription(tenantId: string) {
    const sub = await this.subscriptionRepo.findOne({ where: { tenantId } as any });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async getInvoices(tenantId: string) {
    return this.invoiceRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async getPayments(tenantId: string) {
    return this.paymentRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async trackUsage(tenantId: string, metric: string, quantity: number) {
    // Basic implementation: update or create usage record for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const record: UsageRecord | null = await this.usageRepo.findOne({
      where: { tenantId, metric, periodStart: startOfMonth } as any,
    });

    if (record) {
      record.quantity = Number(record.quantity) + quantity;
      return this.usageRepo.save(record);
    } else {
      const newRecord = this.usageRepo.create({
        tenantId,
        metric,
        quantity,
        periodStart: startOfMonth,
        periodEnd: endOfMonth,
      } as any);
      return this.usageRepo.save(newRecord);
    }
  }

  async getUsage(tenantId: string, metric: string): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (metric === 'all') {
        const records = await this.usageRepo.find({ where: { tenantId, periodStart: startOfMonth } as any });
        return records.reduce((acc, r) => ({ ...acc, [r.metric]: Number(r.quantity) }), {});
    }

    const record = await this.usageRepo.findOne({
      where: { tenantId, metric, periodStart: startOfMonth } as any,
    });
    return record ? Number(record.quantity) : 0;
  }

  // --- Global Management (SuperAdmin) ---

  async getAllInvoices(options?: any) {
    return this.invoiceRepo.find({
      order: { createdAt: 'DESC' },
      ...options,
    });
  }

  async getAllSubscriptions(options?: any) {
    return this.subscriptionRepo.find({
      order: { createdAt: 'DESC' },
      ...options,
    });
  }

  async getGlobalUsage(metric: string = 'all'): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (metric === 'all') {
        const records = await this.usageRepo.find({ where: { periodStart: startOfMonth } as any });
        return records.reduce((acc, r) => {
            acc[r.metric] = (acc[r.metric] || 0) + Number(r.quantity);
            return acc;
        }, {} as Record<string, number>);
    }

    const records = await this.usageRepo.find({
      where: { metric, periodStart: startOfMonth } as any,
    });
    return records.reduce((sum, r) => sum + Number(r.quantity), 0);
  }
}
