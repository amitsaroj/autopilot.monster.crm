import type { CustomField } from '../../database/entities/custom-field.entity';

const isEmpty = (v: unknown) =>
  v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

function typeError(def: CustomField, value: unknown): string | null {
  const options = def.options ?? [];
  switch (def.type) {
    case 'NUMBER':
      return typeof value === 'number' && Number.isFinite(value) ? null : 'must be a number';
    case 'BOOLEAN':
      return typeof value === 'boolean' ? null : 'must be a boolean';
    case 'DATE':
      return typeof value === 'string' && !Number.isNaN(Date.parse(value))
        ? null
        : 'must be an ISO date string';
    case 'SELECT':
      return typeof value === 'string' && (!options.length || options.includes(value))
        ? null
        : `must be one of: ${options.join(', ')}`;
    case 'MULTI_SELECT':
      return Array.isArray(value) &&
        value.every((v) => typeof v === 'string' && (!options.length || options.includes(v)))
        ? null
        : `must be a list of: ${options.join(', ')}`;
    default:
      return typeof value === 'string' ? null : 'must be text';
  }
}

/**
 * Checks a custom-field payload against the tenant's definitions (matched by `name`).
 * Returns human-readable errors; empty array means valid. Unknown keys are rejected.
 */
export function validateCustomFieldValues(
  defs: CustomField[],
  values: Record<string, unknown>,
): string[] {
  const byName = new Map(defs.map((d) => [d.name, d]));
  const errors: string[] = [];
  for (const [key, value] of Object.entries(values)) {
    const def = byName.get(key);
    if (!def) {
      errors.push(`customFields.${key} is not a defined custom field`);
      continue;
    }
    if (isEmpty(value)) continue;
    const err = typeError(def, value);
    if (err) errors.push(`customFields.${key} ${err}`);
  }
  for (const def of defs) {
    if (def.isRequired && isEmpty(values[def.name])) {
      errors.push(`customFields.${def.name} is required`);
    }
  }
  return errors;
}
