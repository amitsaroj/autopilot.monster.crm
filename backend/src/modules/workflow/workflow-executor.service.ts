import { Injectable, Logger } from '@nestjs/common';

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

@Injectable()
export class WorkflowExecutorService {
  private readonly logger = new Logger(WorkflowExecutorService.name);

  extractSteps(definition: Record<string, unknown>): WorkflowStep[] {
    if (Array.isArray(definition.steps)) {
      return definition.steps as WorkflowStep[];
    }

    const nodes = definition.nodes as Array<{ id: string; data?: Record<string, unknown> }> | undefined;
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
      nodes.find((n) => (n.data?.type as string | undefined)?.includes('TRIGGER')) ??
      nodes[0];

    const steps: WorkflowStep[] = [];
    const visited = new Set<string>();
    let currentId: string | undefined = startNode.id;

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = nodeMap.get(currentId);
      if (!node) break;

      const stepType = (node.data?.stepType ?? node.data?.type ?? 'LOG') as string;
      if (!stepType.includes('TRIGGER')) {
        steps.push({
          id: node.id,
          type: stepType.toUpperCase(),
          name: (node.data?.label as string) ?? stepType,
          config: (node.data?.config as Record<string, unknown>) ?? node.data ?? {},
          nextStepId: adjacency.get(currentId),
        });
      }
      currentId = adjacency.get(currentId);
    }

    return steps;
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
      case 'is_empty':
        return actual === undefined || actual === null || actual === '';
      case 'is_not_empty':
        return actual !== undefined && actual !== null && actual !== '';
      default:
        this.logger.warn(`Unknown condition operator: ${operator}`);
        return true;
    }
  }

  async executeStep(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
  ): Promise<Record<string, unknown>> {
    this.logger.log(`Executing step ${step.id} (${step.type}) for tenant ${context.tenantId}`);

    switch (step.type) {
      case 'CONDITION':
      case 'CONDITION_BRANCH': {
        const passed = this.evaluateCondition(step.config ?? {}, context);
        return { stepId: step.id, type: step.type, passed };
      }
      case 'WAIT_DELAY':
      case 'DELAY': {
        const delayMs = this.resolveDelayMs(step.config ?? {});
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 5000)));
        }
        return { stepId: step.id, type: step.type, delayedMs: delayMs };
      }
      case 'LOG':
        this.logger.log(
          `Workflow log [${context.eventName}]: ${String(step.config?.message ?? step.name ?? step.type)}`,
        );
        return { stepId: step.id, type: step.type, logged: true };
      case 'SEND_WHATSAPP':
      case 'SEND_EMAIL':
      case 'CREATE_TASK':
      case 'UPDATE_DEAL':
      case 'AI_CHAT':
      case 'AI_RESPONSE':
      case 'CALL_WEBHOOK':
      case 'NOTIFY_TEAM':
        this.logger.log(
          `Action ${step.type} queued with config: ${JSON.stringify(step.config ?? {})}`,
        );
        return { stepId: step.id, type: step.type, status: 'QUEUED' };
      default: {
        this.logger.warn(`Unhandled workflow step type: ${step.type}`);
        return { stepId: step.id, type: step.type, status: 'SKIPPED' };
      }
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

  private resolveDelayMs(config: Record<string, unknown>): number {
    const hours = Number(config.delayHours ?? 0);
    const days = Number(config.delayDays ?? 0);
    const seconds = Number(config.delaySeconds ?? config.seconds ?? 0);
    return (days * 24 * 3600 + hours * 3600 + seconds) * 1000;
  }
}
