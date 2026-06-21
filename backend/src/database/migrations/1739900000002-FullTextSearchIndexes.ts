import { MigrationInterface, QueryRunner } from 'typeorm';

export class FullTextSearchIndexes1739900000002 implements MigrationInterface {
  name = 'FullTextSearchIndexes1739900000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_fts ON contacts USING gin (
        to_tsvector(
          'english',
          coalesce(first_name, '') || ' ' ||
          coalesce(last_name, '') || ' ' ||
          coalesce(email, '')
        )
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_fts ON companies USING gin (
        to_tsvector(
          'english',
          coalesce(name, '') || ' ' ||
          coalesce(domain, '')
        )
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_deals_fts ON deals USING gin (
        to_tsvector('english', coalesce(name, ''))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_deals_fts`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_companies_fts`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_contacts_fts`);
  }
}
