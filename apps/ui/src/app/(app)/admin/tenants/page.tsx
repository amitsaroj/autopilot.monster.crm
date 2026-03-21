import { Plus, Building2, Users, Globe, Search, Filter, MoreHorizontal, CreditCard, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const tenants = [
  { id: 1, name: 'TechCorp Workspace', slug: 'techcorp', plan: 'Enterprise', users: 48, status: 'Active', mrr: '$960', created: 'Jan 2024' },
  { id: 2, name: 'Acme Corp', slug: 'acme', plan: 'Professional', users: 12, status: 'Active', mrr: '$240', created: 'Feb 2024' },
  { id: 3, name: 'StartupXYZ', slug: 'startupxyz', plan: 'Starter', users: 4, status: 'Trial', mrr: '$0', created: 'Mar 2024' },
  { id: 4, name: 'HealthFirst', slug: 'healthfirst', plan: 'Professional', users: 22, status: 'Active', mrr: '$440', created: 'Mar 2024' },
  { id: 5, name: 'OldBusiness Co', slug: 'oldbiz', plan: 'Starter', users: 2, status: 'Suspended', mrr: '$0', created: 'Dec 2023' },
];

const statusStyle: Record<string, string> = {
  Active: 'bg-green-500/10 text-green-500',
  Trial: 'bg-yellow-500/10 text-yellow-500',
  Suspended: 'bg-red-500/10 text-red-400',
};

export default function AdminTenantsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenants</h1>
          <p className="page-description">All workspace tenants · 5 total</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/tenants/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Plus className="h-4 w-4" />New Tenant</Link>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Tenants', value: '5', icon: Building2, color: 'text-blue-400' },
          { label: 'Active', value: '3', icon: TrendingUp, color: 'text-green-400' },
          { label: 'Total Users', value: '88', icon: Users, color: 'text-purple-400' },
          { label: 'MRR', value: '$1,640', icon: CreditCard, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search tenants..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Filter className="h-4 w-4" />Filter</button>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tenant</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Users</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">MRR</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(246,80%,60%)]/10 flex items-center justify-center text-xs font-bold text-[hsl(246,80%,60%)]">{t.name[0]}</div>
                    <div>
                      <Link href={`/admin/tenants/${t.id}`} className="font-medium text-foreground hover:text-[hsl(246,80%,60%)]">{t.name}</Link>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="h-2.5 w-2.5" />{t.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)] text-xs rounded-full font-medium">{t.plan}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{t.users}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{t.mrr}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[t.status]}`}>{t.status}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{t.created}</td>
                <td className="px-4 py-3"><button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
