import type { EventName } from '../event.constants';

/**
 * Base contract for all domain events published on the event bus.
 */
export interface DomainEvent<T = unknown> {
  /** The event name — must be from EVENT_NAMES */
  name: EventName;
  /** The tenant that owns this event */
  tenantId: string;
  /** Actor who triggered this event (userId or 'system') */
  actorId: string;
  /** Event payload */
  payload: T;
  /** ISO timestamp of when the event occurred */
  occurredAt: string;
  /** Correlation ID for distributed tracing */
  correlationId: string;
}
