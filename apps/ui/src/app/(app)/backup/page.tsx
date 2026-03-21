import { Archive, Plus, Save, RefreshCw, Download, Clock, CheckCircle, Database, HardDrive, Shield } from 'lucide-react';

const backups = [
  { id: 1, name: 'Auto Backup — Oct 15, 2024', type: 'Automatic', size: '18.4 MB', status: 'Complete', created: 'Oct 15, 2024 02:00 AM' },
  { id: 2, name: 'Manual Backup — Oct 10', type: 'Manual', size: '17.8 MB', status: 'Complete', created: 'Oct 10, 2024 10:32 AM' },
  { id: 3, name: 'Auto Backup — Oct 8, 2024', type: 'Automatic', size: '17.2 MB', status: 'Complete', created: 'Oct 8, 2024 02:00 AM' },
];

export default function BackupPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">Backup & Restore</h1>
          <p className="page-description">Create backups and restore previous workspace snapshots</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> Create Backup Now
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Backups', value: '3', icon: Archive, color: 'text-blue-400' },
          { label: 'Total Size', value: '53.4 MB', icon: HardDrive, color: 'text-purple-400' },
          { label: 'Next Auto', value: 'Oct 16, 2am', icon: Clock, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-lg font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><RefreshCw className="h-4 w-4 text-[hsl(246,80%,60%)]" />Auto-Backup Schedule</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Frequency</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">
              {['Daily at 2:00 AM', 'Twice daily', 'Weekly (Sunday 2am)', 'Monthly'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Retention</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">
              {['7 days', '14 days', '30 days', '90 days'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm transition-colors"><Save className="h-4 w-4" />Save Schedule</button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h2 className="text-sm font-semibold">Backup History</h2></div>
        <div className="divide-y divide-border">
          {backups.map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-5 py-4">
              <div className="p-2 rounded-lg bg-muted shrink-0"><Database className="h-4 w-4 text-muted-foreground" /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{b.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{b.type} · {b.size} · {b.created}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle className="h-3 w-3" />{b.status}</span>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors"><RefreshCw className="h-3 w-3" />Restore</button>
                <button className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"><Download className="h-3.5 w-3.5 text-muted-foreground" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
        <Shield className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-600 dark:text-yellow-400">Restoring a backup will overwrite your current data. This action cannot be undone. Download a fresh backup before restoring.</p>
      </div>
    </div>
  );
}
