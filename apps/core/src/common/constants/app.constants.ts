/** Metadata keys for decorators */
export const METADATA_KEYS = {
  TENANT_ID: 'tenantId',
  USER_ID: 'userId',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  PLAN_FEATURE: 'planFeature',
  PLAN_LIMIT: 'planLimit',
  IS_PUBLIC: 'isPublic',
  CORRELATION_ID: 'correlationId',
} as const;

/** DI injection tokens */
export const INJECTION_TOKENS = {
  MINIO_CONFIG: 'MINIO_CONFIG',
  QDRANT_CONFIG: 'QDRANT_CONFIG',
  CURRENT_USER: 'CURRENT_USER',
  REQUEST_CONTEXT: 'REQUEST_CONTEXT',
} as const;

/** HTTP header names used across the platform */
export const HEADERS = {
  TENANT_ID: 'x-tenant-id',
  CORRELATION_ID: 'x-correlation-id',
  API_KEY: 'x-api-key',
  PLAN_ID: 'x-plan-id',
} as const;
