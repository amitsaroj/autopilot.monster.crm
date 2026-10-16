import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import Stripe from 'stripe';
import { Subscription as SubscriptionEntity } from '../../database/entities/subscription.entity';
import { Invoice as InvoiceEntity } from '../../database/entities/invoice.entity';
import { Payment } from '../../database/entities/payment.entity';
import { UsageRecord } from '../../database/entities/usage-record.entity';
import { PaymentMethod } from '../../database/entities/payment-method.entity';
import { Plan } from '../../database/entities/plan.entity';
import { AppConfig } from '../../config/app.config';
import { resolveUsagePeriodBounds, UsagePeriod } from './usage-period.util';
import { resolveStripePriceId, stripePriceConfigHint } from './stripe-price.util';
import { WhatsappAutomationStripeBilling } from '../whatsapp-automation/whatsapp-automation.stripe';
import { ensureTrialSubscription } from './subscription-entitlement';
import { EVENT_NAMES } from '../../events/event.constants';

type BillingCycle = 'MONTHLY' | 'ANNUAL';
type SubscriptionStatus = SubscriptionEntity['status'];

const STRIPE_STATUS_MAP: Record<string, SubscriptionStatus> = {
  active: 'ACTIVE',
  past_due: 'PAST_DUE',
  unpaid: 'PAST_DUE',
  canceled: 'CANCELLED',
  incomplete: 'PAST_DUE',
  incomplete_expired: 'EXPIRED',
  trialing: 'TRIAL',
};

/** Stripe moved current_period_* from the subscription to its items in newer API versions. */
function stripePeriod(stripeSub: Stripe.Subscription): { start?: Date; end?: Date } {
  type Period = { current_period_start?: number; current_period_end?: number };
  const raw = stripeSub as unknown as Period;
  const item = stripeSub.items?.data?.[0] as unknown as Period | undefined;
  const start = raw.current_period_start ?? item?.current_period_start;
  const end = raw.current_period_end ?? item?.current_period_end;
  return {
    start: start ? new Date(start * 1000) : undefined,
    end: end ? new Date(end * 1000) : undefined,
  };
}

function stripeId(value: string | { id: string } | null | undefined): string | undefined {
  return typeof value === 'string' ? value : value?.id;
}

@Injectable()
export class BillingService {
  private static readonly logger = new Logger(BillingService.name);
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
    const isProduction =
      (this.configService.get<string>('app.nodeEnv') ?? 'development') === 'production';
    const secretKey = stripeConfig?.secretKey;

    if (!secretKey) {
      BillingService.logger.warn(
        'STRIPE_SECRET_KEY is not configured — billing endpoints will fail until a live key is provided.',
      );
    } else if (isProduction && /placeholder|changeme|change-me/i.test(secretKey)) {
      throw new Error('STRIPE_SECRET_KEY must be a live injected secret in production');
    }

    this.stripe = new Stripe(secretKey || 'sk_not_configured', {
      apiVersion: '2025-01-27' as Stripe.LatestApiVersion,
    });
  }

  private getStripePrices(): AppConfig['stripe']['prices'] {
    return (
      this.configService.get<AppConfig['stripe']>('app.stripe')?.prices ?? {
        starterMonthly: '',
        starterAnnual: '',
        proMonthly: '',
        proAnnual: '',
        enterpriseMonthly: '',
        enterpriseAnnual: '',
      }
    );
  }

  private resolvePlanStripePriceId(plan: Plan, billingCycle: 'MONTHLY' | 'ANNUAL'): string {
    const dbPriceId =
      billingCycle === 'MONTHLY' ? plan.stripePriceIdMonthly : plan.stripePriceIdAnnual;
    const priceId = resolveStripePriceId(
      plan.slug,
      billingCycle,
      dbPriceId,
      this.getStripePrices(),
    );

    if (!priceId) {
      throw new BadRequestException(
        `Stripe price ID for plan "${plan.slug}" (${billingCycle}) is not configured. ${stripePriceConfigHint(plan.slug, billingCycle)}`,
      );
    }

    return priceId;
  }

  /**
   * Upgrade entry point. A tenant with a live Stripe subscription gets an in-place price swap
   * (prorated) — never a second subscription. Everyone else goes through Checkout.
   */
  async createCheckoutSession(tenantId: string, planId: string, billingCycle: BillingCycle) {
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const priceId = this.resolvePlanStripePriceId(plan, billingCycle);
    const sub = await this.getSubscription(tenantId);
    const appUrl = this.configService.get<string>('app.frontendUrl');

    if (sub.stripeSubscriptionId) {
      const stripeSub = await this.stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
      if (!['canceled', 'incomplete_expired'].includes(stripeSub.status)) {
        await this.swapSubscriptionPrice(stripeSub, priceId);
        sub.planId = plan.id;
        sub.billingCycle = billingCycle;
        await this.subscriptionRepo.save(sub);
        return { url: `${appUrl}/billing?upgraded=true`, updated: true };
      }
    }

    const customerId = await this.ensureStripeCustomer(tenantId);
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      metadata: { tenantId, planId, billingCycle },
    });

    return { url: session.url, updated: false };
  }

  private async swapSubscriptionPrice(stripeSub: Stripe.Subscription, priceId: string) {
    const itemId = stripeSub.items.data[0]?.id;
    if (!itemId) {
      throw new BadRequestException('Subscription has no line items');
    }
    await this.stripe.subscriptions.update(stripeSub.id, {
      items: [{ id: itemId, price: priceId }],
      proration_behavior: 'create_prorations',
    });
  }

  async createPortalSession(tenantId: string) {
    const sub = await this.subscriptionRepo.findOne({ where: { tenantId } });
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

  async handleWebhook(signature: string, payload: Buffer | undefined) {
    if (!payload?.length) {
      throw new BadRequestException('Missing request body');
    }

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      throw new BadRequestException(`Webhook Error: ${message}`);
    }

    // Idempotency: the stripe_events row and every state change commit together, so a
    // redelivered (or concurrently delivered) event is applied exactly once.
    let duplicate = false;
    await this.subscriptionRepo.manager.transaction(async (manager) => {
      const inserted: unknown[] = await manager.query(
        `INSERT INTO stripe_events (id, type, created) VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING RETURNING id`,
        [event.id, event.type, event.created],
      );
      if (inserted.length === 0) {
        duplicate = true;
        return;
      }
      await this.dispatchEvent(manager, event);
    });

    return { received: true, type: event.type, duplicate };
  }

  private async dispatchEvent(manager: EntityManager, event: Stripe.Event): Promise<void> {
    if (
      await new WhatsappAutomationStripeBilling(
        this.stripe,
        this.subscriptionRepo.manager,
      ).handleVerifiedEvent(event)
    ) {
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(manager, event, event.data.object);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(manager, event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(manager, event, event.data.object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChange(manager, event, event.data.object);
        break;
      case 'charge.refunded':
        await this.handleChargeRefunded(manager, event.data.object);
        break;
      default:
        break;
    }
  }

  isProductCheckoutConfigured(): boolean {
    const key = this.configService.get<string>('app.stripe.secretKey');
    const webhook = this.configService.get<string>('app.stripe.webhookSecret');
    const frontend = this.configService.get<string>('app.frontendUrl');
    return (
      !!key &&
      /^sk_(test|live)_/.test(key) &&
      !/placeholder|changeme|change-me|not_configured/i.test(key) &&
      !!webhook &&
      /^whsec_/.test(webhook) &&
      !/placeholder|changeme|change-me/i.test(webhook) &&
      !!frontend
    );
  }

  async createProductCheckoutSession(tenantId: string, pluginId: string, version: string) {
    if (!this.isProductCheckoutConfigured()) {
      throw new ServiceUnavailableException(
        'Paid product checkout requires configured Stripe credentials, signed webhook secret and frontend URL',
      );
    }
    return new WhatsappAutomationStripeBilling(this.stripe, this.subscriptionRepo.manager).checkout(
      tenantId,
      pluginId,
      version,
      this.configService.get<string>('app.frontendUrl')!,
    );
  }

  /** Locks the subscription row and reports whether `event` is older than what was applied. */
  private async lockSubscription(
    manager: EntityManager,
    where: { tenantId: string } | { stripeSubscriptionId: string } | { stripeCustomerId: string },
  ): Promise<SubscriptionEntity | null> {
    return manager.getRepository(SubscriptionEntity).findOne({
      where,
      order: { createdAt: 'DESC' },
      lock: { mode: 'pessimistic_write' },
    });
  }

  private isStaleEvent(sub: SubscriptionEntity, event: Stripe.Event): boolean {
    return sub.lastStripeEventCreated != null && Number(sub.lastStripeEventCreated) > event.created;
  }

  private setStatus(sub: SubscriptionEntity, status: SubscriptionStatus): void {
    if (status === 'PAST_DUE') {
      sub.pastDueSince =
        sub.status === 'PAST_DUE' && sub.pastDueSince ? sub.pastDueSince : new Date();
    } else {
      sub.pastDueSince = null;
    }
    sub.status = status;
  }

  private enqueueBillingEvent(
    manager: EntityManager,
    tenantId: string,
    event: string,
    eventId: string,
    payload: Record<string, unknown>,
  ): Promise<unknown> {
    return manager.query(
      `INSERT INTO billing_event_outbox (tenant_id, event, event_id, payload)
       VALUES ($1, $2, $3, $4::jsonb) ON CONFLICT (tenant_id, event, event_id) DO NOTHING`,
      [tenantId, event, eventId, JSON.stringify({ tenantId, eventId, ...payload })],
    );
  }

  /** Applies the Stripe subscription's status, plan/price, period and cancellation flags. */
  private async applyStripeSubscription(
    manager: EntityManager,
    sub: SubscriptionEntity,
    stripeSub: Stripe.Subscription,
    event: Stripe.Event,
  ): Promise<void> {
    this.setStatus(
      sub,
      event.type === 'customer.subscription.deleted'
        ? 'CANCELLED'
        : (STRIPE_STATUS_MAP[stripeSub.status] ?? 'EXPIRED'),
    );

    const priceId = stripeSub.items?.data?.[0]?.price?.id;
    const match = priceId ? await this.planForStripePrice(manager, priceId) : null;
    if (match) {
      sub.planId = match.plan.id;
      sub.billingCycle = match.billingCycle;
    }

    const period = stripePeriod(stripeSub);
    sub.currentPeriodStart = period.start ?? sub.currentPeriodStart;
    sub.currentPeriodEnd = period.end ?? sub.currentPeriodEnd;
    sub.trialEndsAt = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : undefined;
    sub.cancelAtPeriodEnd = !!stripeSub.cancel_at_period_end;
    if (sub.status === 'CANCELLED') {
      sub.cancelledAt = sub.cancelledAt ?? new Date(event.created * 1000);
    }
    sub.lastStripeEventCreated = event.created;
  }

  private async planForStripePrice(
    manager: EntityManager,
    priceId: string,
  ): Promise<{ plan: Plan; billingCycle: BillingCycle } | null> {
    const plans = await manager.getRepository(Plan).find();
    for (const plan of plans) {
      for (const billingCycle of ['MONTHLY', 'ANNUAL'] as const) {
        const dbPriceId =
          billingCycle === 'MONTHLY' ? plan.stripePriceIdMonthly : plan.stripePriceIdAnnual;
        if (
          resolveStripePriceId(plan.slug, billingCycle, dbPriceId, this.getStripePrices()) ===
          priceId
        ) {
          return { plan, billingCycle };
        }
      }
    }
    return null;
  }

  private async handleCheckoutComplete(
    manager: EntityManager,
    event: Stripe.Event,
    session: Stripe.Checkout.Session,
  ) {
    const { tenantId, planId, billingCycle } = session.metadata ?? {};
    const stripeSubscriptionId = stripeId(session.subscription);
    if (session.mode !== 'subscription' || !tenantId || !planId || !stripeSubscriptionId) return;

    const stripeSub = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
    const repo = manager.getRepository(SubscriptionEntity);
    const sub =
      (await this.lockSubscription(manager, { tenantId })) ??
      repo.create({ tenantId, planId, billingCycle: 'MONTHLY', status: 'TRIAL' });
    if (this.isStaleEvent(sub, event)) return;

    const previousStripeSubscriptionId = sub.stripeSubscriptionId;
    sub.planId = planId;
    sub.billingCycle = billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY';
    sub.stripeCustomerId = stripeId(session.customer) ?? sub.stripeCustomerId;
    sub.stripeSubscriptionId = stripeSubscriptionId;
    await this.applyStripeSubscription(manager, sub, stripeSub, event);
    await repo.save(sub);
    const lifecycleEvent = previousStripeSubscriptionId
      ? EVENT_NAMES.SUBSCRIPTION_UPDATED
      : EVENT_NAMES.SUBSCRIPTION_CREATED;
    await this.enqueueBillingEvent(manager, tenantId, lifecycleEvent, event.id, {
      subscriptionId: sub.id,
      planId: sub.planId,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString(),
    });

    // A tenant must never be billed for two subscriptions (e.g. two checkout tabs).
    if (previousStripeSubscriptionId && previousStripeSubscriptionId !== stripeSubscriptionId) {
      try {
        await this.stripe.subscriptions.cancel(previousStripeSubscriptionId, { prorate: true });
      } catch (error) {
        BillingService.logger.error(
          `Failed to cancel superseded Stripe subscription ${previousStripeSubscriptionId} (tenant ${tenantId})`,
          error,
        );
      }
    }
  }

  private async handleInvoicePaid(manager: EntityManager, invoice: Stripe.Invoice) {
    const stripeCustomerId = stripeId(invoice.customer);
    if (!stripeCustomerId) return;
    const sub = await manager
      .getRepository(SubscriptionEntity)
      .findOne({ where: { stripeCustomerId } });
    if (!sub) return;

    const existing = await manager
      .getRepository(InvoiceEntity)
      .findOne({ where: { stripeInvoiceId: invoice.id } });
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

    const savedInvoice = await manager.getRepository(InvoiceEntity).save({
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
        unit_amount:
          ((line as Stripe.InvoiceLineItem & { price?: { unit_amount?: number } }).price
            ?.unit_amount ?? 0) / 100,
      })),
    } as Partial<InvoiceEntity>);

    const paymentIntentId =
      typeof stripeInvoice.payment_intent === 'string'
        ? stripeInvoice.payment_intent
        : stripeInvoice.payment_intent?.id;

    const payment = await manager.getRepository(Payment).save({
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
    await this.enqueueBillingEvent(
      manager,
      sub.tenantId,
      EVENT_NAMES.PAYMENT_SUCCEEDED,
      invoice.id,
      {
        paymentId: payment.id,
        invoiceId: savedInvoice.id,
        amount: amountPaid,
        currency: invoice.currency.toUpperCase(),
        status: 'SUCCEEDED',
      },
    );
    if (invoice.billing_reason === 'subscription_cycle') {
      await this.enqueueBillingEvent(
        manager,
        sub.tenantId,
        EVENT_NAMES.SUBSCRIPTION_RENEWED,
        invoice.id,
        {
          subscriptionId: sub.id,
          planId: sub.planId,
          currentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
        },
      );
    }
  }

  private async handleChargeRefunded(manager: EntityManager, charge: Stripe.Charge) {
    const paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

    if (!paymentIntentId) return;

    const paymentRepo = manager.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { providerPaymentId: paymentIntentId },
    });
    if (!payment) return;

    payment.status = 'REFUNDED';
    payment.metadata = {
      ...payment.metadata,
      refundId: charge.refunds?.data[0]?.id,
      refundedAt: new Date().toISOString(),
    };
    await paymentRepo.save(payment);
    await this.enqueueBillingEvent(
      manager,
      payment.tenantId,
      EVENT_NAMES.PAYMENT_REFUNDED,
      charge.id,
      { paymentId: payment.id, status: 'REFUNDED' },
    );
  }

  private async handleSubscriptionChange(
    manager: EntityManager,
    event: Stripe.Event,
    stripeSub: Stripe.Subscription,
  ) {
    const sub = await this.lockSubscription(manager, { stripeSubscriptionId: stripeSub.id });
    if (!sub || this.isStaleEvent(sub, event)) return;

    const previous = `${sub.status}:${sub.planId}:${sub.currentPeriodEnd?.toISOString() ?? ''}:${sub.cancelAtPeriodEnd}`;
    await this.applyStripeSubscription(manager, sub, stripeSub, event);
    await manager.getRepository(SubscriptionEntity).save(sub);
    const next = `${sub.status}:${sub.planId}:${sub.currentPeriodEnd?.toISOString() ?? ''}:${sub.cancelAtPeriodEnd}`;
    if (previous !== next) {
      await this.enqueueBillingEvent(
        manager,
        sub.tenantId,
        sub.status === 'CANCELLED'
          ? EVENT_NAMES.SUBSCRIPTION_CANCELLED
          : EVENT_NAMES.SUBSCRIPTION_UPDATED,
        event.id,
        {
          subscriptionId: sub.id,
          planId: sub.planId,
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd?.toISOString(),
        },
      );
    }
  }

  private async handleInvoicePaymentFailed(
    manager: EntityManager,
    event: Stripe.Event,
    invoice: Stripe.Invoice,
  ) {
    const stripeCustomerId = stripeId(invoice.customer);
    if (!stripeCustomerId) return;
    const sub = await this.lockSubscription(manager, { stripeCustomerId });
    if (!sub || this.isStaleEvent(sub, event)) return;

    this.setStatus(sub, 'PAST_DUE');
    sub.lastStripeEventCreated = event.created;
    await manager.getRepository(SubscriptionEntity).save(sub);
    await this.enqueueBillingEvent(manager, sub.tenantId, EVENT_NAMES.PAYMENT_FAILED, event.id, {
      invoiceId: invoice.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'FAILED',
    });
  }

  async getSubscription(tenantId: string): Promise<SubscriptionEntity> {
    const sub = await this.subscriptionRepo.findOne({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return sub ?? this.ensureTrialSubscription(tenantId);
  }

  /** Idempotent signup hook: gives a tenant with no subscription its trial. */
  ensureTrialSubscription(tenantId: string): Promise<SubscriptionEntity> {
    return ensureTrialSubscription(this.subscriptionRepo.manager, tenantId);
  }

  /**
   * Daily trial expiry. A single conditional UPDATE is idempotent, so it is safe for every
   * replica to run it — no leader election needed. Stripe-managed trials are left to webhooks.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM, { name: 'billing-expire-trials' })
  async expireTrials(now = new Date()): Promise<number> {
    const result = await this.subscriptionRepo.update(
      { status: 'TRIAL', trialEndsAt: LessThan(now), stripeSubscriptionId: IsNull() },
      { status: 'EXPIRED' },
    );
    const expired = result.affected ?? 0;
    if (expired > 0) BillingService.logger.log(`Expired ${expired} trial subscription(s)`);
    return expired;
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

  /** Atomically adds `quantity` (may be negative to release) and returns the new total. */
  async trackUsage(
    tenantId: string,
    metric: string,
    quantity: number,
    period: UsagePeriod = 'MONTHLY',
  ): Promise<number> {
    const rows = await this.upsertUsage(tenantId, metric, quantity, period);
    return Number(rows[0]?.quantity ?? 0);
  }

  /**
   * Atomically adds `quantity` only if the total stays within `limit`. Returns false (and
   * changes nothing) when the limit would be exceeded — one statement, so no check-then-act race.
   */
  async reserveUsage(
    tenantId: string,
    metric: string,
    quantity: number,
    period: UsagePeriod,
    limit: number,
  ): Promise<boolean> {
    if (quantity > limit) return false;
    const rows = await this.upsertUsage(tenantId, metric, quantity, period, limit);
    return rows.length > 0;
  }

  private upsertUsage(
    tenantId: string,
    metric: string,
    quantity: number,
    period: UsagePeriod,
    limit?: number,
  ): Promise<Array<{ quantity: string }>> {
    const { periodStart, periodEnd } = resolveUsagePeriodBounds(period);
    const params: Array<string | number | Date> = [
      tenantId,
      metric,
      quantity,
      periodStart,
      periodEnd,
    ];
    if (limit !== undefined) params.push(limit);
    return this.usageRepo.query(
      `INSERT INTO usage_records (tenant_id, metric, quantity, period_start, period_end)
       VALUES ($1, $2, GREATEST($3::bigint, 0), $4, $5)
       ON CONFLICT (tenant_id, metric, period_start) DO UPDATE
         SET quantity = GREATEST(usage_records.quantity + $3::bigint, 0), updated_at = now()
       ${limit === undefined ? '' : 'WHERE usage_records.quantity + $3::bigint <= $6::bigint'}
       RETURNING quantity`,
      params,
    );
  }

  async getUsage(
    tenantId: string,
    metric: string,
    period: UsagePeriod = 'MONTHLY',
  ): Promise<number> {
    const { periodStart } = resolveUsagePeriodBounds(period);
    if (metric === 'all') {
      const records = await this.usageRepo.find({ where: { tenantId, periodStart } });
      return records.reduce((sum, record) => sum + Number(record.quantity), 0);
    }

    const record = await this.usageRepo.findOne({
      where: { tenantId, metric, periodStart },
    });
    return record ? Number(record.quantity) : 0;
  }

  /** Current-period usage per metric, whatever period (DAILY/MONTHLY/TOTAL) each is metered in. */
  async getUsageBreakdown(tenantId: string, now = new Date()): Promise<Record<string, number>> {
    const records = await this.usageRepo.find({
      where: { tenantId, periodStart: LessThanOrEqual(now), periodEnd: MoreThanOrEqual(now) },
    });
    return records.reduce<Record<string, number>>((acc, record) => {
      acc[record.metric] = (acc[record.metric] ?? 0) + Number(record.quantity);
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
      const records = await this.usageRepo.find({
        where: { periodStart: startOfMonth } as Record<string, Date>,
      });
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
    const sub = await this.getSubscription(tenantId);
    if (sub.stripeCustomerId) {
      return sub.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({ metadata: { tenantId } });
    sub.stripeCustomerId = customer.id;
    await this.subscriptionRepo.save(sub);
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
    const sub = await this.subscriptionRepo.findOne({
      where: { tenantId } as Record<string, string>,
    });
    if (!sub?.stripeSubscriptionId) {
      throw new NotFoundException('Active subscription not found');
    }

    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const priceId = this.resolvePlanStripePriceId(plan, sub.billingCycle);
    const stripeSub = await this.stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    await this.swapSubscriptionPrice(stripeSub, priceId);

    sub.planId = planId;
    return this.subscriptionRepo.save(sub);
  }

  async cancelSubscription(tenantId: string, atPeriodEnd = true): Promise<SubscriptionEntity> {
    const sub = await this.subscriptionRepo.findOne({
      where: { tenantId } as Record<string, string>,
    });
    if (!sub?.stripeSubscriptionId) {
      throw new NotFoundException('Active subscription not found');
    }

    if (atPeriodEnd) {
      await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      sub.cancelAtPeriodEnd = true;
    } else {
      await this.stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      sub.status = 'CANCELLED';
      sub.cancelledAt = new Date();
    }

    return this.subscriptionRepo.save(sub);
  }

  async reactivateSubscription(tenantId: string): Promise<SubscriptionEntity> {
    const sub = await this.subscriptionRepo.findOne({
      where: { tenantId } as Record<string, string>,
    });
    if (!sub?.stripeSubscriptionId) {
      throw new NotFoundException('Subscription not found');
    }

    await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    sub.status = 'ACTIVE';
    sub.cancelAtPeriodEnd = false;
    sub.cancelledAt = undefined;
    return this.subscriptionRepo.save(sub);
  }

  async getBillingRecovery(tenantId: string): Promise<{
    status: string;
    canRetryPayment: boolean;
    hasPaymentMethod: boolean;
  }> {
    const sub = await this.subscriptionRepo.findOne({
      where: { tenantId } as Record<string, string>,
      order: { createdAt: 'DESC' },
    });

    const status = sub?.status ?? 'TRIAL';
    const canRetryPayment = status === 'PAST_DUE';
    const hasPaymentMethod =
      (await this.paymentMethodRepo.count({ where: { tenantId } as Record<string, string> })) > 0;

    return {
      status,
      canRetryPayment,
      hasPaymentMethod,
    };
  }

  async retryFailedPayment(tenantId: string): Promise<{ url: string; status: string }> {
    const sub = await this.subscriptionRepo.findOne({
      where: { tenantId } as Record<string, string>,
    });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestException('No stripe customer found for this tenant');
    }

    if (sub.status !== 'PAST_DUE') {
      throw new BadRequestException('Retry is available only for past due subscriptions');
    }

    const appUrl = this.configService.get<string>('app.frontendUrl');
    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/billing?retry=processed`,
    });

    return { url: session.url, status: sub.status };
  }
}
