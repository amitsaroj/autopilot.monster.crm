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

  // Tenant
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',

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
  DEAL_CREATED: 'deal.created',
  DEAL_STAGE_CHANGED: 'deal.stage.changed',

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
