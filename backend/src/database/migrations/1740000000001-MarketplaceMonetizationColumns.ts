import { MigrationInterface, QueryRunner } from 'typeorm';

export class MarketplaceMonetizationColumns1740000000001 implements MigrationInterface {
  name = 'MarketplaceMonetizationColumns1740000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE plugins
        ADD COLUMN IF NOT EXISTS price_monthly decimal(10,2),
        ADD COLUMN IF NOT EXISTS vendor_id varchar,
        ADD COLUMN IF NOT EXISTS stripe_price_id varchar
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE plugins
        DROP COLUMN IF EXISTS stripe_price_id,
        DROP COLUMN IF EXISTS vendor_id,
        DROP COLUMN IF EXISTS price_monthly
    `);
  }
}
