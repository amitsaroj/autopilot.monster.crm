import { MigrationInterface, QueryRunner } from 'typeorm';

import { downCoreCrm, upCoreCrm } from './ddl/core-crm.ddl';
import { downCorePlatform, upCorePlatform } from './ddl/core-platform.ddl';

/**
 * Baseline schema — explicit DDL for core platform + CRM entities.
 * Replaces synchronize() with deterministic SQL (TASK-011 partial).
 * Remaining module tables: see migration 1739900000004-PlatformModulesSchema.
 */
export class BaselineSchema1739900000001 implements MigrationInterface {
  name = 'BaselineSchema1739900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await upCorePlatform(queryRunner);
    await upCoreCrm(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await downCoreCrm(queryRunner);
    await downCorePlatform(queryRunner);
  }
}
