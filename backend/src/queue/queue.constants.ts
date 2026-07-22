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

export const JOB_NAMES = {
  SEND_EMAIL: 'send-email',
  SEND_SMS: 'send-sms',
  SEND_NOTIFICATION: 'send-notification',
  PROCESS_VOICE: 'process-voice',
  RUN_INFERENCE: 'run-inference',
  PROCESS_BILLING: 'process-billing',
  TRACK_EVENT: 'track-event',
  INDEX_DOCUMENT: 'index-document',
  EXECUTE_WORKFLOW: 'execute-workflow',
  BROADCAST_MESSAGE: 'broadcast-message',
  PROCESS_IMPORT: 'process-import',
  PROCESS_EXPORT: 'process-export',
  PROCESS_BACKUP: 'process-backup',
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];
