import { Save, ArrowLeft, User, Mail, Phone, Building2, Tag } from 'lucide-react';
import Link from 'next/link';

export default function NewContactPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/crm/contacts" className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="page-title mb-0">New Contact</h1>
          <p className="text-xs text-muted-foreground">Add a new CRM contact</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4 text-[hsl(246,80%,60%)]" />Personal Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">First Name *</label>
            <input placeholder="Sarah" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Last Name *</label>
            <input placeholder="Johnson" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Email *</label>
            <input type="email" placeholder="autopilot.monster@gmail.com" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Phone</label>
            <input type="tel" placeholder="+1 555-234-5678" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Job Title</label>
            <input placeholder="CTO" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Department</label>
            <input placeholder="Engineering" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-[hsl(246,80%,60%)]" />Company</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-muted-foreground block mb-1">Company</label>
            <input placeholder="Search or create company..." className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Lead Source</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">
              {['Website', 'LinkedIn', 'Referral', 'Cold Outreach', 'Event', 'Partner', 'Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Owner</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">
              {['Amit Saroj', 'Priya Sharma', 'Alex Kim', 'Sarah Lee'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Save className="h-4 w-4" />Create Contact</button>
        <Link href="/crm/contacts" className="px-4 py-2.5 border border-border text-sm rounded-lg hover:bg-muted transition-colors">Cancel</Link>
      </div>
    </div>
  );
}
