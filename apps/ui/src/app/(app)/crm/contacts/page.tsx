import { Plus, Search, Filter, Download, Upload, Tags, GitMerge } from 'lucide-react';
import Link from 'next/link';

const contacts = [
  { name: 'Sarah Johnson', email: 'sarah@techcorp.com', company: 'TechCorp', status: 'Active', deals: 3, lastContact: '2 hours ago' },
  { name: 'Mike Chen', email: 'mike@startupxyz.io', company: 'StartupXYZ', status: 'Active', deals: 1, lastContact: '1 day ago' },
  { name: 'Emily Davis', email: 'emily@enterprise.com', company: 'Enterprise Co', status: 'Inactive', deals: 0, lastContact: '2 weeks ago' },
  { name: 'James Wilson', email: 'james@scale.co', company: 'Scale.co', status: 'Active', deals: 5, lastContact: '3 hours ago' },
  { name: 'Anna Martinez', email: 'anna@global.io', company: 'Global Inc', status: 'Pending', deals: 2, lastContact: '5 days ago' },
];

export default function ContactsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-description">12,489 total contacts across all segments</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/crm/contacts/import" className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <Upload className="h-4 w-4" /> Import
          </Link>
          <Link href="/crm/contacts/export" className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Export
          </Link>
          <Link href="/crm/contacts/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Add Contact
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search contacts..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
          <Filter className="h-4 w-4" /> Filter
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
          <Tags className="h-4 w-4" /> Tags
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
          <GitMerge className="h-4 w-4" /> Merge
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8"><input type="checkbox" /></th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Deals</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contacts.map((c) => (
              <tr key={c.email} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3"><input type="checkbox" /></td>
                <td className="px-4 py-3">
                  <Link href={`/crm/contacts/1`} className="hover:text-[hsl(246,80%,60%)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(246,80%,60%)]">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.company}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                    c.status === 'Inactive' ? 'bg-muted text-muted-foreground' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.deals}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.lastContact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
