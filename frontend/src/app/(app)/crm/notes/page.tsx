import { Search, Filter, Plus, FileText, Edit, Trash2, Tag, Clock } from 'lucide-react';

const notes = [
  { id: 1, title: 'TechCorp Q4 Negotiation Notes', preview: 'CTO wants to see ROI case study before signing. Send over the custom deck by Friday. They are comparing us with HubSpot...', contact: 'Sarah Johnson', tags: ['enterprise', 'negotiation'], updated: '2h ago' },
  { id: 2, title: 'GlobalManufacturing discovery call', preview: 'Key pain point: too many manual CSV exports. Current CRM is Zoho. Decision makers: Mike Braun (procurement) + Board...', contact: 'Mike Braun', tags: ['discovery'], updated: '1d ago' },
  { id: 3, title: 'Acme demo feedback', preview: 'The workflow automation resonated well. They want a pilot period. Free trial for 2 weeks, then convert at $14,400...', contact: 'Emily Davis', tags: ['demo', 'feedback'], updated: '2d ago' },
  { id: 4, title: 'HealthFirst compliance requirements', preview: 'HIPAA compliance required. Need to get legal to sign off on data processing agreement. Legal contact: Dr. Priya Nath legal team...', contact: 'Dr. Priya Nath', tags: ['compliance', 'healthcare'], updated: '3d ago' },
];

export default function CrmNotesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-description">{notes.length} notes · stay on top of every conversation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> New Note
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search notes..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Filter className="h-4 w-4" />Filter</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {notes.map((n) => (
          <div key={n.id} className="rounded-xl border border-border bg-card p-5 hover:border-[hsl(246,80%,60%)]/30 transition-colors group">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[hsl(246,80%,60%)] shrink-0" />
                <p className="font-semibold text-foreground text-sm">{n.title}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded hover:bg-muted"><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                <button className="p-1 rounded hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{n.preview}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {n.tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)] text-xs rounded-full">
                  <Tag className="h-2.5 w-2.5" />{t}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
              <span>Contact: <span className="text-foreground font-medium">{n.contact}</span></span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{n.updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
