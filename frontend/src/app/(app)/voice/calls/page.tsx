import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, Filter, Download, Clock, User, Mic } from 'lucide-react';
import Link from 'next/link';

const calls = [
  { id: 1, contact: 'Sarah Johnson', company: 'TechCorp', number: '+1 555-234-5678', direction: 'outbound', duration: '24:18', status: 'completed', time: '2h ago', recording: true },
  { id: 2, contact: 'Mike Braun', company: 'GlobalManufacturing', number: '+49 30 1234567', direction: 'inbound', duration: '08:42', status: 'completed', time: '4h ago', recording: true },
  { id: 3, contact: 'Unknown', company: '', number: '+1 555-987-6543', direction: 'inbound', duration: '—', status: 'missed', time: '5h ago', recording: false },
  { id: 4, contact: 'Emily Davis', company: 'Acme Solutions', number: '+44 20 7890 1234', direction: 'outbound', duration: '42:05', status: 'completed', time: '1d ago', recording: true },
  { id: 5, contact: 'Raj Patel', company: 'StartupXYZ', number: '+91 98765 43210', direction: 'outbound', duration: '15:30', status: 'completed', time: '1d ago', recording: true },
];

const dirIcon: Record<string, typeof Phone> = { outbound: PhoneOutgoing, inbound: PhoneIncoming, missed: PhoneMissed };
const dirColor: Record<string, string> = { outbound: 'text-blue-400', inbound: 'text-green-400', missed: 'text-red-400' };

export default function AllCallsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Calls</h1>
          <p className="page-description">Full call history · last 30 days</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Download className="h-4 w-4" />Export</button>
          <Link href="/voice/calls/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"><Phone className="h-4 w-4" />New Call</Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Calls', value: '248', icon: Phone, color: 'text-blue-400' },
          { label: 'Inbound', value: '118', icon: PhoneIncoming, color: 'text-green-400' },
          { label: 'Outbound', value: '112', icon: PhoneOutgoing, color: 'text-[hsl(246,80%,60%)]' },
          { label: 'Missed', value: '18', icon: PhoneMissed, color: 'text-red-400' },
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
          <input placeholder="Search calls..." className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"><Filter className="h-4 w-4" />Filter</button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Direction</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Number</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Duration</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">When</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {calls.map((c) => {
              const DirIco = dirIcon[c.direction];
              return (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground"><User className="h-4 w-4" /></div>
                      <div>
                        <Link href={`/voice/calls/${c.id}`} className="font-medium text-foreground hover:text-[hsl(246,80%,60%)]">{c.contact}</Link>
                        {c.company && <p className="text-xs text-muted-foreground">{c.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${dirColor[c.direction]}`}>
                      <DirIco className="h-3.5 w-3.5" />{c.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.number}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm text-foreground"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{c.duration}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.time}</td>
                  <td className="px-4 py-3">
                    {c.recording && <button className="flex items-center gap-1 px-2 py-1 text-xs border border-border rounded-lg hover:bg-muted transition-colors"><Mic className="h-3 w-3 text-[hsl(246,80%,60%)]" />Recording</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
