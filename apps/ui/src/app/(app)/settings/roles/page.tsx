import { Shield, Plus, Search, Edit, Trash2, Check, Lock } from 'lucide-react';
import Link from 'next/link';

const roles = [
  { name: 'Super Admin', users: 1, desc: 'Full access to all modules, settings and billing', perms: ['All permissions'], builtin: true },
  { name: 'Admin', users: 2, desc: 'Full access except billing and super-admin settings', perms: ['Manage users', 'View all data', 'Configure modules'], builtin: true },
  { name: 'Sales Manager', users: 1, desc: 'Manage team pipeline, reports, and assign leads', perms: ['View all CRM', 'Assign leads', 'View reports'], builtin: false },
  { name: 'Sales Rep', users: 6, desc: 'Access own leads, deals, calls and contacts only', perms: ['Own contacts', 'Own deals', 'Log activities'], builtin: false },
  { name: 'Support Agent', users: 3, desc: 'Inbox conversations, contact view, no CRM edit', perms: ['View contacts', 'Reply inbox', 'Log notes'], builtin: false },
];

export default function SettingsRolesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Roles & Permissions</h1>
          <p className="page-description">5 roles · Define what each role can access</p>
        </div>
        <Link href="/settings/roles/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" /> New Role
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Search roles..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
      </div>

      <div className="space-y-3">
        {roles.map((r) => (
          <div key={r.name} className="rounded-xl border border-border bg-card p-5 hover:border-[hsl(246,80%,60%)]/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-[hsl(246,80%,60%)]/10 shrink-0">
                  {r.builtin ? <Lock className="h-4 w-4 text-[hsl(246,80%,60%)]" /> : <Shield className="h-4 w-4 text-[hsl(246,80%,60%)]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{r.name}</p>
                    {r.builtin && <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded">Built-in</span>}
                    <span className="text-xs text-muted-foreground">{r.users} {r.users === 1 ? 'user' : 'users'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {r.perms.map((p) => (
                      <span key={p} className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full">
                        <Check className="h-2.5 w-2.5" />{p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!r.builtin && (
                  <>
                    <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button className="p-2 rounded-lg border border-border hover:bg-red-500/10 hover:border-red-500/30 transition-colors"><Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
