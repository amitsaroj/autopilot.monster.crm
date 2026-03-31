import { Bot, Plus, Search, Play, Pause, Trash2, Settings, Zap, MessageSquare, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

const agents = [
  { id: 1, name: 'Lead Qualifier', purpose: 'Qualifies inbound leads via chat', channels: ['chat', 'email'], runs: 248, success: '91%', status: 'Active', model: 'GPT-4o' },
  { id: 2, name: 'Support Agent', purpose: 'Handles tier-1 customer support queries', channels: ['chat', 'whatsapp'], runs: 1204, success: '88%', status: 'Active', model: 'GPT-4o Mini' },
  { id: 3, name: 'CRM Analyst', purpose: 'Answers questions about pipeline data', channels: ['chat'], runs: 89, success: '94%', status: 'Active', model: 'GPT-4o' },
  { id: 4, name: 'Email Drip Writer', purpose: 'Generates personalised outbound emails', channels: ['email'], runs: 42, success: '79%', status: 'Paused', model: 'GPT-4o' },
];

const channelIcon: Record<string, typeof MessageSquare> = { chat: MessageSquare, email: Mail, whatsapp: Phone };

export default function AIAgentsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Agents</h1>
          <p className="page-description">Autonomous AI agents powering your CRM workflows</p>
        </div>
        <Link href="/ai/agents/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> New Agent
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: '4', icon: Bot },
          { label: 'Active', value: '3', icon: Zap },
          { label: 'Total Runs', value: '1,583', icon: Play },
          { label: 'Avg Success', value: '88%', icon: Settings },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]"><s.icon className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Search agents..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {agents.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-5 hover:border-[hsl(246,80%,60%)]/40 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[hsl(246,80%,60%)]/10">
                  <Bot className="h-5 w-5 text-[hsl(246,80%,60%)]" />
                </div>
                <div>
                  <Link href={`/ai/agents/${a.id}`} className="font-semibold text-foreground hover:text-[hsl(246,80%,60%)]">{a.name}</Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.model}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${a.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{a.status}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{a.purpose}</p>
            <div className="flex items-center gap-3 mt-3">
              {a.channels.map((ch) => {
                const Ico = channelIcon[ch];
                return <span key={ch} className="flex items-center gap-1 text-xs text-muted-foreground"><Ico className="h-3 w-3" />{ch}</span>;
              })}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border text-center">
              <div><p className="text-sm font-bold text-foreground">{a.runs.toLocaleString()}</p><p className="text-xs text-muted-foreground">Runs</p></div>
              <div><p className="text-sm font-bold text-green-500">{a.success}</p><p className="text-xs text-muted-foreground">Success</p></div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link href={`/ai/agents/${a.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"><Settings className="h-3.5 w-3.5" />Configure</Link>
              <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">{a.status === 'Active' ? <Pause className="h-3.5 w-3.5 text-muted-foreground" /> : <Play className="h-3.5 w-3.5 text-muted-foreground" />}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
