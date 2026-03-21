import { Plus, Zap, Play, Pause, MoreHorizontal, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

const workflows = [
  { name: 'Lead Nurture Sequence', trigger: 'Contact Created', status: 'Active', runs: 1284, errors: 2, lastRun: '5 min ago' },
  { name: 'Deal Won → Invoice', trigger: 'Deal Stage Changed', status: 'Active', runs: 342, errors: 0, lastRun: '1 hour ago' },
  { name: 'Weekly Report Email', trigger: 'Schedule: Weekly', status: 'Active', runs: 48, errors: 0, lastRun: '2 days ago' },
  { name: 'Abandoned Chat Follow-up', trigger: 'Chat Abandoned', status: 'Paused', runs: 89, errors: 5, lastRun: '3 days ago' },
  { name: 'High Score Lead Alert', trigger: 'Lead Score > 80', status: 'Active', runs: 214, errors: 1, lastRun: '20 min ago' },
];

export default function WorkflowsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workflows</h1>
          <p className="page-description">Automate repetitive tasks and processes</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/workflows/templates" className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Browse Templates</Link>
          <Link href="/workflows/builder" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> New Workflow
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: 'Active Workflows', value: '4' }, { label: 'Runs Today', value: '847' }, { label: 'Errors (24h)', value: '8' }].map((s) => (
          <div key={s.label} className="stat-card text-center">
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Workflow</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trigger</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Runs</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Errors</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Run</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {workflows.map((w) => (
              <tr key={w.name} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[hsl(246,80%,60%)]/10">
                      <Zap className="h-3.5 w-3.5 text-[hsl(246,80%,60%)]" />
                    </div>
                    <Link href="/workflows/1" className="font-medium hover:text-[hsl(246,80%,60%)]">{w.name}</Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{w.trigger}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${w.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                    {w.status === 'Active' ? <CheckCircle className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                    {w.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{w.runs.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {w.errors > 0 ? (
                    <span className="flex items-center gap-1 text-red-500 text-xs"><AlertCircle className="h-3 w-3" />{w.errors}</span>
                  ) : (
                    <span className="text-green-500 text-xs">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{w.lastRun}</td>
                <td className="px-4 py-3">
                  <button className="p-1 rounded hover:bg-muted transition-colors"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
