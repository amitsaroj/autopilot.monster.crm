import { Injectable, Logger } from '@nestjs/common';

import { WorkflowActionExecutorService } from './workflow-action-executor.service';

import { compileWorkflow, normalizeStepType, WorkflowStep } from './workflow-definition';
import { resolveWorkflowConfig, buildWorkflowVariableRoot } from './workflow-template.util';
export type { WorkflowStep } from './workflow-definition';

export interface WorkflowExecutionContext {
  tenantId: string;
  eventName: string;
  payload: Record<string, unknown>;
  executionId?: string;
  versionId?: string;
  idempotencyKey?: string;
  outputs?: Record<string, unknown>;
  now?: string;
}

export type WorkflowStepStatus = 'COMPLETED' | 'SCHEDULED' | 'SKIPPED' | 'STARTED' | 'FAILED';

export interface WorkflowStepResult {
  stepId: string;
  idempotencyKey?: string;
  nextStepId?: string | null;
  output?: Record<string, unknown>;
  handoff?: boolean;
  startedAt?: string;
  completedAt?: string;
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
    return compileWorkflow(definition).steps;
  }

  normalizeStepType(type: string): string {
    return normalizeStepType(type);
  }

  evaluateCondition(config: Record<string, unknown>, context: WorkflowExecutionContext): boolean {
    if (Array.isArray(config.conditions)) {
      const conditions = config.conditions;
      if (
        conditions.length < 1 ||
        conditions.length > 10 ||
        (config.logicalOperator !== 'AND' && config.logicalOperator !== 'OR')
      ) {
        throw new Error('Invalid condition group');
      }
      const evaluate = (condition: unknown): boolean => {
        if (!condition || typeof condition !== 'object' || Array.isArray(condition))
          throw new Error('Invalid condition');
        return this.evaluateCondition(condition as Record<string, unknown>, context);
      };
      return config.logicalOperator === 'AND'
        ? conditions.every(evaluate)
        : conditions.some(evaluate);
    }
    const field = config.field as string | undefined;
    if (!field) throw new Error('Condition requires field');

    const actual = this.resolveField(field, buildWorkflowVariableRoot(context));
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
      default:
        throw new Error(`Unknown condition operator: ${operator}`);
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
        const passed = this.evaluateCondition(
          resolveWorkflowConfig(normalizedStep.config ?? {}, context),
          context,
        );
        return { stepId: normalizedStep.id, type: normalizedType, status: 'COMPLETED', passed };
      }
      case 'END':
        return { stepId: step.id, type: 'END', status: 'COMPLETED' };
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
      if (
        ['__proto__', 'prototype', 'constructor'].includes(part) ||
        !Object.prototype.hasOwnProperty.call(current, part)
      )
        return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }
}
