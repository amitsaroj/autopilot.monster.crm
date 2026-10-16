import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingEventOutbox } from '../../database/entities/billing-event-outbox.entity';

@Injectable()
export class BillingEventOutboxProcessor {
  private readonly logger = new Logger(BillingEventOutboxProcessor.name);
  private dispatching = false;

  constructor(
    @InjectRepository(BillingEventOutbox)
    private readonly outbox: Repository<BillingEventOutbox>,
    private readonly events: EventEmitter2,
  ) {}

  @Interval(5000)
  async dispatchPending(): Promise<void> {
    if (this.dispatching) return;
    this.dispatching = true;
    try {
      const rows = (await this.outbox.query(
        `WITH due AS (
           SELECT id FROM billing_event_outbox
           WHERE (status='PENDING' AND next_attempt_at<=now())
              OR (status='PROCESSING' AND lease_expires_at<now())
           ORDER BY created_at LIMIT 50 FOR UPDATE SKIP LOCKED
         )
         UPDATE billing_event_outbox AS event SET status='PROCESSING', attempts=event.attempts+1,
           lease_expires_at=now()+interval '60 seconds', updated_at=now()
         FROM due WHERE event.id=due.id
         RETURNING event.id,event.event,event.payload`,
      )) as Array<{ id: string; event: string; payload: Record<string, unknown> }>;
      for (const row of rows) {
        try {
          await this.events.emitAsync(row.event, row.payload);
          await this.outbox.update(
            { id: row.id, status: 'PROCESSING' },
            {
              status: 'DELIVERED',
              dispatchedAt: new Date(),
              leaseExpiresAt: null,
              lastError: null,
            },
          );
        } catch {
          await this.outbox
            .createQueryBuilder()
            .update()
            .set({
              status: 'PENDING',
              nextAttemptAt: () =>
                `now() + make_interval(secs => LEAST(3600.0, 5.0 * power(2.0, LEAST(attempts, 10)))::double precision)`,
              leaseExpiresAt: null,
              lastError: 'event dispatch failed',
            })
            .where('id=:id AND status=:status', { id: row.id, status: 'PROCESSING' })
            .execute();
          this.logger.warn(`Billing event ${row.id} will be retried`);
        }
      }
    } catch {
      this.logger.warn('Billing event outbox scan deferred');
    } finally {
      this.dispatching = false;
    }
  }
}
