// Lives outside migrations/ because TypeORM loads every *.ts in that directory as a migration.
import { QueryRunner } from 'typeorm';
import { WhatsAppAutomationCatalog1740000000018 } from './migrations/1740000000018-WhatsAppAutomationCatalog';
import { WhatsAppAutomationPacks1740000000020 } from './migrations/1740000000020-WhatsAppAutomationPacks';

function mockRunner(hasDefaultTenant: boolean) {
  const query = jest.fn(async (sql: string): Promise<unknown> => {
    if (sql.includes('FROM tenants')) return hasDefaultTenant ? [{ id: 'tenant-1' }] : [];
    if (sql.startsWith('SELECT id FROM plugins')) return [{ id: 'plugin-1' }];
    return [];
  });
  return { runner: { query } as unknown as QueryRunner, query };
}

const pluginInserts = (query: jest.Mock) =>
  query.mock.calls.filter(([sql]) => String(sql).includes('INSERT INTO plugins'));

describe('WhatsApp automation catalog migrations', () => {
  it('018 creates schema and inserts 13 listings when the default tenant exists', async () => {
    const { runner, query } = mockRunner(true);
    await new WhatsAppAutomationCatalog1740000000018().up(runner);
    expect(query.mock.calls[0][0]).toContain('CREATE TABLE IF NOT EXISTS product_entitlements');
    const inserts = pluginInserts(query);
    expect(inserts).toHaveLength(13);
    const params = inserts[0][1] as string[];
    expect(params.slice(0, 5)).toEqual([
      'Keyword welcome reply',
      'wa-automation-welcome-reply',
      expect.any(String),
      '1.0.0',
      'WHATSAPP_AUTOMATION',
    ]);
    expect(JSON.parse(params[5])).toMatchObject({
      kind: 'WHATSAPP_AUTOMATION',
      slug: 'wa-automation-welcome-reply',
      version: '1.0.0',
      additionalProperties: false,
    });
  });

  it('018 still creates schema but skips listings on a fresh DB without the default tenant', async () => {
    const { runner, query } = mockRunner(false);
    await new WhatsAppAutomationCatalog1740000000018().up(runner);
    expect(query.mock.calls[0][0]).toContain('CREATE TABLE IF NOT EXISTS product_entitlements');
    expect(pluginInserts(query)).toHaveLength(0);
  });

  it('020 inserts and verifies the 5 packs when the default tenant exists', async () => {
    const { runner, query } = mockRunner(true);
    await new WhatsAppAutomationPacks1740000000020().up(runner);
    expect(pluginInserts(query).map(([, params]) => (params as string[])[1])).toEqual([
      'wa-automation-follow-up-sequence',
      'wa-automation-new-contact-nurture',
      'wa-automation-reply-timeout-handoff',
      'wa-automation-property-inquiry',
      'wa-automation-education-inquiry',
    ]);
  });

  it('020 does not throw on a fresh DB without the default tenant', async () => {
    const { runner, query } = mockRunner(false);
    await expect(new WhatsAppAutomationPacks1740000000020().up(runner)).resolves.toBeUndefined();
    expect(pluginInserts(query)).toHaveLength(0);
  });
});
