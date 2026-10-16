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

const WHATSAPP_AUTOMATION_PRODUCTS_SNAPSHOT: readonly CatalogListingSnapshot[] = [
  {
    name: 'Keyword welcome reply',
    slug: 'wa-automation-welcome-reply',
    description: 'Reply to an inbound greeting with your team’s welcome message.',
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
    name: 'Opening hours and location',
    slug: 'wa-automation-opening-hours',
    description:
      'Answer an inbound hours or location request with maintained business information.',
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
    name: 'Inbound lead capture',
    slug: 'wa-automation-lead-capture',
    description: 'Create a CRM lead contact from an inbound WhatsApp request and acknowledge it.',
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
          key: 'firstName',
          label: 'Contact first name',
          type: 'string',
          required: true,
          description: 'Literal or workflow variable such as {{phone}}.',
          maxLength: 100,
        },
        {
          key: 'email',
          label: 'Contact email',
          type: 'string',
          required: true,
          description:
            'Literal or workflow variable resolving to a valid email; required by the existing CRM contact action.',
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
    name: 'Sales team handoff',
    slug: 'wa-automation-sales-handoff',
    description:
      'Assign an inbound conversation to a workspace teammate and send an acknowledgment.',
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
          label: 'Assignee',
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
  {
    name: 'Appointment request intake',
    slug: 'wa-automation-appointment-request',
    description:
      'Create a CRM follow-up task when a customer asks for an appointment. Does not book a calendar slot.',
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
          key: 'taskTitle',
          label: 'Task title',
          type: 'string',
          required: true,
          description: 'Title for the appointment follow-up task.',
          maxLength: 255,
        },
        {
          key: 'assigneeId',
          label: 'Task assignee',
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
  {
    name: 'Support escalation',
    slug: 'wa-automation-support-escalation',
    description:
      'Assign the conversation, notify the assignee, and acknowledge the support request.',
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
          label: 'Support assignee',
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
  {
    name: 'Conversation resolution',
    slug: 'wa-automation-resolve-conversation',
    description: 'Acknowledge an inbound resolution keyword and mark the conversation resolved.',
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
    name: 'Deal stage notification',
    slug: 'wa-automation-deal-stage-update',
    description: 'Send an approved utility template when an existing CRM deal changes stage.',
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
      ],
      additionalProperties: false,
    },
  },
  {
    name: 'Payment instructions reply',
    slug: 'wa-automation-payment-instructions',
    description:
      'Reply to an inbound request with payment instructions or an existing payment link. Does not create or verify payments.',
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
    name: 'Manual customer follow-up',
    slug: 'wa-automation-customer-follow-up',
    description:
      'Send an approved marketing template to a supplied CRM recipient on manual execution.',
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
      ],
      additionalProperties: false,
    },
  },
  {
    name: 'Inbound team alert',
    slug: 'wa-automation-team-alert',
    description: 'Notify a workspace teammate when an inbound keyword needs attention.',
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
          label: 'Notification recipient',
          type: 'uuid',
          required: true,
          description: 'An active user in this workspace.',
        },
      ],
      additionalProperties: false,
    },
  },
  {
    name: 'Shopify cart recovery',
    slug: 'wa-automation-shopify-recovery',
    description:
      'Requires a Shopify event/authentication adapter that is not implemented. Not installable.',
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
      ],
      additionalProperties: false,
    },
  },
  {
    name: 'AI knowledge assistant',
    slug: 'wa-automation-ai-knowledge-reply',
    description:
      'Answer inbound text from your knowledge base using an existing AI agent. Uncertain or unavailable answers route to a teammate.',
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
          key: 'agentId',
          label: 'AI agent',
          type: 'uuid',
          required: true,
          description:
            'An active workspace agent. Configure its instructions and tone in AI settings.',
        },
        {
          key: 'knowledgeBaseId',
          label: 'Knowledge base',
          type: 'uuid',
          required: true,
          description: 'A workspace knowledge base with indexed business information.',
        },
        {
          key: 'assigneeId',
          label: 'Handoff teammate',
          type: 'uuid',
          required: true,
          description: 'An active workspace user for unanswered requests.',
        },
        {
          key: 'fallbackMessage',
          label: 'Handoff message',
          type: 'message',
          required: true,
          description: 'Customer acknowledgment when AI cannot answer.',
          maxLength: 2000,
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

export class WhatsAppAutomationCatalog1740000000018 implements MigrationInterface {
  name = 'WhatsAppAutomationCatalog1740000000018';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS product_entitlements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
      plugin_id uuid NOT NULL REFERENCES plugins(id), status varchar(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','ACTIVE','REVOKED','EXPIRED')),
      source varchar(30) NOT NULL DEFAULT 'STRIPE', stripe_price_id varchar(255) NOT NULL,
      product_version varchar(50) NOT NULL, checkout_session_id varchar(255), stripe_subscription_id varchar(255),
      payment_intent_id varchar(255), stripe_customer_id varchar(255), expires_at timestamptz,
      last_event_id varchar(255), last_event_created bigint NOT NULL DEFAULT 0, revocation_reason varchar(50),
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz, created_by uuid, updated_by uuid
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_product_entitlements_tenant_plugin" ON product_entitlements(tenant_id,plugin_id)',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_product_entitlements_checkout" ON product_entitlements(checkout_session_id)',
    );
    // Scope uniqueness to the new product type, without rewriting existing plugin installations.
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_tenant_plugins_whatsapp_automation"
      ON tenant_plugins("tenantId",plugin_id) WHERE config->>'kind' = 'WHATSAPP_AUTOMATION' AND deleted_at IS NULL`);
    // Fresh DB (seed not run): no platform tenant to own listings, so skip catalog rows.
    if (!(await defaultTenantExists(queryRunner))) return;
    for (const product of WHATSAPP_AUTOMATION_PRODUCTS_SNAPSHOT) {
      await insertListing(queryRunner, product);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Preserve installed catalog rows and flows on rollback; commercial history must not be silently erased.
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_tenant_plugins_whatsapp_automation"');
    await queryRunner.query('DROP TABLE IF EXISTS product_entitlements');
  }
}
