'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Phone, PhoneOff, Mic, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { voiceCallService, VoiceCall } from '@/services/voice-call.service';

export default function VoiceCallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [call, setCall] = useState<VoiceCall | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await voiceCallService.get(id);
      const nextCall = res.data.data;
      setCall(nextCall);
      if (nextCall.recordingUrl) {
        setRecordingUrl(nextCall.recordingUrl);
      } else {
        const recordingRes = await voiceCallService.getRecording(id);
        setRecordingUrl(recordingRes.data.data.url);
      }
    } catch {
      toast.error('Failed to load call');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const handleHangUp = async () => {
    try {
      await voiceCallService.hangUp(id);
      toast.success('Call ended');
      await load();
    } catch {
      toast.error('Failed to end call');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!call) {
    return <p className="py-8 text-center text-gray-500">Call not found.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Link href="/voice/calls" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
        <ArrowLeft className="h-4 w-4" /> Back to Calls
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">{call.from} → {call.to}</h1>
              <p className="text-sm text-gray-500">{call.direction} · {call.status}</p>
            </div>
          </div>
          {!['completed', 'COMPLETED', 'failed', 'FAILED'].includes(call.status) && (
            <button type="button" onClick={() => void handleHangUp()} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white">
              <PhoneOff className="h-4 w-4" /> Hang up
            </button>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Duration</dt><dd className="font-medium">{call.durationSeconds}s</dd></div>
          <div><dt className="text-gray-500">Cost</dt><dd className="font-medium">${Number(call.costAmount).toFixed(4)}</dd></div>
          <div><dt className="text-gray-500">Voice profile</dt><dd className="font-medium">{call.voiceProfile ?? 'default'}</dd></div>
          <div><dt className="text-gray-500">Sentiment</dt><dd className="font-medium">{call.sentiment ?? '—'}</dd></div>
          <div><dt className="text-gray-500">SID</dt><dd className="font-mono text-xs">{call.sid}</dd></div>
          <div><dt className="text-gray-500">Created</dt><dd className="font-medium">{new Date(call.createdAt).toLocaleString()}</dd></div>
        </dl>

        {recordingUrl && (
          <div className="mt-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Mic className="h-4 w-4" /> Recording
            </h2>
            <audio controls className="mt-2 w-full" src={recordingUrl}>
              <track kind="captions" />
            </audio>
          </div>
        )}

        {call.aiSummary && (
          <div className="mt-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Sparkles className="h-4 w-4" /> AI Summary
            </h2>
            <p className="mt-2 text-sm text-gray-600">{call.aiSummary}</p>
          </div>
        )}

        {call.transcript && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900">Transcript</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{call.transcript}</p>
          </div>
        )}
      </div>
    </div>
  );
}
