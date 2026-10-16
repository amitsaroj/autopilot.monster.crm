import type { WhatsappTemplate } from '@/services/whatsapp-template.service';

export function templateComponents(template?: WhatsappTemplate): Record<string, unknown>[] {
  const items = template?.components?.components;
  return Array.isArray(items)
    ? items.filter(
        (item): item is Record<string, unknown> =>
          typeof item === 'object' && item !== null && !Array.isArray(item),
      )
    : [];
}
export function templateBody(template?: WhatsappTemplate) {
  return String(templateComponents(template).find((c) => c.type === 'BODY')?.text ?? '');
}
export function templateSendIssue(template?: WhatsappTemplate): string | undefined {
  if (!template) return;
  const components = templateComponents(template);
  if (
    components.filter((component) => component.type === 'BODY').length !== 1 ||
    new Set(components.map((component) => component.type)).size !== components.length
  )
    return 'Sending unavailable: invalid or duplicate template components.';
  const body = templateBody(template);
  if (/\{\{|\}\}/.test(body.replace(/\{\{\d+\}\}/g, '')))
    return 'Sending unavailable: this composer supports positional body variables only.';
  for (const component of components) {
    if (
      component.type === 'HEADER' &&
      (component.format !== 'TEXT' || String(component.text).includes('{{'))
    )
      return 'Sending unavailable: this template needs header data that this composer cannot supply.';
    if (
      component.type === 'BUTTONS' &&
      Array.isArray(component.buttons) &&
      component.buttons.some(
        (button) =>
          !button ||
          typeof button !== 'object' ||
          !['URL', 'PHONE_NUMBER', 'QUICK_REPLY'].includes(String(button.type)) ||
          (button.type === 'URL' && String(button.url).includes('{{')),
      )
    )
      return 'Sending unavailable: this template needs button data that this composer cannot supply.';
    if (!['HEADER', 'BODY', 'FOOTER', 'BUTTONS'].includes(String(component.type)))
      return 'Sending unavailable: unsupported template component.';
  }
}
export function templateParameterKeys(template?: WhatsappTemplate): string[] {
  const issue = templateSendIssue(template);
  // shortcut: legacy composers accept body keys only; remove this guard when they collect header/button data.
  if (issue) return [issue];
  return [...new Set(templateBody(template).match(/\{\{\d+\}\}/g) ?? [])].sort(
    (a, b) => Number(a.replace(/\D/g, '')) - Number(b.replace(/\D/g, '')),
  );
}
export function templateSendComponents(keys: string[], values: Record<string, string>) {
  if (keys.some((key, index) => key !== `{{${index + 1}}}`))
    throw new Error(
      'Sending unavailable: required header/button data is missing or body variables are unsupported.',
    );
  if (keys.some((key) => !values[key]?.trim()))
    throw new Error('Provide every template body parameter.');
  return keys.length
    ? [{ type: 'body', parameters: keys.map((key) => ({ type: 'text', text: values[key] })) }]
    : [];
}
