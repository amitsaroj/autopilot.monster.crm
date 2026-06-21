import { MigrationInterface, QueryRunner } from 'typeorm';

const PERMISSION_RESOURCES = [
  'admin',
  'ai',
  'analytics',
  'audit',
  'billing',
  'crm',
  'data-jobs',
  'integrations',
  'marketplace',
  'notifications',
  'platform',
  'plugins',
  'rbac',
  'scheduler',
  'search',
  'settings',
  'social',
  'storage',
  'support',
  'tenant',
  'users',
  'voice',
  'whatsapp',
  'workflow',
  'workflows',
] as const;

const PERMISSION_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'manage',
  'view',
  'execute',
] as const;

export class BackfillPermissions1740000000002 implements MigrationInterface {
  name = 'BackfillPermissions1740000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const resource of PERMISSION_RESOURCES) {
      for (const action of PERMISSION_ACTIONS) {
        const name = `${resource}:${action}`;
        await queryRunner.query(
          `
          INSERT INTO permissions (name, resource, action, description)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (name) DO UPDATE
          SET resource = EXCLUDED.resource,
              action = EXCLUDED.action,
              description = EXCLUDED.description
          `,
          [name, resource, action, `Can ${action} ${resource}`],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const resource of PERMISSION_RESOURCES) {
      for (const action of PERMISSION_ACTIONS) {
        const name = `${resource}:${action}`;
        await queryRunner.query(`DELETE FROM permissions WHERE name = $1`, [name]);
      }
    }
  }
}
