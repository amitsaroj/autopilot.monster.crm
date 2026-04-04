import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Subscription as SubscriptionEntity } from '../../database/entities/subscription.entity';
import { Invoice as InvoiceEntity } from '../../database/entities/invoice.entity';
import { Payment } from '../../database/entities/payment.entity';
import { UsageRecord } from '../../database/entities/usage-record.entity';
import { Plan } from '../../database/entities/plan.entity';
import { AppConfig } from '../../config/app.config';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepo: Repository<InvoiceEntity>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(UsageRecord)
    private readonly usageRepo: Repository<UsageRecord>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
    private readonly configService: ConfigService,
  ) {
    const stripeConfig = this.configService.get<AppConfig['stripe']>('app.stripe');
    if (!stripeConfig?.secretKey) {
      throw new Error('STRIPE_SECRET_KEY is missing');
    }
    this.stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2025-01-27' as any,
    });
  }

  async createCheckoutSession(tenantId: string, planId: string, billingCycle: 'MONTHLY' | 'ANNUAL') {
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const priceId = billingCycle === 'MONTHLY' ? plan.stripePriceIdMonthly : plan.stripePriceIdAnnual;
    if (!priceId) throw new BadRequestException(`Stripe price ID for ${billingCycle} not configured`);

    const sub = await this.subscriptionRepo.findOne({ where: { tenantId } as any });
    
    let customerId = sub?.stripeCustomerId;
    if (!customerId) {
        const customer = await this.stripe.customers.create({
            metadata: { tenantId },
        });
        customerId = customer.id;
    }

    const appUrl = this.configService.get<string>('app.frontendUrl');

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      metadata: { tenantId, planId, billingCycle },
    });

    return { url: session.url };
  }

  async createPortalSession(tenantId: string) {
    const sub = await this.subscriptionRepo.findOne({ where: { tenantId } as any });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestException('No stripe customer found for this tenant');
    }

    const appUrl = this.configService.get<string>('app.frontendUrl');
    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('app.stripe.webhookSecret');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret!);
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const { tenantId, planId, billingCycle } = session.metadata!;
    const stripeSubscriptionId = session.subscription as string;
    const stripeCustomerId = session.customer as string;

    const stripeSub = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
    if (!stripeSub) return;

    let sub = await this.subscriptionRepo.findOne({ where: { tenantId } as any });
    if (!sub) {
      sub = this.subscriptionRepo.create({ tenantId } as any) as any;
    }

    if (sub) {
        sub.planId = planId;
        sub.billingCycle = billingCycle as any;
        sub.status = 'ACTIVE';
        sub.stripeCustomerId = stripeCustomerId;
        sub.stripeSubscriptionId = stripeSubscriptionId;
        sub.currentPeriodStart = new Date((stripeSub as any).current_period_start * 1000);
        sub.currentPeriodEnd = new Date((stripeSub as any).current_period_end * 1000);

        await this.subscriptionRepo.save(sub);
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const stripeCustomerId = invoice.customer as string;
    const sub = await this.subscriptionRepo.findOne({ where: { stripeCustomerId } as any });
    if (!sub) return;

    await this.invoiceRepo.save({
      tenantId: sub.tenantId,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'PAID',
      stripeInvoiceId: invoice.id,
      invoiceUrl: invoice.hosted_invoice_url || '',
      createdAt: new Date(invoice.created * 1000),
    } as any);

    const paymentIntentId = typeof (invoice as any).payment_intent === 'string' 
      ? (invoice as any).payment_intent 
      : ((invoice as any).payment_intent as any)?.id;

    await this.paymentRepo.save({
      tenantId: sub.tenantId,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'SUCCEEDED',
      stripePaymentIntentId: paymentIntentId || '',
      method: 'CARD', 
    } as any);
  }

  private async handleSubscriptionChange(stripeSub: Stripe.Subscription) {
    const sub = await this.subscriptionRepo.findOne({
      where: { stripeSubscriptionId: stripeSub.id } as any,
    });
    if (!sub) return;

    const statusMap: Record<string, SubscriptionEntity['status']> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      unpaid: 'PAST_DUE',
      canceled: 'CANCELLED',
      incomplete: 'PAST_DUE',
      trialing: 'TRIAL',
    };

    sub.status = statusMap[stripeSub.status] || 'EXPIRED';
    sub.currentPeriodStart = new Date((stripeSub as any).current_period_start * 1000);
    sub.currentPeriodEnd = new Date((stripeSub as any).current_period_end * 1000);

    if (stripeSub.status === 'canceled') {
        sub.cancelledAt = new Date();
    }

    await this.subscriptionRepo.save(sub);
  }

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
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const record = await this.usageRepo.findOne({
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
        return records.reduce((acc: any, r: any) => {
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
