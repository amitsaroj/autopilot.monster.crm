"use client";

import { useState, useCallback, useEffect } from 'react';
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
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play, MessageCircle, GitBranch, Zap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { flowService, Flow } from '@/services/flow.service';

const defaultNodes: Node[] = [
  {
    id: 'trigger',
    type: 'input',
    data: { label: 'Keyword: "Pricing"' },
    position: { x: 250, y: 100 },
    style: { background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '8px', padding: '10px', width: 200 },
  },
];

const defaultEdges: Edge[] = [];

export default function FlowBuilderPage() {
  const [nodes, setNodes] = useState<Node[]>(defaultNodes);
  const [edges, setEdges] = useState<Edge[]>(defaultEdges);
  const [flowId, setFlowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void flowService
      .list()
      .then((res) => {
        const flows = res.data.data ?? [];
        const whatsappFlow = flows.find((flow: Flow) => flow.type === 'whatsapp');
        if (whatsappFlow) {
          setFlowId(whatsappFlow.id);
          const definition = whatsappFlow.definition as { nodes?: Node[]; edges?: Edge[] };
          if (definition.nodes?.length) setNodes(definition.nodes);
          if (definition.edges?.length) setEdges(definition.edges);
        }
      })
      .catch(() => toast.error('Failed to load flow'))
      .finally(() => setLoading(false));
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const addNode = (type: 'message' | 'condition' | 'action') => {
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      data: { label: `New ${type}` },
      position: { x: 100, y: 100 },
      style: {
        background: type === 'message' ? '#fef3c7' : type === 'condition' ? '#f3e8ff' : '#d1fae5',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        width: 150,
      },
    };
    setNodes([...nodes, newNode]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: 'WhatsApp Default Flow',
        type: 'whatsapp' as const,
        definition: { nodes, edges },
        isPublished: true,
      };

      if (flowId) {
        await flowService.update(flowId, payload);
      } else {
        const res = await flowService.create(payload);
        setFlowId(res.data.data.id);
      }
      toast.success('Flow saved');
    } catch {
      toast.error('Failed to save flow');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

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
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save & Publish
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
