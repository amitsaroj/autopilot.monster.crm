import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { extractWhatsappFlowKeyword } from './whatsapp-flow-matcher.util';

export interface WorkflowStep {
  id: string;
  type: string;
  name?: string;
  config?: Record<string, unknown>;
  nextStepId?: string;
  trueStepId?: string;
  falseStepId?: string;
  fallbackStepId?: string;
}

export interface WorkflowPlan {
  schemaVersion: number;
  startStepId: string | null;
  steps: WorkflowStep[];
}

export interface WorkflowCondition {
  field: string;
  operator?: string;
  value?: unknown;
}

export interface WorkflowConditionGroup {
  logicalOperator: 'AND' | 'OR';
  conditions: WorkflowCondition[];
}

export interface WorkflowConditionConfig extends Record<string, unknown> {
  field?: string;
  operator?: string;
  value?: unknown;
  logicalOperator?: 'AND' | 'OR';
  conditions?: WorkflowCondition[];
}

export interface WorkflowSequencePolicy {
  stopOnReply?: boolean;
  stopOnConversion?: boolean;
  exitCondition?: WorkflowConditionConfig;
  businessHours?: {
    timezone: string;
    startHour: number;
    endHour: number;
    days: number[];
    useRecipientTimezone?: boolean;
  };
}

export function sequencePolicy(value: unknown): WorkflowSequencePolicy {
  if (value === undefined) return {};
  const policy = record(value, 'sequence policy');
  if (
    Object.keys(policy).some(
      (key) => !['stopOnReply', 'stopOnConversion', 'exitCondition', 'businessHours'].includes(key),
    )
  ) {
    throw new BadRequestException('Unknown sequence policy option');
  }
  for (const key of ['stopOnReply', 'stopOnConversion']) {
    if (policy[key] !== undefined && typeof policy[key] !== 'boolean')
      throw new BadRequestException(`${key} must be boolean`);
  }
  if (policy.exitCondition !== undefined)
    validateStepConfig({
      id: 'exit',
      type: 'CONDITION',
      config: record(policy.exitCondition, 'exit condition'),
    });
  if (policy.businessHours !== undefined) {
    const hours = record(policy.businessHours, 'business hours');
    if (
      Object.keys(hours).some(
        (key) =>
          !['timezone', 'startHour', 'endHour', 'days', 'useRecipientTimezone'].includes(key),
      )
    )
      throw new BadRequestException('Unknown business-hours option');
    if (typeof hours.timezone !== 'string')
      throw new BadRequestException('A business timezone is required');
    if (hours.useRecipientTimezone !== undefined && typeof hours.useRecipientTimezone !== 'boolean')
      throw new BadRequestException('useRecipientTimezone must be boolean');
    try {
      new Intl.DateTimeFormat('en', { timeZone: hours.timezone }).format();
    } catch {
      throw new BadRequestException('Use a valid IANA business timezone');
    }
    if (
      !Number.isInteger(hours.startHour) ||
      !Number.isInteger(hours.endHour) ||
      Number(hours.startHour) < 0 ||
      Number(hours.endHour) > 24 ||
      Number(hours.startHour) >= Number(hours.endHour) ||
      !Array.isArray(hours.days) ||
      !hours.days.length ||
      hours.days.length > 7 ||
      hours.days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
    ) {
      throw new BadRequestException(
        'Business hours need start/end hours within 0–24 and weekdays 0 (Sunday) through 6',
      );
    }
  }
  return policy as WorkflowSequencePolicy;
}

export const CONTACT_MUTABLE_FIELDS = new Set([
  'firstName',
  'lastName',
  'email',
  'phone',
  'mobile',
  'jobTitle',
  'department',
  'status',
  'leadSource',
  'tags',
  'customFields',
  'notes',
  'linkedinUrl',
  'twitterHandle',
]);
export const DEAL_MUTABLE_FIELDS = new Set([
  'name',
  'value',
  'currency',
  'probability',
  'expectedCloseDate',
  'lostReason',
  'tags',
  'customFields',
]);
export const CONDITION_OPERATORS = new Set([
  'gt',
  'greater_than',
  'lt',
  'less_than',
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'is_empty',
  'is_not_empty',
  'in',
  'not_in',
]);
export const ACTION_TYPES = [
  'CREATE_CONTACT',
  'CREATE_LEAD',
  'UPDATE_CONTACT',
  'CREATE_DEAL',
  'UPDATE_DEAL',
  'MOVE_PIPELINE_STAGE',
  'ASSIGN_OWNER',
  'ADD_TAG',
  'CREATE_TASK',
  'CREATE_NOTE',
  'SEND_EMAIL',
  'SEND_WHATSAPP',
  'SEND_TEMPLATE',
  'LOOKUP_SHOPIFY_ORDER',
  'ASSIGN_AGENT',
  'RESOLVE',
  'NOTIFY_TEAM',
  'CALL_WEBHOOK',
  'INITIATE_CALL',
  'DELAY',
  'WAIT_FOR_REPLY',
  'WAIT_UNTIL',
  'CONDITION',
  'LOG',
  'AI_CHAT',
  'END',
] as const;
const TRIGGERS = new Set([
  'TRIGGER',
  'TRIGGER_KEYWORD',
  'TRIGGER_EVENT',
  'TRIGGER_MANUAL',
  'TRIGGER_CONTACT_CREATED',
  'TRIGGER_CONTACT_UPDATED',
  'TRIGGER_DEAL_CREATED',
  'TRIGGER_DEAL_STAGE_CHANGED',
  'TRIGGER_LEAD_CREATED',
  'TRIGGER_WHATSAPP_MESSAGE_RECEIVED',
  'TRIGGER_CALL_COMPLETED',
]);

export function record(value: unknown, label = 'object'): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

export function normalizeStepType(type: string): string {
  const aliases: Record<string, string> = {
    SEND_MESSAGE: 'SEND_WHATSAPP',
    CONDITION_BRANCH: 'CONDITION',
    WAIT_DELAY: 'DELAY',
    ADD_NOTE: 'CREATE_NOTE',
    MAKE_CALL: 'INITIATE_CALL',
    AI_RESPONSE: 'AI_CHAT',
    AWAIT_RESPONSE: 'WAIT_FOR_REPLY',
  };
  const upper = type.toUpperCase();
  return aliases[upper] ?? upper;
}

function nonempty(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
function requireOne(config: Record<string, unknown>, keys: string[], label: string): void {
  if (!keys.some((key) => nonempty(config[key]))) {
    throw new BadRequestException(`${label} requires ${keys.join(' or ')}`);
  }
}

function validateCondition(config: Record<string, unknown>, allowTimeout = false): void {
  if (config.conditions !== undefined) {
    const allowed = allowTimeout
      ? ['logicalOperator', 'conditions', 'timeoutMinutes']
      : ['logicalOperator', 'conditions'];
    if (Object.keys(config).some((key) => !allowed.includes(key)))
      throw new BadRequestException('Unknown condition group option');
    if ('field' in config || 'operator' in config || 'value' in config)
      throw new BadRequestException('Condition groups cannot mix grouped and single conditions');
    if (config.logicalOperator !== 'AND' && config.logicalOperator !== 'OR')
      throw new BadRequestException('Condition group requires AND or OR');
    if (
      !Array.isArray(config.conditions) ||
      config.conditions.length < 1 ||
      config.conditions.length > 10
    )
      throw new BadRequestException('Condition groups require 1–10 conditions');
    for (const value of config.conditions) {
      const condition = record(value, 'condition');
      if (Object.keys(condition).some((key) => !['field', 'operator', 'value'].includes(key)))
        throw new BadRequestException('Unknown condition option');
      if (!nonempty(condition.field) || String(condition.field).length > 200)
        throw new BadRequestException('Condition field must be 1–200 characters');
      const operator = String(condition.operator ?? 'equals');
      if (!CONDITION_OPERATORS.has(operator))
        throw new BadRequestException('Unsupported condition operator');
      if (!['is_empty', 'is_not_empty'].includes(operator) && condition.value === undefined)
        throw new BadRequestException(`${operator} requires a condition value`);
    }
    return;
  }
  if (!nonempty(config.field) || String(config.field).length > 200)
    throw new BadRequestException('Condition field must be 1–200 characters');
  const operator = String(config.operator ?? 'equals');
  if (!CONDITION_OPERATORS.has(operator))
    throw new BadRequestException('Unsupported condition operator');
  if (
    allowTimeout &&
    config.timeoutMinutes !== undefined &&
    (!Number.isFinite(Number(config.timeoutMinutes)) ||
      Number(config.timeoutMinutes) <= 0 ||
      Number(config.timeoutMinutes) > 43200)
  )
    throw new BadRequestException('Wait timeout must be greater than zero and at most 30 days');
}

export function validateStepConfig(step: WorkflowStep): void {
  const c = step.config ?? {};
  const required: Record<string, string[]> = {
    CREATE_CONTACT: ['email'],
    CREATE_LEAD: ['firstName'],
    ADD_TAG: ['tag', 'tagName'],
    SEND_EMAIL: ['to', 'recipient'],
    SEND_WHATSAPP: ['text', 'message', 'body'],
    SEND_TEMPLATE: ['templateId', 'templateName'],
    LOOKUP_SHOPIFY_ORDER: ['orderName'],
    ASSIGN_OWNER: ['ownerId', 'userId', 'assigneeId'],
    ASSIGN_AGENT: ['assigneeId', 'ownerId', 'userId'],
    MOVE_PIPELINE_STAGE: ['stageId', 'toStageId'],
    CALL_WEBHOOK: ['url'],
    AI_CHAT: ['agentId'],
  };
  if (required[step.type]) requireOne(c, required[step.type], step.type);
  if (step.type === 'UPDATE_CONTACT' || step.type === 'UPDATE_DEAL') {
    const fields = step.type === 'UPDATE_CONTACT' ? CONTACT_MUTABLE_FIELDS : DEAL_MUTABLE_FIELDS;
    if (c.field !== undefined && (typeof c.field !== 'string' || !fields.has(c.field))) {
      throw new BadRequestException(`${step.type} field is not mutable`);
    }
    if (!c.field && !Object.keys(c).some((key) => fields.has(key))) {
      throw new BadRequestException(`${step.type} requires a mutable field`);
    }
    // Protected changes must use their dedicated tenant-checked action.
    for (const key of [
      'tenantId',
      'id',
      'doNotContact',
      'emailOptOut',
      'whatsappOptIn',
      'ownerId',
      'stageId',
      'status',
    ]) {
      if ((key !== 'status' || step.type === 'UPDATE_DEAL') && key in c) {
        throw new BadRequestException(`${step.type} cannot mutate ${key}`);
      }
    }
  }
  if (['CONDITION', 'WAIT_UNTIL'].includes(step.type))
    validateCondition(c, step.type === 'WAIT_UNTIL');
  if (
    ['WAIT_FOR_REPLY', 'WAIT_UNTIL'].includes(step.type) &&
    (!Number.isFinite(Number(c.timeoutMinutes ?? 1440)) ||
      Number(c.timeoutMinutes ?? 1440) <= 0 ||
      Number(c.timeoutMinutes ?? 1440) > 43200)
  ) {
    throw new BadRequestException('Wait timeout must be greater than zero and at most 30 days');
  }
  if (step.type === 'DELAY') {
    const delay = resolveDelayMs(c);
    if (!Number.isFinite(delay) || delay < 0 || delay > 30 * 86400000) {
      throw new BadRequestException('Delay must be finite, nonnegative, and at most 30 days');
    }
  }
  if (step.type === 'CALL_WEBHOOK') {
    if (
      !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(String(c.method ?? 'POST').toUpperCase())
    ) {
      throw new BadRequestException('Unsupported webhook method');
    }
    const seconds = Number(c.timeoutSeconds ?? 30);
    if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 30) {
      throw new BadRequestException('Webhook timeout must be 1–30 seconds');
    }
  }
  if (step.type === 'AI_CHAT') {
    if (
      c.tools !== undefined &&
      (!Array.isArray(c.tools) ||
        c.tools.length > 3 ||
        c.tools.some((tool) => !['retrieve_kb', 'get_contact', 'get_deal'].includes(String(tool))))
    ) {
      throw new BadRequestException('AI tools are limited to retrieve_kb, get_contact, get_deal');
    }
    if (
      c.knowledgeBaseIds !== undefined &&
      (!Array.isArray(c.knowledgeBaseIds) ||
        c.knowledgeBaseIds.length > 5 ||
        c.knowledgeBaseIds.some((id) => !nonempty(id)))
    )
      throw new BadRequestException('Invalid AI knowledgeBaseIds');
    if (
      c.maxOutputChars !== undefined &&
      (!Number.isInteger(c.maxOutputChars) ||
        Number(c.maxOutputChars) < 1 ||
        Number(c.maxOutputChars) > 8000)
    ) {
      throw new BadRequestException('AI maxOutputChars must be 1–8000');
    }
  }
  for (const key of [
    'delayHours',
    'delayDays',
    'delayMinutes',
    'delaySeconds',
    'seconds',
    'timeoutMinutes',
    'dueInHours',
  ]) {
    if (c[key] !== undefined && (!Number.isFinite(Number(c[key])) || Number(c[key]) < 0)) {
      throw new BadRequestException(`${key} must be finite and nonnegative`);
    }
  }
  if (c.headers !== undefined) {
    const headers = record(c.headers, 'headers');
    if (
      Object.entries(headers).some(
        ([key, value]) =>
          typeof value !== 'string' ||
          /[\r\n]/.test(key + value) ||
          ['host', 'connection', 'content-length', 'transfer-encoding'].includes(key.toLowerCase()),
      )
    ) {
      throw new BadRequestException('Invalid webhook headers');
    }
  }
}

export function resolveDelayMs(config: Record<string, unknown>): number {
  return (
    (Number(config.delayDays ?? 0) * 86400 +
      Number(config.delayHours ?? 0) * 3600 +
      Number(config.timeoutMinutes ?? config.delayMinutes ?? 0) * 60 +
      Number(config.delaySeconds ?? config.seconds ?? 0)) *
    1000
  );
}

export function compileWorkflow(definition: Record<string, unknown>): WorkflowPlan {
  record(definition, 'definition');
  sequencePolicy(definition.sequence);
  if (definition.triggerEvent === 'WHATSAPP_KEYWORD' && !extractWhatsappFlowKeyword(definition)) {
    throw new BadRequestException('WhatsApp keyword trigger requires a non-empty keyword');
  }
  let steps: WorkflowStep[];
  let start: string | null;
  let triggerId: string | undefined;
  const links = new Map<string, Map<string, string>>();
  if (Array.isArray(definition.steps)) {
    steps = definition.steps.map((value) => {
      const s = record(value, 'step');
      const id = String(s.id ?? '');
      const type = normalizeStepType(String(s.type ?? ''));
      return {
        id,
        type,
        name: typeof s.name === 'string' ? s.name : undefined,
        config: s.config === undefined ? {} : record(s.config, 'step config'),
        nextStepId: s.nextStepId as string | undefined,
        trueStepId: s.trueStepId as string | undefined,
        falseStepId: s.falseStepId as string | undefined,
        fallbackStepId: s.fallbackStepId as string | undefined,
      };
    });
    steps.forEach((step, i) => {
      if (!step.nextStepId && step.type !== 'END') step.nextStepId = steps[i + 1]?.id;
      if (step.type === 'CONDITION' && !step.trueStepId) step.trueStepId = step.nextStepId;
    });
    start = steps[0]?.id ?? null;
  } else {
    if (!Array.isArray(definition.nodes))
      throw new BadRequestException('Definition requires steps or nodes');
    const nodes = definition.nodes.map((value) => record(value, 'node'));
    const triggers = nodes.filter((n) => {
      const d = n.data === undefined ? {} : record(n.data, 'node data');
      return (
        d.isTrigger === true ||
        n.type === 'input' ||
        TRIGGERS.has(String(d.stepType ?? d.nodeType ?? d.type ?? '').toUpperCase())
      );
    });
    if (triggers.length > 1) throw new BadRequestException('Only one trigger node is supported');
    triggerId = triggers[0] ? String(triggers[0].id) : undefined;
    const allIds = nodes.map((n) => String(n.id ?? ''));
    if (allIds.some((id) => !id) || new Set(allIds).size !== allIds.length)
      throw new BadRequestException('Node IDs must be unique and nonempty');
    steps = nodes
      .filter((n) => String(n.id) !== triggerId)
      .map((n) => {
        const d = n.data === undefined ? {} : record(n.data, 'node data');
        return {
          id: String(n.id),
          type: normalizeStepType(String(d.stepType ?? d.nodeType ?? d.type ?? 'LOG')),
          name: typeof d.label === 'string' ? d.label : undefined,
          config: d.config === undefined ? d : record(d.config, 'node config'),
        };
      });
    if (definition.edges !== undefined && !Array.isArray(definition.edges))
      throw new BadRequestException('edges must be an array');
    for (const value of (definition.edges ?? []) as unknown[]) {
      const edge = record(value, 'edge');
      const source = String(edge.source ?? '');
      const target = String(edge.target ?? '');
      if (!allIds.includes(source) || !allIds.includes(target) || target === triggerId)
        throw new BadRequestException('Invalid graph edge');
      const port = String(edge.sourceHandle ?? edge.port ?? 'next').toLowerCase();
      if (!['next', 'true', 'false', 'fallback'].includes(port))
        throw new BadRequestException(`Unsupported edge port: ${port}`);
      const ports = links.get(source) ?? new Map<string, string>();
      if (ports.has(port)) throw new BadRequestException(`Multiple edges for ${source}:${port}`);
      ports.set(port, target);
      links.set(source, ports);
    }
    if (triggerId && [...(links.get(triggerId)?.keys() ?? [])].some((port) => port !== 'next'))
      throw new BadRequestException('Trigger requires a next edge');
    start = triggerId ? (links.get(triggerId)?.get('next') ?? null) : (steps[0]?.id ?? null);
    for (const step of steps) {
      const ports = links.get(step.id);
      step.nextStepId = ports?.get('next');
      step.trueStepId = ports?.get('true');
      step.falseStepId = ports?.get('false');
      step.fallbackStepId = ports?.get('fallback');
      if (step.type === 'CONDITION') {
        if (step.nextStepId || !step.trueStepId || !step.falseStepId)
          throw new BadRequestException(
            'Condition graph edges require explicit true and false ports',
          );
      } else if (
        step.trueStepId ||
        step.falseStepId ||
        (step.fallbackStepId && !['AI_CHAT', 'WAIT_FOR_REPLY', 'WAIT_UNTIL'].includes(step.type))
      ) {
        throw new BadRequestException(`Invalid branch ports for ${step.type}`);
      }
    }
  }
  if (steps.length > 200 || !steps.length)
    throw new BadRequestException('Workflow requires 1–200 action nodes');
  const ids = new Set(steps.map((s) => s.id));
  if (ids.size !== steps.length) throw new BadRequestException('Step IDs must be unique');
  for (const step of steps) {
    if (!/^[A-Za-z0-9_.-]{1,100}$/.test(step.id)) throw new BadRequestException('Invalid step ID');
    if (!(ACTION_TYPES as readonly string[]).includes(step.type))
      throw new BadRequestException(`Unsupported action type: ${step.type}`);
    validateStepConfig(step);
    for (const id of [step.nextStepId, step.trueStepId, step.falseStepId, step.fallbackStepId]) {
      if (id !== undefined && (typeof id !== 'string' || !ids.has(id)))
        throw new BadRequestException(`Unknown next step: ${String(id)}`);
    }
    if (
      step.type === 'END' &&
      [step.nextStepId, step.trueStepId, step.falseStepId, step.fallbackStepId].some(Boolean)
    )
      throw new BadRequestException('END cannot have outgoing edges');
  }
  const seen = new Set<string>();
  const visiting = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) throw new BadRequestException('Workflow cycles are not supported');
    if (seen.has(id)) return;
    visiting.add(id);
    const step = steps.find((s) => s.id === id)!;
    for (const next of [step.nextStepId, step.trueStepId, step.falseStepId, step.fallbackStepId])
      if (next) visit(next);
    visiting.delete(id);
    seen.add(id);
  };
  if (start) visit(start);
  if (seen.size !== steps.length)
    throw new BadRequestException('Workflow contains unreachable nodes');
  return { schemaVersion: 1, startStepId: start, steps };
}

export function definitionHash(definition: Record<string, unknown>): string {
  const canonical = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, canonical(v)]),
      );
    return value;
  };
  return createHash('sha256')
    .update(JSON.stringify(canonical(definition)))
    .digest('hex');
}
