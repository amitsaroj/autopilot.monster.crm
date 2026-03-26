'use client';

import { useState, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Search, 
  Filter, 
  Clock,
  Activity,
  Cpu,
  Zap,
  ShieldAlert,
  Terminal,
  Send,
  Trash2,
  Play
} from 'lucide-react';
import { adminDebugService } from '@/services/admin-debug.service';

export default function SuperAdminTerminalPage() {
  const [history, setHistory] = useState<string[]>([
    '>> Autopilot Monster CNS v4.0.2 Initialized',
    '>> Connecting to Root Cluster... OK',
    '>> Authenticating Node Operator... Master Access Granted',
    '>> Type "help" for a list of available protocols.'
  ]);
  const [input, setInput] = useState('');

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;

    const newHistory = [...history, `> ${input}`];
    
    // Mock command responses
    if (input === 'help') {
       newHistory.push('>> Available Protocols: health, flush-cache, rotate-keys, lockdown, debug-logs');
    } else if (input === 'lockdown') {
       newHistory.push('>> !! WARNING: SEGMENTING INGRESS VECTORS... DONE');
    } else {
       newHistory.push(`>> Executing [${input}]... Command unrecognized or insufficient permissions in this shell.`);
    }

    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="page-header border-b border-border/10 pb-6">
        <div>
          <h1 className="page-title font-black text-3xl tracking-tighter text-foreground">Kernel Terminal</h1>
          <p className="page-description text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">SuperAdmin / High-Priority Low-Level Access</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest text-foreground">Root Execution Mode</span>
           </div>
        </div>
      </div>

      {/* Terminal Interface */}
      <div className="bg-[#0A0A0A] rounded-[2.5rem] border border-white/5 shadow-2xl p-10 font-mono relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-20 group-hover:opacity-100 transition-opacity" />
         
         <div className="h-[500px] overflow-y-auto space-y-2 mb-8 pr-4 custom-scrollbar">
            {history.map((line, i) => (
               <p key={i} className={`text-[12px] tracking-tight ${line.startsWith('>>') ? 'text-brand' : line.includes('!!') ? 'text-red-500' : 'text-gray-400'}`}>
                  {line}
               </p>
            ))}
         </div>

         <form onSubmit={handleCommand} className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-brand font-black">{'>'}</div>
            <input 
               type="text" 
               className="w-full bg-transparent border-b border-white/10 pl-6 pr-12 py-4 outline-none text-[12px] text-white focus:border-brand/40 transition-all font-mono"
               placeholder="Awaiting instruction..."
               autoFocus
               value={input}
               onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-brand transition-colors">
               <Send className="h-4 w-4" />
            </button>
         </form>
      </div>

      {/* Quick Ops */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-card/20 backdrop-blur-xl border border-border/30 rounded-3xl flex items-center justify-between group hover:border-brand/40 transition-all">
            <div className="flex items-center gap-4">
               <RefreshCw className="h-5 w-5 text-brand" />
               <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Flush Globals</span>
            </div>
            <Play className="h-4 w-4 text-muted-foreground group-hover:text-brand cursor-pointer" />
         </div>
         <div className="p-6 bg-card/20 backdrop-blur-xl border border-border/30 rounded-3xl flex items-center justify-between group hover:border-brand/40 transition-all">
            <div className="flex items-center gap-4">
               <Trash2 className="h-5 w-5 text-orange-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Evict Sessions</span>
            </div>
            <Play className="h-4 w-4 text-muted-foreground group-hover:text-brand cursor-pointer" />
         </div>
         <div className="p-6 bg-card/20 backdrop-blur-xl border border-border/30 rounded-3xl flex items-center justify-between group hover:border-brand/40 transition-all">
            <div className="flex items-center gap-4">
               <Zap className="h-5 w-5 text-purple-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Hot-Swap ENV</span>
            </div>
            <Play className="h-4 w-4 text-muted-foreground group-hover:text-brand cursor-pointer" />
         </div>
      </div>
    </div>
  );
}
