import { Process, Processor } from '@nestjs/bull';
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { Contact } from '../../database/entities/contact.entity';
import { WhatsAppBroadcastStatus as Status } from '../../database/entities/whatsapp-broadcast.entity';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import { WhatsappService } from './whatsapp.service';
import { WhatsappBroadcastService } from './whatsapp-broadcast.service';
import { WhatsappProviderError } from './whatsapp-provider';

export interface WhatsappBroadcastJobPayload {
  tenantId: string;
  broadcastId: string;
  contactId?: string;
  phoneNumberId?: string;
  phone?: string;
  templateName?: string;
  language?: string;
  components?: unknown[];
}
@Processor(QUEUE_NAMES.WHATSAPP)
export class WhatsappBroadcastProcessor {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly broadcasts: WhatsappBroadcastService,
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
  @Process({ name: 'broadcast-message', concurrency: 1 })
  async handleBroadcastMessage(job: Job<WhatsappBroadcastJobPayload>): Promise<void> {
    const { tenantId, broadcastId, contactId } = job.data;
    if (!contactId) return; // Reject legacy freeform jobs.
    let retryError: unknown;
    let dueAt: number | undefined;
    await this.broadcasts.locked(tenantId, broadcastId, async (b, m) => {
      if (b.status !== Status.SENDING) return;
      const [row] = await m.query(
        `SELECT payload,outcome FROM whatsapp_broadcast_recipients WHERE tenant_id=$1 AND broadcast_id=$2 AND contact_id=$3 FOR UPDATE`,
        [tenantId, broadcastId, contactId],
      );
      if (!row || row.outcome) return;
      const p = row.payload as WhatsappBroadcastJobPayload;
      const configured = Number(this.config.get('WHATSAPP_BROADCAST_PACING_MS'));
      const interval =
        Number.isFinite(configured) && configured >= 100 ? Math.min(configured, 60000) : 1000;
      if (b.nextSendAt && b.nextSendAt.getTime() > Date.now()) {
        dueAt = b.nextSendAt.getTime();
        return;
      }
      b.nextSendAt = new Date(Date.now() + interval);
      let outcome = 'failed';
      let messageId: string | null = null;
      let reason: string | null = null;
      try {
        const c = await m.getRepository(Contact).findOne({ where: { tenantId, id: contactId } });
        if (
          !c ||
          c.doNotContact !== false ||
          (c.mobile?.trim() || c.phone?.trim()) !== p.phone ||
          b.contactFilter.excludeContactIds?.includes(c.id) ||
          b.contactFilter.excludeTags?.some((tag) => c.tags.includes(tag))
        ) {
          reason = 'Recipient consent or phone changed';
        } else {
          const t = await this.broadcasts.approvedTemplate(tenantId, b.templateId);
          if (t.name !== p.templateName || t.language !== p.language)
            throw new HttpException('Template identity changed', 400);
          const message = await this.whatsappService.sendTemplateMessage(
            tenantId,
            p.phone!,
            p.templateName!,
            p.language!,
            p.components ?? [],
            p.phoneNumberId ?? b.phoneNumberId,
            `broadcast-${broadcastId}-${contactId}`,
            broadcastId,
          );
          messageId = message.id;
          if (['SUBMITTED', 'SENT', 'DELIVERED', 'READ'].includes(message.status)) outcome = 'sent';
          else throw new Error('Template was not accepted');
        }
      } catch (error) {
        reason = error instanceof Error ? error.message : 'Broadcast send failed';
        // Central sender must reject ambiguous retries for this stable key.
        const status = error instanceof HttpException ? error.getStatus() : undefined;
        const permanent =
          status !== undefined &&
          status >= 400 &&
          status < 500 &&
          status !== 429 &&
          !(error instanceof WhatsappProviderError && error.retryable);
        if (!permanent && job.attemptsMade + 1 < (job.opts.attempts ?? 1)) retryError = error;
      }
      if (!retryError) {
        const changed = await m.query(
          `UPDATE whatsapp_broadcast_recipients SET outcome=$4,message_id=$5,error=$6 WHERE tenant_id=$1 AND broadcast_id=$2 AND contact_id=$3 AND outcome IS NULL RETURNING contact_id`,
          [tenantId, broadcastId, contactId, outcome, messageId, reason],
        );
        if (changed.length) {
          if (outcome === 'sent') b.sent++;
          else b.failed++;
          if (b.sent + b.failed >= b.total) b.status = b.sent ? Status.COMPLETED : Status.FAILED;
        }
      }
      await m.save(b);
    });
    if (dueAt !== undefined) await this.broadcasts.deferRecipient(job.data, dueAt);
    if (retryError) throw retryError;
  }
  static computeDelay(index: number, pacingMs = 1000): number {
    return index * Math.max(100, pacingMs);
  }
}
