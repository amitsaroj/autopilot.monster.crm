import { BadRequestException } from '@nestjs/common';
import { sequencePolicy } from '../workflow/workflow-definition';
import { AutomationProductDefinition } from './whatsapp-automation.contracts';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const variable = /^[a-zA-Z][\w]*(?:\.[a-zA-Z][\w]*)*$/;
const supportedVariables =
  /^(phone|body|message|text|contactId|dealId|contact\.(id|phone|firstName|lastName|email)|deal\.(id|name|contact\.phone)|trigger\.data\.[\w.]+|now)$/;

export function validateAutomationConfig(
  product: AutomationProductDefinition,
  input: unknown,
): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BadRequestException('config must be an object');
  }
  const values = input as Record<string, unknown>;
  const errors: Array<{ field: string; message: string }> = [];
  const clean: Record<string, unknown> = {};
  const fields = product.configSchema.fields;
  for (const key of Object.keys(values)) {
    if (!fields.some((f) => f.key === key))
      errors.push({ field: key, message: 'Unknown configuration field' });
  }
  for (const field of fields) {
    const value = values[field.key];
    if (value === undefined || value === null || value === '') {
      if (field.required) errors.push({ field: field.key, message: 'This field is required' });
      continue;
    }
    if (field.type === 'integer') {
      if (
        typeof value !== 'number' ||
        !Number.isSafeInteger(value) ||
        value < (field.minimum ?? 0) ||
        value > (field.maximum ?? Number.MAX_SAFE_INTEGER)
      ) {
        errors.push({ field: field.key, message: 'Use an integer within the declared limits' });
      } else clean[field.key] = value;
      continue;
    }
    if (typeof value !== 'string' || !value.trim() || value.length > (field.maxLength ?? 4096)) {
      errors.push({
        field: field.key,
        message: `Use non-empty text up to ${field.maxLength ?? 4096} characters`,
      });
      continue;
    }
    const text = value.trim();
    if ((field.type === 'uuid' || field.type === 'template') && !uuid.test(text)) {
      errors.push({ field: field.key, message: 'Use a valid workspace resource UUID' });
    } else if (
      field.key === 'recipient' &&
      (!variable.test(text) || !supportedVariables.test(text))
    ) {
      errors.push({
        field: field.key,
        message: 'Use a supported workflow recipient variable path',
      });
    } else if (field.type === 'url' && !isPublicHttpsUrl(text)) {
      errors.push({
        field: field.key,
        message: 'Use an HTTPS URL without credentials or private hosts',
      });
    } else {
      const placeholders = [...text.matchAll(/\{\{([^}]+)\}\}/g)];
      if (placeholders.some((match) => !supportedVariables.test(match[1].trim()))) {
        errors.push({ field: field.key, message: 'Contains an unsupported workflow variable' });
      } else clean[field.key] = text;
    }
  }
  if (
    typeof clean.email === 'string' &&
    !clean.email.includes('{{') &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)
  ) {
    errors.push({ field: 'email', message: 'Use a valid email address or workflow variable' });
  }
  if (typeof clean.templateParameters === 'string') {
    try {
      const parsed: unknown = JSON.parse(clean.templateParameters);
      if (
        !Array.isArray(parsed) ||
        parsed.length > 100 ||
        parsed.some((v) => typeof v !== 'string' || !v.trim() || v.length > 4096)
      )
        throw new Error();
      // Keep the public config string stable; provisioning converts it into bodyParameters.
    } catch {
      errors.push({
        field: 'templateParameters',
        message: 'Use a JSON array of up to 100 non-empty text parameters',
      });
    }
  }
  if (typeof clean.businessTimezone === 'string') {
    try {
      new Intl.DateTimeFormat('en', { timeZone: clean.businessTimezone }).format();
    } catch {
      errors.push({ field: 'businessTimezone', message: 'Use a valid IANA business timezone' });
    }
  }
  if (
    typeof clean.businessStartHour === 'number' &&
    typeof clean.businessEndHour === 'number' &&
    clean.businessStartHour >= clean.businessEndHour
  ) {
    errors.push({
      field: 'businessEndHour',
      message: 'Closing hour must be later than opening hour',
    });
  }
  if (errors.length)
    throw new BadRequestException({
      code: 'AUTOMATION_CONFIG_INVALID',
      message: errors.map((error) => `${error.field}: ${error.message}`),
      fields: errors,
    });
  return clean;
}

export function isPublicHttpsUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      !/^(localhost|127\.|0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[|.*\.local$)/i.test(
        url.hostname,
      )
    );
  } catch {
    return false;
  }
}

export function buildAutomationDefinition(
  product: AutomationProductDefinition,
  settings: Record<string, unknown>,
  phoneNumberId: string,
  installation: { installationId: string; pluginId: string },
): Record<string, unknown> {
  const materialize = (value: unknown): unknown => {
    if (typeof value === 'string' && value.startsWith('$')) {
      const key = value.slice(1);
      if (key === 'recipient') return `{{${String(settings.recipient)}}}`;
      if (key === 'templateParameters')
        return JSON.parse(String(settings.templateParameters ?? '[]')) as unknown;
      return settings[key];
    }
    if (Array.isArray(value)) return value.map(materialize);
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [key, materialize(entry)]),
      );
    return value;
  };
  return {
    triggerEvent: product.trigger,
    phoneNumberId,
    ...(product.keyword
      ? {
          keyword: settings.keyword,
          trigger: { type: 'WHATSAPP_KEYWORD', keyword: settings.keyword },
        }
      : {}),
    automation: { ...installation, slug: product.slug, version: product.version },
    ...(product.sequence ? { sequence: sequencePolicy(materialize(product.sequence)) } : {}),
    steps: product.actions.map((action, index) => ({
      id: action.id ?? `${product.slug}-${index + 1}`,
      type: action.type,
      ...(action.nextStepId ? { nextStepId: action.nextStepId } : {}),
      ...(action.fallbackStepId ? { fallbackStepId: action.fallbackStepId } : {}),
      config: {
        ...(materialize(action.config) as Record<string, unknown>),
        phoneNumberId,
        wabaId: phoneNumberId,
      },
    })),
  };
}
