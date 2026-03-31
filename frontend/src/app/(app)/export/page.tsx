import { Download, FileDown, Database, Table, FileText, Archive, Clock, CheckCircle } from 'lucide-react';

const exports = [
  { name: 'contacts_export_oct2024.csv', entity: 'Contacts', records: 284, size: '42 KB', date: 'Oct 10, 2024', status: 'Ready' },
  { name: 'deals_q3_2024.xlsx', entity: 'Deals', records: 48, size: '18 KB', date: 'Sep 30, 2024', status: 'Ready' },
  { name: 'full_crm_backup_sep2024.json', entity: 'All Data', records: 1240, size: '2.1 MB', date: 'Sep 1, 2024', status: 'Ready' },
];

export default function ExportGlobalPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-title">Export Data</h1>
        <p className="page-description">Download workspace data for backup or analysis</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'CSV Export', desc: 'Contacts, Leads, Deals, Activities', icon: Table, format: '.csv' },
          { label: 'Excel Export', desc: 'Multi-sheet workbook for all modules', icon: FileText, format: '.xlsx' },
          { label: 'Full Backup', desc: 'Complete JSON dump of all workspace data', icon: Archive, format: '.json' },
        ].map((e) => (
          <div key={e.label} className="rounded-xl border border-border bg-card p-5 hover:border-[hsl(246,80%,60%)]/40 transition-colors cursor-pointer group">
            <div className="p-3 rounded-xl bg-[hsl(246,80%,60%)]/10 w-fit mb-3"><e.icon className="h-6 w-6 text-[hsl(246,80%,60%)]" /></div>
            <p className="font-semibold text-foreground">{e.label}</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">{e.desc}</p>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{e.format}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold">Custom Export</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Data Type</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">
              {['Contacts', 'Leads', 'Companies', 'Deals', 'Activities', 'All Data'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Format</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">
              {['CSV', 'Excel (.xlsx)', 'JSON'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Date Range From</label>
            <input type="date" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Date Range To</label>
            <input type="date" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Download className="h-4 w-4" /> Generate Export
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h2 className="text-sm font-semibold">Recent Exports</h2></div>
        <div className="divide-y divide-border">
          {exports.map((e) => (
            <div key={e.name} className="flex items-center gap-4 px-5 py-4">
              <FileDown className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{e.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{e.entity} · {e.records.toLocaleString()} records · {e.size} · {e.date}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle className="h-3 w-3" />{e.status}</span>
              <button className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"><Download className="h-3.5 w-3.5 text-muted-foreground" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
