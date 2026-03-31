'use client';

import { useState, useEffect } from 'react';
import { adminDebugService } from '@/services/admin-debug.service';

export default function AdminDebugPage() {
  const [env, setEnv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [operating, setOperating] = useState(false);

  useEffect(() => {
    loadEnv();
  }, []);

  const loadEnv = async () => {
    try {
      const response = await adminDebugService.getEnv();
      setEnv(response.data);
    } catch (error) {
      console.error('Failed to load environment', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Purge all Redis buffers? Performance may degrade temporarily.')) return;
    setOperating(true);
    try {
      await adminDebugService.clearCache();
      alert('System buffers invalidated.');
    } finally {
      setOperating(false);
    }
  };

  const handleSimulateError = async () => {
    setOperating(true);
    try {
      await adminDebugService.simulateError();
    } catch (error) {
      alert('Exception successfully induced in core manifold.');
    } finally {
      setOperating(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Admin / System Manifold Debug</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl">
         <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-8">Destructive Diagnostics</h2>
            <div className="space-y-6">
               <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100 flex items-center justify-between group">
                  <div>
                     <div className="text-sm font-black text-red-900 uppercase tracking-widest">Invalidate Global Cache</div>
                     <div className="text-[10px] text-red-400 font-bold uppercase mt-1">Flush all Redis memory keys</div>
                  </div>
                  <button 
                    onClick={handleClearCache}
                    disabled={operating}
                    className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-red-200"
                  >
                    PURGE
                  </button>
               </div>

               <div className="p-8 bg-orange-50 rounded-[2.5rem] border border-orange-100 flex items-center justify-between group">
                  <div>
                     <div className="text-sm font-black text-orange-900 uppercase tracking-widest">Induce Exception</div>
                     <div className="text-[10px] text-orange-400 font-bold uppercase mt-1">Test error logging pipeline</div>
                  </div>
                  <button 
                    onClick={handleSimulateError}
                    disabled={operating}
                    className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-orange-200"
                  >
                    TRIGGER
                  </button>
               </div>
            </div>
         </div>

         <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white">
            <h2 className="text-xl font-black mb-8 flex items-center gap-3">
               Environment Identity
               <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            </h2>
            {loading ? (
              <div className="font-mono text-gray-500 text-xs">Decrypting environment blueprint...</div>
            ) : (
              <div className="space-y-4 font-mono text-[11px]">
                 {Object.entries(env).map(([key, value]) => (
                   <div key={key} className="flex justify-between border-b border-white/5 py-2">
                      <span className="text-gray-500">{key}</span>
                      <span className={value === '********' ? 'text-gray-700' : 'text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]'}>{value as string}</span>
                   </div>
                 ))}
              </div>
            )}
            <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 italic text-[9px] font-bold text-gray-500 leading-relaxed uppercase tracking-[0.2em]">
               Sensitive descriptors are masked by default. Modification of core environment variables requires root access to the orchestration layer.
            </div>
         </div>
      </div>
    </div>
  );
}
