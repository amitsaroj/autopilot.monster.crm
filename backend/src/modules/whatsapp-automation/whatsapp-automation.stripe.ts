import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import Stripe from 'stripe';
import { EntityManager } from 'typeorm';
import { Flow } from '../../database/entities/flow.entity';
import { Plugin } from '../../database/entities/plugin.entity';
import { ProductEntitlement } from '../../database/entities/product-entitlement.entity';
import { Subscription } from '../../database/entities/subscription.entity';
import { TenantPlugin } from '../../database/entities/tenant-plugin.entity';
import {
  AUTOMATION_PLUGIN_CATEGORY,
  getAutomationDefinition,
} from './whatsapp-automation.registry';

const PRODUCT_KIND = 'WHATSAPP_AUTOMATION';
function providerId(value: unknown): string | null {
  return typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value && typeof value.id === 'string'
      ? value.id
      : null;
}

/** Uses the existing billing Stripe client; no second payment configuration or unsigned grant path. */
export class WhatsappAutomationStripeBilling {
  constructor(
    private readonly stripe: Stripe,
    private readonly manager: EntityManager,
  ) {}

  async checkout(tenantId: string, pluginId: string, version: string, frontendUrl: string) {
    const plugin = await this.manager
      .getRepository(Plugin)
      .findOne({ where: { id: pluginId, status: 'ACTIVE', category: AUTOMATION_PLUGIN_CATEGORY } });
    if (!plugin?.isPremium || !plugin.stripePriceId)
      throw new BadRequestException('Paid product Stripe price is not configured');
    const product = getAutomationDefinition(plugin.slug);
    if (!product || product.availability !== 'IMPLEMENTED' || product.version !== version)
      throw new BadRequestException('Product/version is not purchasable');
    const price = await this.stripe.prices.retrieve(plugin.stripePriceId);
    if (
      !price.active ||
      price.unit_amount === null ||
      price.unit_amount <= 0 ||
      price.billing_scheme !== 'per_unit' ||
      (price.recurring &&
        (price.recurring.usage_type !== 'licensed' ||
          !['month', 'year'].includes(price.recurring.interval)))
    ) {
      throw new BadRequestException(
        'Product requires an active fixed one-time or licensed monthly/annual Stripe price',
      );
    }
    const frontend = new URL(frontendUrl);
    if (!['https:', 'http:'].includes(frontend.protocol) || frontend.username || frontend.password)
      throw new BadRequestException('Frontend billing return URL is not configured');

    return this.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `whatsapp-automation:${tenantId}:${plugin.id}`,
      ]);
      const repository = manager.getRepository(ProductEntitlement);
      const active = await repository
        .createQueryBuilder('entitlement')
        .where('entitlement.tenantId = :tenantId', { tenantId })
        .andWhere('entitlement.pluginId = :pluginId', { pluginId })
        .andWhere('entitlement.status = :status', { status: 'ACTIVE' })
        .andWhere('(entitlement.expiresAt IS NULL OR entitlement.expiresAt > now())')
        .getExists();
      if (active) throw new ConflictException('This workspace already owns this product');
      // Reuse a pending session rather than opening parallel charge opportunities.
      const pending = await repository.findOne({
        where: { tenantId, pluginId, status: 'PENDING' },
        order: { createdAt: 'DESC' },
      });
      if (pending?.checkoutSessionId) {
        const session = await this.stripe.checkout.sessions.retrieve(pending.checkoutSessionId);
        if (session.status === 'open' && pending.stripePriceId === price.id && session.url)
          return this.checkoutResult(session, price);
        if (session.status === 'complete')
          throw new ConflictException('Payment is awaiting signed webhook confirmation');
        pending.status = 'EXPIRED';
        await repository.save(pending);
      }
      const entitlement = await repository.save(
        repository.create({
          tenantId,
          pluginId,
          status: 'PENDING',
          source: 'STRIPE',
          stripePriceId: price.id,
          productVersion: version,
          lastEventCreated: 0,
        }),
      );
      const metadata = {
        productKind: PRODUCT_KIND,
        tenantId,
        pluginId,
        entitlementId: entitlement.id,
        productVersion: version,
        stripePriceId: price.id,
      };
      const platformSubscription = await manager
        .getRepository(Subscription)
        .findOne({ where: { tenantId } });
      const session = await this.stripe.checkout.sessions.create(
        {
          mode: price.recurring ? 'subscription' : 'payment',
          line_items: [{ price: price.id, quantity: 1 }],
          ...(platformSubscription?.stripeCustomerId
            ? { customer: platformSubscription.stripeCustomerId }
            : {}),
          metadata,
          ...(price.recurring
            ? { subscription_data: { metadata } }
            : { payment_intent_data: { metadata } }),
          success_url: `${frontend.origin}/whatsapp/automations?checkout=complete&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${frontend.origin}/whatsapp/automations?checkout=canceled`,
        },
        { idempotencyKey: `whatsapp-product-checkout:${entitlement.id}` },
      );
      entitlement.checkoutSessionId = session.id;
      entitlement.stripeCustomerId = providerId(session.customer);
      await repository.save(entitlement);
      return this.checkoutResult(session, price);
    });
  }

  /** Must only receive events constructed by BillingService's signature verification. */
  async handleVerifiedEvent(event: Stripe.Event): Promise<boolean> {
    if (
      [
        'checkout.session.completed',
        'checkout.session.async_payment_succeeded',
        'checkout.session.expired',
        'checkout.session.async_payment_failed',
      ].includes(event.type)
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.productKind !== PRODUCT_KIND) return false;
      const entitlement = await this.manager
        .getRepository(ProductEntitlement)
        .findOne({ where: { id: session.metadata.entitlementId } });
      if (!entitlement) throw new ForbiddenException('Unknown product checkout entitlement');
      this.assertSessionBinding(entitlement, session);
      if (
        event.type === 'checkout.session.expired' ||
        event.type === 'checkout.session.async_payment_failed'
      ) {
        await this.transition(entitlement, event, 'EXPIRED', null, 'CHECKOUT_EXPIRED');
        return true;
      }
      // A browser redirect or an unpaid completed session never grants access.
      if (session.payment_status !== 'paid') return true;
      const verified = await this.stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'subscription'],
      });
      this.assertSessionBinding(entitlement, verified);
      if (
        verified.payment_status !== 'paid' ||
        verified.status !== 'complete' ||
        verified.amount_total === null ||
        verified.amount_total <= 0 ||
        verified.line_items?.data.length !== 1 ||
        verified.line_items.data[0].price?.id !== entitlement.stripePriceId ||
        verified.line_items.data[0].quantity !== 1
      ) {
        throw new ForbiddenException('Product checkout payment/price could not be verified');
      }
      entitlement.paymentIntentId = providerId(verified.payment_intent);
      entitlement.stripeSubscriptionId = providerId(verified.subscription);
      entitlement.stripeCustomerId = providerId(verified.customer);
      let expiresAt: Date | null = null;
      if (entitlement.stripeSubscriptionId) {
        const subscription = await this.stripe.subscriptions.retrieve(
          entitlement.stripeSubscriptionId,
        );
        expiresAt = this.verifiedSubscriptionPeriod(entitlement, subscription);
        const latestInvoiceId = providerId(subscription.latest_invoice);
        if (!latestInvoiceId) throw new ForbiddenException('Paid subscription invoice is missing');
        const invoice = await this.stripe.invoices.retrieve(latestInvoiceId);
        if (invoice.status !== 'paid' || invoice.amount_paid <= 0)
          throw new ForbiddenException('Product subscription invoice is not paid');
      }
      await this.transition(entitlement, event, 'ACTIVE', expiresAt, null);
      return true;
    }

    if (['invoice.paid', 'invoice.payment_failed'].includes(event.type)) {
      const invoice = event.data.object as Stripe.Invoice;
      const raw = invoice as unknown as {
        subscription?: unknown;
        parent?: { subscription_details?: { subscription?: unknown } };
      };
      const subscriptionId =
        providerId(raw.subscription) ?? providerId(raw.parent?.subscription_details?.subscription);
      if (!subscriptionId) return false;
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.metadata.productKind !== PRODUCT_KIND) return false;
      const entitlement = await this.manager
        .getRepository(ProductEntitlement)
        .findOne({ where: { id: subscription.metadata.entitlementId } });
      if (!entitlement) throw new ForbiddenException('Unknown product subscription entitlement');
      this.assertSubscriptionBinding(entitlement, subscription);
      entitlement.stripeSubscriptionId = subscription.id;
      entitlement.stripeCustomerId = providerId(subscription.customer);
      if (event.type === 'invoice.payment_failed') {
        await this.transition(entitlement, event, 'EXPIRED', new Date(), 'PAYMENT_FAILED');
      } else {
        const verified = await this.stripe.invoices.retrieve(invoice.id);
        if (
          providerId(subscription.latest_invoice) !== invoice.id ||
          verified.status !== 'paid' ||
          verified.amount_paid <= 0 ||
          providerId(verified.customer) !== providerId(subscription.customer)
        )
          throw new ForbiddenException('Product invoice is not the current paid invoice');
        await this.transition(
          entitlement,
          event,
          'ACTIVE',
          this.verifiedSubscriptionPeriod(entitlement, subscription),
          null,
        );
      }
      return true;
    }

    if (['customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.metadata.productKind !== PRODUCT_KIND) return false;
      const entitlement = await this.manager
        .getRepository(ProductEntitlement)
        .findOne({ where: { id: subscription.metadata.entitlementId } });
      if (!entitlement) throw new ForbiddenException('Unknown product subscription entitlement');
      this.assertSubscriptionBinding(entitlement, subscription);
      entitlement.stripeSubscriptionId = subscription.id;
      // Subscription status alone cannot grant or extend paid access. Only paid checkout/invoices do.
      if (
        event.type === 'customer.subscription.deleted' ||
        !['active'].includes(subscription.status)
      ) {
        await this.transition(
          entitlement,
          event,
          'REVOKED',
          new Date(),
          subscription.status === 'canceled' ? 'CANCELLED' : 'SUBSCRIPTION_INACTIVE',
        );
      }
      return true;
    }

    if (event.type === 'charge.refunded' || event.type === 'charge.dispute.created') {
      const object = event.data.object as Stripe.Charge | Stripe.Dispute;
      const paymentIntentId = providerId(object.payment_intent);
      if (!paymentIntentId) return false;
      const records = await this.manager
        .getRepository(ProductEntitlement)
        .find({ where: { paymentIntentId } });
      if (!records.length) return false;
      for (const entitlement of records)
        await this.transition(
          entitlement,
          event,
          'REVOKED',
          new Date(),
          event.type === 'charge.refunded' ? 'REFUNDED' : 'DISPUTED',
        );
      return true;
    }
    return false;
  }

  private assertSessionBinding(entitlement: ProductEntitlement, session: Stripe.Checkout.Session) {
    const metadata = session.metadata;
    if (
      entitlement.checkoutSessionId !== session.id ||
      metadata?.tenantId !== entitlement.tenantId ||
      metadata.pluginId !== entitlement.pluginId ||
      metadata.entitlementId !== entitlement.id ||
      metadata.productVersion !== entitlement.productVersion ||
      metadata.stripePriceId !== entitlement.stripePriceId
    ) {
      throw new ForbiddenException('Product checkout does not match its stored entitlement');
    }
  }

  private assertSubscriptionBinding(
    entitlement: ProductEntitlement,
    subscription: Stripe.Subscription,
  ) {
    const metadata = subscription.metadata;
    if (
      metadata.tenantId !== entitlement.tenantId ||
      metadata.pluginId !== entitlement.pluginId ||
      metadata.entitlementId !== entitlement.id ||
      metadata.stripePriceId !== entitlement.stripePriceId ||
      metadata.productVersion !== entitlement.productVersion ||
      (entitlement.stripeSubscriptionId && entitlement.stripeSubscriptionId !== subscription.id)
    )
      throw new ForbiddenException('Product subscription does not match entitlement');
  }

  private verifiedSubscriptionPeriod(
    entitlement: ProductEntitlement,
    subscription: Stripe.Subscription,
  ): Date {
    this.assertSubscriptionBinding(entitlement, subscription);
    const item = subscription.items.data[0];
    const raw = subscription as unknown as { current_period_end?: number };
    const itemRaw = item as unknown as { current_period_end?: number } | undefined;
    const end = raw.current_period_end ?? itemRaw?.current_period_end;
    if (
      subscription.status !== 'active' ||
      subscription.items.data.length !== 1 ||
      item?.price.id !== entitlement.stripePriceId ||
      item.quantity !== 1 ||
      !end ||
      !Number.isFinite(end) ||
      end * 1000 <= Date.now()
    )
      throw new ForbiddenException('Product subscription is not active for the expected price');
    return new Date(end * 1000);
  }

  private async transition(
    candidate: ProductEntitlement,
    event: Stripe.Event,
    status: ProductEntitlement['status'],
    expiresAt: Date | null,
    reason: string | null,
  ) {
    await this.manager.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `whatsapp-automation:${candidate.tenantId}:${candidate.pluginId}`,
      ]);
      const repository = manager.getRepository(ProductEntitlement);
      const stored = await repository.findOne({
        where: { id: candidate.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        !stored ||
        stored.lastEventId === event.id ||
        Number(stored.lastEventCreated) > event.created
      )
        return;
      if (
        status === 'ACTIVE' &&
        (['REFUNDED', 'DISPUTED', 'CANCELLED'].includes(stored.revocationReason ?? '') ||
          (Number(stored.lastEventCreated) === event.created && stored.status === 'REVOKED'))
      )
        return;
      stored.status = status;
      stored.expiresAt = expiresAt;
      stored.revocationReason = reason;
      stored.paymentIntentId = candidate.paymentIntentId;
      stored.stripeCustomerId = candidate.stripeCustomerId;
      stored.stripeSubscriptionId = candidate.stripeSubscriptionId;
      stored.lastEventId = event.id;
      stored.lastEventCreated = event.created;
      await repository.save(stored);
      if (status !== 'ACTIVE') {
        const rows = await manager
          .getRepository(TenantPlugin)
          .find({ where: { tenantId: stored.tenantId, pluginId: stored.pluginId } });
        for (const row of rows) {
          if (row.config.kind !== PRODUCT_KIND || typeof row.config.flowId !== 'string') continue;
          await manager
            .getRepository(Flow)
            .update({ id: row.config.flowId, tenantId: row.tenantId }, { isPublished: false });
          row.isEnabled = false;
          row.config = {
            ...row.config,
            state: row.config.state === 'UNINSTALLED' ? 'UNINSTALLED' : 'DISABLED',
          };
          await manager.getRepository(TenantPlugin).save(row);
        }
      }
    });
  }

  private checkoutResult(session: Stripe.Checkout.Session, price: Stripe.Price) {
    return {
      url: session.url,
      sessionId: session.id,
      status: 'PENDING' as const,
      pricing: {
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval ?? null,
        intervalCount: price.recurring?.interval_count ?? null,
        unit: 'minor' as const,
      },
    };
  }
}
