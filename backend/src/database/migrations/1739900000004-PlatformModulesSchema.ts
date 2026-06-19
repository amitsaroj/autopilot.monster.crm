import { MigrationInterface, QueryRunner } from 'typeorm';

import { downPlatformModules, upPlatformModules } from './ddl/platform-modules.ddl';

/**
 * Platform module tables — billing, workflows, communications, marketplace.
 * TASK-011 continuation. Remaining tables documented in project-audit/missing-database.md.
 */
export class PlatformModulesSchema1739900000004 implements MigrationInterface {
  name = 'PlatformModulesSchema1739900000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await upPlatformModules(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await downPlatformModules(queryRunner);
  }
}
