'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Plus, Save, Zap, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { workflowService, type WorkflowTrigger } from '@/services/workflow.service';

type StepData = { label: string; stepType: string; config: Record<string, unknown> };
const initialNodes: Node<StepData>[] = [];

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([]);
  const [actions, setActions] = useState<WorkflowTrigger[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState<StepData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [configText, setConfigText] = useState('{}');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const selectedNode = nodes.find((node) => node.id === selected);

  const loadPalette = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [triggerResponse, actionResponse] = await Promise.all([
        workflowService.getTriggers(),
        workflowService.getActions(),
      ]);
      setTriggers(triggerResponse.data.data);
      setActions(actionResponse.data.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadPalette();
  }, [loadPalette]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((current) => addEdge(connection, current)),
    [setEdges],
  );
  const addStep = (action: WorkflowTrigger) => {
    const id = crypto.randomUUID();
    setNodes((current) => [
      ...current,
      {
        id,
        type: 'default',
        position: { x: 80, y: current.length * 130 + 40 },
        data: { label: action.label, stepType: action.key, config: {} },
      },
    ]);
    setSelected(id);
    setConfigText('{}');
  };
  const applyConfig = () => {
    try {
      const value: unknown = JSON.parse(configText);
      if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error('Configuration must be an object');
      const config = Object.fromEntries(Object.entries(value));
      setNodes((current) =>
        current.map((node) =>
          node.id === selected ? { ...node, data: { ...node.data, config } } : node,
        ),
      );
      toast.success('Step configuration updated');
    } catch {
      toast.error('Enter a valid JSON object for the step configuration.');
    }
  };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nodes.length) {
      toast.error('Add at least one action.');
      return;
    }
    // A linear graph matches the existing executor's single-successor contract.
    const incoming = new Set(edges.map((edge) => edge.target));
    const roots = nodes.filter((node) => !incoming.has(node.id));
    if (
      roots.length !== 1 ||
      edges.length !== nodes.length - 1 ||
      nodes.some(
        (node) =>
          edges.filter((edge) => edge.source === node.id).length > 1 ||
          edges.filter((edge) => edge.target === node.id).length > 1,
      )
    ) {
      toast.error('Connect every action in one sequence before saving.');
      return;
    }
    const visited = new Set<string>();
    let current: string | undefined = roots[0].id;
    while (current && !visited.has(current)) {
      visited.add(current);
      current = edges.find((edge) => edge.source === current)?.target;
    }
    if (visited.size !== nodes.length) {
      toast.error('Remove loops and connect every action.');
      return;
    }
    setSaving(true);
    try {
      const result = await workflowService.create({
        name: name.trim(),
        type: 'voice',
        isPublished: false,
        definition: {
          triggerEvent: trigger,
          nodes: [roots[0], ...nodes.filter((node) => node.id !== roots[0].id)],
          edges,
        },
      });
      if (!result.data.data?.id) throw new Error('No workflow returned');
      toast.success('Workflow draft saved');
      router.push(`/workflows/${result.data.data.id}`);
    } catch {
      toast.error('Unable to save the workflow. Check your access and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Link
        href="/workflows"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Workflows
      </Link>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workflow builder</h1>
          <p className="page-description">
            Connect actions in sequence, configure each step, then save a draft.
          </p>
        </div>
        <span className="px-3 py-1 text-xs bg-muted rounded-full">Draft</span>
      </div>
      <form onSubmit={save} className="product-panel p-4 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-0 basis-52">
          <label htmlFor="workflow-name" className="block text-xs font-medium mb-2">
            Workflow name
          </label>
          <input
            id="workflow-name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name your workflow"
            className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 min-w-0 basis-52">
          <label htmlFor="workflow-trigger" className="block text-xs font-medium mb-2">
            Trigger
          </label>
          <select
            id="workflow-trigger"
            required
            value={trigger}
            onChange={(event) => setTrigger(event.target.value)}
            className="w-full border border-input bg-background rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Choose a trigger</option>
            {triggers.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <button
          disabled={saving || loading || error}
          className="product-button product-button-primary disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save
          draft
        </button>
      </form>
      <div className="product-panel grid lg:grid-cols-[220px_1fr_260px] overflow-hidden">
        <aside className="p-4 border-b lg:border-r lg:border-b-0 border-border max-h-64 lg:max-h-[600px] overflow-y-auto">
          <h2 className="text-sm font-semibold mb-4">Actions</h2>
          {loading ? (
            <p role="status" className="text-sm text-muted-foreground">
              Loading actions…
            </p>
          ) : error ? (
            <div role="alert">
              <p className="text-sm text-muted-foreground mb-3">Actions could not be loaded.</p>
              <button
                onClick={() => void loadPalette()}
                className="product-button product-button-secondary"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {actions.map((action) => (
                <button
                  key={action.key}
                  onClick={() => addStep(action)}
                  className="flex items-center gap-2 text-left p-3 rounded-lg border border-border text-xs hover:bg-accent"
                >
                  <Plus className="w-3 h-3 shrink-0 text-primary" />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </aside>
        <div className="h-[420px] lg:h-[600px] min-w-0 relative bg-background">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => {
              setSelected(node.id);
              setConfigText(JSON.stringify(node.data.config, null, 2));
            }}
            fitView
          >
            <Background color="#d4deed" gap={24} />
            <Controls />
            <MiniMap pannable zoomable nodeColor="#155eef" />
          </ReactFlow>
          {!nodes.length && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Zap className="w-7 h-7 text-primary" />
              <p className="text-sm">Add an action to start your workflow.</p>
            </div>
          )}
        </div>
        <aside className="p-4 border-t lg:border-t-0 lg:border-l border-border">
          <h2 className="text-sm font-semibold mb-4">Step configuration</h2>
          {selectedNode ? (
            <div className="space-y-4">
              <p className="text-sm font-medium">{selectedNode.data.label}</p>
              <label htmlFor="step-config" className="block text-xs text-muted-foreground">
                Action configuration (JSON)
              </label>
              <textarea
                id="step-config"
                rows={12}
                value={configText}
                onChange={(event) => setConfigText(event.target.value)}
                className="w-full rounded-lg border border-input bg-background p-3 text-xs font-mono"
              />
              <button
                onClick={applyConfig}
                className="product-button product-button-secondary w-full"
              >
                Apply configuration
              </button>
              <button
                onClick={() => {
                  setNodes((current) => current.filter((node) => node.id !== selected));
                  setEdges((current) =>
                    current.filter((edge) => edge.source !== selected && edge.target !== selected),
                  );
                  setSelected(null);
                }}
                className="flex gap-2 items-center text-red-700 dark:text-red-400 text-xs p-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove step
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select an action on the canvas to configure it. Connect its handle to the next action.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
