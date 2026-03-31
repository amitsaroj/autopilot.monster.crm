import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../../database/entities/tenant.entity';
import { UserEntity as User } from '@autopilot/core/modules/auth/entities/user.entity';
import { Subscription } from '../../../database/entities/subscription.entity';
import { Invoice } from '../../../database/entities/invoice.entity';
import { BillingService } from '../../billing/billing.service';

@Injectable()
export class AdminMetricsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    private readonly billingService: BillingService,
  ) {}

  async getGlobalStats() {
    const [tenantsCount, usersCount, activeSubs, totalRevenue] = await Promise.all([
      this.tenantRepo.count(),
      this.userRepo.count(),
      this.subscriptionRepo.count({ where: { status: 'ACTIVE' } }),
      this.invoiceRepo.createQueryBuilder('invoice')
        .select('SUM(invoice.total)', 'total')
        .where('invoice.status = :status', { status: 'PAID' })
        .getRawOne(),
    ]);

    const usage = await this.billingService.getGlobalUsage('all');

    return {
      tenants: tenantsCount,
      users: usersCount,
      activeSubscriptions: activeSubs,
      totalRevenue: parseFloat(totalRevenue?.total || 0),
      usage,
    };
  }

  async getHealth() {
    return {
      status: 'UP',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}
