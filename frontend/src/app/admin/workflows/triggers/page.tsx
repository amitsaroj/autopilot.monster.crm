"use client";

import { useState } from 'react';
import { Zap, Plus, Edit2, Trash2, CheckCircle2, Clock, Globe, Database, MessageSquare, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface Trigger {
  id: string;
  name: string;
  type: 'EVENT' | 'WEBHOOK' | 'SCHEDULE' | 'MANUAL';
  event: string;
  source: string;
  workflowsAttached: number;
  status: 'ACTIVE' | 'INACTIVE';
  lastFired: string;
}

const mockTriggers: Trigger[] = [
  { id: '1', name: 'New Lead Created', type: 'EVENT', event: 'lead.created', source: 'CRM', workflowsAttached: 3, status: 'ACTIVE', lastFired: '5 min ago' },
  { id: '2', name: 'Deal Stage Changed', type: 'EVENT', event: 'deal.stage_changed', source: 'CRM', workflowsAttached: 2, status: 'ACTIVE', lastFired: '12 min ago' },
  { id: '3', name: 'WhatsApp Message Received', type: 'EVENT', event: 'whatsapp.message_received', source: 'WhatsApp', workflowsAttached: 1, status: 'ACTIVE', lastFired: '30 min ago' },
  { id: '4', name: 'Daily Digest', type: 'SCHEDULE', event: 'cron:0 9 * * *', source: 'Scheduler', workflowsAttached: 1, status: 'ACTIVE', lastFired: '9 hours ago' },
  { id: '5', name: 'Stripe Webhook', type: 'WEBHOOK', event: 'payment_intent.succeeded', source: 'Stripe', workflowsAttached: 2, status: 'ACTIVE', lastFired: '2 hours ago' },
  { id: '6', name: 'Contact Inactivity', type: 'SCHEDULE', event: 'cron:0 0 * * 1', source: 'Scheduler', workflowsAttached: 1, status: 'INACTIVE', lastFired: '3 days ago' },
];

const TYPE_STYLES: Record<string, string> = {
  EVENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  WEBHOOK: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SCHEDULE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  MANUAL: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const SOURCE_ICONS: Record<string, React.ElementType> = {
  CRM: Database,
  WhatsApp: MessageSquare,
  Stripe: Globe,
  Scheduler: Clock,
};

export default function AdminWorkflowTriggersPage() {
  const [triggers] = useState<Trigger[]>(mockTriggers);

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
                  {trigger.status === 'INACTIVE' && <span className="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest bg-gray-500/10 text-gray-500 border-gray-500/20">Inactive</span>}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-600">
                  <span className="flex items-center gap-1"><SourceIcon className="w-3 h-3" /> {trigger.source}</span>
                  <span className="font-mono">{trigger.event}</span>
                  <span>{trigger.workflowsAttached} workflow{trigger.workflowsAttached !== 1 ? 's' : ''} attached</span>
                  <span>Last: {trigger.lastFired}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button className="p-2 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => toast.error('Cannot delete trigger with attached workflows')} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
