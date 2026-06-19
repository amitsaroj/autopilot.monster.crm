"use client";

import { useState, useEffect } from 'react';
import { Zap, Plus, Edit2, Trash2, Clock, Globe, Database, MessageSquare, Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';

import { workflowService, type WorkflowTrigger } from '@/services/workflow.service';

interface Trigger {
  id: string;
  name: string;
  type: 'EVENT' | 'WEBHOOK' | 'SCHEDULE' | 'MANUAL';
  event: string;
  source: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const TYPE_STYLES: Record<string, string> = {
  EVENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  WEBHOOK: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SCHEDULE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  MANUAL: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const SOURCE_ICONS: Record<string, React.ElementType> = {
  CRM: Database,
  Voice: Phone,
  WhatsApp: MessageSquare,
  Webhook: Globe,
  Scheduler: Clock,
  Manual: Globe,
};

function mapTriggerType(key: string): Trigger['type'] {
  if (key === 'WEBHOOK') return 'WEBHOOK';
  if (key === 'SCHEDULE') return 'SCHEDULE';
  if (key === 'MANUAL') return 'MANUAL';
  return 'EVENT';
}

function mapSource(category?: string): string {
  return category ?? 'CRM';
}

export default function AdminWorkflowTriggersPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const triggerRes = await workflowService.getTriggers();
        const triggerItems = triggerRes.data?.data ?? [];
        const mapped: Trigger[] = triggerItems.map((t: WorkflowTrigger, i: number) => ({
          id: `trigger-${i}`,
          name: t.label,
          type: mapTriggerType(t.key),
          event: t.key,
          source: mapSource(t.category),
          status: 'ACTIVE' as const,
        }));
        setTriggers(mapped);
      } catch {
        toast.error('Failed to load workflow triggers');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Workflow Triggers</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Event Triggers & Webhook Configuration</p>
        </div>
        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Trigger
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: triggers.length },
          { label: 'Active', value: triggers.filter(t => t.status === 'ACTIVE').length },
          { label: 'Events', value: triggers.filter(t => t.type === 'EVENT').length },
          { label: 'Webhooks', value: triggers.filter(t => t.type === 'WEBHOOK').length },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-2xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {triggers.map(trigger => {
          const SourceIcon = SOURCE_ICONS[trigger.source] || Globe;
          return (
            <div key={trigger.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all group flex items-center gap-5">
              <div className="p-3 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500 transition-all shrink-0">
                <Zap className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-sm font-black text-white">{trigger.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${TYPE_STYLES[trigger.type]}`}>{trigger.type}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-600">
                  <span className="flex items-center gap-1"><SourceIcon className="w-3 h-3" /> {trigger.source}</span>
                  <span className="font-mono">{trigger.event}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => toast.error('System triggers cannot be deleted')} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
