import { Injectable, Logger } from '@nestjs/common';

import { WorkflowActionExecutorService } from './workflow-action-executor.service';

export interface WorkflowStep {
  id: string;
  type: string;
  name?: string;
  config?: Record<string, unknown>;
  nextStepId?: string;
}

export interface WorkflowExecutionContext {
  tenantId: string;
  eventName: string;
  payload: Record<string, unknown>;
}

export type WorkflowStepStatus = 'COMPLETED' | 'SCHEDULED' | 'SKIPPED';

export interface WorkflowStepResult {
  stepId: string;
  type: string;
  status: WorkflowStepStatus;
  passed?: boolean;
  delayedMs?: number;
  delayMs?: number;
  reason?: string;
  contactId?: string;
  dealId?: string;
  taskId?: string;
  noteId?: string;
  notificationId?: string;
  messageId?: string;
  callId?: string;
  to?: string;
  subject?: string;
  httpStatus?: number;
  logged?: boolean;
  stageId?: string;
  ownerId?: string;
  tag?: string;
}

@Injectable()
export class WorkflowExecutorService {
  private readonly logger = new Logger(WorkflowExecutorService.name);

  constructor(private readonly actionExecutor: WorkflowActionExecutorService) {}

  extractSteps(definition: Record<string, unknown>): WorkflowStep[] {
    if (Array.isArray(definition.steps)) {
      return (definition.steps as WorkflowStep[]).map((step) => ({
        ...step,
        type: this.normalizeStepType(step.type),
      }));
    }

    const nodes = definition.nodes as
      | Array<{ id: string; data?: Record<string, unknown> }>
      | undefined;
    const edges = definition.edges as Array<{ source: string; target: string }> | undefined;
    if (!nodes?.length) {
      return [];
    }

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const adjacency = new Map<string, string>();
    for (const edge of edges ?? []) {
      adjacency.set(edge.source, edge.target);
    }

    const startNode =
      nodes.find((n) => n.data?.isTrigger === true) ??
      nodes.find((n) => {
        const raw = String(n.data?.stepType ?? n.data?.nodeType ?? n.data?.type ?? '');
        return raw.toUpperCase().includes('TRIGGER');
      }) ??
      nodes[0];

    const steps: WorkflowStep[] = [];
    const visited = new Set<string>();
    let currentId: string | undefined = startNode.id;

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = nodeMap.get(currentId);
      if (!node) break;

      const stepType = String(
        node.data?.stepType ?? node.data?.nodeType ?? node.data?.type ?? 'LOG',
      );
      if (!stepType.toUpperCase().includes('TRIGGER')) {
        const configFromNode =
          node.data?.config && typeof node.data.config === 'object'
            ? (node.data.config as Record<string, unknown>)
            : {};
        steps.push({
          id: node.id,
          type: this.normalizeStepType(stepType),
          name: (node.data?.label as string) ?? stepType,
          config: Object.keys(configFromNode).length > 0 ? configFromNode : (node.data ?? {}),
          nextStepId: adjacency.get(currentId),
        });
      }
      currentId = adjacency.get(currentId);
    }

    return steps;
  }

  normalizeStepType(type: string): string {
    const upper = type.toUpperCase();
    switch (upper) {
      case 'SEND_MESSAGE':
        return 'SEND_WHATSAPP';
      case 'AWAIT_RESPONSE':
        return 'WAIT_DELAY';
      case 'CONDITION_BRANCH':
        return 'CONDITION';
      default:
        return upper;
    }
  }

  evaluateCondition(config: Record<string, unknown>, context: WorkflowExecutionContext): boolean {
    const field = config.field as string | undefined;
    if (!field) return true;

    const actual = this.resolveField(field, context.payload);
    const operator = (config.operator as string) ?? 'equals';
    const expected = config.value;

    switch (operator) {
      case 'gt':
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'lt':
      case 'less_than':
        return Number(actual) < Number(expected);
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'contains':
        return String(actual).includes(String(expected));
      case 'not_contains':
        return !String(actual).includes(String(expected));
      case 'starts_with':
        return String(actual).startsWith(String(expected));
      case 'ends_with':
        return String(actual).endsWith(String(expected));
      case 'is_empty':
        return actual === undefined || actual === null || actual === '';
      case 'is_not_empty':
        return actual !== undefined && actual !== null && actual !== '';
      case 'in': {
        const values = Array.isArray(expected) ? expected : [expected];
        return values.some((entry) => entry === actual);
      }
      case 'not_in': {
        const values = Array.isArray(expected) ? expected : [expected];
        return !values.some((entry) => entry === actual);
      }
      default: {
        const unknownOperator: never = operator as never;
        this.logger.warn(`Unknown condition operator: ${String(unknownOperator)}`);
        return true;
      }
    }
  }

  async executeStep(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
  ): Promise<WorkflowStepResult> {
    const normalizedType = this.normalizeStepType(step.type);
    const normalizedStep: WorkflowStep = { ...step, type: normalizedType };
    this.logger.log(
      `Executing step ${normalizedStep.id} (${normalizedType}) for tenant ${context.tenantId}`,
    );

    switch (normalizedType) {
      case 'CONDITION': {
        const passed = this.evaluateCondition(normalizedStep.config ?? {}, context);
        return { stepId: normalizedStep.id, type: normalizedType, status: 'COMPLETED', passed };
      }
      case 'LOG': {
        this.logger.log(
          `Workflow log [${context.eventName}]: ${String(normalizedStep.config?.message ?? normalizedStep.name ?? normalizedType)}`,
        );
        return {
          stepId: normalizedStep.id,
          type: normalizedType,
          status: 'COMPLETED',
          logged: true,
        };
      }
      default:
        return this.actionExecutor.executeAction(normalizedStep, context);
    }
  }

  private resolveField(path: string, payload: Record<string, unknown>): unknown {
    const parts = path.split('.');
    let current: unknown = payload;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }
}
