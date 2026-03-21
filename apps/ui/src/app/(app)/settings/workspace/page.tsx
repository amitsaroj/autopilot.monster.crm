import { Building2, Save, Upload, Globe } from 'lucide-react';

const timezones = ['Asia/Kolkata (IST)', 'America/New_York (EST)', 'America/Los_Angeles (PST)', 'Europe/London (GMT)'];
const currencies = ['INR ₹', 'USD $', 'EUR €', 'GBP £'];

export default function SettingsWorkspacePage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">Workspace Settings</h1>
        <p className="page-description">Configure workspace name, branding, and regional settings</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Globe className="h-4 w-4 text-[hsl(246,80%,60%)]" />Branding</h2>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(246,80%,60%)] flex items-center justify-center text-2xl font-bold text-white">A</div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Logo appears on login, emails, exports.</p>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-[hsl(246,80%,60%)] text-white rounded-lg hover:bg-[hsl(246,80%,55%)] transition-colors"><Upload className="h-3.5 w-3.5" />Upload Logo</button>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Workspace Name</label>
          <input defaultValue="AutopilotMonster" className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Workspace Slug</label>
          <div className="flex">
            <span className="px-3 py-2 text-sm border border-r-0 border-input rounded-l-lg bg-muted text-muted-foreground">app.crm.com/</span>
            <input defaultValue="acme-corp" className="flex-1 px-3 py-2 text-sm border border-input rounded-r-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-[hsl(246,80%,60%)]" />Regional Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Timezone</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">{timezones.map(t => <option key={t}>{t}</option>)}</select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Currency</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]">{currencies.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Date Format</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none">{['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(d => <option key={d}>{d}</option>)}</select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Language</label>
            <select className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none">{['English (US)', 'हिन्दी', 'Arabic', 'French'].map(l => <option key={l}>{l}</option>)}</select>
          </div>
        </div>
      </div>
      <button className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
        <Save className="h-4 w-4" /> Save Settings
      </button>
    </div>
  );
}
