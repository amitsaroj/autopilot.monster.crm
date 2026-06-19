'use client';

import { useEffect, useState } from 'react';
import { Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { voiceTranscriptService, VoiceTranscript } from '@/services/voice-transcript.service';

export default function VoiceTranscriptsPage() {
  const [transcripts, setTranscripts] = useState<VoiceTranscript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await voiceTranscriptService.list();
        setTranscripts(res.data?.data ?? []);
      } catch {
        toast.error('Failed to load transcripts');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transcripts</h1>
          <p className="page-description">AI call transcriptions</p>
        </div>
        <Link href="/voice" className="text-sm text-[hsl(246,80%,60%)] hover:underline">
          Back to Voice
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : transcripts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transcripts available yet.</p>
      ) : (
        <div className="space-y-3">
          {transcripts.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">{item.from} → {item.to}</p>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                {item.transcript}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
