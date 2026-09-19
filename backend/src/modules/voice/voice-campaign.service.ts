import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { ModuleRef } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { In, Repository } from 'typeorm';

import { VoiceCampaign, VoiceCampaignStatus } from '../../database/entities/voice-campaign.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Segment } from '../../database/entities/segment.entity';
import { CreateVoiceCampaignDto, UpdateVoiceCampaignDto } from './dto/voice-campaign.dto';
import { AiProviderService } from '../ai/providers/ai-provider.service';
import { VoiceCampaignRecipientRepository } from './voice-campaign-recipient.repository';
import {
  VoiceCampaignRecipient,
  VoiceCampaignRecipientStatus,
  VoiceCallDisposition,
} from '../../database/entities/voice-campaign-recipient.entity';
import { EVENT_NAMES } from '../../events/event.constants';
import { JOB_NAMES, QUEUE_NAMES } from '../../queue/queue.constants';
import { nextWithinCallingHours } from './calling-window.util';
import { PricingService } from '../pricing/pricing.service';
import { BillingService } from '../billing/billing.service';
import { VoiceCallService } from './voice-call.service';

interface VoiceJobPayload {
  tenantId: string;
  recipientId: string;
  campaignId: string;
}

/** Provider outcomes that are worth retrying (transient) vs. terminal-and-final. */
const RETRYABLE_OUTCOMES = new Set(['BUSY', 'NO-ANSWER', 'FAILED']);
const OUTCOME_TO_RECIPIENT_STATUS: Record<string, VoiceCampaignRecipientStatus> = {
  COMPLETED: VoiceCampaignRecipientStatus.COMPLETED,
  BUSY: VoiceCampaignRecipientStatus.BUSY,
  'NO-ANSWER': VoiceCampaignRecipientStatus.NO_ANSWER,
  FAILED: VoiceCampaignRecipientStatus.FAILED,
  CANCELED: VoiceCampaignRecipientStatus.CANCELLED,
};
const ACTIVE_RECIPIENT_STATUSES = [
  VoiceCampaignRecipientStatus.PENDING,
  VoiceCampaignRecipientStatus.QUEUED,
  VoiceCampaignRecipientStatus.CALLING,
  VoiceCampaignRecipientStatus.RETRY_PENDING,
];
const PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;

/** Strips human formatting (spaces, dashes, parens) so validation and dialing use a consistent value. */
function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, '');
}

@Injectable()
export class VoiceCampaignService {
  private readonly logger = new Logger(VoiceCampaignService.name);

  constructor(
    @InjectRepository(VoiceCampaign)
    private readonly campaignRepository: Repository<VoiceCampaign>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Segment)
    private readonly segmentRepository: Repository<Segment>,
    private readonly recipientRepository: VoiceCampaignRecipientRepository,
    @InjectQueue(QUEUE_NAMES.VOICE)
    private readonly voiceQueue: Queue<VoiceJobPayload>,
    private readonly moduleRef: ModuleRef,
    private readonly aiProviderService: AiProviderService,
    private readonly voiceCallService: VoiceCallService,
  ) {}

  findAll(tenantId: string): Promise<VoiceCampaign[]> {
    return this.campaignRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id, tenantId } });
    if (!campaign) {
      throw new NotFoundException('Voice campaign not found');
    }
    return campaign;
  }

  create(tenantId: string, dto: CreateVoiceCampaignDto): Promise<VoiceCampaign> {
    return this.campaignRepository.save(
      this.campaignRepository.create({
        tenantId,
        name: dto.name,
        fromNumber: dto.fromNumber,
        script: dto.script,
        contactListId: dto.contactListId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: VoiceCampaignStatus.DRAFT,
        agentId: dto.agentId,
        concurrency: dto.concurrency ?? 3,
        maxAttempts: dto.maxAttempts ?? 1,
        retryDelayMinutes: dto.retryDelayMinutes ?? 30,
        callingHoursStart: dto.callingHoursStart,
        callingHoursEnd: dto.callingHoursEnd,
        timezone: dto.timezone ?? 'UTC',
        maxCalls: dto.maxCalls,
        objective: dto.objective,
        voicemailAction: dto.voicemailAction ?? 'CONTINUE',
        humanTransferNumber: dto.humanTransferNumber,
      }),
    );
  }

  /**
   * Turns a plain-language objective into a draft campaign name + AI voice
   * script the user reviews/edits before creating anything — never launches
   * on its own. Reuses the existing AiProviderService (same seam every other
   * AI call in the app goes through), not a separate prompt-generation stack.
   */
  async generateDraft(
    tenantId: string,
    input: { objective: string; audienceDescription?: string },
  ): Promise<{ name: string; script: string }> {
    const response = await this.aiProviderService.chatComplete(
      tenantId,
      [
        {
          role: 'system',
          content: `You are an expert outbound sales campaign strategist writing instructions for an AI voice agent.

Given a campaign objective, produce:
1. A short, descriptive campaign name (under 60 characters).
2. A conversational call script/instructions for the AI agent, covering (in prose, not headings): how to open the call, qualification questions to ask, how to explain the offer, how to handle common objections, and a clear call-to-action / closing (e.g. arranging a callback). Write it as guidance for the agent to speak naturally, not a rigid word-for-word transcript. Keep it concise enough for a phone conversation.

Return ONLY a JSON object: { "name": "...", "script": "..." }`,
        },
        {
          role: 'user',
          content: [
            `Objective: ${input.objective}`,
            input.audienceDescription ? `Audience: ${input.audienceDescription}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ],
      { jsonMode: true, model: 'gpt-4o-mini' },
    );

    let parsed: { name?: string; script?: string };
    try {
      parsed = JSON.parse(response.content || '{}');
    } catch {
      throw new BadRequestException('AI campaign generation returned an unparseable response — try again.');
    }

    if (!parsed.script?.trim()) {
      throw new BadRequestException('AI campaign generation did not produce a script — try rephrasing the objective.');
    }

    return {
      name: parsed.name?.trim() || 'New AI Campaign',
      script: parsed.script.trim(),
    };
  }

  async update(tenantId: string, id: string, dto: UpdateVoiceCampaignDto): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    if (campaign.status === VoiceCampaignStatus.RUNNING) {
      throw new BadRequestException('Cannot update a running campaign');
    }

    if (dto.name !== undefined) campaign.name = dto.name;
    if (dto.fromNumber !== undefined) campaign.fromNumber = dto.fromNumber;
    if (dto.script !== undefined) campaign.script = dto.script;
    if (dto.contactListId !== undefined) campaign.contactListId = dto.contactListId;
    if (dto.scheduledAt !== undefined) campaign.scheduledAt = new Date(dto.scheduledAt);
    if (dto.totalContacts !== undefined) campaign.totalContacts = dto.totalContacts;
    if (dto.agentId !== undefined) campaign.agentId = dto.agentId;
    if (dto.concurrency !== undefined) campaign.concurrency = dto.concurrency;
    if (dto.maxAttempts !== undefined) campaign.maxAttempts = dto.maxAttempts;
    if (dto.retryDelayMinutes !== undefined) campaign.retryDelayMinutes = dto.retryDelayMinutes;
    if (dto.callingHoursStart !== undefined) campaign.callingHoursStart = dto.callingHoursStart;
    if (dto.callingHoursEnd !== undefined) campaign.callingHoursEnd = dto.callingHoursEnd;
    if (dto.timezone !== undefined) campaign.timezone = dto.timezone;
    if (dto.maxCalls !== undefined) campaign.maxCalls = dto.maxCalls;
    if (dto.objective !== undefined) campaign.objective = dto.objective;
    if (dto.voicemailAction !== undefined) campaign.voicemailAction = dto.voicemailAction;
    if (dto.humanTransferNumber !== undefined) campaign.humanTransferNumber = dto.humanTransferNumber;

    return this.campaignRepository.save(campaign);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const campaign = await this.findOne(tenantId, id);
    if (campaign.status === VoiceCampaignStatus.RUNNING) {
      throw new BadRequestException('Cannot delete a running campaign');
    }
    await this.campaignRepository.softDelete({ id, tenantId });
  }

  async start(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);

    if (campaign.status === VoiceCampaignStatus.RUNNING) {
      return campaign;
    }
    if (campaign.status === VoiceCampaignStatus.COMPLETED) {
      throw new BadRequestException('Cannot start a completed campaign');
    }
    if (campaign.status === VoiceCampaignStatus.PAUSED) {
      throw new BadRequestException('Use resume to continue a paused campaign');
    }
    if (!campaign.contactListId) {
      throw new BadRequestException('Campaign requires a contact list (segment)');
    }

    const dialable = await this.resolveDialableContacts(tenantId, campaign.contactListId);
    if (dialable.length === 0) {
      throw new BadRequestException('No dialable contacts in the contact list');
    }

    const created = await this.ensureRecipients(campaign, dialable);

    const totalRecipients = await this.recipientRepository.findByCampaign(tenantId, id, {
      limit: 1,
    });
    const allActive = await this.recipientRepository.findActive(tenantId, id);

    await this.checkQuota(tenantId, allActive.length);

    campaign.status = VoiceCampaignStatus.RUNNING;
    campaign.startedAt = new Date();
    campaign.completedAt = undefined;
    campaign.stoppedAt = undefined;
    campaign.totalContacts = totalRecipients[1];
    await this.campaignRepository.save(campaign);

    this.logger.log(
      `Campaign ${id} started: ${created.length} new recipients, ${allActive.length} active total`,
    );

    await this.enqueueDueRecipients(campaign);
    return campaign;
  }

  async pause(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    if (campaign.status !== VoiceCampaignStatus.RUNNING) {
      throw new BadRequestException('Only running campaigns can be paused');
    }
    campaign.status = VoiceCampaignStatus.PAUSED;
    await this.removeQueuedJobsForCampaign(campaign.id);

    // QUEUED means "a Bull job exists for this recipient" — that job was just
    // deleted, so revert to PENDING or resume()'s due-now query would never
    // find these recipients again (findDueNow only matches PENDING or a due
    // RETRY_PENDING, not QUEUED).
    const [queued] = await this.recipientRepository.findByCampaign(tenantId, id, {
      status: VoiceCampaignRecipientStatus.QUEUED,
      limit: 10000,
    });
    for (const recipient of queued) {
      recipient.status = VoiceCampaignRecipientStatus.PENDING;
      await this.recipientRepository.save(recipient);
    }

    this.logger.log(`Campaign ${id} paused: ${queued.length} queued recipients reverted to pending`);
    return this.campaignRepository.save(campaign);
  }

  async resume(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    if (campaign.status !== VoiceCampaignStatus.PAUSED) {
      throw new BadRequestException('Only paused campaigns can be resumed');
    }

    // Pick up any contacts added to the segment since the campaign started.
    if (campaign.contactListId) {
      const dialable = await this.resolveDialableContacts(tenantId, campaign.contactListId);
      await this.ensureRecipients(campaign, dialable);
    }

    const active = await this.recipientRepository.findActive(tenantId, id);
    if (active.length === 0) {
      campaign.status = VoiceCampaignStatus.COMPLETED;
      campaign.completedAt = new Date();
      this.logger.log(`Campaign ${id} resumed with nothing left to do — marking completed`);
      return this.campaignRepository.save(campaign);
    }

    campaign.status = VoiceCampaignStatus.RUNNING;
    campaign.completedAt = undefined;
    const saved = await this.campaignRepository.save(campaign);
    this.logger.log(`Campaign ${id} resumed with ${active.length} recipients still active`);
    await this.enqueueDueRecipients(saved);
    return saved;
  }

  /** Historically named `cancel` (matches the existing frontend action); stops the campaign for good. */
  async cancel(tenantId: string, id: string): Promise<VoiceCampaign> {
    const campaign = await this.findOne(tenantId, id);
    await this.removeQueuedJobsForCampaign(campaign.id);

    const active = await this.recipientRepository.findActive(tenantId, id);
    for (const recipient of active) {
      recipient.status = VoiceCampaignRecipientStatus.CANCELLED;
      await this.recipientRepository.save(recipient);
    }
    await this.resetConcurrency(campaign.id);

    campaign.status = VoiceCampaignStatus.STOPPED;
    campaign.stoppedAt = new Date();
    this.logger.log(`Campaign ${id} stopped — cancelled ${active.length} in-flight/pending recipients`);
    return this.campaignRepository.save(campaign);
  }

  async listRecipients(
    tenantId: string,
    campaignId: string,
    query: { status?: VoiceCampaignRecipientStatus; page?: number; limit?: number },
  ) {
    await this.findOne(tenantId, campaignId);
    const [items, total] = await this.recipientRepository.findByCampaign(
      tenantId,
      campaignId,
      query,
    );
    return { items, total, page: query.page ?? 1, limit: query.limit ?? 50 };
  }

  /** CSV of every recipient this campaign has ever dialed, for the user to download/analyze offline. */
  async exportRecipientsCsv(tenantId: string, campaignId: string): Promise<string> {
    await this.findOne(tenantId, campaignId);
    const recipients = await this.recipientRepository.findAllByCampaign(tenantId, campaignId);

    const headers = [
      'contactId',
      'phone',
      'status',
      'disposition',
      'attempts',
      'maxAttempts',
      'outcome',
      'lastAttemptAt',
      'nextAttemptAt',
      'failureReason',
    ];
    const escape = (value: unknown) => {
      const str = value === null || value === undefined ? '' : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };
    const rows = recipients.map((r) =>
      [
        r.contactId,
        r.phone,
        r.status,
        r.disposition ?? '',
        r.attempts,
        r.maxAttempts,
        r.outcome ?? '',
        r.lastAttemptAt?.toISOString() ?? '',
        r.nextAttemptAt?.toISOString() ?? '',
        r.failureReason ?? '',
      ]
        .map(escape)
        .join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  async skipRecipient(
    tenantId: string,
    campaignId: string,
    recipientId: string,
  ): Promise<VoiceCampaignRecipient> {
    await this.findOne(tenantId, campaignId);
    const recipient = await this.recipientRepository.findById(tenantId, recipientId);
    if (!recipient || recipient.campaignId !== campaignId) {
      throw new NotFoundException('Recipient not found');
    }
    recipient.status = VoiceCampaignRecipientStatus.SKIPPED;
    return this.recipientRepository.save(recipient);
  }

  async retryRecipient(
    tenantId: string,
    campaignId: string,
    recipientId: string,
  ): Promise<VoiceCampaignRecipient> {
    const campaign = await this.findOne(tenantId, campaignId);
    const recipient = await this.recipientRepository.findById(tenantId, recipientId);
    if (!recipient || recipient.campaignId !== campaignId) {
      throw new NotFoundException('Recipient not found');
    }
    if (ACTIVE_RECIPIENT_STATUSES.includes(recipient.status)) {
      throw new BadRequestException('Recipient is already pending or in progress');
    }

    recipient.status = VoiceCampaignRecipientStatus.PENDING;
    recipient.nextAttemptAt = undefined;
    recipient.failureReason = undefined;
    const saved = await this.recipientRepository.save(recipient);

    // A force-retry should actually run, not silently strand the recipient —
    // reactivate a campaign that had already finished/stopped instead of
    // leaving this recipient PENDING with nothing left to ever pick it up.
    if (
      campaign.status === VoiceCampaignStatus.COMPLETED ||
      campaign.status === VoiceCampaignStatus.STOPPED
    ) {
      campaign.status = VoiceCampaignStatus.RUNNING;
      campaign.completedAt = undefined;
      campaign.stoppedAt = undefined;
      await this.campaignRepository.save(campaign);
    }

    if (campaign.status === VoiceCampaignStatus.RUNNING) {
      await this.enqueueRecipient(campaign, saved);
    }
    return saved;
  }

  /**
   * Called once a call reaches a terminal status (provider webhook, or an
   * immediate provider-side rejection). Single source of truth for: releasing
   * the campaign's concurrency slot, scheduling a retry or finalizing the
   * recipient, updating campaign aggregate counters, and detecting campaign
   * completion. Safe to call more than once for the same event — the caller
   * (TwilioController) only invokes this on the first terminal webhook for a
   * given call, but this method is additionally guarded by only acting on
   * recipients that are still in an active state.
   */
  async recordCallOutcome(
    campaignId: string,
    callStatus: string,
    recipientId?: string,
  ): Promise<void> {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
    if (!campaign) {
      return;
    }

    await this.releaseConcurrencySlot(campaignId);

    const normalized = callStatus.toUpperCase();
    const isFailure = RETRYABLE_OUTCOMES.has(normalized) || normalized === 'CANCELED';

    // Concurrent recipients can finish within milliseconds of each other under
    // real concurrency — a read-modify-write on these counters would silently
    // lose updates, so increment atomically in SQL instead of in JS.
    await this.campaignRepository
      .createQueryBuilder()
      .update(VoiceCampaign)
      .set({
        // Uncapped and consistent with callsAnswered/callsFailed: this counts every
        // dial attempt (retries included), not unique recipients — the per-recipient
        // final outcome is what byStatus / getStats() exposes for that instead.
        callsMade: () => 'calls_made + 1',

        callsAnswered: () =>
          normalized === 'COMPLETED' ? 'calls_answered + 1' : 'calls_answered',
        callsFailed: () => (isFailure ? 'calls_failed + 1' : 'calls_failed'),
      })
      .where('id = :id', { id: campaignId })
      .execute();

    if (recipientId) {
      await this.applyOutcomeToRecipient(campaign, recipientId, normalized);
    }

    const active = await this.recipientRepository.findActive(campaign.tenantId, campaignId);
    if (active.length === 0) {
      // Conditional on status = RUNNING so two recipients finishing at the
      // same instant can'''t both flip the campaign to COMPLETED and log twice.
      const result = await this.campaignRepository
        .createQueryBuilder()
        .update(VoiceCampaign)
        .set({ status: VoiceCampaignStatus.COMPLETED, completedAt: new Date() })
        .where('id = :id AND status = :running', {
          id: campaignId,
          running: VoiceCampaignStatus.RUNNING,
        })
        .execute();

      if ((result.affected ?? 0) > 0) {
        const finished = await this.campaignRepository.findOne({ where: { id: campaignId } });
        if (finished) {
          this.logger.log(
            `Campaign ${campaignId} completed: ${finished.callsAnswered} answered, ${finished.callsFailed} failed of ${finished.callsMade} calls made`,
          );
        }
      }
      return;
    }

    await this.enforceCallBudget(campaignId);
  }

  /** Auto-pauses a campaign that has hit its configured maxCalls, same as a manual pause. */
  private async enforceCallBudget(campaignId: string): Promise<void> {
    const current = await this.campaignRepository.findOne({ where: { id: campaignId } });
    if (!current || current.maxCalls == null || current.callsMade < current.maxCalls) {
      return;
    }

    const result = await this.campaignRepository
      .createQueryBuilder()
      .update(VoiceCampaign)
      .set({ status: VoiceCampaignStatus.PAUSED })
      .where('id = :id AND status = :running', {
        id: campaignId,
        running: VoiceCampaignStatus.RUNNING,
      })
      .execute();

    if ((result.affected ?? 0) > 0) {
      await this.removeQueuedJobsForCampaign(campaignId);
      this.logger.log(
        `Campaign ${campaignId} auto-paused: reached its ${current.maxCalls}-call budget (${current.callsMade} made)`,
      );
    }
  }

  /**
   * Called from the AMD callback as soon as Twilio reports a machine picked
   * up — well before the call's own 'completed' status webhook. Marks the
   * recipient VOICEMAIL immediately (applyOutcomeToRecipient later refuses
   * to downgrade this back to a plain COMPLETED) and, if the campaign is
   * configured to hang up on voicemail, ends the call rather than letting
   * the AI talk to an answering machine for the rest of its greeting.
   */
  /**
   * LeadIntelligenceService (crm module) emits this once it's classified a
   * transcript — listened for here instead of injected directly to avoid a
   * crm<->voice module dependency; decoupled the same way WorkflowEventListener
   * reacts to CRM events without crm depending on workflow.
   */
  @OnEvent(EVENT_NAMES.CALL_DISPOSITIONED)
  async handleCallDispositioned(payload: {
    tenantId: string;
    disposition: string;
    campaignId?: string;
    recipientId?: string;
  }): Promise<void> {
    if (!payload.campaignId || !payload.recipientId) {
      return;
    }
    if (!(payload.disposition in VoiceCallDisposition)) {
      return;
    }

    const recipient = await this.recipientRepository.findById(payload.tenantId, payload.recipientId);
    if (!recipient || recipient.campaignId !== payload.campaignId) {
      return;
    }

    recipient.disposition = payload.disposition as VoiceCallDisposition;
    await this.recipientRepository.save(recipient);
  }

  async applyVoicemailDetected(campaignId: string, callId: string, callSid: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });
    if (!campaign) {
      return;
    }

    const call = await this.voiceCallService.findOne(campaign.tenantId, callId);
    if (call.recipientId) {
      const recipient = await this.recipientRepository.findById(campaign.tenantId, call.recipientId);
      if (recipient) {
        recipient.status = VoiceCampaignRecipientStatus.VOICEMAIL;
        recipient.outcome = 'VOICEMAIL';
        await this.recipientRepository.save(recipient);
      }
    }

    if (campaign.voicemailAction === 'HANGUP') {
      try {
        await this.voiceCallService.hangUp(campaign.tenantId, callId);
      } catch (err) {
        this.logger.warn(`Failed to hang up voicemail call ${callSid}`, err as Error);
      }
    }
  }

  private async applyOutcomeToRecipient(
    campaign: VoiceCampaign,
    recipientId: string,
    normalized: string,
  ): Promise<void> {
    const recipient = await this.recipientRepository.findById(campaign.tenantId, recipientId);
    if (!recipient) {
      return;
    }

    // The AMD callback (fires as soon as Twilio detects a machine, before the
    // call actually ends) already classified this recipient as VOICEMAIL —
    // don't let the later 'completed' status webhook downgrade that to a
    // generic COMPLETED; a call a machine picked up is more useful labeled
    // as a voicemail than as a normal answered call.
    if (recipient.status === VoiceCampaignRecipientStatus.VOICEMAIL) {
      recipient.outcome = normalized;
      recipient.lastAttemptAt = new Date();
      await this.recipientRepository.save(recipient);
      return;
    }

    recipient.outcome = normalized;
    recipient.lastAttemptAt = new Date();

    const canRetry =
      RETRYABLE_OUTCOMES.has(normalized) &&
      recipient.attempts < recipient.maxAttempts &&
      campaign.status === VoiceCampaignStatus.RUNNING;

    if (canRetry) {
      recipient.status = VoiceCampaignRecipientStatus.RETRY_PENDING;
      const earliestRetry = new Date(Date.now() + campaign.retryDelayMinutes * 60000);
      recipient.nextAttemptAt = nextWithinCallingHours(
        earliestRetry,
        campaign.timezone,
        campaign.callingHoursStart,
        campaign.callingHoursEnd,
      );
      recipient.failureReason = `Retrying after ${normalized} (attempt ${recipient.attempts}/${recipient.maxAttempts})`;
      await this.recipientRepository.save(recipient);
      await this.enqueueRecipient(campaign, recipient);
      return;
    }

    recipient.status =
      OUTCOME_TO_RECIPIENT_STATUS[normalized] ?? VoiceCampaignRecipientStatus.FAILED;
    if (recipient.status !== VoiceCampaignRecipientStatus.COMPLETED) {
      recipient.failureReason = `Final outcome: ${normalized} after ${recipient.attempts} attempt(s)`;
    }
    await this.recipientRepository.save(recipient);
  }

  async getStats(tenantId: string, id: string) {
    const campaign = await this.findOne(tenantId, id);
    const breakdown = await this.recipientRepository.countByStatus(tenantId, id);
    const byStatus: Record<string, number> = {};
    for (const row of breakdown) {
      byStatus[row.status] = Number(row.count);
    }

    const answerRate =
      campaign.callsMade > 0 ? (campaign.callsAnswered / campaign.callsMade) * 100 : 0;

    return {
      campaignId: campaign.id,
      status: campaign.status,
      totalContacts: campaign.totalContacts,
      callsMade: campaign.callsMade,
      callsAnswered: campaign.callsAnswered,
      callsFailed: campaign.callsFailed,
      answerRate,
      concurrency: campaign.concurrency,
      byStatus,
    };
  }

  // --- internals ---------------------------------------------------------

  private async checkQuota(tenantId: string, additionalCalls: number): Promise<void> {
    try {
      const pricingService = this.moduleRef.get(PricingService, { strict: false });
      const billingService = this.moduleRef.get(BillingService, { strict: false });
      if (!pricingService || !billingService) {
        return;
      }
      const limit = await pricingService.getLimit(tenantId, 'calls');
      if (limit === -1) {
        return;
      }
      const usage = await billingService.getUsage(tenantId, 'calls');
      if (usage + additionalCalls > limit) {
        throw new BadRequestException(
          `This campaign needs ${additionalCalls} more calls, but the plan allows only ${Math.max(limit - usage, 0)} remaining this period (${usage}/${limit} used).`,
        );
      }
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.warn('Voice campaign quota check failed open', err as Error);
    }
  }

  private async resolveContactList(tenantId: string, contactListId: string): Promise<Contact[]> {
    const segment = await this.segmentRepository.findOne({
      where: { id: contactListId, tenantId },
    });
    if (!segment) {
      throw new NotFoundException('Contact list (segment) not found');
    }

    let contacts = await this.contactRepository.find({ where: { tenantId } });
    const tagFilters = new Set<string>();
    const conditions = (segment.rules?.conditions ?? []) as Array<{
      field?: string;
      value?: string;
      operator?: string;
    }>;

    for (const condition of conditions) {
      if ((condition.field === 'tags' || condition.field === 'tag') && condition.value) {
        tagFilters.add(condition.value);
      }
      if (condition.field === 'status' && condition.value) {
        contacts = contacts.filter((contact) => contact.status === condition.value);
      }
      if (condition.field === 'ids' && condition.value) {
        const ids = condition.value
          .split(',')
          .map((cid) => cid.trim())
          .filter(Boolean);
        if (ids.length > 0) {
          contacts = await this.contactRepository.find({
            where: { tenantId, id: In(ids) },
          });
        }
      }
    }

    if (tagFilters.size > 0) {
      contacts = contacts.filter((contact) =>
        [...tagFilters].some((tag) => (contact.tags ?? []).includes(tag)),
      );
    }

    return contacts;
  }

  private async resolveDialableContacts(
    tenantId: string,
    contactListId?: string,
  ): Promise<Contact[]> {
    if (!contactListId) {
      throw new BadRequestException('Campaign requires a contact list (segment)');
    }
    const contacts = await this.resolveContactList(tenantId, contactListId);
    return contacts.filter((contact) => {
      if (contact.doNotContact) {
        return false;
      }
      const phone = contact.mobile ?? contact.phone;
      return Boolean(phone) && PHONE_PATTERN.test(normalizePhone(phone as string));
    });
  }

  /** Idempotently creates PENDING recipient rows for contacts that don't have one yet. */
  private async ensureRecipients(
    campaign: VoiceCampaign,
    contacts: Contact[],
  ): Promise<VoiceCampaignRecipient[]> {
    const existing = await this.recipientRepository.findByContactIds(
      campaign.tenantId,
      campaign.id,
      contacts.map((c) => c.id),
    );
    const existingContactIds = new Set(existing.map((r) => r.contactId));
    const toCreate = contacts.filter((c) => !existingContactIds.has(c.id));

    if (toCreate.length === 0) {
      return [];
    }

    const rows = toCreate.map((contact) => ({
      tenantId: campaign.tenantId,
      campaignId: campaign.id,
      contactId: contact.id,
      phone: normalizePhone((contact.mobile ?? contact.phone) as string),
      status: VoiceCampaignRecipientStatus.PENDING,
      maxAttempts: campaign.maxAttempts,
    }));
    return this.recipientRepository.createMany(rows);
  }

  private async enqueueDueRecipients(campaign: VoiceCampaign): Promise<void> {
    const due = await this.recipientRepository.findDueNow(campaign.tenantId, campaign.id);
    for (const recipient of due) {
      await this.enqueueRecipient(campaign, recipient);
    }
  }

  private async enqueueRecipient(
    campaign: VoiceCampaign,
    recipient: VoiceCampaignRecipient,
  ): Promise<void> {
    const delay =
      recipient.nextAttemptAt && recipient.nextAttemptAt.getTime() > Date.now()
        ? recipient.nextAttemptAt.getTime() - Date.now()
        : 0;

    // RETRY_PENDING recipients stay visibly "retry scheduled" until they're
    // actually dialed; a fresh PENDING recipient becomes QUEUED right away.
    if (recipient.status !== VoiceCampaignRecipientStatus.RETRY_PENDING) {
      recipient.status = VoiceCampaignRecipientStatus.QUEUED;
      await this.recipientRepository.save(recipient);
    }

    await this.voiceQueue.add(
      JOB_NAMES.PROCESS_VOICE,
      {
        tenantId: campaign.tenantId,
        campaignId: campaign.id,
        recipientId: recipient.id,
      },
      {
        delay,
        jobId: `voice-recipient:${recipient.id}:${recipient.attempts}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  private async removeQueuedJobsForCampaign(campaignId: string): Promise<void> {
    const jobs = await this.voiceQueue.getJobs(['waiting', 'delayed', 'paused']);
    for (const job of jobs) {
      if (job.data?.campaignId === campaignId) {
        await job.remove();
      }
    }
  }

  // --- per-campaign concurrency gate, backed by the voice queue's own Redis connection ---

  private activeCallsKey(campaignId: string): string {
    return `voice-campaign:${campaignId}:active-calls`;
  }

  /** Atomically claims one concurrency slot. Returns false if the campaign is already at its cap. */
  async tryAcquireConcurrencySlot(campaignId: string, concurrency: number): Promise<boolean> {
    const key = this.activeCallsKey(campaignId);
    const active = await this.voiceQueue.client.incr(key);
    if (active === 1) {
      // Crash safety net: an active-calls key should never outlive a campaign by more than a few hours.
      await this.voiceQueue.client.expire(key, 6 * 60 * 60);
    }
    if (active > concurrency) {
      await this.voiceQueue.client.decr(key);
      return false;
    }
    return true;
  }

  async releaseConcurrencySlot(campaignId: string): Promise<void> {
    const key = this.activeCallsKey(campaignId);
    const value = await this.voiceQueue.client.decr(key);
    if (value < 0) {
      await this.voiceQueue.client.set(key, '0');
    }
  }

  private async resetConcurrency(campaignId: string): Promise<void> {
    await this.voiceQueue.client.del(this.activeCallsKey(campaignId));
  }
}
