'use client';

import { useEffect, useState } from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Mic,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { voiceCallService, VoiceCall } from '@/services/voice-call.service';

const dirIcon = {
  OUTBOUND: PhoneOutgoing,
  INBOUND: PhoneIncoming,
} as const;

const dirColor = {
  OUTBOUND: 'text-blue-400',
  INBOUND: 'text-green-400',
} as const;

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function AllCallsPage() {
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    void voiceCallService
      .list()
      .then((res) => setCalls(res.data.data ?? []))
      .catch(() => toast.error('Failed to load calls'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = calls.filter((call) => {
    const haystack = `${call.from} ${call.to} ${call.status}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const inbound = calls.filter((call) => call.direction === 'INBOUND').length;
  const outbound = calls.filter((call) => call.direction === 'OUTBOUND').length;
  const missed = calls.filter((call) =>
    ['NO-ANSWER', 'BUSY', 'FAILED', 'CANCELED'].includes(call.status),
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Calls</h1>
          <p className="page-description">Full call history from your voice platform</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            href="/voice/calls/new"
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Phone className="h-4 w-4" />
            New Call
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Calls', value: String(calls.length), icon: Phone, color: 'text-blue-400' },
          { label: 'Inbound', value: String(inbound), icon: PhoneIncoming, color: 'text-green-400' },
          { label: 'Outbound', value: String(outbound), icon: PhoneOutgoing, color: 'text-[hsl(246,80%,60%)]' },
          { label: 'Missed', value: String(missed), icon: PhoneMissed, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-muted ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search calls..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
          />
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No calls found.</p>
        ) : (
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
              {filtered.map((call) => {
                const DirIco = dirIcon[call.direction] ?? PhoneOutgoing;
                return (
                  <tr key={call.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <Link
                            href={`/voice/calls/${call.id}`}
                            className="font-medium text-foreground hover:text-[hsl(246,80%,60%)]"
                          >
                            {call.direction === 'OUTBOUND' ? call.to : call.from}
                          </Link>
                          <p className="text-xs text-muted-foreground">{call.status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-medium ${dirColor[call.direction] ?? 'text-muted-foreground'}`}
                      >
                        <DirIco className="h-3.5 w-3.5" />
                        {call.direction.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {call.direction === 'OUTBOUND' ? call.to : call.from}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm text-foreground">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDuration(call.durationSeconds)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(call.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {call.recordingUrl && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs border border-border rounded-lg">
                          <Mic className="h-3 w-3 text-[hsl(246,80%,60%)]" />
                          Recording
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
