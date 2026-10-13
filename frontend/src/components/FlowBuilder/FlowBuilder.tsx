'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  MessageSquare,
  CircleHelp,
  GitBranch,
  PhoneForwarded,
  CalendarDays,
  ClipboardList,
  Zap,
  PhoneOff,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { flowService } from '@/services/flow.service';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Panel,
  MiniMap,
  type ReactFlowInstance,
} from 'reactflow';
import { ReactFlowStyles } from '../ReactFlowStyles';

import { MessageNode } from './nodes/MessageNode';
import { QuestionNode } from './nodes/QuestionNode';
import { ActionNode } from './nodes/ActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { EndNode } from './nodes/EndNode';
import { TransferNode } from './nodes/TransferNode';
import { AppointmentNode } from './nodes/AppointmentNode';
import { FormNode } from './nodes/FormNode';

const nodeTypes = {
  message: MessageNode,
  question: QuestionNode,
  action: ActionNode,
  condition: ConditionNode,
  end: EndNode,
  transfer: TransferNode,
  appointment: AppointmentNode,
  form: FormNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'message',
    data: { label: 'Greeting', text: 'Hello! How can I help you today?' },
    position: { x: 250, y: 5 },
  },
];

const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `node_${id++}`;

export function FlowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const [flowName, setFlowName] = useState('Untitled voice flow');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = nodes.find((node) => node.id === selectedId);
  const saveFlow = async () => {
    if (!flowName.trim()) {
      toast.error('Enter a flow name.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: flowName.trim(),
        type: 'voice' as const,
        definition: { nodes, edges },
        isPublished: false,
      };
      if (savedId) {
        await flowService.update(savedId, payload);
      } else {
        const result = await flowService.create(payload);
        if (!result.data.data?.id) throw new Error('No flow returned');
        setSavedId(result.data.data.id);
      }
      toast.success('Voice flow draft saved');
    } catch {
      toast.error('Unable to save the voice flow. Check your access and try again.');
    } finally {
      setSaving(false);
    }
  };
  const addNode = (type: string) =>
    setNodes((current) => [
      ...current,
      {
        id: getId(),
        type,
        position: { x: 250, y: current.length * 140 + 40 },
        data: { label: `${type} node`, text: '' },
      },
    ]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node`, text: '' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  return (
    <div className="w-full h-full min-h-[620px] flex flex-col md:flex-row bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden shadow-sm">
      <NodeSidebar onAdd={addNode} />

      <div className="flex-1 min-h-[420px] min-w-0 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-white dark:bg-[#0b0f19]"
        >
          <Background color="#aaa" gap={20} />
          <Controls />
          <MiniMap pannable zoomable nodeColor="#155eef" />
          <Panel
            position="top-right"
            className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-2 rounded-lg border border-gray-200 dark:border-white/10"
          >
            <label htmlFor="voice-flow-name" className="sr-only">
              Flow name
            </label>
            <input
              id="voice-flow-name"
              value={flowName}
              onChange={(event) => setFlowName(event.target.value)}
              className="max-w-40 rounded-lg px-2 py-1 text-sm bg-card border border-border mr-2"
            />
            <button
              onClick={() => void saveFlow()}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              {saving ? (
                <Loader2 className="inline w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="inline w-4 h-4 mr-2" />
              )}
              Save draft
            </button>
          </Panel>
        </ReactFlow>
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm">
            <label htmlFor="voice-node-text" className="block text-xs font-medium mb-2">
              {selectedNode.data.label}: message text
            </label>
            <textarea
              id="voice-node-text"
              value={typeof selectedNode.data.text === 'string' ? selectedNode.data.text : ''}
              onChange={(event) =>
                setNodes((current) =>
                  current.map((node) =>
                    node.id === selectedId
                      ? { ...node, data: { ...node.data, text: event.target.value } }
                      : node,
                  ),
                )
              }
              className="w-full p-2 border border-input bg-background rounded-lg text-sm"
              rows={2}
            />
            <button onClick={() => setSelectedId(null)} className="mt-2 text-xs text-primary">
              Close editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NodeSidebar({ onAdd }: { onAdd: (type: string) => void }) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeItems = [
    { type: 'message', label: 'Message', icon: MessageSquare, color: 'bg-blue-600' },
    { type: 'question', label: 'Question', icon: CircleHelp, color: 'bg-blue-600' },
    { type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-orange-500' },
    { type: 'transfer', label: 'Transfer', icon: PhoneForwarded, color: 'bg-orange-600' },
    { type: 'appointment', label: 'Schedule', icon: CalendarDays, color: 'bg-blue-600' },
    { type: 'form', label: 'Extract Form', icon: ClipboardList, color: 'bg-green-600' },
    { type: 'action', label: 'Action', icon: Zap, color: 'bg-blue-600' },
    { type: 'end', label: 'End Call', icon: PhoneOff, color: 'bg-red-500' },
  ];

  return (
    <div className="w-full md:w-56 shrink-0 max-h-64 md:max-h-none overflow-y-auto p-4 bg-white dark:bg-[#111827] border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/[0.08] z-10">
      <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
        Components
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
        {nodeItems.map((item) => (
          <button
            type="button"
            onClick={() => onAdd(item.type)}
            key={item.type}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] cursor-grab hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
            onDragStart={(event) => onDragStart(event, item.type)}
            draggable
          >
            <div
              className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white shadow-lg shadow-black/10`}
            >
              <item.icon className="w-4 h-4" />
            </div>
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
        <p className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed">
          <strong>Tip:</strong> Drag nodes onto the canvas and connect them to design your AI
          agent's conversation logic.
        </p>
      </div>
    </div>
  );
}

export default function FlowBuilderPage() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
}
