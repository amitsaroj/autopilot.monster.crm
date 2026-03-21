"use client";

import { useState, useCallback } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play, PlusCircle, MessageCircle, GitBranch, Zap } from 'lucide-react';

const initialNodes = [
  {
    id: 'trigger',
    type: 'input',
    data: { label: 'Keyword: "Pricing"' },
    position: { x: 250, y: 100 },
    style: { background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px', width: 200 }
  },
  {
    id: 'msg-1',
    data: { label: 'Send Info Message' },
    position: { x: 250, y: 200 },
    style: { background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '10px', width: 200 }
  },
  {
    id: 'condition',
    data: { label: 'If response = "Agent"' },
    position: { x: 250, y: 300 },
    style: { background: '#f3e8ff', border: '1px solid #a855f7', borderRadius: '8px', padding: '10px', width: 200 }
  },
  {
    id: 'human',
    type: 'output',
    data: { label: 'Route to Human Queue' },
    position: { x: 450, y: 400 },
    style: { background: '#d1fae5', border: '1px solid #10b981', borderRadius: '8px', padding: '10px', width: 200 }
  }
];

const initialEdges = [
  { id: 'e1-2', source: 'trigger', target: 'msg-1', animated: true },
  { id: 'e2-3', source: 'msg-1', target: 'condition' },
  { id: 'e3-4', source: 'condition', target: 'human', label: 'True', style: { stroke: '#10b981' } }
];

export default function FlowBuilderPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = (type: 'message' | 'condition' | 'action') => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      data: { label: `New ${type}` },
      position: { x: 100, y: 100 },
      style: { 
        background: type === 'message' ? '#fef3c7' : type === 'condition' ? '#f3e8ff' : '#d1fae5',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        width: 150
      }
    };
    setNodes([...nodes, newNode]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white border rounded-xl overflow-hidden shadow-sm animate-fade-in max-w-7xl relative">
      <div className="h-16 border-b flex items-center justify-between px-6 bg-white z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">WhatsApp Flow Builder</h1>
          <p className="text-xs text-gray-500">Design automated chat trees.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Play className="w-4 h-4" /> Test Flow
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
            <Save className="w-4 h-4" /> Save & Publish
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>

        {/* Floating Toolbox */}
        <div className="absolute top-4 left-4 bg-white border shadow-lg rounded-xl p-3 flex flex-col gap-2 z-10 w-48">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">Nodes</h3>
          
          <button onClick={() => addNode('message')} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#fef3c7] transition-colors border border-transparent hover:border-[#f59e0b] text-sm text-gray-700 w-full text-left">
            <MessageCircle className="w-4 h-4 text-amber-500" /> Send Message
          </button>
          
          <button onClick={() => addNode('condition')} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#f3e8ff] transition-colors border border-transparent hover:border-[#a855f7] text-sm text-gray-700 w-full text-left">
            <GitBranch className="w-4 h-4 text-purple-500" /> Condition Branch
          </button>
          
          <button onClick={() => addNode('action')} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#d1fae5] transition-colors border border-transparent hover:border-[#10b981] text-sm text-gray-700 w-full text-left">
            <Zap className="w-4 h-4 text-green-500" /> System Action
          </button>
        </div>
      </div>
    </div>
  );
}
