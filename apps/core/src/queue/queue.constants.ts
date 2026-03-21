/**
 * Centralised queue name registry.
 * All Bull queue names must be declared here to avoid magic strings.
 */
export const QUEUE_NAMES = {
  EMAIL: 'email',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  VOICE: 'voice',
  NOTIFICATION: 'notification',
  AI_INFERENCE: 'ai-inference',
  WORKFLOW: 'workflow',
  BILLING: 'billing',
  ANALYTICS: 'analytics',
  IMPORT: 'import',
  EXPORT: 'export',
  SEARCH_INDEX: 'search-index',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
