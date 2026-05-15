"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Phone, 
  ArrowLeft, 
  Play, 
  Pause, 
  Clock, 
  Calendar, 
  User, 
  Download, 
  MessageSquare,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api/client';
import { format } from 'date-fns';

interface CallDetail {
  id: string;
  sid: string;
  from: string;
  to: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  durationSeconds: number;
  recordingUrl?: string;
  transcript?: string;
  createdAt: string;
}

export default function CallDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [call, setCall] = useState<CallDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const fetchCall = async () => {
      try {
        const response = await api.get(`/v1/voice/calls/${id}`);
        setCall(response.data.data || response.data); // Handle both wrapped and unwrapped
      } catch (err) {
        console.error('Failed to fetch call', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCall();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[hsl(246,80%,60%)]" />
        <p className="text-muted-foreground animate-pulse font-medium">Retrieving call data...</p>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Call not found</h2>
        <button onClick={() => router.back()} className="text-[hsl(246,80%,60%)] font-bold">Return to Voice Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-muted transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              Call Session
              <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded uppercase tracking-widest text-muted-foreground">
                #{call.sid.substring(0, 8)}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(call.createdAt), 'MMMM do, yyyy · HH:mm')}
            </p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${
          call.status === 'completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
        }`}>
          {call.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recording & Info */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(246,80%,60%)]/5 blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-tighter text-muted-foreground">Recording</h3>
              <Download className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
              <button 
                onClick={() => setPlaying(!playing)}
                className="w-20 h-20 rounded-full bg-[hsl(246,80%,60%)] text-white flex items-center justify-center shadow-2xl shadow-[hsl(246,80%,60%)]/30 hover:scale-105 transition-transform active:scale-95"
              >
                {playing ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 translate-x-1" />}
              </button>
              <div className="text-center">
                <div className="text-2xl font-black">0:00 / {Math.floor(call.durationSeconds / 60)}:{(call.durationSeconds % 60).toString().padStart(2, '0')}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Audio Stream Playback</div>
              </div>
            </div>

            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-[hsl(246,80%,60%)] rounded-full" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-md space-y-6">
            <h3 className="text-sm font-black uppercase tracking-tighter text-muted-foreground">Session Metadata</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">To (Lead)</div>
                  <div className="text-sm font-bold">{call.to}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">From (Agent)</div>
                  <div className="text-sm font-bold">{call.from}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration</div>
                  <div className="text-sm font-bold">{call.durationSeconds} seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transcript */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-border bg-card min-h-[600px] flex flex-col shadow-xl overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[hsl(246,80%,60%)]" />
                <h3 className="text-lg font-bold">Full Transcript</h3>
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                AI Generated
              </div>
            </div>
            <div className="flex-1 p-8 space-y-8 overflow-y-auto">
              {!call.transcript ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <p className="text-sm font-bold uppercase tracking-widest">Analyzing audio data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {call.transcript.split('\n').map((line, idx) => {
                    const isAi = line.startsWith('AI:');
                    const content = line.replace(/^(AI|User): /, '');
                    if (!content) return null;
                    return (
                      <div key={idx} className={`flex gap-4 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAi ? 'bg-[hsl(246,80%,60%)] text-white' : 'bg-muted text-muted-foreground'}`}>
                          {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${isAi ? 'bg-muted/50 rounded-tl-none' : 'bg-[hsl(246,80%,60%)]/5 text-foreground rounded-tr-none border border-[hsl(246,80%,60%)]/10'}`}>
                          <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">
                            {isAi ? 'AI Agent' : 'Customer'}
                          </div>
                          <p className="text-sm leading-relaxed">{content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bot(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
