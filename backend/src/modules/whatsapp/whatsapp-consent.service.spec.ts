import { Repository } from 'typeorm';
import { Contact } from '../../database/entities/contact.entity';
import { WhatsAppConsent } from '../../database/entities/whatsapp-consent.entity';
import { WhatsappConsentService } from './whatsapp-consent.service';

function setup() {
  const saved: Array<Partial<WhatsAppConsent>> = [];
  const contact = { id: 'c1', whatsappOptIn: true } as Contact;
  const qb = { where: () => qb, andWhere: () => qb, getOne: async () => contact };
  const manager = {
    query: jest.fn(async () => []),
    getRepository: (entity: unknown) =>
      entity === Contact
        ? { createQueryBuilder: () => qb }
        : { save: async (r: Partial<WhatsAppConsent>) => (saved.push(r), r) },
    create: (_e: unknown, r: Partial<WhatsAppConsent>) => r,
    save: async (e: unknown) => e,
  };
  const records = {
    manager: { transaction: async <R>(fn: (m: typeof manager) => Promise<R>) => fn(manager) },
  };
  const service = new WhatsappConsentService(
    records as unknown as Repository<WhatsAppConsent>,
    {} as Repository<Contact>,
  );
  return { service, saved, contact };
}

describe('WhatsappConsentService opt-in/opt-out', () => {
  it('records a scoped marketing opt-out with provenance', async () => {
    const { service, saved, contact } = setup();
    await service.recordOptOut('t1', '+91 98765 43210', 'meta_error_131050', {
      scope: 'MARKETING',
      evidence: 'Broadcast b1',
    });
    expect(saved[0]).toMatchObject({
      tenantId: 't1',
      phone: '919876543210',
      status: 'OPTED_OUT',
      scope: 'MARKETING',
      source: 'meta_error_131050',
      evidence: 'Broadcast b1',
      contactId: 'c1',
    });
    expect(contact.whatsappOptIn).toBe(false);
  });

  it('keyword STOP suppresses everything and START re-subscribes', async () => {
    const { service, saved, contact } = setup();
    await service.suppress('t1', '919876543210');
    await service.recordOptIn('t1', '919876543210', 'inbound_keyword', { evidence: 'START' });
    expect(saved.map((r) => [r.status, r.scope])).toEqual([
      ['OPTED_OUT', 'ALL'],
      ['OPTED_IN', 'ALL'],
    ]);
    expect(contact.whatsappOptIn).toBe(true);
  });

  it('manual DTO opt-outs always apply to every purpose', async () => {
    const { service, saved } = setup();
    await service.record('t1', {
      phone: '919876543210',
      status: 'OPTED_OUT',
      scope: 'UTILITY',
      source: 'admin',
    });
    expect(saved[0].scope).toBe('ALL');
  });
});
