import api from '../lib/api/client';

export enum TaskPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  contactId?: string;
  dealId?: string;
  assigneeId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export const taskService = {
  getTasks: () => api.get('/crm/tasks'),
  getTask: (id: string) => api.get(`/crm/tasks/${id}`),
  createTask: (data: Partial<Task>) => api.post('/crm/tasks', data),
  updateTask: (id: string, data: Partial<Task>) => api.put(`/crm/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/crm/tasks/${id}`),
};
