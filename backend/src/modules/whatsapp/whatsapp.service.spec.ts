import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { WhatsappService, WHATSAPP_OUTBOUND_ACCEPTED } from './whatsapp.service';
import { WhatsAppMessage } from '../../database/entities/whatsapp-message.entity';
import { WhatsappMessageRepository } from './whatsapp.repository';
import { Contact } from '../../database/entities/contact.entity';
import { WhatsappAccountService } from './whatsapp-account.service';
import { WhatsappProviderRegistry } from './whatsapp-provider';
import { WhatsappConsentService } from './whatsapp-consent.service';
import { PricingService } from '../pricing/pricing.service';
import { WhatsAppTemplate } from '../../database/entities/whatsapp-template.entity';
import { UserEntity } from '../auth/entities/user.entity';
import type { Cache } from 'cache-manager';

const TENANT = '11111111-1111-4111-8111-111111111111';
const PHONE_ID = '1234567890';

function queryBuilder(result: { raw?: unknown[]; affected?: number } = {}) {
  const qb: Record<string, jest.Mock> = {};
  for (const key of ['insert', 'update', 'set', 'values', 'orIgnore', 'returning', 'where'])
    qb[key] = jest.fn(() => qb);
  qb.execute = jest.fn(async () => ({ raw: [], affected: 0, ...result }));
  return qb;
}

function setup(rows: Array<Partial<WhatsAppMessage>> = []) {
  const store = rows as WhatsAppMessage[];
  const txRepo = {
    findOne: jest.fn(
      async ({ where }: { where: Partial<WhatsAppMessage> }) =>
        store.find(
          (row) =>
            row.tenantId === where.tenantId &&
            row.messageSid === where.messageSid &&
            row.direction === where.direction,
        ) ?? null,
    ),
  };
  const manager = {
    getRepository: () => txRepo,
    save: jest.fn(async (row: WhatsAppMessage) => row),
  };
  const insertQb = queryBuilder();
  const messages = {
    manager: {
      transaction: jest.fn(async (work: (m: typeof manager) => unknown) => work(manager)),
    },
    createQueryBuilder: jest.fn(() => insertQb),
    findOne: jest.fn(async () => ({ id: 'stored-1', workflowDispatched: false })),
    update: jest.fn(async () => ({ affected: 1 })),
  };
  const recordOptOut = jest.fn(async (..._args: unknown[]) => ({}));
  const recordOptIn = jest.fn(async (..._args: unknown[]) => ({}));
  const getEligibility = jest.fn(async (..._args: unknown[]) => ({
    eligible: false,
    reason: 'opted out',
  }));
  const applyInboundKeyword = jest.fn(
    async (tenantId: string, phone: string, status: string, _messageSid: string) => {
      const meta = { scope: 'ALL', evidence: 'inbound keyword' };
      if (status === 'OPTED_OUT') await recordOptOut(tenantId, phone, 'inbound_keyword', meta);
      else if (!(await getEligibility(tenantId, phone, 'SERVICE')).eligible)
        await recordOptIn(tenantId, phone, 'inbound_keyword', meta);
    },
  );
  const consent = {
    normalizePhone: jest.fn((input: string) => input.replace(/\D/g, '')),
    recordOptOut,
    recordOptIn,
    getEligibility,
    findContact: jest.fn(async () => ({ id: 'contact-1', customFields: {} })),
    applyInboundKeyword,
  };
  const events = { emit: jest.fn(), emitAsync: jest.fn(async () => []) };
  const config = { get: jest.fn(() => undefined) };
  const accounts = { findTenantByPhoneNumberId: jest.fn(async () => TENANT) };
  const contactQuery: Record<string, jest.Mock> = {};
  for (const key of ['where', 'andWhere', 'orderBy', 'addOrderBy'])
    contactQuery[key] = jest.fn(() => contactQuery);
  Object.assign(contactQuery, {
    getOne: jest.fn(async () => null),
  });
  const contactManager = {
    query: jest.fn(async () => undefined),
    getRepository: () => ({
      createQueryBuilder: () => contactQuery,
      create: jest.fn((contact: Partial<Contact>) => contact),
      save: jest.fn(async (contact: Contact) => contact),
    }),
  };
  const contacts = {
    manager: {
      transaction: jest.fn(async (work: (manager: typeof contactManager) => unknown) =>
        work(contactManager),
      ),
    },
  };
  const service = new WhatsappService(
    config as unknown as ConfigService,
    {} as WhatsappMessageRepository,
    contacts as unknown as Repository<Contact>,
    events as unknown as EventEmitter2,
    accounts as unknown as WhatsappAccountService,
    {} as WhatsappProviderRegistry,
    consent as unknown as WhatsappConsentService,
    {} as PricingService,
    messages as unknown as Repository<WhatsAppMessage>,
    {} as Repository<WhatsAppTemplate>,
    {} as Repository<UserEntity>,
    { get: jest.fn(), set: jest.fn() } as unknown as Cache,
  );
  return { service, store, manager, messages, consent, events, insertQb };
}

const statusPayload = (statuses: Array<Record<string, unknown>>) => ({
  entry: [
    {
      id: '999',
      changes: [
        { field: 'messages', value: { metadata: { phone_number_id: PHONE_ID }, statuses } },
      ],
    },
  ],
});

const inboundPayload = (body: string, id = 'wamid.in.1') => ({
  entry: [
    {
      id: '999',
      changes: [
        {
          field: 'messages',
          value: {
            metadata: { phone_number_id: PHONE_ID, display_phone_number: '15550001111' },
            messages: [
              {
                id,
                from: '15559998888',
                type: 'text',
                timestamp: String(Math.floor(Date.now() / 1000)),
                text: { body },
              },
            ],
          },
        },
      ],
    },
  ],
});

describe('WhatsappService webhook processing', () => {
  it('reports a status that arrives before the wamid, then applies it once the row exists', async () => {
    const { service, store, events } = setup();
    const payload = statusPayload([{ id: 'wamid.out.1', status: 'delivered' }]);

    await expect(service.processIncomingMessage(TENANT, payload)).resolves.toEqual({
      unmatchedStatuses: ['wamid.out.1'],
    });

    store.push({
      tenantId: TENANT,
      phoneNumberId: PHONE_ID,
      messageSid: 'wamid.out.1',
      direction: 'OUTBOUND',
      status: 'SUBMITTED',
      to: '15559998888',
    } as WhatsAppMessage);
    await expect(service.processIncomingMessage(TENANT, payload)).resolves.toEqual({
      unmatchedStatuses: [],
    });
    expect(store[0].status).toBe('DELIVERED');
    expect(events.emitAsync).toHaveBeenCalledWith(
      'message.delivered',
      expect.objectContaining({ messageSid: 'wamid.out.1' }),
    );
  });

  it('does not let a late FAILED override READ, but still captures pricing', async () => {
    const row = {
      tenantId: TENANT,
      phoneNumberId: PHONE_ID,
      messageSid: 'wamid.out.2',
      direction: 'OUTBOUND' as const,
      status: 'READ',
    };
    const { service, store, manager } = setup([row]);
    await service.processIncomingMessage(
      TENANT,
      statusPayload([
        {
          id: 'wamid.out.2',
          status: 'failed',
          errors: [{ code: 131026, title: 'Undeliverable' }],
          pricing: { billable: true, category: 'utility', pricing_model: 'PMP' },
        },
      ]),
    );
    expect(store[0]).toMatchObject({
      status: 'READ',
      pricingBillable: true,
      pricingCategory: 'utility',
      pricingModel: 'PMP',
    });
    expect(store[0].errorReason).toBeUndefined();
    expect(manager.save).toHaveBeenCalledTimes(1);
  });

  it('skips a message with an invalid timestamp without failing the batch', async () => {
    const { service, insertQb } = setup();
    const payload = inboundPayload('hello');
    const change = payload.entry[0].changes[0].value.messages;
    change.push({ ...change[0], id: 'wamid.in.bad', timestamp: 'not-a-number' });
    await expect(service.processIncomingMessage(TENANT, payload)).resolves.toBeDefined();
    expect(insertQb.values).toHaveBeenCalledTimes(1);
  });
});

describe('WhatsappService consent keywords', () => {
  it.each(['STOP', ' stop ', 'Stop!', 'UNSUBSCRIBE.', 'stop all', 'opt-out'])(
    'treats %p as an opt-out',
    (text) => {
      expect(setup().service.consentKeyword(text)).toBe('OPT_OUT');
    },
  );

  it.each(['START', 'start!', ' Subscribe '])('treats %p as a re-subscribe', (text) => {
    expect(setup().service.consentKeyword(text)).toBe('OPT_IN');
  });

  it.each(['please stop calling me', 'stopwatch', 'started', ''])('ignores %p', (text) => {
    expect(setup().service.consentKeyword(text)).toBeNull();
  });

  it('records an opt-out for STOP and does not dispatch workflows', async () => {
    const { service, consent, events } = setup();
    await service.processIncomingMessage(TENANT, inboundPayload('Stop.'));
    expect(consent.applyInboundKeyword).toHaveBeenCalledWith(
      TENANT,
      '15559998888',
      'OPTED_OUT',
      'wamid.in.1',
    );
    expect(events.emitAsync).not.toHaveBeenCalled();
  });

  it('re-subscribes on START only when the number is currently suppressed', async () => {
    const { service, consent } = setup();
    await service.processIncomingMessage(TENANT, inboundPayload('start'));
    expect(consent.applyInboundKeyword).toHaveBeenCalledWith(
      TENANT,
      '15559998888',
      'OPTED_IN',
      'wamid.in.1',
    );

    const eligible = setup();
    eligible.consent.getEligibility.mockResolvedValue({ eligible: true, reason: '' });
    await eligible.service.processIncomingMessage(TENANT, inboundPayload('START'));
    expect(eligible.consent.recordOptIn).not.toHaveBeenCalled();
  });

  it('does not re-apply a keyword that was already handled (replay of an older STOP)', async () => {
    const { service, consent, messages } = setup();
    messages.findOne.mockResolvedValue({ id: 'stored-1', workflowDispatched: true });
    await service.processIncomingMessage(TENANT, inboundPayload('STOP'));
    expect(consent.recordOptOut).not.toHaveBeenCalled();
  });
});

describe('WhatsappService unconfirmed outbound sweeper', () => {
  it('expires SENDING/UNKNOWN rows older than the TTL with one conditional update', async () => {
    const { service, messages } = setup();
    const qb = queryBuilder({ affected: 3 });
    messages.createQueryBuilder.mockReturnValue(qb);
    await expect(service.expireUnconfirmedOutbound()).resolves.toBe(3);
    expect(qb.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'EXPIRED' }));
    const [clause, params] = qb.where.mock.calls[0] as [string, { cutoff: Date }];
    expect(clause).toContain("status IN ('SENDING','UNKNOWN')");
    expect(Date.now() - params.cutoff.getTime()).toBeGreaterThanOrEqual(30 * 60 * 1000 - 1000);
  });

  it('exports the outbound-accepted event name used to replay buffered statuses', () => {
    expect(WHATSAPP_OUTBOUND_ACCEPTED).toBe('whatsapp.outbound.accepted');
  });
});
