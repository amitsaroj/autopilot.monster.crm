import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Baseline schema — synchronizes all TypeORM entities for greenfield deploys.
 * Run after InitialSchema1739900000000 (idempotent via synchronize diff).
 */
export class BaselineSchema1739900000001 implements MigrationInterface {
  name = 'BaselineSchema1739900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.connection.synchronize(false);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableNames = queryRunner.connection.entityMetadatas
      .map((meta) => meta.tableName)
      .filter((name) => name !== 'migrations')
      .reverse();

    for (const tableName of tableNames) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    }
  }
}
