import { Save, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function NewLeadPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/crm/leads" className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="page-title mb-0">New Lead</h1>
          <p className="text-xs text-muted-foreground">Capture a new inbound or outbound lead</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[hsl(246,80%,60%)]" />Lead Details</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'First Name *', placeholder: 'John' },
            { label: 'Last Name *', placeholder: 'Doe' },
            { label: 'Email *', placeholder: 'autopilot.monster@gmail.com', type: 'email' },
            { label: 'Phone', placeholder: '+1 555-000-1111', type: 'tel' },
            { label: 'Company', placeholder: 'Company Inc' },
            { label: 'Job Title', placeholder: 'VP of Sales' },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
              <input type={f.type || 'text'} placeholder={f.placeholder} className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Lead Source</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">
              {['Website', 'LinkedIn', 'Referral', 'Cold Outreach', 'Event', 'Partner'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">
              {['New', 'Contacted', 'Qualified', 'Nurturing', 'Unqualified'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Priority</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">
              {['High', 'Medium', 'Low'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Assign To</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">
              {['Amit Saroj', 'Priya Sharma', 'Alex Kim', 'Sarah Lee'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-muted-foreground block mb-1">Notes</label>
            <textarea rows={3} placeholder="Initial notes about this lead..." className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)] resize-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Save className="h-4 w-4" />Create Lead</button>
        <Link href="/crm/leads" className="px-4 py-2.5 border border-border text-sm rounded-lg hover:bg-muted transition-colors">Cancel</Link>
      </div>
    </div>
  );
}
