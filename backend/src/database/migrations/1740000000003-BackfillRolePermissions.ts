import { MigrationInterface, QueryRunner } from 'typeorm';

type RoleName = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'MANAGER' | 'USER' | 'AGENT';

interface PermissionRow {
  id: string;
  resource: string;
  action: string;
}

const ROLE_NAMES: RoleName[] = ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'USER', 'AGENT'];

function permissionsForRole(permissions: PermissionRow[], roleName: RoleName): PermissionRow[] {
  switch (roleName) {
    case 'SUPER_ADMIN':
      return permissions;
    case 'TENANT_ADMIN':
      return permissions.filter((p) => p.resource !== 'admin');
    case 'MANAGER':
      return permissions.filter(
        (p) => !['admin', 'billing'].includes(p.resource) && p.action !== 'delete',
      );
    case 'USER':
      return permissions.filter(
        (p) =>
          ['read', 'create', 'update', 'view'].includes(p.action) &&
          !['admin', 'billing', 'settings'].includes(p.resource),
      );
    case 'AGENT':
      return permissions.filter(
        (p) =>
          ['read', 'view', 'create', 'update'].includes(p.action) &&
          ['crm', 'voice', 'whatsapp'].includes(p.resource),
      );
    default: {
      const _exhaustive: never = roleName;
      return _exhaustive;
    }
  }
}

export class BackfillRolePermissions1740000000003 implements MigrationInterface {
  name = 'BackfillRolePermissions1740000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissions = (await queryRunner.query(
      `SELECT id, resource, action FROM permissions`,
    )) as PermissionRow[];

    if (permissions.length === 0) {
      return;
    }

    const roles = (await queryRunner.query(
      `SELECT id, name, tenant_id AS "tenantId" FROM roles WHERE name = ANY($1)`,
      [ROLE_NAMES],
    )) as Array<{ id: string; name: RoleName; tenantId: string }>;

    for (const role of roles) {
      const assigned = permissionsForRole(permissions, role.name);
      for (const permission of assigned) {
        await queryRunner.query(
          `
          INSERT INTO role_permissions (role_id, permission_id)
          VALUES ($1, $2)
          ON CONFLICT (role_id, permission_id) DO NOTHING
          `,
          [role.id, permission.id],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const roles = (await queryRunner.query(
      `SELECT id FROM roles WHERE name = ANY($1)`,
      [ROLE_NAMES],
    )) as Array<{ id: string }>;

    for (const role of roles) {
      await queryRunner.query(`DELETE FROM role_permissions WHERE role_id = $1`, [role.id]);
    }
  }
}
