import api from '../lib/api/client';

export enum ActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
  TASK = 'TASK',
  WHATSAPP = 'WHATSAPP',
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  ownerId?: string;
  occurredAt: string;
  durationMinutes?: number;
  outcome?: string;
  createdAt: string;
}

export const activityService = {
  getActivities: () => api.get('/crm/activities'),
  logActivity: (data: Partial<Activity>) => api.post('/crm/activities', data),
};
