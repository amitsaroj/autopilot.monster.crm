"use client";

import React, { useState, useCallback, useRef } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';

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
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="w-full h-[800px] flex flex-col md:flex-row bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden shadow-2xl">
      <NodeSidebar />
      
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-white dark:bg-[#0b0f19]"
        >
          <Background color="#aaa" gap={20} />
          <Controls />
          <Panel position="top-right" className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-2 rounded-lg border border-gray-200 dark:border-white/10">
            <button 
              onClick={() => console.log('Saving flow...', { nodes, edges })}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
            >
              Save Flow
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

function NodeSidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeItems = [
    { type: 'message', label: 'Message', icon: '💬', color: 'bg-blue-500' },
    { type: 'question', label: 'Question', icon: '❓', color: 'bg-purple-500' },
    { type: 'condition', label: 'Condition', icon: '🔀', color: 'bg-orange-500' },
    { type: 'transfer', label: 'Transfer', icon: '📲', color: 'bg-orange-600' },
    { type: 'appointment', label: 'Schedule', icon: '📅', color: 'bg-indigo-600' },
    { type: 'form', label: 'Extract Form', icon: '📝', color: 'bg-green-600' },
    { type: 'action', label: 'Action', icon: '⚡', color: 'bg-blue-600' },
    { type: 'end', label: 'End Call', icon: '📞', color: 'bg-red-500' },
  ];

  return (
    <div className="w-full md:w-64 p-6 bg-white dark:bg-[#111827] border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/[0.08] z-10">
      <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Components</h3>
      <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
        {nodeItems.map((item) => (
          <div
            key={item.type}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] cursor-grab hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
            onDragStart={(event) => onDragStart(event, item.type)}
            draggable
          >
            <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white shadow-lg shadow-black/10`}>
              {item.icon}
            </div>
            {item.label}
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
        <p className="text-xs text-orange-600 dark:text-orange-400 leading-relaxed">
          <strong>Tip:</strong> Drag nodes onto the canvas and connect them to design your AI agent's conversation logic.
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
