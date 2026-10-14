import type { WorkflowSequencePolicy } from '../workflow/workflow-definition';

export type AutomationCategory =
  | 'CUSTOMER_SERVICE'
  | 'LEAD_CAPTURE'
  | 'SALES'
  | 'APPOINTMENTS'
  | 'SUPPORT'
  | 'PAYMENTS'
  | 'RETENTION'
  | 'OPERATIONS'
  | 'ECOMMERCE'
  | 'AI'
  | 'SEQUENCES'
  | 'INDUSTRIES'
  | 'NOTIFICATIONS';

export interface AutomationConfigField {
  key: string;
  label: string;
  type: 'string' | 'uuid' | 'message' | 'template' | 'url' | 'integer';
  required: boolean;
  description: string;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
}

export interface AutomationRequirement {
  key: string;
  label: string;
  implemented: boolean;
  description: string;
}

export interface AutomationCategoryOverview {
  key:
    | 'A'
    | 'B'
    | 'C'
    | 'D'
    | 'E'
    | 'F'
    | 'G'
    | 'H'
    | 'I'
    | 'J'
    | 'K'
    | 'L'
    | 'M'
    | 'N'
    | 'O'
    | 'P'
    | 'Q';
  name: string;
  support: 'PACK_AVAILABLE' | 'EXTERNAL_INTEGRATION';
  productSlugs: string[];
  externalRequirements: AutomationRequirement[];
}

export interface AutomationProductDefinition {
  slug: string;
  name: string;
  description: string;
  category: AutomationCategory;
  version: string;
  availability: 'IMPLEMENTED' | 'EXTERNAL_REQUIRED';
  requiredFeatures: string[];
  externalRequirements: AutomationRequirement[];
  configSchema: { fields: AutomationConfigField[]; additionalProperties: false };
  steps: string[];
  trigger: string;
  keyword: boolean;
  templatePurpose?: 'MARKETING' | 'UTILITY';
  sequence?: Omit<WorkflowSequencePolicy, 'businessHours'> & {
    businessHours?: {
      timezone: string;
      startHour: number | `$${string}`;
      endHour: number | `$${string}`;
      days: number[];
    };
  };
  actions: Array<{
    id?: string;
    type: string;
    config: Record<string, unknown>;
    nextStepId?: string;
    fallbackStepId?: string;
  }>;
}

export interface AutomationCatalogProduct {
  id: string | null;
  slug: string;
  name: string;
  description: string;
  category: AutomationCategory;
  version: string;
  availability: AutomationProductDefinition['availability'];
  requiredFeatures: string[];
  externalRequirements: AutomationRequirement[];
  configSchema: AutomationProductDefinition['configSchema'];
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
  issues: Array<{ code: string; message: string; field?: string }>;
}

export interface AutomationAnalytics {
  total: number;
  completed: number;
  failed: number;
  running: number;
  paused: number;
  cancelled: number;
  lastExecutedAt: string | null;
}

export interface AutomationInstallation {
  id: string;
  pluginId: string;
  slug: string;
  name: string;
  version: string;
  flowId: string;
  isEnabled: boolean;
  state: 'DRAFT' | 'ACTIVE' | 'DISABLED' | 'UNINSTALLED';
  config: Record<string, unknown>;
  readiness: AutomationReadiness;
  analytics: AutomationAnalytics;
}

/** Stored inside TenantPlugin.config; runtime workers must check enabled/state before every action. */
export interface AutomationInstallationConfig extends Record<string, unknown> {
  kind: 'WHATSAPP_AUTOMATION';
  slug: string;
  version: string;
  flowId: string;
  state: AutomationInstallation['state'];
  settings: Record<string, unknown>;
}
