import { Building2, Globe, MapPin, Users, DollarSign, Phone, Mail, Edit, Plus, ExternalLink, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const contacts = [
  { name: 'Sarah Johnson', role: 'CTO', email: 'sarah@techcorp.com', phone: '+1 555-234-5678', status: 'Active' },
  { name: 'Mike Chen', role: 'VP Sales', email: 'mike@techcorp.com', phone: '+1 555-876-5432', status: 'Active' },
  { name: 'Emily Davis', role: 'Procurement', email: 'emily@techcorp.com', phone: '+1 555-345-6789', status: 'Active' },
];
const deals = [
  { name: 'Enterprise License', value: '$48,000', stage: 'Proposal', close: 'Oct 31' },
  { name: 'Support Package', value: '$12,000', stage: 'Closed Won', close: 'Done' },
];

export default function CompanyDetailPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(246,80%,60%)]/10 flex items-center justify-center text-2xl font-bold text-[hsl(246,80%,60%)]">T</div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">TechCorp Inc</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />techcorp.com</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />San Francisco, USA</span>
              <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">Customer</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/crm/companies/1/edit" className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <Edit className="h-4 w-4" /> Edit
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Add Deal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Company Info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold mb-4">Company Info</h2>
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Industry', value: 'SaaS / Software' },
                { label: 'Company Size', value: '201–500 employees' },
                { label: 'Founded', value: '2014' },
                { label: 'Annual Revenue', value: '$12M–$50M' },
                { label: 'HQ', value: 'San Francisco, CA' },
                { label: 'Phone', value: '+1 (415) 555-0100' },
                { label: 'LinkedIn', value: 'linkedin.com/company/techcorp' },
              ].map((f) => (
                <div key={f.label} className="flex items-start justify-between gap-2">
                  <dt className="text-muted-foreground shrink-0">{f.label}</dt>
                  <dd className="font-medium text-foreground text-right">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold mb-3">Key Metrics</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Open Deals', value: '2', icon: TrendingUp, color: 'text-blue-400' },
                { label: 'Revenue', value: '$60k', icon: DollarSign, color: 'text-green-400' },
                { label: 'Contacts', value: '3', icon: Users, color: 'text-purple-400' },
                { label: 'Activities', value: '28', icon: Phone, color: 'text-orange-400' },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tabs area */}
        <div className="col-span-2 space-y-4">
          {/* Contacts */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Contacts ({contacts.length})</h2>
              <Link href="/crm/contacts/new" className="text-xs text-[hsl(246,80%,60%)] hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Add Contact</Link>
            </div>
            <div className="divide-y divide-border">
              {contacts.map((c) => (
                <div key={c.name} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[hsl(246,80%,60%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(246,80%,60%)]">{c.name.split(' ').map(n => n[0]).join('')}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deals */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">Deals ({deals.length})</h2>
              <Link href="/crm/deals/new" className="text-xs text-[hsl(246,80%,60%)] hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Add Deal</Link>
            </div>
            <div className="divide-y divide-border">
              {deals.map((d) => (
                <div key={d.name} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">Close: {d.close}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.stage === 'Closed Won' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-400'}`}>{d.stage}</span>
                  <span className="text-sm font-bold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { action: 'Deal "Enterprise License" moved to Proposal', time: '2h ago', color: 'bg-blue-500' },
                { action: 'Sarah Johnson sent contract for review', time: '1d ago', color: 'bg-green-500' },
                { action: 'Call with Mike Chen — 24min', time: '2d ago', color: 'bg-purple-500' },
                { action: 'New contact Emily Davis added', time: '3d ago', color: 'bg-orange-500' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${a.color}`} />
                  <div>
                    <p className="text-sm text-foreground">{a.action}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
