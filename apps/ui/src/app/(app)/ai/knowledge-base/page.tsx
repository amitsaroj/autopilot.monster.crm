import { Database, Plus, Search, File, Trash2, Upload, RefreshCw, BookOpen, Link as LinkIcon } from 'lucide-react';

const sources = [
  { id: 1, name: 'Product Documentation', type: 'URL Crawl', docs: 48, status: 'Synced', updated: '2h ago', tokens: '124k' },
  { id: 2, name: 'Support FAQ', type: 'PDF Upload', docs: 12, status: 'Synced', updated: '1d ago', tokens: '38k' },
  { id: 3, name: 'Sales Playbook', type: 'PDF Upload', docs: 5, status: 'Synced', updated: '3d ago', tokens: '22k' },
  { id: 4, name: 'API Reference', type: 'URL Crawl', docs: 84, status: 'Indexing', updated: 'Syncing...', tokens: '—' },
];

const statusStyle: Record<string, string> = {
  Synced: 'bg-green-500/10 text-green-500',
  Indexing: 'bg-yellow-500/10 text-yellow-500',
};

export default function AIKnowledgePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="page-description">Documents and sources powering your AI agents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Add Source
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Sources', value: '4', icon: Database },
          { label: 'Total Docs', value: '149', icon: File },
          { label: 'Total Tokens', value: '184k', icon: BookOpen },
          { label: 'Last Sync', value: '2h ago', icon: RefreshCw },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]"><s.icon className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search knowledge sources..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <div className="ml-auto flex gap-2">
          {['All', 'PDF Upload', 'URL Crawl'].map((t, i) => (
            <button key={t} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${i === 0 ? 'bg-[hsl(246,80%,60%)] border-transparent text-white' : 'border-border hover:bg-muted text-muted-foreground'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sources.map((s) => (
          <div key={s.id} className="rounded-xl border border-border bg-card p-5 hover:border-[hsl(246,80%,60%)]/30 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[hsl(246,80%,60%)]/10">
                  {s.type === 'PDF Upload' ? <File className="h-4 w-4 text-[hsl(246,80%,60%)]" /> : <LinkIcon className="h-4 w-4 text-[hsl(246,80%,60%)]" />}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.type}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[s.status]}`}>{s.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-center text-xs">
              <div className="p-2 rounded-lg bg-muted/30"><p className="font-bold text-foreground">{s.docs}</p><p className="text-muted-foreground">Docs</p></div>
              <div className="p-2 rounded-lg bg-muted/30"><p className="font-bold text-foreground">{s.tokens}</p><p className="text-muted-foreground">Tokens</p></div>
              <div className="p-2 rounded-lg bg-muted/30"><p className="font-bold text-foreground">{s.updated}</p><p className="text-muted-foreground">Updated</p></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"><RefreshCw className="h-3.5 w-3.5" />Re-sync</button>
              <button className="p-2 rounded-lg border border-border hover:bg-red-500/10 hover:border-red-500/30 transition-colors"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
