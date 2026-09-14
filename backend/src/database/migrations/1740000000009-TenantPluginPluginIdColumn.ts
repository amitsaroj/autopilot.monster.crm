import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * TenantPlugin.pluginId maps to column `plugin_id` (see tenant-plugin.entity.ts),
 * but some environments still have the table from before that mapping was
 * fixed, where TypeORM's default camelCase naming created a `pluginId` column
 * instead. Rename it in place where that's the case; no-op otherwise.
 */
export class TenantPluginPluginIdColumn1740000000009 implements MigrationInterface {
  name = 'TenantPluginPluginIdColumn1740000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'tenant_plugins' AND column_name = 'pluginId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'tenant_plugins' AND column_name = 'plugin_id'
        ) THEN
          ALTER TABLE tenant_plugins RENAME COLUMN "pluginId" TO plugin_id;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'tenant_plugins' AND column_name = 'plugin_id'
        ) THEN
          ALTER TABLE tenant_plugins RENAME COLUMN plugin_id TO "pluginId";
        END IF;
      END $$;
    `);
  }
}
