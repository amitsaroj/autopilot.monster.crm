'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { voiceCallService, VoiceCall } from '@/services/voice-call.service';

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function VoicePage() {
  const router = useRouter();
  const [calls, setCalls] = useState<VoiceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialNumber, setDialNumber] = useState('');
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    void voiceCallService
      .list()
      .then((res) => setCalls((res.data.data ?? []).slice(0, 5)))
      .catch(() => toast.error('Failed to load recent calls'))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickCall = async () => {
    if (!dialNumber.trim()) {
      toast.error('Enter a phone number');
      return;
    }
    setCalling(true);
    try {
      const res = await voiceCallService.initiate({ to: dialNumber.trim() });
      toast.success('Call initiated');
      router.push(`/voice/calls/${res.data.data.id}`);
    } catch {
      toast.error('Failed to initiate call');
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Voice</h1>
          <p className="page-description">AI-powered calling with auto-recording and transcription</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/voice/campaigns"
            className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Campaigns
          </Link>
          <Link
            href="/voice/calls/new"
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Phone className="h-4 w-4" /> New Call
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold mb-4">Quick Dial</h2>
          <div className="flex items-center gap-2 mb-4">
            <input
              value={dialNumber}
              onChange={(e) => setDialNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleQuickCall()}
            disabled={calling}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {calling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
            Call
          </button>
        </div>

        <div className="col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Calls</h2>
            <Link href="/voice/calls" className="text-xs text-[hsl(246,80%,60%)] hover:underline">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : calls.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No calls yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {calls.map((call) => {
                  const Icon =
                    call.direction === 'INBOUND'
                      ? PhoneIncoming
                      : ['NO-ANSWER', 'BUSY', 'FAILED'].includes(call.status)
                        ? PhoneMissed
                        : PhoneOutgoing;
                  const iconClass =
                    call.direction === 'INBOUND'
                      ? 'text-green-500'
                      : ['NO-ANSWER', 'BUSY', 'FAILED'].includes(call.status)
                        ? 'text-red-500'
                        : 'text-blue-400';

                  return (
                    <tr key={call.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Icon className={`h-4 w-4 ${iconClass}`} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/voice/calls/${call.id}`}
                          className="font-medium text-foreground hover:text-[hsl(246,80%,60%)]"
                        >
                          {call.from} → {call.to}
                        </Link>
                        <p className="text-xs text-muted-foreground">{call.status}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDuration(call.durationSeconds)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(call.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
