import { Activity, Phone, Mail, MessageSquare, Calendar, FileText, Plus, Filter, Search } from 'lucide-react';
import Link from 'next/link';

const activities = [
  { id: 1, type: 'call', icon: Phone, color: 'bg-green-500/10 text-green-500', title: 'Outbound Call — Sarah Johnson (TechCorp)', duration: '24 min', summary: 'Discussed Q4 pricing. Sarah wants to see the enterprise package. Follow up with proposal by Friday.', user: 'You', time: '2h ago', contact: 'Sarah Johnson' },
  { id: 2, type: 'email', icon: Mail, color: 'bg-blue-500/10 text-blue-400', title: 'Email sent — Contract for GlobalManufacturing', summary: 'Sent NDAs and MSA for review. Awaiting legal team sign-off.', user: 'You', time: '4h ago', contact: 'Mike Braun' },
  { id: 3, type: 'meeting', icon: Calendar, color: 'bg-purple-500/10 text-purple-400', title: 'Product Demo — Acme Solutions', duration: '45 min', summary: 'Showcased pipeline kanban and workflow automation. Team impressed. Next step: POC approval.', user: 'Alex Kim', time: '1d ago', contact: 'Emily Davis' },
  { id: 4, type: 'note', icon: FileText, color: 'bg-yellow-500/10 text-yellow-500', title: 'Note — StartupXYZ Onboarding', summary: 'CTO prefers API-first approach. Need to share integration docs before next call.', user: 'You', time: '1d ago', contact: 'Raj Patel' },
  { id: 5, type: 'message', icon: MessageSquare, color: 'bg-orange-500/10 text-orange-400', title: 'WhatsApp — HealthFirst', summary: 'Client confirmed meeting for next Tuesday at 3pm IST.', user: 'You', time: '2d ago', contact: 'Dr. Priya Nath' },
];

export default function ActivitiesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activities</h1>
          <p className="page-description">All calls, emails, meetings, notes · last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Filter className="h-4 w-4" />Filter</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> Log Activity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Calls', value: '48', icon: Phone, color: 'text-green-400' },
          { label: 'Emails', value: '124', icon: Mail, color: 'text-blue-400' },
          { label: 'Meetings', value: '18', icon: Calendar, color: 'text-purple-400' },
          { label: 'Notes', value: '36', icon: FileText, color: 'text-yellow-400' },
          { label: 'Messages', value: '82', icon: MessageSquare, color: 'text-orange-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card text-center">
            <div className={`mx-auto mb-2 p-3 rounded-full bg-muted w-fit ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search activities..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <div className="ml-auto flex gap-2">
          {['All', 'Calls', 'Emails', 'Meetings', 'Notes'].map((t, i) => (
            <button key={t} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${i === 0 ? 'bg-[hsl(246,80%,60%)] border-transparent text-white' : 'border-border hover:bg-muted text-muted-foreground'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {activities.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-5 hover:border-[hsl(246,80%,60%)]/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl shrink-0 ${a.color}`}><a.icon className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground text-sm">{a.title}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{a.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{a.summary}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>By <span className="text-foreground font-medium">{a.user}</span></span>
                  <span>Contact: <Link href="/crm/contacts/1" className="text-[hsl(246,80%,60%)] hover:underline">{a.contact}</Link></span>
                  {a.duration && <span>Duration: {a.duration}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
