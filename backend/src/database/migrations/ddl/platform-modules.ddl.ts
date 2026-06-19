import type { QueryRunner } from 'typeorm';

import { createEnumType, runQueries } from './migration-utils';

const MODULE_QUERIES: string[] = [
  createEnumType('subscriptions_status_enum', ['ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELLED', 'EXPIRED']),
  createEnumType('invoices_status_enum', ['DRAFT', 'OPEN', 'PAID', 'UNCOLLECTIBLE', 'VOID']),
  createEnumType('conversations_status_enum', ['OPEN', 'PENDING', 'CLOSED']),

  `CREATE TABLE IF NOT EXISTS subscriptions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    plan_id uuid NOT NULL,
    status "subscriptions_status_enum" NOT NULL DEFAULT 'TRIAL',
    billing_cycle varchar NOT NULL,
    started_at timestamptz NOT NULL DEFAULT now(),
    current_period_start timestamptz,
    current_period_end timestamptz,
    trial_ends_at timestamptz,
    cancelled_at timestamptz,
    stripe_subscription_id varchar,
    stripe_customer_id varchar
  )`,
  `CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_status ON subscriptions(tenant_id, status)`,

  `CREATE TABLE IF NOT EXISTS invoices (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    subscription_id uuid NOT NULL,
    number varchar(50) NOT NULL UNIQUE,
    status "invoices_status_enum" NOT NULL DEFAULT 'OPEN',
    subtotal decimal(15,2) NOT NULL,
    tax decimal(15,2) NOT NULL DEFAULT 0,
    total decimal(15,2) NOT NULL,
    currency varchar(3) NOT NULL,
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    due_date timestamptz NOT NULL,
    paid_at timestamptz,
    stripe_invoice_id varchar,
    pdf_url varchar,
    line_items jsonb NOT NULL DEFAULT '[]',
    CONSTRAINT fk_invoices_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_tenant_number ON invoices(tenant_id, number)`,

  `CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    invoice_id uuid,
    amount decimal(15,2) NOT NULL,
    currency varchar(3) NOT NULL DEFAULT 'USD',
    status varchar NOT NULL DEFAULT 'PENDING',
    provider varchar NOT NULL DEFAULT 'stripe',
    provider_payment_id varchar,
    metadata jsonb NOT NULL DEFAULT '{}'
  )`,

  `CREATE TABLE IF NOT EXISTS wallets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    balance decimal(12,2) NOT NULL DEFAULT 0,
    currency varchar(3) NOT NULL DEFAULT 'USD'
  )`,

  `CREATE TABLE IF NOT EXISTS wallet_transactions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    wallet_id uuid NOT NULL,
    amount decimal(12,2) NOT NULL,
    type varchar NOT NULL,
    balance_after decimal(12,2),
    description varchar,
    reference_id varchar,
    metadata jsonb NOT NULL DEFAULT '{}',
    CONSTRAINT fk_wallet_transactions_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS flows (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    name varchar(255) NOT NULL,
    type varchar(50) NOT NULL DEFAULT 'voice',
    definition jsonb NOT NULL,
    "isPublished" boolean NOT NULL DEFAULT false,
    description text
  )`,

  `CREATE TABLE IF NOT EXISTS workflow_executions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    flow_id uuid NOT NULL,
    status varchar NOT NULL DEFAULT 'PENDING',
    trigger_type varchar,
    trigger_data jsonb NOT NULL DEFAULT '{}',
    started_at timestamptz,
    completed_at timestamptz,
    error text,
    result jsonb,
    CONSTRAINT fk_workflow_executions_flow FOREIGN KEY (flow_id) REFERENCES flows(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    user_id uuid NOT NULL,
    title varchar NOT NULL,
    body text,
    type varchar NOT NULL DEFAULT 'INFO',
    is_read boolean NOT NULL DEFAULT false,
    read_at timestamptz,
    metadata jsonb NOT NULL DEFAULT '{}'
  )`,

  `CREATE TABLE IF NOT EXISTS webhooks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    url varchar NOT NULL,
    events text[] NOT NULL DEFAULT '{}',
    secret varchar,
    is_active boolean NOT NULL DEFAULT true
  )`,

  `CREATE TABLE IF NOT EXISTS webhook_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    webhook_id uuid NOT NULL,
    event varchar NOT NULL,
    payload jsonb NOT NULL,
    response_status integer,
    response_body text,
    duration_ms integer,
    CONSTRAINT fk_webhook_logs_webhook FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    contact_id uuid,
    channel varchar(50) NOT NULL,
    status "conversations_status_enum" NOT NULL DEFAULT 'OPEN',
    last_message_at timestamptz,
    summary text,
    meta jsonb NOT NULL DEFAULT '{}',
    CONSTRAINT fk_conversations_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_tenant_contact ON conversations(tenant_id, contact_id)`,

  `CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    conversation_id uuid NOT NULL,
    direction varchar NOT NULL,
    content text NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}',
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    name varchar NOT NULL,
    description text,
    sku varchar,
    price decimal(15,2) NOT NULL DEFAULT 0,
    currency varchar(3) NOT NULL DEFAULT 'USD',
    is_active boolean NOT NULL DEFAULT true
  )`,

  `CREATE TABLE IF NOT EXISTS quotes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    number varchar NOT NULL,
    contact_id uuid,
    deal_id uuid,
    status varchar NOT NULL DEFAULT 'DRAFT',
    subtotal decimal(15,2) NOT NULL DEFAULT 0,
    total decimal(15,2) NOT NULL DEFAULT 0,
    currency varchar(3) NOT NULL DEFAULT 'USD',
    valid_until date,
    line_items jsonb NOT NULL DEFAULT '[]',
    CONSTRAINT fk_quotes_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
    CONSTRAINT fk_quotes_deal FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS plugins (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    name varchar NOT NULL UNIQUE,
    slug varchar NOT NULL UNIQUE,
    description text,
    version varchar,
    author varchar,
    icon varchar,
    "configSchema" jsonb,
    "isPremium" boolean NOT NULL DEFAULT false,
    price_monthly decimal(10,2),
    vendor_id varchar,
    stripe_price_id varchar,
    status varchar NOT NULL DEFAULT 'ACTIVE',
    category varchar
  )`,

  `CREATE TABLE IF NOT EXISTS tenant_plugins (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    created_by uuid,
    updated_by uuid,
    plugin_id uuid NOT NULL,
    is_enabled boolean NOT NULL DEFAULT true,
    config jsonb NOT NULL DEFAULT '{}',
    installed_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_tenant_plugins_plugin FOREIGN KEY (plugin_id) REFERENCES plugins(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS platform_settings (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    key varchar NOT NULL UNIQUE,
    value jsonb NOT NULL,
    "group" varchar NOT NULL DEFAULT 'GENERAL',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
];

const MODULE_DOWN_QUERIES: string[] = [
  'DROP TABLE IF EXISTS platform_settings',
  'DROP TABLE IF EXISTS tenant_plugins',
  'DROP TABLE IF EXISTS plugins',
  'DROP TABLE IF EXISTS quotes',
  'DROP TABLE IF EXISTS products',
  'DROP TABLE IF EXISTS messages',
  'DROP TABLE IF EXISTS conversations',
  'DROP TABLE IF EXISTS webhook_logs',
  'DROP TABLE IF EXISTS webhooks',
  'DROP TABLE IF EXISTS notifications',
  'DROP TABLE IF EXISTS workflow_executions',
  'DROP TABLE IF EXISTS flows',
  'DROP TABLE IF EXISTS wallet_transactions',
  'DROP TABLE IF EXISTS wallets',
  'DROP TABLE IF EXISTS payments',
  'DROP TABLE IF EXISTS invoices',
  'DROP TABLE IF EXISTS subscriptions',
  'DROP TYPE IF EXISTS conversations_status_enum',
  'DROP TYPE IF EXISTS invoices_status_enum',
  'DROP TYPE IF EXISTS subscriptions_status_enum',
];

export async function upPlatformModules(queryRunner: QueryRunner): Promise<void> {
  await runQueries(queryRunner, MODULE_QUERIES);
}

export async function downPlatformModules(queryRunner: QueryRunner): Promise<void> {
  await runQueries(queryRunner, MODULE_DOWN_QUERIES);
}
