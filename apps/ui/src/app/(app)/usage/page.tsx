import { Activity, Zap, MessageSquare, Phone, Mail, Database, HardDrive, ArrowUpRight } from 'lucide-react';

const usageItems = [
  { label: 'Contacts', used: 2840, limit: 50000, unit: 'contacts', icon: Activity, color: 'bg-blue-500' },
  { label: 'Emails Sent', used: 8420, limit: 50000, unit: 'emails/mo', icon: Mail, color: 'bg-green-500' },
  { label: 'AI Chat Messages', used: 4200, limit: 10000, unit: 'messages/mo', icon: Zap, color: 'bg-[hsl(246,80%,60%)]' },
  { label: 'WhatsApp Messages', used: 3180, limit: 10000, unit: 'messages/mo', icon: MessageSquare, color: 'bg-green-600' },
  { label: 'Call Minutes', used: 642, limit: 2000, unit: 'minutes/mo', icon: Phone, color: 'bg-orange-500' },
  { label: 'Storage', used: 2.8, limit: 50, unit: 'GB', icon: HardDrive, color: 'bg-purple-500' },
  { label: 'API Calls', used: 48200, limit: 500000, unit: 'calls/mo', icon: Database, color: 'bg-yellow-500' },
];

export default function UsagePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usage</h1>
          <p className="page-description">Resource consumption for October 2024 · Enterprise Plan</p>
        </div>
      </div>

      <div className="space-y-4">
        {usageItems.map((u) => {
          const pct = Math.round((u.used / u.limit) * 100);
          const warn = pct >= 80;
          return (
            <div key={u.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-2.5 rounded-xl ${u.color}/10`}>
                  <u.icon className={`h-4 w-4 ${u.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-foreground">{u.label}</p>
                    <p className="text-sm text-muted-foreground">{u.used.toLocaleString()} / {u.limit.toLocaleString()} {u.unit}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${warn ? 'text-red-400' : 'text-foreground'}`}>{pct}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${warn ? 'bg-red-500' : u.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {warn && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />Approaching limit — consider upgrading your plan
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[hsl(246,80%,60%)]/20 bg-[hsl(246,80%,60%)]/5 p-5">
        <p className="text-sm font-semibold text-foreground mb-1">Need more capacity?</p>
        <p className="text-sm text-muted-foreground">Upgrade to Enterprise for unlimited contacts, 50k AI messages, and dedicated support.</p>
        <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Zap className="h-4 w-4" /> Upgrade Plan
        </button>
      </div>
    </div>
  );
}
