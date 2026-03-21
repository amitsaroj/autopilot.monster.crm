import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Plus, Mic, Video, Users, Clock } from 'lucide-react';
import Link from 'next/link';

const calls = [
  { contact: 'Sarah Johnson', number: '+1 555-234-5678', type: 'outgoing', duration: '24m 12s', outcome: 'Interested', time: '2h ago' },
  { contact: 'Mike Chen', number: '+1 555-876-5432', type: 'incoming', duration: '8m 45s', outcome: 'Follow up', time: '4h ago' },
  { contact: 'Unknown', number: '+1 555-000-1122', type: 'missed', duration: '—', outcome: '—', time: '5h ago' },
  { contact: 'Emily Davis', number: '+1 555-345-6789', type: 'outgoing', duration: '41m 03s', outcome: 'Meeting booked', time: '1d ago' },
];

export default function VoicePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Voice</h1>
          <p className="page-description">AI-powered calling with auto-recording & transcription</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/voice/campaigns" className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Campaigns</Link>
          <Link href="/voice/calls/new" className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Phone className="h-4 w-4" /> New Call
          </Link>
        </div>
      </div>

      {/* Dialer card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Quick Dial</h2>
          <div className="flex items-center gap-2 mb-4">
            <input placeholder="+1 (555) 000-0000" className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['1','2','3','4','5','6','7','8','9','*','0','#'].map((d) => (
              <button key={d} className="py-3 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">{d}</button>
            ))}
          </div>
          <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
            <Phone className="h-4 w-4" /> Call
          </button>
        </div>

        <div className="col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Calls</h2>
            <Link href="/voice/calls" className="text-xs text-[hsl(246,80%,60%)] hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {calls.map((c, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    {c.type === 'incoming' ? <PhoneIncoming className="h-4 w-4 text-green-500" /> :
                     c.type === 'missed' ? <PhoneMissed className="h-4 w-4 text-red-500" /> :
                     <PhoneOutgoing className="h-4 w-4 text-blue-400" />}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.contact}</p>
                    <p className="text-xs text-muted-foreground">{c.number}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.duration}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.outcome === '—' ? 'text-muted-foreground' : 'bg-[hsl(246,80%,60%)]/10 text-[hsl(246,80%,60%)]'}`}>{c.outcome}</span></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
