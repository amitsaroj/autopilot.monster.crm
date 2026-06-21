import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Subscription as SubscriptionEntity } from '../../database/entities/subscription.entity';
import { Invoice as InvoiceEntity } from '../../database/entities/invoice.entity';
import { Payment } from '../../database/entities/payment.entity';
import { UsageRecord } from '../../database/entities/usage-record.entity';
import { PaymentMethod } from '../../database/entities/payment-method.entity';
import { Plan } from '../../database/entities/plan.entity';
import { AppConfig } from '../../config/app.config';
import { resolveUsagePeriodBounds, UsagePeriod } from './usage-period.util';

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
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
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
    const nodeEnv = this.configService.get<string>('app.nodeEnv');
    if (!webhookSecret) {
      if (nodeEnv === 'production') {
        throw new ForbiddenException('Stripe webhook secret is not configured');
      }
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
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
      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
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
    const sub = await this.subscriptionRepo.findOne({ where: { stripeCustomerId } as Record<string, string> });
    if (!sub) return;

    const existing = await this.invoiceRepo.findOne({
      where: { stripeInvoiceId: invoice.id } as Record<string, string>,
    });
    if (existing) return;

    const stripeInvoice = invoice as Stripe.Invoice & {
      tax?: number;
      payment_intent?: string | Stripe.PaymentIntent | null;
      charge?: string | Stripe.Charge | null;
    };

    const amountPaid = invoice.amount_paid / 100;
    const subtotal = (invoice.subtotal ?? invoice.amount_paid) / 100;
    const tax = (stripeInvoice.tax ?? 0) / 100;
    const periodStart = invoice.period_start ?? invoice.created;
    const periodEnd = invoice.period_end ?? invoice.created;

    const savedInvoice = await this.invoiceRepo.save({
      tenantId: sub.tenantId,
      subscriptionId: sub.id,
      number: invoice.number || `INV-${invoice.id.replace('in_', '').slice(0, 12).toUpperCase()}`,
      status: 'PAID',
      subtotal,
      tax,
      total: amountPaid,
      currency: invoice.currency.toUpperCase(),
      periodStart: new Date(periodStart * 1000),
      periodEnd: new Date(periodEnd * 1000),
      dueDate: invoice.due_date
        ? new Date(invoice.due_date * 1000)
        : new Date(invoice.created * 1000),
      paidAt: new Date(),
      stripeInvoiceId: invoice.id,
      pdfUrl: invoice.invoice_pdf ?? undefined,
      lineItems: (invoice.lines?.data ?? []).map((line) => ({
        description: line.description || 'Subscription',
        amount: (line.amount ?? 0) / 100,
        quantity: line.quantity ?? 1,
        unit_amount: ((line as Stripe.InvoiceLineItem & { price?: { unit_amount?: number } }).price?.unit_amount ?? 0) / 100,
      })),
    } as Partial<InvoiceEntity>);

    const paymentIntentId =
      typeof stripeInvoice.payment_intent === 'string'
        ? stripeInvoice.payment_intent
        : stripeInvoice.payment_intent?.id;

    await this.paymentRepo.save({
      tenantId: sub.tenantId,
      invoiceId: savedInvoice.id,
      amount: amountPaid,
      currency: invoice.currency.toUpperCase(),
      status: 'SUCCEEDED',
      provider: 'stripe',
      providerPaymentId:
        paymentIntentId ||
        (typeof stripeInvoice.charge === 'string' ? stripeInvoice.charge : undefined),
      metadata: { stripeInvoiceId: invoice.id },
    } as Partial<Payment>);
  }

  private async handleChargeRefunded(charge: Stripe.Charge) {
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntentId) return;

    const payment = await this.paymentRepo.findOne({
      where: { providerPaymentId: paymentIntentId } as Record<string, string>,
    });
    if (!payment) return;

    payment.status = 'REFUNDED';
    payment.metadata = {
      ...payment.metadata,
      refundId: charge.refunds?.data[0]?.id,
      refundedAt: new Date().toISOString(),
    };
    await this.paymentRepo.save(payment);
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
    let sub = await this.subscriptionRepo.findOne({
      where: { tenantId } as Record<string, string>,
      order: { createdAt: 'DESC' },
    });
    if (!sub) {
      sub = await this.ensureTrialSubscription(tenantId);
    }
    return sub;
  }

  private async ensureTrialSubscription(tenantId: string): Promise<SubscriptionEntity> {
    const freePlan = await this.planRepo.findOne({ where: { slug: 'FREE' } });
    if (!freePlan) {
      throw new NotFoundException('Default plan not configured');
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const sub = this.subscriptionRepo.create({
      tenantId,
      planId: freePlan.id,
      status: 'TRIAL',
      billingCycle: 'MONTHLY',
      trialEndsAt,
    } as Partial<SubscriptionEntity>);

    return this.subscriptionRepo.save(sub);
  }

  async getInvoices(tenantId: string) {
    return this.invoiceRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async getInvoice(tenantId: string, id: string) {
    const invoice = await this.invoiceRepo.findOne({ where: { id, tenantId } as any });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async getPayments(tenantId: string) {
    return this.paymentRepo.find({ where: { tenantId } as any, order: { createdAt: 'DESC' } });
  }

  async trackUsage(
    tenantId: string,
    metric: string,
    quantity: number,
    period: UsagePeriod = 'MONTHLY',
  ): Promise<UsageRecord> {
    const { periodStart, periodEnd } = resolveUsagePeriodBounds(period);

    const record = await this.usageRepo.findOne({
      where: { tenantId, metric, periodStart },
    });

    if (record) {
      record.quantity = Number(record.quantity) + quantity;
      return this.usageRepo.save(record);
    }

    const newRecord = this.usageRepo.create({
      tenantId,
      metric,
      quantity,
      periodStart,
      periodEnd,
    });
    return this.usageRepo.save(newRecord);
  }

  async getUsage(
    tenantId: string,
    metric: string,
    period: UsagePeriod = 'MONTHLY',
  ): Promise<number> {
    if (metric === 'all') {
      const { periodStart } = resolveUsagePeriodBounds(period);
      const records = await this.usageRepo.find({ where: { tenantId, periodStart } });
      return records.reduce((sum, record) => sum + Number(record.quantity), 0);
    }

    const { periodStart } = resolveUsagePeriodBounds(period);
    const record = await this.usageRepo.findOne({
      where: { tenantId, metric, periodStart },
    });
    return record ? Number(record.quantity) : 0;
  }

  async getUsageBreakdown(tenantId: string, period: UsagePeriod = 'MONTHLY'): Promise<Record<string, number>> {
    const { periodStart } = resolveUsagePeriodBounds(period);
    const records = await this.usageRepo.find({ where: { tenantId, periodStart } });
    return records.reduce<Record<string, number>>((acc, record) => {
      acc[record.metric] = Number(record.quantity);
      return acc;
    }, {});
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

  async getGlobalUsage(metric: string = 'all'): Promise<Record<string, number> | number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (metric === 'all') {
        const records = await this.usageRepo.find({ where: { periodStart: startOfMonth } as Record<string, Date> });
        return records.reduce((acc: Record<string, number>, record) => {
            acc[record.metric] = (acc[record.metric] || 0) + Number(record.quantity);
            return acc;
        }, {});
    }

    const records = await this.usageRepo.find({
      where: { metric, periodStart: startOfMonth } as Record<string, string | Date>,
    });
    return records.reduce((sum, record) => sum + Number(record.quantity), 0);
  }

  private async ensureStripeCustomer(tenantId: string): Promise<string> {
    const sub = await this.subscriptionRepo.findOne({ where: { tenantId } as Record<string, string> });
    if (sub?.stripeCustomerId) {
      return sub.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({ metadata: { tenantId } });
    if (sub) {
      sub.stripeCustomerId = customer.id;
      await this.subscriptionRepo.save(sub);
    }
    return customer.id;
  }

  async listPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    return this.paymentMethodRepo.find({
      where: { tenantId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async createSetupIntent(tenantId: string): Promise<{ clientSecret: string }> {
    const customerId = await this.ensureStripeCustomer(tenantId);
    const intent = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    if (!intent.client_secret) {
      throw new BadRequestException('Failed to create setup intent');
    }

    return { clientSecret: intent.client_secret };
  }

  async attachPaymentMethod(
    tenantId: string,
    paymentMethodId: string,
    setDefault = false,
  ): Promise<PaymentMethod> {
    const customerId = await this.ensureStripeCustomer(tenantId);
    await this.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    const stripeMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);

    if (stripeMethod.type !== 'card' || !stripeMethod.card) {
      throw new BadRequestException('Only card payment methods are supported');
    }

    if (setDefault) {
      await this.clearDefaultPaymentMethod(tenantId);
      await this.stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }

    const existing = await this.paymentMethodRepo.findOne({
      where: { tenantId, stripePaymentMethodId: paymentMethodId },
    });

    if (existing) {
      existing.brand = stripeMethod.card.brand;
      existing.lastFour = stripeMethod.card.last4;
      existing.expMonth = stripeMethod.card.exp_month;
      existing.expYear = stripeMethod.card.exp_year;
      existing.isDefault = setDefault || existing.isDefault;
      return this.paymentMethodRepo.save(existing);
    }

    return this.paymentMethodRepo.save(
      this.paymentMethodRepo.create({
        tenantId,
        stripePaymentMethodId: paymentMethodId,
        type: stripeMethod.type,
        brand: stripeMethod.card.brand,
        lastFour: stripeMethod.card.last4,
        expMonth: stripeMethod.card.exp_month,
        expYear: stripeMethod.card.exp_year,
        isDefault: setDefault,
      }),
    );
  }

  async removePaymentMethod(tenantId: string, id: string): Promise<void> {
    const method = await this.paymentMethodRepo.findOne({ where: { id, tenantId } });
    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    await this.stripe.paymentMethods.detach(method.stripePaymentMethodId);
    await this.paymentMethodRepo.softDelete({ id, tenantId });
  }

  async setDefaultPaymentMethod(tenantId: string, id: string): Promise<PaymentMethod> {
    const method = await this.paymentMethodRepo.findOne({ where: { id, tenantId } });
    if (!method) {
      throw new NotFoundException('Payment method not found');
    }

    const customerId = await this.ensureStripeCustomer(tenantId);
    await this.clearDefaultPaymentMethod(tenantId);
    await this.stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: method.stripePaymentMethodId },
    });

    method.isDefault = true;
    return this.paymentMethodRepo.save(method);
  }

  private async clearDefaultPaymentMethod(tenantId: string): Promise<void> {
    const defaults = await this.paymentMethodRepo.find({ where: { tenantId, isDefault: true } });
    for (const method of defaults) {
      method.isDefault = false;
      await this.paymentMethodRepo.save(method);
    }
  }

  async downgradeSubscription(tenantId: string, planId: string): Promise<SubscriptionEntity> {
    const sub = await this.subscriptionRepo.findOne({ where: { tenantId } as Record<string, string> });
    if (!sub?.stripeSubscriptionId) {
      throw new NotFoundException('Active subscription not found');
    }

    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const priceId =
      sub.billingCycle === 'MONTHLY' ? plan.stripePriceIdMonthly : plan.stripePriceIdAnnual;
    if (!priceId) {
      throw new BadRequestException('Target plan price not configured in Stripe');
    }

    const stripeSub = await this.stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    const itemId = stripeSub.items.data[0]?.id;
    if (!itemId) {
      throw new BadRequestException('Subscription has no line items');
    }

    await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: 'create_prorations',
    });

    sub.planId = planId;
    return this.subscriptionRepo.save(sub);
  }

  async cancelSubscription(tenantId: string, atPeriodEnd = true): Promise<SubscriptionEntity> {
    const sub = await this.subscriptionRepo.findOne({ where: { tenantId } as Record<string, string> });
    if (!sub?.stripeSubscriptionId) {
      throw new NotFoundException('Active subscription not found');
    }

    if (atPeriodEnd) {
      await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      await this.stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      sub.status = 'CANCELLED';
      sub.cancelledAt = new Date();
    }

    return this.subscriptionRepo.save(sub);
  }

  async reactivateSubscription(tenantId: string): Promise<SubscriptionEntity> {
    const sub = await this.subscriptionRepo.findOne({ where: { tenantId } as Record<string, string> });
    if (!sub?.stripeSubscriptionId) {
      throw new NotFoundException('Subscription not found');
    }

    await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    sub.status = 'ACTIVE';
    sub.cancelledAt = undefined;
    return this.subscriptionRepo.save(sub);
  }
}
