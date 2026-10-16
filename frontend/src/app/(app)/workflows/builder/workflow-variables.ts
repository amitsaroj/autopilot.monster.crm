/** The workflow runtime resolves these roots; payload fields and action outputs remain trigger-specific. */
export const WORKFLOW_VARIABLES = [
  { path: 'contact.id', description: 'Contact ID (when the trigger includes a contact)' },
  { path: 'contact.firstName', description: 'Contact first name' },
  { path: 'contact.lastName', description: 'Contact last name' },
  { path: 'contact.email', description: 'Contact email' },
  { path: 'contact.phone', description: 'Contact phone' },
  { path: 'deal.id', description: 'Deal ID (when the trigger includes a deal)' },
  { path: 'deal.name', description: 'Deal name (when provided by the trigger)' },
  {
    path: 'attribution.ctwaClid',
    description: 'Optional Meta click ID on an attributed inbound WhatsApp message',
  },
  {
    path: 'attribution.sourceId',
    description: 'Optional Meta ad/post ID on an attributed inbound WhatsApp message',
  },
  { path: 'now', description: 'Current execution timestamp' },
] as const;

export const WORKFLOW_VARIABLE_HINTS = [
  '{{trigger.data.<field>}} — replace <field> with a field supplied by the selected trigger',
  '{{steps.<stepId>.<output>}} — replace both parts with an earlier step ID and its output name',
] as const;

/** Check placeholder syntax only; actual availability depends on the execution payload. */
export function validateWorkflowVariables(value: unknown): string | null {
  if (typeof value === 'string') {
    if (value.includes('{{{') || value.includes('}}}'))
      return 'A workflow variable has extra braces. Use the form {{contact.firstName}}.';
    const placeholders = [...value.matchAll(/\{\{([^{}]*)\}\}/g)];
    for (const [, path] of placeholders) {
      const parts = path.trim().split('.');
      if (
        !parts.every((part) => /^[\w$-]+$/.test(part)) ||
        parts.some((part) => ['__proto__', 'prototype', 'constructor'].includes(part))
      ) {
        return `Invalid workflow variable {{${path}}}. Use a dot-separated path such as {{contact.firstName}}.`;
      }
    }
    const remainder = value.replace(/\{\{([^{}]*)\}\}/g, '');
    if (remainder.includes('{{') || remainder.includes('}}'))
      return 'A workflow variable has unmatched braces. Use the form {{contact.firstName}}.';
    return null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const error = validateWorkflowVariables(entry);
      if (error) return error;
    }
  } else if (value !== null && typeof value === 'object') {
    for (const entry of Object.values(value)) {
      const error = validateWorkflowVariables(entry);
      if (error) return error;
    }
  }
  return null;
}
