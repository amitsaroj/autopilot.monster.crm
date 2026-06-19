import { MigrationInterface, QueryRunner } from 'typeorm';

import { downExtendedModules, upExtendedModules } from './ddl/extended-modules.ddl';

/**
 * Extended module tables — voice, WhatsApp, AI, analytics, support, storage.
 * TASK-011 continuation. Completes explicit DDL for remaining entity tables.
 */
export class ExtendedModulesSchema1739900000005 implements MigrationInterface {
  name = 'ExtendedModulesSchema1739900000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await upExtendedModules(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await downExtendedModules(queryRunner);
  }
}
