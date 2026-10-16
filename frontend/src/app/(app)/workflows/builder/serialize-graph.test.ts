import { describe, expect, it } from 'vitest';
import type { Edge, Node } from 'reactflow';
import { serializeWorkflowGraph, type StepData } from './serialize-graph';

const node = (id: string, stepType = 'LOG'): Node<StepData> => ({
  id,
  position: { x: 0, y: 0 },
  data: { label: id, stepType, config: {} },
});
const edge = (source: string, target: string, sourceHandle: string | null = null): Edge => ({
  id: `${source}-${sourceHandle ?? 'next'}-${target}`,
  source,
  target,
  sourceHandle,
});

describe('serializeWorkflowGraph', () => {
  it('keeps a linear flow unchanged apart from putting the root first', () => {
    const nodes = [node('b'), node('a'), node('c')];
    const edges = [edge('a', 'b'), edge('b', 'c')];
    const result = serializeWorkflowGraph(nodes, edges);
    expect(result).toEqual({ ok: true, nodes: [nodes[1], nodes[0], nodes[2]], edges });
  });

  it('serializes condition branches with true/false source handles', () => {
    const nodes = [node('start'), node('cond', 'CONDITION_BRANCH'), node('yes'), node('no')];
    const edges = [edge('start', 'cond'), edge('cond', 'yes', 'true'), edge('cond', 'no', 'false')];
    const result = serializeWorkflowGraph(nodes, edges);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.nodes[0].id).toBe('start');
    expect(
      result.edges.filter((e) => e.source === 'cond').map((e) => [e.sourceHandle, e.target]),
    ).toEqual([
      ['true', 'yes'],
      ['false', 'no'],
    ]);
  });

  it('allows branches to rejoin', () => {
    const nodes = [node('cond', 'CONDITION'), node('yes'), node('no'), node('end')];
    const edges = [
      edge('cond', 'yes', 'true'),
      edge('cond', 'no', 'false'),
      edge('yes', 'end'),
      edge('no', 'end'),
    ];
    expect(serializeWorkflowGraph(nodes, edges).ok).toBe(true);
  });

  it('rejects a condition missing its false branch', () => {
    const nodes = [node('cond', 'CONDITION_BRANCH'), node('yes')];
    const result = serializeWorkflowGraph(nodes, [edge('cond', 'yes', 'true')]);
    expect(result).toMatchObject({ ok: false, error: expect.stringMatching(/true and false/) });
  });

  it('rejects fan-out from a non-condition step', () => {
    const nodes = [node('a'), node('b'), node('c')];
    const result = serializeWorkflowGraph(nodes, [edge('a', 'b'), edge('a', 'c')]);
    expect(result).toMatchObject({ ok: false, error: expect.stringMatching(/one action/) });
  });

  it('rejects disconnected steps and loops', () => {
    expect(serializeWorkflowGraph([node('a'), node('b')], []).ok).toBe(false);
    const loop = serializeWorkflowGraph(
      [node('a'), node('b'), node('c')],
      [edge('a', 'b'), edge('b', 'c'), edge('c', 'b')],
    );
    expect(loop.ok).toBe(false);
  });
});
