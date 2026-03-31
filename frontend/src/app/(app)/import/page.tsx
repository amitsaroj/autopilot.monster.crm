import { Upload, FileText, Link as LinkIcon, X, CheckCircle, AlertCircle, ChevronRight, Download } from 'lucide-react';

const recent = [
  { name: 'contacts_oct_2024.csv', records: 284, imported: 280, failed: 4, date: 'Oct 10, 2024' },
  { name: 'leads_q3.xlsx', records: 142, imported: 142, failed: 0, date: 'Sep 25, 2024' },
];

export default function ImportGlobalPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-title">Import Data</h1>
        <p className="page-description">Bulk import contacts, leads, companies, deals from CSV, Excel, or JSON</p>
      </div>

      {/* Entity selector */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">1. Choose data type</h2>
        <div className="grid grid-cols-3 gap-3">
          {['Contacts', 'Leads', 'Companies', 'Deals', 'Products', 'Tasks'].map((e, i) => (
            <button key={e} className={`p-4 rounded-xl border-2 text-sm font-medium transition-colors text-left ${i === 0 ? 'border-[hsl(246,80%,60%)] bg-[hsl(246,80%,60%)]/5 text-[hsl(246,80%,60%)]' : 'border-border hover:border-[hsl(246,80%,60%)]/40 text-muted-foreground hover:text-foreground'}`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* File upload */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold">2. Upload file</h2>
        <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-[hsl(246,80%,60%)]/40 transition-colors cursor-pointer">
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Drop your file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Supported: CSV, XLSX, JSON · Max 10 MB · 50,000 rows</p>
          <button className="mt-4 px-4 py-2 text-xs bg-[hsl(246,80%,60%)] text-white rounded-lg hover:bg-[hsl(246,80%,55%)] transition-colors">Browse Files</button>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a href="#" className="flex items-center gap-1 text-[hsl(246,80%,60%)] hover:underline"><Download className="h-3 w-3" />Download CSV Template</a>
          <span>·</span>
          <a href="#" className="flex items-center gap-1 text-[hsl(246,80%,60%)] hover:underline"><FileText className="h-3 w-3" />View Import Guide</a>
        </div>
      </div>

      {/* Field mapping tip */}
      <div className="rounded-xl border border-[hsl(246,80%,60%)]/20 bg-[hsl(246,80%,60%)]/5 p-4 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-[hsl(246,80%,60%)] shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Field Mapping</p>
          <p className="mt-0.5">After upload, you can map CSV columns to CRM fields and preview the import before confirming.</p>
        </div>
      </div>

      {/* Recent imports */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h2 className="text-sm font-semibold">Recent Imports</h2></div>
        <div className="divide-y divide-border">
          {recent.map((r) => (
            <div key={r.name} className="flex items-center gap-4 px-5 py-4">
              <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-green-500"><CheckCircle className="h-3 w-3" />{r.imported} imported</span>
                  {r.failed > 0 && <span className="flex items-center gap-1 text-red-400"><X className="h-3 w-3" />{r.failed} failed</span>}
                  <span>{r.date}</span>
                </div>
              </div>
              <button className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"><ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
