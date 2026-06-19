/** Resource keys used by @ResourcePermissions across controllers. */
export const PERMISSION_RESOURCES = [
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

export type PermissionResource = (typeof PERMISSION_RESOURCES)[number];

export const PERMISSION_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'manage',
  'view',
  'execute',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
