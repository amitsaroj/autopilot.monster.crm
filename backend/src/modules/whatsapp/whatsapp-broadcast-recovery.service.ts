import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { WhatsAppBroadcast } from '../../database/entities/whatsapp-broadcast.entity';
import { QUEUE_NAMES } from '../../queue/queue.constants';
import type { WhatsappBroadcastJobPayload } from './whatsapp-broadcast.processor';

@Injectable()
export class WhatsappBroadcastRecoveryService {
  constructor(
    @InjectRepository(WhatsAppBroadcast)
    private readonly broadcasts: Repository<WhatsAppBroadcast>,
    @InjectQueue(QUEUE_NAMES.WHATSAPP)
    private readonly queue: Queue<WhatsappBroadcastJobPayload>,
  ) {}

  async resumeAfterCredentialReconnect(tenantId: string, phoneNumberId: string): Promise<void> {
    await this.broadcasts.manager.transaction(async (manager) => {
      const rows: Array<{
        id: string;
        recurrenceSeriesId: string | null;
        recurrenceFrequency: string | null;
        phoneNumberId: string | null;
        scheduledAt: Date | null;
      }> = await manager.query(
        `SELECT id, recurrence_series_id AS "recurrenceSeriesId",
                recurrence_frequency AS "recurrenceFrequency",
                phone_number_id AS "phoneNumberId", scheduled_at AS "scheduledAt"
         FROM whatsapp_broadcasts
         WHERE tenant_id=$1 AND phone_number_id=$2 AND status='PAUSED' AND deleted_at IS NULL
           AND (last_error LIKE '%access token expired or was revoked%'
             OR last_error LIKE '%authentication failed; reconnect the WhatsApp account%'
             OR last_error LIKE '%rejected the account credentials (HTTP 401)%')
         ORDER BY id FOR UPDATE`,
        [tenantId, phoneNumberId],
      );

      for (const row of rows) {
        const seriesId = row.recurrenceSeriesId ?? (row.recurrenceFrequency ? row.id : null);
        if (seriesId) {
          await manager.query(
            `UPDATE whatsapp_broadcasts
             SET recurrence_state='ACTIVE',
                 status=CASE WHEN status='PAUSED' THEN
                   CASE WHEN audience_prepared THEN 'SENDING' ELSE 'SCHEDULED' END
                   ELSE status END,
                 control_version=control_version+1
             WHERE tenant_id=$1 AND id=$2 AND recurrence_state='PAUSED'`,
            [tenantId, seriesId],
          );
        }

        const resumed: Array<{ controlVersion: number }> = await manager.query(
          `UPDATE whatsapp_broadcasts
           SET status='SENDING', last_error=NULL, control_version=control_version+1
           WHERE tenant_id=$1 AND id=$2 AND status='PAUSED'
           RETURNING control_version AS "controlVersion"`,
          [tenantId, row.id],
        );
        if (!resumed.length) continue;

        await this.queue.add(
          'broadcast-start',
          { tenantId, broadcastId: row.id, phoneNumberId: row.phoneNumberId ?? phoneNumberId },
          {
            // Queue writes are not part of the SQL transaction; unique IDs make a rolled-back
            // recovery attempt harmless and allow a later reconnect to publish a fresh start.
            jobId: `broadcast-recovery-${row.id}-${resumed[0].controlVersion}-${randomUUID()}`,
            delay: Math.max(0, (row.scheduledAt?.getTime() ?? Date.now()) - Date.now()),
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: false,
          },
        );
      }
    });
  }
}
