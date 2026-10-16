import { AsyncLocalStorage } from 'async_hooks';

/** Domain services emit events synchronously inside an action; retain causation without editing them. */
export const workflowCausation = new AsyncLocalStorage<{
  flowId: string;
  executionId: string;
  depth: number;
}>();
