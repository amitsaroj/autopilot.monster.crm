import { Process, Processor } from '@nestjs/bull';
import { ConflictException, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { WhatsAppBroadcastStatus as Status } from '../../database/entities/whatsapp-broadcast.entity';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { WhatsappService } from './whatsapp.service';
import {
  RecipientClaim,
  RecipientOutcome,
  WhatsappBroadcastService,
} from './whatsapp-broadcast.service';
import { WhatsappConsentService } from './whatsapp-consent.service';
import { WhatsappProviderError } from './whatsapp-provider';
import { classifyWhatsappError } from './whatsapp-error-codes';

export interface WhatsappBroadcastJobPayload {
  tenantId: string;
  broadcastId: string;
  contactId?: string;
  phoneNumberId?: string;
  phone?: string;
  templateName?: string;
  language?: string;
  components?: unknown[];
  recipientSendAt?: string;
}

const SENT_STATES = ['SUBMITTED', 'SENT', 'DELIVERED', 'READ'];
/** Longest a worker blocks waiting for a per-number send slot before re-queueing the recipient. */
const MAX_SLOT_WAIT_MS = 10000;
/** RETRY_LATER provider errors (rate limits) per recipient before it is marked failed. */
const MAX_RATE_RETRIES = 5;
// Workers hold no DB lock during the HTTP send, so several can run per replica.
const CONCURRENCY = Math.max(1, Number(process.env['WHATSAPP_BROADCAST_CONCURRENCY']) || 5);

type PreSend =
  | { action: 'send' }
  | { action: 'skip'; reason: string }
  | { action: 'pause'; reason: string }
  | { action: 'defer'; at: number }
  | { action: 'stop' };

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

@Processor(QUEUE_NAMES.WHATSAPP)
export class WhatsappBroadcastProcessor {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly broadcasts: WhatsappBroadcastService,
    private readonly consent: WhatsappConsentService,
    private readonly config: ConfigService,
  ) {}
  @Process('broadcast-start')
  async handleBroadcastStart(job: Job<WhatsappBroadcastJobPayload>): Promise<void> {
    try {
      await this.broadcasts.prepare(job.data.tenantId, job.data.broadcastId);
    } catch (error: unknown) {
      const status = error instanceof HttpException ? error.getStatus() : undefined;
      if (
        (status !== undefined && status >= 400 && status < 500 && status !== 429) ||
        job.attemptsMade + 1 >= (job.opts.attempts ?? 1)
      )
        await this.broadcasts.failPreparation(
          job.data.tenantId,
          job.data.broadcastId,
          error instanceof Error ? error.message : 'Audience preparation failed',
        );
      throw error;
    }
  }

  @Process({ name: 'broadcast-message', concurrency: CONCURRENCY })
  async handleBroadcastMessage(job: Job<WhatsappBroadcastJobPayload>): Promise<void> {
    const { tenantId, broadcastId, contactId } = job.data;
    if (!contactId) return; // Reject legacy freeform jobs.
    const claimed = await this.broadcasts.claimRecipient(tenantId, broadcastId, contactId);
    if (claimed.state === 'busy') return this.broadcasts.deferRecipient(job.data, claimed.retryAt);
    if (claimed.state === 'done') return;
    const { claim } = claimed;
    const release = (bumpAttempt: boolean) =>
      this.broadcasts.releaseRecipient(tenantId, broadcastId, contactId, bumpAttempt);
    const finish = (outcome: RecipientOutcome, messageId: string | null, reason: string | null) =>
      this.broadcasts.finishRecipient(tenantId, broadcastId, contactId, outcome, messageId, reason);
    const lastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);

    let decision: PreSend;
    try {
      decision = await this.preSend(tenantId, broadcastId, contactId, claim);
    } catch (error) {
      // Nothing was submitted yet (DB/Redis hiccup): safe to hand back to Bull's backoff.
      if (!lastAttempt) {
        await release(false);
        throw error;
      }
      await finish('failed', null, messageOf(error, 'Broadcast send preparation failed'));
      return;
    }
    if (decision.action === 'skip') {
      await finish('skipped', null, decision.reason);
      return;
    }
    if (decision.action !== 'send') {
      await release(false);
      if (decision.action === 'pause')
        await this.broadcasts.pauseForError(tenantId, broadcastId, decision.reason);
      if (decision.action === 'defer') await this.broadcasts.deferRecipient(job.data, decision.at);
      return;
    }

    const p = claim.payload;
    // A fresh attempt gets a fresh key; the central sender refuses to resend an attempted key.
    const key = `broadcast-${broadcastId}-${contactId}${claim.attempt ? `-a${claim.attempt}` : ''}`;
    let error: unknown;
    try {
      const message = await this.whatsappService.sendTemplateMessage(
        tenantId,
        p.phone!,
        p.templateName!,
        p.language!,
        p.components ?? [],
        p.phoneNumberId ?? claim.phoneNumberId ?? undefined,
        key,
        broadcastId,
      );
      await (SENT_STATES.includes(message.status)
        ? finish('sent', message.id, null)
        : finish('unknown', message.id, `Message is ${message.status}; reconcile before retrying`));
      return;
    } catch (caught) {
      error = caught;
    }

    // The central message row is the ground truth for whether anything may have reached Meta.
    const row = await this.broadcasts.messageStatus(tenantId, key);
    if (row && SENT_STATES.includes(row.status)) {
      await finish('sent', row.id, null);
      return;
    }
    const providerError = error instanceof WhatsappProviderError ? error : undefined;
    if (
      providerError?.ambiguous ||
      error instanceof ConflictException ||
      (row && row.status !== 'FAILED')
    ) {
      // Never retried automatically: a resend could double-message the contact.
      await finish(
        'unknown',
        row?.id ?? null,
        'Meta acceptance is unknown; reconcile before retrying',
      );
      return;
    }
    const reason = messageOf(error, 'Broadcast send failed');
    if (providerError) {
      const action = classifyWhatsappError(providerError.providerCode, providerError.httpStatus);
      switch (action.type) {
        case 'SUPPRESS_CONTACT':
          await this.consent.recordOptOut(tenantId, p.phone!, 'meta_error_131050', {
            scope: 'MARKETING',
            evidence: `Broadcast ${broadcastId}`,
          });
          await finish('skipped', row?.id ?? null, action.reason);
          return;
        case 'PAUSE_BROADCAST':
          await release(Boolean(row));
          await this.broadcasts.pauseForError(tenantId, broadcastId, action.reason);
          return;
        case 'RETRY_LATER':
          if (claim.attempt < MAX_RATE_RETRIES) {
            await release(Boolean(row));
            await this.broadcasts.deferRecipient(job.data, Date.now() + action.delayMs);
          } else await finish('failed', row?.id ?? null, action.reason);
          return;
        case 'FAIL_PERMANENT':
          await finish('failed', row?.id ?? null, action.reason);
          return;
      }
    }
    if (row) {
      await finish('failed', row.id, reason); // Definite rejection reported without provider detail.
      return;
    }
    // No message row: the request never reached Meta.
    const status = error instanceof HttpException ? error.getStatus() : undefined;
    const permanent = status !== undefined && status >= 400 && status < 500 && status !== 429;
    if (!permanent && !lastAttempt) {
      await release(false);
      throw error;
    }
    await finish('failed', null, reason);
  }

  private async preSend(
    tenantId: string,
    broadcastId: string,
    contactId: string,
    claim: RecipientClaim,
  ): Promise<PreSend> {
    const p = claim.payload;
    const sender = p.phoneNumberId ?? claim.phoneNumberId ?? 'default';
    const waitMs = await this.waitForSlot(sender);
    if (waitMs > 0) return { action: 'defer', at: Date.now() + waitMs };

    let category: Parameters<WhatsappConsentService['getEligibility']>[2];
    try {
      const t = await this.broadcasts.approvedTemplate(tenantId, claim.templateId);
      if (t.name !== p.templateName || t.language !== p.language)
        return { action: 'pause', reason: 'Template changed after the audience was prepared' };
      category = t.category;
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() < 500)
        return { action: 'pause', reason: `Template unavailable: ${error.message}` };
      throw error;
    }

    // Consent can change while a campaign is pending: re-check every recipient right before sending.
    const c = await this.broadcasts.recipientContact(tenantId, contactId);
    if (
      !c ||
      c.doNotContact !== false ||
      (c.mobile?.trim() || c.phone?.trim()) !== p.phone ||
      claim.contactFilter.excludeContactIds?.includes(c.id) ||
      claim.contactFilter.excludeTags?.some((tag) => c.tags.includes(tag))
    )
      return { action: 'skip', reason: 'Recipient consent or phone changed' };
    try {
      const eligibility = await this.consent.getEligibility(tenantId, p.phone!, category);
      if (!eligibility.eligible)
        return { action: 'skip', reason: eligibility.reason ?? 'Recipient is not eligible' };
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() < 500)
        return { action: 'skip', reason: error.message };
      throw error;
    }

    // Pause/cancel/resume bump controlVersion; never send for a superseded run.
    const state = await this.broadcasts.controlState(tenantId, broadcastId);
    if (state?.status !== Status.SENDING) return { action: 'stop' };
    // Paused and resumed meanwhile: the resume scan may have skipped this in-flight job, so re-queue.
    if (state.controlVersion !== claim.controlVersion)
      return { action: 'defer', at: Date.now() + 1000 };
    return { action: 'send' };
  }

  /** Blocks briefly for a per-phone-number slot; returns >0 ms when the caller should re-queue. */
  private async waitForSlot(phoneNumberId: string): Promise<number> {
    const configured = Number(this.config.get('WHATSAPP_PHONE_NUMBER_MPS'));
    const perSecond =
      Number.isFinite(configured) && configured >= 1 ? Math.min(configured, 1000) : 20;
    const deadline = Date.now() + MAX_SLOT_WAIT_MS;
    for (;;) {
      const wait = await this.broadcasts.acquireSendSlot(phoneNumberId, perSecond);
      if (wait === 0) return 0;
      if (Date.now() + wait > deadline) return wait;
      await sleep(wait + Math.floor(Math.random() * 50));
    }
  }
}
