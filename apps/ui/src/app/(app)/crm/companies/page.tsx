import { Plus, Building2, Users, DollarSign, TrendingUp, Search, Filter, Download, Upload, MoreHorizontal, Globe, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

const companies = [
  { id: 1, name: 'TechCorp Inc', domain: 'techcorp.com', industry: 'SaaS', size: '201-500', contacts: 12, deals: 3, revenue: '$142k', status: 'Customer', country: 'USA' },
  { id: 2, name: 'GlobalManufacturing', domain: 'globalmanuf.com', industry: 'Manufacturing', size: '1001+', contacts: 8, deals: 1, revenue: '$89k', status: 'Customer', country: 'Germany' },
  { id: 3, name: 'Acme Solutions', domain: 'acmesolutions.io', industry: 'Consulting', size: '51-200', contacts: 5, deals: 2, revenue: '$34k', status: 'Prospect', country: 'UK' },
  { id: 4, name: 'StartupXYZ', domain: 'startupxyz.co', industry: 'FinTech', size: '1-50', contacts: 3, deals: 1, revenue: '$8k', status: 'Trial', country: 'India' },
  { id: 5, name: 'Retail Holdings', domain: 'retailholdings.com', industry: 'Retail', size: '501-1000', contacts: 9, deals: 0, revenue: '$0', status: 'Lead', country: 'USA' },
  { id: 6, name: 'HealthFirst', domain: 'healthfirst.org', industry: 'Healthcare', size: '201-500', contacts: 6, deals: 2, revenue: '$28k', status: 'Customer', country: 'Canada' },
];

const statusColors: Record<string, string> = {
  Customer: 'bg-green-500/10 text-green-500',
  Prospect: 'bg-blue-500/10 text-blue-400',
  Trial: 'bg-yellow-500/10 text-yellow-500',
  Lead: 'bg-purple-500/10 text-purple-400',
};

export default function CompaniesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="page-description">284 companies · $312k total pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Upload className="h-4 w-4" /> Import</button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Download className="h-4 w-4" /> Export</button>
          <Link href="/crm/companies/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> New Company
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Companies', value: '284', icon: Building2, color: 'text-blue-400' },
          { label: 'Customers', value: '142', icon: Users, color: 'text-green-400' },
          { label: 'Total Revenue', value: '$312k', icon: DollarSign, color: 'text-yellow-400' },
          { label: 'Avg Deal Size', value: '$18.2k', icon: TrendingUp, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search companies..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Filter className="h-4 w-4" /> Filter</button>
        <div className="ml-auto flex gap-2">
          {['All', 'Customer', 'Prospect', 'Trial', 'Lead'].map((t, i) => (
            <button key={t} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${i === 0 ? 'bg-[hsl(246,80%,60%)] border-transparent text-white' : 'border-border hover:bg-muted text-muted-foreground'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground"><input type="checkbox" /></th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Industry</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Size</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contacts</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deals</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Revenue</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3"><input type="checkbox" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{c.name[0]}</div>
                    <div>
                      <Link href={`/crm/companies/${c.id}`} className="font-medium text-foreground hover:text-[hsl(246,80%,60%)]">{c.name}</Link>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Globe className="h-2.5 w-2.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{c.domain}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.industry}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.size}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="h-3.5 w-3.5" />{c.contacts}</div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.deals}</td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">{c.revenue}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 rounded hover:bg-muted transition-colors"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing 6 of 284</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Previous</button>
            <button className="px-3 py-1.5 rounded-lg bg-[hsl(246,80%,60%)] text-white">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">2</button>
            <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
