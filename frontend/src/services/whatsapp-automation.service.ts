import api from '@/lib/api/client';
import { parseApiData } from '@/lib/api/parse-response';
import type { WorkflowExecution } from './workflow.service';

export interface AutomationField {
  key: string;
  label: string;
  type: 'string' | 'uuid' | 'message' | 'template' | 'url' | 'integer';
  required: boolean;
  description: string;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
}
export interface AutomationProduct {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  category: string;
  version: string;
  availability: 'IMPLEMENTED' | 'EXTERNAL_REQUIRED';
  requiredFeatures: string[];
  externalRequirements: { key: string; label: string; implemented: boolean; description: string }[];
  configSchema: { fields: AutomationField[] };
  steps: string[];
  trigger: string;
  pricing: {
    model: 'FREE' | 'PLAN_INCLUDED' | 'PAID';
    amount: number | null;
    currency: string | null;
    interval: string | null;
    checkoutAvailable: boolean;
  };
}
export interface AutomationReadiness {
  ready: boolean;
  issues: { code: string; message: string; field?: string }[];
}
export interface AutomationCoverage {
  key: string;
  name: string;
  support: 'PACK_AVAILABLE' | 'EXTERNAL_INTEGRATION';
  productSlugs: string[];
  externalRequirements: { key: string; label: string; implemented: boolean; description: string }[];
}
export interface AutomationInstallation {
  id: string;
  slug: string;
  name: string;
  version: string;
  flowId: string;
  state: 'DRAFT' | 'ACTIVE' | 'DISABLED' | 'UNINSTALLED';
  config: Record<string, unknown>;
  readiness: AutomationReadiness;
  analytics: {
    total: number;
    completed: number;
    failed: number;
    running: number;
    paused: number;
    cancelled: number;
    lastExecutedAt: string | null;
  };
}
export interface AutomationPreview {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  readiness: AutomationReadiness;
  preview?: {
    stepId: string;
    type: string;
    config: Record<string, unknown>;
    passed?: boolean;
    wouldExecute: boolean;
  }[];
}
function required<T>(response: { data?: unknown }): T {
  const value = parseApiData<T>(response);
  if (value === null) throw new Error('The server did not return automation data');
  return value;
}
const root = '/whatsapp-automations';
export const whatsappAutomationService = {
  catalog: async () => required<AutomationProduct[]>(await api.get(`${root}/catalog`)),
  coverage: async () => required<AutomationCoverage[]>(await api.get(`${root}/coverage`)),
  detail: async (slug: string) =>
    required<AutomationProduct>(await api.get(`${root}/catalog/${encodeURIComponent(slug)}`)),
  installed: async () => required<AutomationInstallation[]>(await api.get(`${root}/installed`)),
  install: async (slug: string, config: Record<string, unknown>) =>
    required<AutomationInstallation>(
      await api.post(`${root}/catalog/${encodeURIComponent(slug)}/install`, { config }),
    ),
  configure: async (id: string, config: Record<string, unknown>) =>
    required<AutomationInstallation>(await api.patch(`${root}/installed/${id}/config`, { config })),
  activate: async (id: string) =>
    required<AutomationInstallation>(await api.post(`${root}/installed/${id}/activate`)),
  disable: async (id: string) =>
    required<AutomationInstallation>(await api.post(`${root}/installed/${id}/disable`)),
  uninstall: async (id: string) =>
    required<AutomationInstallation>(await api.delete(`${root}/installed/${id}`)),
  preview: async (
    slug: string,
    config: Record<string, unknown>,
    payload: Record<string, unknown>,
  ) =>
    required<AutomationPreview>(
      await api.post(`${root}/catalog/${encodeURIComponent(slug)}/preview`, { config, payload }),
    ),
  executions: async (id: string) =>
    required<WorkflowExecution[]>(await api.get(`${root}/installed/${id}/executions`)),
  run: async (id: string, payload: Record<string, unknown>, requestId: string) =>
    required<{ triggered: number; jobIds: string[] }>(
      await api.post(`${root}/installed/${id}/run`, { payload, requestId }),
    ),
  checkout: async (slug: string) =>
    required<{ url: string }>(
      await api.post(`${root}/catalog/${encodeURIComponent(slug)}/checkout`),
    ),
};
