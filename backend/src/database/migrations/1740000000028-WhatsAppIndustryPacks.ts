import { MigrationInterface, QueryRunner } from 'typeorm';

interface Listing {
  name: string;
  slug: string;
  description: string;
  configSchema: Record<string, unknown>;
}

const category = 'WHATSAPP_AUTOMATION';
const listings: readonly Listing[] = [
  {
    name: 'Travel and hospitality inquiry intake',
    slug: 'travel-hospitality-inquiry',
    description:
      'Route an inbound travel or stay inquiry to a teammate, create a follow-up task, and acknowledge the request. It does not read availability, quote prices, or confirm a reservation.',
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
          label: 'Follow-up task title',
          type: 'string',
          required: true,
          description: 'Task title for the travel or stay inquiry.',
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
    name: 'Retail and service request intake',
    slug: 'retail-service-inquiry',
    description:
      'Capture an inbound retail or service question in a CRM note, notify a teammate, and acknowledge the customer. It does not check product inventory, orders, refunds, or service availability.',
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

export class WhatsAppIndustryPacks1740000000028 implements MigrationInterface {
  name = 'WhatsAppIndustryPacks1740000000028';

  async up(queryRunner: QueryRunner): Promise<void> {
    const tenants: unknown = await queryRunner.query(
      `SELECT id FROM tenants WHERE slug='default' LIMIT 1`,
    );
    if (!Array.isArray(tenants) || tenants.length === 0) return;
    for (const product of listings) {
      await queryRunner.query(
        `INSERT INTO plugins(tenant_id,name,slug,description,version,author,category,
          "configSchema","isPremium",status,price_monthly)
         SELECT id,$1,$2,$3,'1.0.0','Autopilot Monster',$4,$5::jsonb,false,'ACTIVE',NULL
         FROM tenants WHERE slug='default'
         ON CONFLICT (slug) DO NOTHING`,
        [
          product.name,
          product.slug,
          product.description,
          category,
          JSON.stringify({
            ...product.configSchema,
            kind: category,
            slug: product.slug,
            version: '1.0.0',
          }),
        ],
      );
      const rows: unknown = await queryRunner.query(
        'SELECT id FROM plugins WHERE slug=$1 AND category=$2 AND status=$3',
        [product.slug, category, 'ACTIVE'],
      );
      if (!Array.isArray(rows) || rows.length !== 1)
        throw new Error(`Automation listing was not provisioned: ${product.slug}`);
    }
  }

  async down(): Promise<void> {
    // Keep catalog rows and installation/commercial history on rollback.
  }
}
