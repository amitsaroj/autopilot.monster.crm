import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanySizeRangeColumnNames1740000000007 implements MigrationInterface {
  name = 'CompanySizeRangeColumnNames1740000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE companies RENAME COLUMN "sizeRange" TO size_range
    `);
    await queryRunner.query(`
      ALTER TABLE companies RENAME COLUMN "annualRevenueRange" TO annual_revenue_range
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
