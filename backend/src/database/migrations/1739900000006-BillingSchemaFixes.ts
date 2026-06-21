import { MigrationInterface, QueryRunner } from 'typeorm';

export class BillingSchemaFixes1739900000006 implements MigrationInterface {
  name = 'BillingSchemaFixes1739900000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE wallet_transactions
      ADD COLUMN IF NOT EXISTS balance_after decimal(12,2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE wallet_transactions
      DROP COLUMN IF EXISTS balance_after
    `);
  }
}
