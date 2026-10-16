import type { Edge, Node } from 'reactflow';

export type StepData = { label: string; stepType: string; config: Record<string, unknown> };

/** Branch ports the backend accepts on CONDITION nodes (workflow-definition.ts compileWorkflow). */
export const CONDITION_PORTS = ['true', 'false'] as const;

export const isConditionStep = (stepType: string) =>
  ['CONDITION', 'CONDITION_BRANCH'].includes(stepType.toUpperCase());

export type SerializedGraph =
  { ok: true; nodes: Node<StepData>[]; edges: Edge[] } | { ok: false; error: string };

/**
 * Validates the canvas and returns the definition graph the backend compiles: the single root
 * first (no trigger node, so the backend starts at the first node), plain edges for the "next"
 * port, and `sourceHandle: 'true' | 'false'` edges out of condition nodes.
 */
export function serializeWorkflowGraph(nodes: Node<StepData>[], edges: Edge[]): SerializedGraph {
  if (!nodes.length) return { ok: false, error: 'Add at least one action.' };
  const incoming = new Set(edges.map((edge) => edge.target));
  const roots = nodes.filter((node) => !incoming.has(node.id));
  if (roots.length !== 1)
    return { ok: false, error: 'Connect every action into one flow with a single start.' };

  for (const node of nodes) {
    const outgoing = edges.filter((edge) => edge.source === node.id);
    if (isConditionStep(node.data.stepType)) {
      const ports = outgoing.map((edge) => edge.sourceHandle ?? '');
      const complete =
        outgoing.length === CONDITION_PORTS.length &&
        CONDITION_PORTS.every((port) => ports.includes(port));
      if (!complete)
        return {
          ok: false,
          error: `Connect both the true and false outputs of "${node.data.label}" once each.`,
        };
    } else if (outgoing.length > 1) {
      return {
        ok: false,
        error: `"${node.data.label}" can only continue to one action. Use a condition to branch.`,
      };
    }
  }

  // Branches may rejoin, but every action must be reachable and loops are not allowed.
  const done = new Set<string>();
  const visiting = new Set<string>();
  const hasCycle = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (done.has(id)) return false;
    visiting.add(id);
    const cyclic = edges.filter((edge) => edge.source === id).some((edge) => hasCycle(edge.target));
    visiting.delete(id);
    done.add(id);
    return cyclic;
  };
  if (hasCycle(roots[0].id) || done.size !== nodes.length)
    return { ok: false, error: 'Remove loops and connect every action.' };

  return { ok: true, nodes: [roots[0], ...nodes.filter((node) => node.id !== roots[0].id)], edges };
}
