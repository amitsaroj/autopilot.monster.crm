import { Save, ArrowLeft, Building2, Globe, MapPin, Phone, Users } from 'lucide-react';
import Link from 'next/link';

export default function EditCompanyPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/crm/companies" className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="page-title mb-0">Edit Company</h1>
          <p className="text-xs text-muted-foreground">TechCorp Inc</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-[hsl(246,80%,60%)]" />Company Details</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Company Name', value: 'TechCorp Inc', span: true },
            { label: 'Domain', value: 'techcorp.com' },
            { label: 'Industry', value: 'SaaS' },
            { label: 'Company Size', value: '201-500' },
            { label: 'Annual Revenue', value: '$12M–$50M' },
            { label: 'Founded', value: '2014' },
          ].map((f) => (
            <div key={f.label} className={f.span ? 'col-span-2' : ''}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
              <input defaultValue={f.value} className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-[hsl(246,80%,60%)]" />Address</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Street', value: '415 Mission Street', span: true },
            { label: 'City', value: 'San Francisco' },
            { label: 'State', value: 'CA' },
            { label: 'Zip', value: '94105' },
            { label: 'Country', value: 'United States' },
          ].map((f) => (
            <div key={f.label} className={f.span ? 'col-span-2' : ''}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
              <input defaultValue={f.value} className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Save className="h-4 w-4" />Save Changes</button>
        <Link href="/crm/companies/1" className="px-4 py-2.5 border border-border text-sm rounded-lg hover:bg-muted transition-colors">Cancel</Link>
      </div>
    </div>
  );
}
