'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

import { voiceCallService } from '@/services/voice-call.service';

export default function NewVoiceCallPage() {
  const router = useRouter();
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await voiceCallService.initiate({ to });
      toast.success('Call initiated');
      router.push(`/voice/calls/${res.data.data.id}`);
    } catch {
      toast.error('Failed to initiate call');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <Link href="/voice/calls" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
        <ArrowLeft className="h-4 w-4" /> Back to Calls
      </Link>
      <h1 className="text-2xl font-bold">New Outbound Call</h1>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <label className="text-sm font-medium">Phone number (E.164)</label>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="+15551234567"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
          Start Call
        </button>
      </form>
    </div>
  );
}
