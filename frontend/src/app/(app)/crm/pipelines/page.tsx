import { Plus, Settings } from 'lucide-react';
import Link from 'next/link';

const stages = [
  { name: 'Prospecting', deals: [{ title: 'Acme Corp', value: '$12k', company: 'Acme' }, { title: 'New Lead', value: '$8k', company: 'Beta Inc' }] },
  { name: 'Qualification', deals: [{ title: 'Enterprise Deal', value: '$48k', company: 'TechCorp' }] },
  { name: 'Proposal', deals: [{ title: 'Startup Package', value: '$4k', company: 'StartupXYZ' }, { title: 'SMB Plan', value: '$3.2k', company: 'Retail Co' }] },
  { name: 'Negotiation', deals: [{ title: 'Annual License', value: '$92k', company: 'GlobalInc' }] },
  { name: 'Closed Won', deals: [{ title: 'CRM Migration', value: '$22k', company: 'NovaTech' }] },
];

export default function PipelinesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pipeline</h1>
          <p className="page-description">Sales pipeline · 5 stages · 284 open deals</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/crm/pipelines/new" className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <Settings className="h-4 w-4" /> Manage Pipelines
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Add Deal
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.name} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{stage.name}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{stage.deals.length}</span>
            </div>
            <div className="space-y-2">
              {stage.deals.map((deal) => (
                <Link
                  key={deal.title}
                  href="/crm/deals/1"
                  className="block p-4 rounded-xl border border-border bg-card hover:border-[hsl(246,80%,60%)]/50 hover:shadow-md transition-all"
                >
                  <p className="text-sm font-medium text-foreground mb-1">{deal.title}</p>
                  <p className="text-xs text-muted-foreground mb-2">{deal.company}</p>
                  <p className="text-sm font-bold text-[hsl(246,80%,60%)]">{deal.value}</p>
                </Link>
              ))}
              <button className="w-full p-3 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:border-[hsl(246,80%,60%)] hover:text-[hsl(246,80%,60%)] transition-colors flex items-center justify-center gap-1.5">
                <Plus className="h-3 w-3" /> Add deal
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
