import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bull';
import { Repository } from 'typeorm';
import {
  WhatsAppBroadcast,
  WhatsAppBroadcastStatus as Status,
} from '../../database/entities/whatsapp-broadcast.entity';
import { Contact } from '../../database/entities/contact.entity';
import { Segment } from '../../database/entities/segment.entity';
import { WhatsAppTemplate } from '../../database/entities/whatsapp-template.entity';
import {
  WhatsappBroadcastJobPayload,
  WhatsappBroadcastProcessor,
} from './whatsapp-broadcast.processor';
import { WhatsappBroadcastService } from './whatsapp-broadcast.service';
import { WhatsappConsentService } from './whatsapp-consent.service';
import { WhatsappService } from './whatsapp.service';
import { WhatsappTemplateService } from './whatsapp-template.service';
import { WhatsappAccountService } from './whatsapp-account.service';
import { WhatsappProviderError } from './whatsapp-provider';
import { classifyWhatsappError } from './whatsapp-error-codes';

const T = 'tenant-1';
const B = 'broadcast-1';

interface Row {
  payload: WhatsappBroadcastJobPayload;
  outcome: string | null;
  attempt: number;
  claimedAt: Date | null;
  error?: string | null;
}

/** In-memory stand-in for the recipient/broadcast/message tables. Each statement is atomic,
 * like a single-row UPDATE in PostgreSQL, and yields first so concurrent workers interleave. */
function fakeDb() {
  const broadcast = {
    tenantId: T,
    id: B,
    status: Status.SENDING,
    controlVersion: 1,
    templateId: 'tpl',
    phoneNumberId: 'pn-1',
    contactFilter: {},
    sent: 0,
    failed: 0,
    total: 0,
    lastError: null as string | null,
  };
  const rows = new Map<string, Row>();
  const messages = new Map<string, { id: string; status: string }>();
  const query = async (sql: string, p: unknown[] = []): Promise<unknown> => {
    await Promise.resolve();
    const row = rows.get(String(p[2]));
    if (sql.includes("SET outcome='sending'")) {
      if (!row || row.outcome !== null || broadcast.status !== Status.SENDING) return [[], 0];
      row.outcome = 'sending';
      row.claimedAt = new Date();
      const claim = {
        payload: row.payload,
        attempt: row.attempt,
        controlVersion: broadcast.controlVersion,
        templateId: broadcast.templateId,
        phoneNumberId: broadcast.phoneNumberId,
        contactFilter: broadcast.contactFilter,
      };
      return [[claim], 1];
    }
    if (sql.includes('SELECT outcome, claimed_at'))
      return row ? [{ outcome: row.outcome, claimedAt: row.claimedAt }] : [];
    if (sql.includes('SET outcome=$4')) {
      if (row?.outcome !== 'sending') return [[], 0];
      row.outcome = String(p[3]);
      row.error = p[5] as string | null;
      return [[{ contact_id: p[2] }], 1];
    }
    if (sql.includes('UPDATE whatsapp_broadcasts SET sent=sent+')) {
      broadcast.sent += Number(p[2]);
      broadcast.failed += Number(p[3]);
      return [[], 1];
    }
    if (sql.includes('SET outcome=NULL, claimed_at=NULL, attempt=attempt+$4')) {
      if (row?.outcome === 'sending') {
        row.outcome = null;
        row.attempt += Number(p[3]);
      }
      return [[], 1];
    }
    if (sql.includes("WHERE tenant_id=$1 AND broadcast_id=$2 AND outcome='failed'")) {
      const reset = [...rows.entries()].filter(([, r]) => r.outcome === 'failed');
      for (const [, r] of reset) {
        r.outcome = null;
        r.attempt++;
      }
      return [reset.map(([id]) => ({ contact_id: id })), reset.length];
    }
    if (sql.includes('SELECT CASE WHEN COALESCE(series.recurrence_state,b.recurrence_state)'))
      return [{ status: broadcast.status, controlVersion: broadcast.controlVersion }];
    if (sql.includes('SELECT status, control_version'))
      return [{ status: broadcast.status, controlVersion: broadcast.controlVersion }];
    if (sql.includes('FROM whatsapp_messages')) {
      const m = messages.get(String(p[1]));
      return m ? [m] : [];
    }
    throw new Error(`Unexpected SQL: ${sql}`);
  };
  interface FakeManager {
    query: typeof query;
    getRepository: () => { findOne: () => Promise<typeof broadcast> };
    save: <E>(entity: E) => Promise<E>;
    transaction: <R>(fn: (m: FakeManager) => Promise<R>) => Promise<R>;
  }
  const manager: FakeManager = {
    query,
    getRepository: () => ({ findOne: async () => broadcast }),
    save: async (entity) => entity,
    transaction: async (fn) => fn(manager),
  };
  const addRecipient = (contactId: string) => {
    rows.set(contactId, {
      payload: {
        tenantId: T,
        broadcastId: B,
        contactId,
        phoneNumberId: 'pn-1',
        phone: `+9198765432${rows.size}0`,
        templateName: 'promo',
        language: 'en',
        components: [],
      },
      outcome: null,
      attempt: 0,
      claimedAt: null,
    });
    broadcast.total++;
  };
  return { broadcast, rows, messages, repo: { query, manager }, addRecipient };
}

function setup() {
  const db = fakeDb();
  const queue = { add: jest.fn(async () => undefined) };
  const service = new WhatsappBroadcastService(
    db.repo as unknown as Repository<WhatsAppBroadcast>,
    {} as Repository<Contact>,
    {} as Repository<Segment>,
    {} as WhatsappTemplateService,
    {
      getCredentials: async () => ({ phoneNumberId: 'pn-1' }),
    } as unknown as WhatsappAccountService,
    queue as unknown as Queue<WhatsappBroadcastJobPayload>,
  );
  jest.spyOn(service, 'approvedTemplate').mockResolvedValue({
    name: 'promo',
    language: 'en',
    category: 'MARKETING',
  } as WhatsAppTemplate);
  jest.spyOn(service, 'findOne').mockResolvedValue(db.broadcast as unknown as WhatsAppBroadcast);
  jest.spyOn(service, 'recipientContact').mockImplementation(async (_t, id) => {
    const phone = db.rows.get(id)?.payload.phone;
    return { id, mobile: phone, doNotContact: false, tags: [] } as unknown as Contact;
  });
  const acquire = jest.spyOn(service, 'acquireSendSlot').mockResolvedValue(0);
  const defer = jest.spyOn(service, 'deferRecipient').mockResolvedValue(undefined);
  const pause = jest.spyOn(service, 'pauseForError').mockImplementation(async (_t, _id, reason) => {
    db.broadcast.status = Status.PAUSED;
    db.broadcast.lastError = reason;
    db.broadcast.controlVersion++;
  });
  const consent = {
    getEligibility: jest.fn(async () => ({ eligible: true, reason: null as string | null })),
    recordOptOut: jest.fn(async () => undefined),
  };
  let n = 0;
  const send = jest.fn(async (..._args: unknown[]) => {
    await new Promise((r) => setTimeout(r, 5)); // the HTTP call
    const key = String(_args[6]);
    const message = { id: `msg-${++n}`, status: 'SUBMITTED' };
    db.messages.set(key, message);
    return message;
  });
  const processor = new WhatsappBroadcastProcessor(
    { sendTemplateMessage: send } as unknown as WhatsappService,
    service,
    consent as unknown as WhatsappConsentService,
    { get: (k: string) => (k === 'WHATSAPP_PHONE_NUMBER_MPS' ? '2' : undefined) } as ConfigService,
  );
  const run = (contactId: string, attemptsMade = 0) =>
    processor.handleBroadcastMessage({
      data: { tenantId: T, broadcastId: B, contactId },
      attemptsMade,
      opts: { attempts: 5 },
    } as Job<WhatsappBroadcastJobPayload>);
  return { db, service, queue, consent, send, acquire, defer, pause, run };
}

describe('WhatsappBroadcastProcessor', () => {
  it('two concurrent workers never send the same recipient', async () => {
    const { db, send, defer, run } = setup();
    db.addRecipient('c1');
    await Promise.all([run('c1'), run('c1')]);
    expect(send).toHaveBeenCalledTimes(1);
    expect(defer).toHaveBeenCalledTimes(1); // the loser re-checks after the stale window
    expect(db.rows.get('c1')?.outcome).toBe('sent');
    expect(db.broadcast.sent).toBe(1);
    await run('c1'); // a redelivered job is a no-op
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('pausing mid-run stops further sends, including an already-claimed recipient', async () => {
    const { db, send, acquire, run } = setup();
    db.addRecipient('c1');
    db.addRecipient('c2');
    db.addRecipient('c3');
    await run('c1');
    // Pause lands while c2's worker waits for a send slot (claim already taken).
    acquire.mockImplementationOnce(async () => {
      db.broadcast.status = Status.PAUSED;
      db.broadcast.controlVersion++;
      return 0;
    });
    await run('c2');
    await run('c3');
    expect(send).toHaveBeenCalledTimes(1);
    expect(db.rows.get('c2')).toMatchObject({ outcome: null, attempt: 0 });
    expect(db.rows.get('c3')?.outcome).toBeNull();
  });

  it('honours an opt-out recorded while the campaign is pending', async () => {
    const { db, send, consent, run } = setup();
    db.addRecipient('c1');
    consent.getEligibility.mockResolvedValueOnce({
      eligible: false,
      reason: 'This recipient has opted out or is suppressed',
    });
    await run('c1');
    expect(send).not.toHaveBeenCalled();
    expect(db.rows.get('c1')).toMatchObject({ outcome: 'skipped' });
    expect(db.broadcast.failed).toBe(1);
  });

  it('131050 records a marketing opt-out and skips the recipient', async () => {
    const { db, send, consent, run } = setup();
    db.addRecipient('c1');
    send.mockImplementationOnce(async (...args: unknown[]) => {
      db.messages.set(String(args[6]), { id: 'm1', status: 'FAILED' });
      throw new WhatsappProviderError('REJECTED', false, 400, 131050);
    });
    await run('c1');
    expect(consent.recordOptOut).toHaveBeenCalledWith(
      T,
      db.rows.get('c1')?.payload.phone,
      'meta_error_131050',
      expect.objectContaining({ scope: 'MARKETING' }),
    );
    expect(db.rows.get('c1')?.outcome).toBe('skipped');
  });

  it('token expiry pauses the broadcast and returns the recipient for a fresh-key resend', async () => {
    const { db, send, pause, run } = setup();
    db.addRecipient('c1');
    db.addRecipient('c2');
    send.mockImplementationOnce(async (...args: unknown[]) => {
      db.messages.set(String(args[6]), { id: 'm1', status: 'FAILED' });
      throw new WhatsappProviderError('REJECTED', false, 401, 190);
    });
    await run('c1');
    await run('c2');
    expect(pause).toHaveBeenCalledWith(T, B, expect.stringContaining('(190)'));
    expect(send).toHaveBeenCalledTimes(1);
    expect(db.rows.get('c1')).toMatchObject({ outcome: null, attempt: 1 });
  });

  it('ambiguous outcomes become unknown and are never retried', async () => {
    const { db, service, send, run } = setup();
    db.addRecipient('c1');
    db.addRecipient('c2');
    send.mockImplementationOnce(async (...args: unknown[]) => {
      db.messages.set(String(args[6]), { id: 'm1', status: 'UNKNOWN' });
      throw new WhatsappProviderError('AMBIGUOUS', false);
    });
    send.mockImplementationOnce(async (...args: unknown[]) => {
      db.messages.set(String(args[6]), { id: 'm2', status: 'FAILED' });
      throw new WhatsappProviderError('REJECTED', false, 400, 131026);
    });
    await run('c1');
    await run('c2');
    expect(db.rows.get('c1')?.outcome).toBe('unknown');
    expect(db.rows.get('c2')?.outcome).toBe('failed');
    db.broadcast.status = Status.COMPLETED;
    await expect(service.retryFailed(T, B)).resolves.toEqual({ retried: 1 });
    expect(db.rows.get('c1')?.outcome).toBe('unknown');
    expect(db.rows.get('c2')).toMatchObject({ outcome: null, attempt: 1 });
    expect(db.broadcast.status).toBe(Status.SENDING);
    await run('c1');
    await run('c2');
    expect(send).toHaveBeenCalledTimes(3);
    expect(send.mock.calls[2][6]).toBe(`broadcast-${B}-c2-a1`); // fresh idempotency key
  });

  it('rate-limit errors re-queue with a delay instead of failing', async () => {
    const { db, send, defer, run } = setup();
    db.addRecipient('c1');
    send.mockImplementationOnce(async (...args: unknown[]) => {
      db.messages.set(String(args[6]), { id: 'm1', status: 'FAILED' });
      throw new WhatsappProviderError('REJECTED', true, 400, 130429);
    });
    await run('c1');
    expect(db.rows.get('c1')).toMatchObject({ outcome: null, attempt: 1 });
    expect(defer).toHaveBeenCalledTimes(1);
  });

  it('defers instead of sending when the phone number has no send slot', async () => {
    const { db, send, acquire, defer, run } = setup();
    db.addRecipient('c1');
    acquire.mockResolvedValue(60000);
    await run('c1');
    expect(acquire).toHaveBeenCalledWith('pn-1', 2);
    expect(send).not.toHaveBeenCalled();
    expect(defer).toHaveBeenCalledTimes(1);
    expect(db.rows.get('c1')?.outcome).toBeNull();
  });
});

describe('WhatsappBroadcastService.acquireSendSlot', () => {
  it('allows at most N sends per second per phone number', async () => {
    const counts = new Map<string, number>();
    const client = {
      multi() {
        let key = '';
        const chain = {
          incr: (k: string) => {
            key = k;
            return chain;
          },
          pexpire: () => chain,
          exec: async () => {
            counts.set(key, (counts.get(key) ?? 0) + 1);
            return [[null, counts.get(key)]];
          },
        };
        return chain;
      },
    };
    const service = new WhatsappBroadcastService(
      {} as Repository<WhatsAppBroadcast>,
      {} as Repository<Contact>,
      {} as Repository<Segment>,
      {} as WhatsappTemplateService,
      {} as WhatsappAccountService,
      { client } as unknown as Queue<WhatsappBroadcastJobPayload>,
    );
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_250);
    expect(await service.acquireSendSlot('pn-1', 2)).toBe(0);
    expect(await service.acquireSendSlot('pn-1', 2)).toBe(0);
    expect(await service.acquireSendSlot('pn-1', 2)).toBe(750);
    expect(await service.acquireSendSlot('pn-2', 2)).toBe(0); // separate number, separate budget
    jest.restoreAllMocks();
  });
});

describe('classifyWhatsappError', () => {
  it.each([
    [131050, 400, 'SUPPRESS_CONTACT'],
    [130429, 400, 'RETRY_LATER'],
    [131056, 400, 'RETRY_LATER'],
    [131048, 400, 'PAUSE_BROADCAST'],
    [190, 401, 'PAUSE_BROADCAST'],
    [132015, 400, 'PAUSE_BROADCAST'],
    [132000, 400, 'FAIL_PERMANENT'],
    [131026, 400, 'FAIL_PERMANENT'],
    [131047, 400, 'FAIL_PERMANENT'],
    [undefined, 429, 'RETRY_LATER'],
    [undefined, 403, 'PAUSE_BROADCAST'],
    [999999, 400, 'FAIL_PERMANENT'],
  ])('code %s / HTTP %s -> %s', (code, status, type) => {
    expect(classifyWhatsappError(code, status).type).toBe(type);
  });
});
