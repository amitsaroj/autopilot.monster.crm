import { MigrationInterface, QueryRunner } from 'typeorm';

export class WhatsAppAccounts1740000000013 implements MigrationInterface {
  name = 'WhatsAppAccounts1740000000013';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE whatsapp_accounts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz NULL,
        created_by uuid NULL,
        updated_by uuid NULL,
        provider varchar(30) NOT NULL DEFAULT 'meta' CHECK (provider = 'meta'),
        phone_number_id varchar(64) NOT NULL CHECK (phone_number_id ~ '^[1-9][0-9]{0,63}$'),
        business_account_id varchar(64) NOT NULL CHECK (business_account_id ~ '^[1-9][0-9]{0,63}$'),
        display_phone_number varchar(64) NULL,
        verified_name varchar(255) NULL,
        status varchar(20) NOT NULL DEFAULT 'CONNECTED'
          CHECK (status IN ('CONNECTED', 'DISCONNECTED')),
        encrypted_access_token text NULL,
        validated_at timestamptz NULL,
        disconnected_at timestamptz NULL,
        CONSTRAINT CHK_whatsapp_accounts_connected_token CHECK (
          status <> 'CONNECTED' OR encrypted_access_token IS NOT NULL
        )
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_whatsapp_accounts_phone_number_id"
      ON whatsapp_accounts (phone_number_id)`);
    await queryRunner.query(`CREATE INDEX "IDX_whatsapp_accounts_tenant_status"
      ON whatsapp_accounts (tenant_id, status)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE whatsapp_accounts');
  }
}
