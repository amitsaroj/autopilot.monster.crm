/**
 * Platform-wide domain event name registry.
 * All event emitter event names must be declared here.
 */
export const EVENT_NAMES = {
  // Auth
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  PASSWORD_RESET: 'user.password.reset',
  USER_VERIFIED: 'user.verified',
  USER_MFA_ENABLED: 'user.mfa.enabled',
  USER_MFA_DISABLED: 'user.mfa.disabled',
  USER_INVITED: 'user.invited',
  USER_UPDATED: 'user.updated',

  // Audit (direct write path)
  AUDIT_LOG: 'audit.log',

  // Tenant
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',

  // RBAC
  ROLE_CREATED: 'role.created',
  ROLE_UPDATED: 'role.updated',
  ROLE_ASSIGNED: 'role.assigned',
  ROLE_REVOKED: 'role.revoked',

  // Billing
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  USAGE_LIMIT_REACHED: 'usage.limit.reached',

  // CRM
  CONTACT_CREATED: 'contact.created',
  CONTACT_UPDATED: 'contact.updated',
  CONTACT_DELETED: 'contact.deleted',
  CONTACT_MERGED: 'contact.merged',
  COMPANY_CREATED: 'company.created',
  COMPANY_UPDATED: 'company.updated',
  COMPANY_DELETED: 'company.deleted',
  COMPANY_MERGED: 'company.merged',
  DEAL_CREATED: 'deal.created',
  DEAL_UPDATED: 'deal.updated',
  DEAL_DELETED: 'deal.deleted',
  DEAL_STAGE_CHANGED: 'deal.stage.changed',
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  LEAD_DELETED: 'lead.deleted',

  // Workflow
  WORKFLOW_STARTED: 'workflow.started',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',

  // AI
  AI_RESPONSE_GENERATED: 'ai.response.generated',
  AI_QUOTA_EXCEEDED: 'ai.quota.exceeded',

  // Voice
  CALL_STARTED: 'call.started',
  CALL_ENDED: 'call.ended',

  // Messaging
  MESSAGE_SENT: 'message.sent',
  MESSAGE_RECEIVED: 'message.received',
  MESSAGE_DELIVERED: 'message.delivered',
  MESSAGE_READ: 'message.read',

  // Notifications
  NOTIFICATION_SENT: 'notification.sent',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
