import { WorkflowExecutionContext } from './workflow-executor.service';

function readPath(root: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = root;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function buildWorkflowVariableRoot(context: WorkflowExecutionContext): Record<string, unknown> {
  const payload = context.payload;
  const contact =
    (payload.contact as Record<string, unknown> | undefined) ??
    (typeof payload.contactId === 'string' ? { id: payload.contactId } : undefined);
  const deal =
    (payload.deal as Record<string, unknown> | undefined) ??
    (typeof payload.dealId === 'string' ? { id: payload.dealId } : undefined);

  return {
    ...payload,
    contact,
    deal,
    trigger: { data: payload },
    now: new Date().toISOString(),
  };
}

export function resolveWorkflowTemplate(
  value: string,
  context: WorkflowExecutionContext,
): string {
  const root = buildWorkflowVariableRoot(context);
  return value.replace(/\{\{([^}]+)\}\}/g, (_match, rawPath: string) => {
    const resolved = readPath(root, rawPath.trim());
    if (resolved === undefined || resolved === null) {
      return '';
    }
    return String(resolved);
  });
}

export function resolveWorkflowConfigValue(
  value: unknown,
  context: WorkflowExecutionContext,
): unknown {
  if (typeof value === 'string') {
    return resolveWorkflowTemplate(value, context);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => resolveWorkflowConfigValue(entry, context));
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        resolveWorkflowConfigValue(entry, context),
      ]),
    );
  }
  return value;
}

export function resolveWorkflowConfig(
  config: Record<string, unknown>,
  context: WorkflowExecutionContext,
): Record<string, unknown> {
  return resolveWorkflowConfigValue(config, context) as Record<string, unknown>;
}
