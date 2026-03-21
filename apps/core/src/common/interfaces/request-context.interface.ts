/**
 * Request context — injected via middleware, available in every controller.
 * Contains authenticated user info and tenant context.
 */
export interface IRequestContext {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  permissions: string[];
  planId: string;
  correlationId: string;
  ipAddress: string;
  userAgent: string;
}
