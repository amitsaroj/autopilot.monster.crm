import { Search, Command } from 'lucide-react';

const results = [
  { type: 'Contact', label: 'Sarah Johnson', sub: 'sarah@techcorp.com · TechCorp', href: '/crm/contacts/1' },
  { type: 'Deal', label: 'Enterprise License $48k', sub: 'Stage: Proposal · TechCorp', href: '/crm/deals/1' },
  { type: 'Lead', label: 'Acme Corp — Hot Lead', sub: 'Score: 92 · Tom Bradley', href: '/crm/leads/1' },
  { type: 'Workflow', label: 'Lead Nurture Sequence', sub: 'Active · 1,284 runs', href: '/workflows/1' },
  { type: 'File', label: 'Q3 Sales Report.pdf', sub: '2.4 MB · Modified 2h ago', href: '/storage/1' },
];

const typeColors: Record<string, string> = {
  Contact: 'bg-blue-500/10 text-blue-400',
  Deal: 'bg-green-500/10 text-green-500',
  Lead: 'bg-red-500/10 text-red-500',
  Workflow: 'bg-purple-500/10 text-purple-400',
  File: 'bg-yellow-500/10 text-yellow-500',
};

export default function SearchPage() {
  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <h1 className="page-title">Global Search</h1>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          placeholder="Search contacts, deals, leads, files, workflows..."
          autoFocus
          className="w-full pl-12 pr-24 py-3.5 text-base border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)] shadow-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded border border-border">
          <Command className="h-3 w-3" /> K
        </div>
      </div>
      <div className="flex items-center gap-2">
        {['All', 'Contacts', 'Deals', 'Leads', 'Files', 'Workflows'].map((f, i) => (
          <button key={f} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${i === 0 ? 'bg-[hsl(246,80%,60%)] text-white' : 'border border-border hover:bg-muted text-muted-foreground'}`}>{f}</button>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Results — 5 found</p>
        {results.map((r) => (
          <a key={r.label} href={r.href} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-[hsl(246,80%,60%)]/50 hover:shadow-sm transition-all">
            <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${typeColors[r.type]}`}>{r.type}</span>
            <div>
              <p className="font-medium text-foreground">{r.label}</p>
              <p className="text-xs text-muted-foreground">{r.sub}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
