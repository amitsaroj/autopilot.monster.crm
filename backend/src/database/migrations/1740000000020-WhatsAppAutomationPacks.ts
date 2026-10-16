import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Frozen snapshot of the catalog rows this migration provisions, copied from
 * whatsapp-automation.registry at the time the migration shipped. Do not edit:
 * migrations must not change when the live registry evolves.
 */
interface CatalogListingSnapshot {
  name: string;
  slug: string;
  description: string;
  version: string;
  configSchema: Record<string, unknown>;
}

const AUTOMATION_PLUGIN_CATEGORY = 'WHATSAPP_AUTOMATION';

const WHATSAPP_AUTOMATION_PACKS_SNAPSHOT: readonly CatalogListingSnapshot[] = [
  {
    name: 'Three-touch customer follow-up',
    slug: 'wa-automation-follow-up-sequence',
    description:
      'Manually start three sends of the same approved marketing template, separated by configured delays and weekday business hours. Stops on reply, opt-out or CRM conversion.',
    version: '1.0.0',
    configSchema: {
      fields: [
        {
          key: 'accountId',
          label: 'WhatsApp account',
          type: 'uuid',
          required: true,
          description: 'A connected Meta account owned by this workspace.',
        },
        {
          key: 'templateId',
          label: 'Approved template',
          type: 'template',
          required: true,
          description: 'An approved basic body-only Meta template owned by this workspace.',
        },
        {
          key: 'recipient',
          label: 'Recipient variable',
          type: 'string',
          required: true,
          description: 'Workflow variable path, such as contact.phone or deal.contact.phone.',
          maxLength: 100,
        },
        {
          key: 'templateParameters',
          label: 'Template body parameters',
          type: 'string',
          required: false,
          description:
            'Values for each template body variable, in placeholder order. Use available workflow variables for personalization.',
          maxLength: 16000,
        },
        {
          key: 'followUpHours',
          label: 'Hours between follow-ups',
          type: 'integer',
          required: true,
          description:
            'Delay between three sends of the same approved template; each delay is at most 30 days.',
          minimum: 1,
          maximum: 720,
        },
        {
          key: 'businessTimezone',
          label: 'Business timezone',
          type: 'string',
          required: true,
          description:
            'IANA timezone, such as Asia/Kolkata. Sends run Monday through Friday in these business hours.',
          maxLength: 100,
        },
        {
          key: 'businessStartHour',
          label: 'Opening hour',
          type: 'integer',
          required: true,
          description: 'Local hour, from 0 to 23.',
          minimum: 0,
          maximum: 23,
        },
        {
          key: 'businessEndHour',
          label: 'Closing hour',
          type: 'integer',
          required: true,
          description: 'Local hour, from 1 to 24; must be later than opening.',
          minimum: 1,
          maximum: 24,
        },
      ],
      additionalProperties: false,
    },
  },
  {
    name: 'New CRM contact nurture',
    slug: 'wa-automation-new-contact-nurture',
    description:
      'Start a three-touch marketing-template sequence when a CRM contact is created. Requires a reachable CRM phone and marketing opt-in before the first send; stops on reply or conversion.',
    version: '1.0.0',
    configSchema: {
      fields: [
        {
          key: 'accountId',
          label: 'WhatsApp account',
          type: 'uuid',
          required: true,
          description: 'A connected Meta account owned by this workspace.',
        },
        {
          key: 'templateId',
          label: 'Approved template',
          type: 'template',
          required: true,
          description: 'An approved basic body-only Meta template owned by this workspace.',
        },
        {
          key: 'recipient',
          label: 'Recipient variable',
          type: 'string',
          required: true,
          description: 'Workflow variable path, such as contact.phone or deal.contact.phone.',
          maxLength: 100,
        },
        {
          key: 'templateParameters',
          label: 'Template body parameters',
          type: 'string',
          required: false,
          description:
            'Values for each template body variable, in placeholder order. Use available workflow variables for personalization.',
          maxLength: 16000,
        },
        {
          key: 'followUpHours',
          label: 'Hours between follow-ups',
          type: 'integer',
          required: true,
          description:
            'Delay between three sends of the same approved template; each delay is at most 30 days.',
          minimum: 1,
          maximum: 720,
        },
        {
          key: 'businessTimezone',
          label: 'Business timezone',
          type: 'string',
          required: true,
          description:
            'IANA timezone, such as Asia/Kolkata. Sends run Monday through Friday in these business hours.',
          maxLength: 100,
        },
        {
          key: 'businessStartHour',
          label: 'Opening hour',
          type: 'integer',
          required: true,
          description: 'Local hour, from 0 to 23.',
          minimum: 0,
          maximum: 23,
        },
        {
          key: 'businessEndHour',
          label: 'Closing hour',
          type: 'integer',
          required: true,
          description: 'Local hour, from 1 to 24; must be later than opening.',
          minimum: 1,
          maximum: 24,
        },
      ],
      additionalProperties: false,
    },
  },
  {
    name: 'Follow-up reply timeout alert',
    slug: 'wa-automation-reply-timeout-handoff',
    description:
      'Manually send one approved marketing template and wait for a reply. Notify a teammate only when the reply window expires. Does not send a second message.',
    version: '1.0.0',
    configSchema: {
      fields: [
        {
          key: 'accountId',
          label: 'WhatsApp account',
          type: 'uuid',
          required: true,
          description: 'A connected Meta account owned by this workspace.',
        },
        {
          key: 'templateId',
          label: 'Approved template',
          type: 'template',
          required: true,
          description: 'An approved basic body-only Meta template owned by this workspace.',
        },
        {
          key: 'recipient',
          label: 'Recipient variable',
          type: 'string',
          required: true,
          description: 'Workflow variable path, such as contact.phone or deal.contact.phone.',
          maxLength: 100,
        },
        {
          key: 'templateParameters',
          label: 'Template body parameters',
          type: 'string',
          required: false,
          description:
            'Values for each template body variable, in placeholder order. Use available workflow variables for personalization.',
          maxLength: 16000,
        },
        {
          key: 'assigneeId',
          label: 'Responsible teammate',
          type: 'uuid',
          required: true,
          description: 'An active user in this workspace.',
        },
        {
          key: 'replyTimeoutMinutes',
          label: 'Reply timeout in minutes',
          type: 'integer',
          required: true,
          description: 'Positive reply wait, at most 30 days.',
          minimum: 1,
          maximum: 43200,
        },
      ],
      additionalProperties: false,
    },
  },
  {
    name: 'Real estate viewing inquiry intake',
    slug: 'wa-automation-property-inquiry',
    description:
      'Assign a property inquiry to a teammate, create a viewing follow-up task containing the inbound request, and acknowledge the customer. Does not access listings or book a viewing.',
    version: '1.0.0',
    configSchema: {
      fields: [
        {
          key: 'accountId',
          label: 'WhatsApp account',
          type: 'uuid',
          required: true,
          description: 'A connected Meta account owned by this workspace.',
        },
        {
          key: 'keyword',
          label: 'Inbound keyword',
          type: 'string',
          required: true,
          description: 'Case-insensitive keyword that starts this workflow.',
          maxLength: 100,
        },
        {
          key: 'assigneeId',
          label: 'Responsible teammate',
          type: 'uuid',
          required: true,
          description: 'An active user in this workspace.',
        },
        {
          key: 'taskTitle',
          label: 'Viewing follow-up title',
          type: 'string',
          required: true,
          description: 'Title for the teammate’s viewing follow-up task.',
          maxLength: 255,
        },
        {
          key: 'message',
          label: 'Reply message',
          type: 'message',
          required: true,
          description: 'Text reply inside the inbound customer service window.',
          maxLength: 4096,
        },
      ],
      additionalProperties: false,
    },
  },
  {
    name: 'Education course inquiry intake',
    slug: 'wa-automation-education-inquiry',
    description:
      'Store an inbound course inquiry as a CRM note, notify an admissions teammate and reply with maintained course information. Does not enroll students or query a student system.',
    version: '1.0.0',
    configSchema: {
      fields: [
        {
          key: 'accountId',
          label: 'WhatsApp account',
          type: 'uuid',
          required: true,
          description: 'A connected Meta account owned by this workspace.',
        },
        {
          key: 'keyword',
          label: 'Inbound keyword',
          type: 'string',
          required: true,
          description: 'Case-insensitive keyword that starts this workflow.',
          maxLength: 100,
        },
        {
          key: 'assigneeId',
          label: 'Responsible teammate',
          type: 'uuid',
          required: true,
          description: 'An active user in this workspace.',
        },
        {
          key: 'message',
          label: 'Reply message',
          type: 'message',
          required: true,
          description: 'Text reply inside the inbound customer service window.',
          maxLength: 4096,
        },
      ],
      additionalProperties: false,
    },
  },
];

/** Platform listings are owned by the default tenant; a fresh DB without it has no owner yet. */
async function defaultTenantExists(queryRunner: QueryRunner): Promise<boolean> {
  const rows: unknown = await queryRunner.query(
    `SELECT id FROM tenants WHERE slug='default' LIMIT 1`,
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function insertListing(queryRunner: QueryRunner, product: CatalogListingSnapshot) {
  await queryRunner.query(
    `INSERT INTO plugins(tenant_id,name,slug,description,version,author,category,
    "configSchema","isPremium",status,price_monthly)
    SELECT id,$1,$2,$3,$4,'Autopilot Monster',$5,$6::jsonb,false,'ACTIVE',NULL FROM tenants WHERE slug='default'
    ON CONFLICT (slug) DO NOTHING`,
    [
      product.name,
      product.slug,
      product.description,
      product.version,
      AUTOMATION_PLUGIN_CATEGORY,
      JSON.stringify({
        ...product.configSchema,
        kind: AUTOMATION_PLUGIN_CATEGORY,
        slug: product.slug,
        version: product.version,
      }),
    ],
  );
}

export class WhatsAppAutomationPacks1740000000020 implements MigrationInterface {
  name = 'WhatsAppAutomationPacks1740000000020';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Fresh DB (seed not run): no platform tenant to own listings, so skip catalog rows.
    if (!(await defaultTenantExists(queryRunner))) return;
    for (const product of WHATSAPP_AUTOMATION_PACKS_SNAPSHOT) {
      await insertListing(queryRunner, product);
      const rows: unknown = await queryRunner.query(
        'SELECT id FROM plugins WHERE slug=$1 AND category=$2',
        [product.slug, AUTOMATION_PLUGIN_CATEGORY],
      );
      if (!Array.isArray(rows) || rows.length !== 1)
        throw new Error(`Automation listing was not provisioned: ${product.slug}`);
    }
  }

  async down(): Promise<void> {
    // Retain listings, installations and commercial history on rollback.
  }
}
