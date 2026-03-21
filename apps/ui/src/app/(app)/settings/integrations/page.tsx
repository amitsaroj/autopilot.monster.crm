import { Zap, Search, Check, ExternalLink, Settings, Star } from 'lucide-react';

const integrations = [
  { name: 'Gmail', desc: 'Sync emails with contacts and deals', logo: 'G', category: 'Email', connected: true },
  { name: 'Slack', desc: 'Get CRM notifications in Slack channels', logo: 'S', category: 'Messaging', connected: true },
  { name: 'Zapier', desc: 'Connect to 5000+ apps via Zapier', logo: 'Z', category: 'Automation', connected: false },
  { name: 'HubSpot', desc: 'Migrate and sync data from HubSpot', logo: 'H', category: 'CRM', connected: false },
  { name: 'Stripe', desc: 'Sync subscription and payment events', logo: 'St', category: 'Payments', connected: true },
  { name: 'Calendly', desc: 'Auto-create activities from bookings', logo: 'C', category: 'Scheduling', connected: false },
  { name: 'Twilio', desc: 'SMS and voice call integration', logo: 'T', category: 'Communications', connected: true },
  { name: 'Salesforce', desc: 'Two-way sync with Salesforce CRM', logo: 'SF', category: 'CRM', connected: false },
  { name: 'Google Sheets', desc: 'Export CRM data to Google Sheets live', logo: 'GS', category: 'Analytics', connected: false },
];

export default function SettingsIntegrationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-description">Connect third-party tools to AutopilotMonster</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search integrations..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <div className="ml-auto flex gap-2">
          {['All', 'Email', 'CRM', 'Messaging', 'Automation', 'Payments'].map((t, i) => (
            <button key={t} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${i === 0 ? 'bg-[hsl(246,80%,60%)] border-transparent text-white' : 'border-border hover:bg-muted text-muted-foreground'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {integrations.map((int) => (
          <div key={int.name} className={`rounded-xl border bg-card p-5 hover:border-[hsl(246,80%,60%)]/40 transition-colors ${int.connected ? 'border-green-500/20' : 'border-border'}`}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-foreground">{int.logo}</div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{int.name}</p>
                  <span className="text-xs text-muted-foreground">{int.category}</span>
                </div>
              </div>
              {int.connected && <span className="flex items-center gap-1 text-xs text-green-500 shrink-0"><Check className="h-3 w-3" />Connected</span>}
            </div>
            <p className="text-xs text-muted-foreground mb-4">{int.desc}</p>
            <div className="flex gap-2">
              {int.connected ? (
                <>
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs border border-border rounded-lg hover:bg-muted transition-colors"><Settings className="h-3.5 w-3.5" />Configure</button>
                  <button className="px-3 py-2 text-xs border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">Disconnect</button>
                </>
              ) : (
                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-[hsl(246,80%,60%)] text-white rounded-lg hover:bg-[hsl(246,80%,55%)] transition-colors"><Zap className="h-3.5 w-3.5" />Connect</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
