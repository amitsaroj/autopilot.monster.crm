import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanySizeRangeColumnNames1740000000007 implements MigrationInterface {
  name = 'CompanySizeRangeColumnNames1740000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'companies' AND column_name = 'sizeRange'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'companies' AND column_name = 'size_range'
        ) THEN
          ALTER TABLE companies RENAME COLUMN "sizeRange" TO size_range;
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'companies' AND column_name = 'annualRevenueRange'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'companies' AND column_name = 'annual_revenue_range'
        ) THEN
          ALTER TABLE companies RENAME COLUMN "annualRevenueRange" TO annual_revenue_range;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE companies RENAME COLUMN annual_revenue_range TO "annualRevenueRange"
    `);
    await queryRunner.query(`
      ALTER TABLE companies RENAME COLUMN size_range TO "sizeRange"
    `);
  }
}
