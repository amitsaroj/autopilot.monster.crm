'use client';

import { useState, useEffect } from 'react';
import { adminInternalService } from '@/services/admin-internal.service';

export default function AdminInternalPage() {
  const [health, setHealth] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [hRes, dRes] = await Promise.all([
        adminInternalService.getSystemHealth(),
        adminInternalService.getDbStatus()
      ]);
      setHealth(hRes.data);
      setDbStatus(dRes.data);
    } catch (error) {
      console.error('Failed to load internal data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin / Core Infrastructure Blueprint</h1>
        <button 
          onClick={loadData}
          className="bg-black text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
        >
          RE-SYNC MONITOR
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Syncing core manifold...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 max-w-[120rem]">
           <div className="xl:col-span-2 space-y-10">
              <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                 <h2 className="text-xl font-black text-gray-900 mb-10 relative z-10 flex items-center gap-3">
                    System Vitals
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                       <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Core Uptime</div>
                       <div className="text-2xl font-black text-gray-900">{Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</div>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                       <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Memory Resident</div>
                       <div className="text-2xl font-black text-gray-900">{Math.round(health.memoryUsage.rss / 1024 / 1024)} MB</div>
                    </div>
                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                       <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Node Runtime</div>
                       <div className="text-2xl font-black text-gray-900">{health.nodeVersion}</div>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
                 <h2 className="text-xl font-black text-gray-900 mb-10">Database Manifold Status</h2>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                       <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Active Connection</div>
                       <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${dbStatus.isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {dbStatus.isConnected ? 'SECURED' : 'DISCONNECTED'}
                       </span>
                    </div>
                    <div className="grid grid-cols-2 gap-6 font-mono text-[11px] p-8 border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                       <div className="flex justify-between">
                          <span className="text-gray-400 uppercase">Provider</span>
                          <span className="text-gray-900 font-bold uppercase">{dbStatus.type}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-gray-400 uppercase">Catalog</span>
                          <span className="text-gray-900 font-bold">{dbStatus.database}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-gray-400 uppercase">Schema</span>
                          <span className="text-gray-900 font-bold">{dbStatus.schema}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-gray-400 uppercase">Entity Metadatas</span>
                          <span className="text-gray-900 font-bold">{dbStatus.entitiesCount}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 p-12 rounded-[4.5rem] text-white flex flex-col justify-between overflow-hidden relative">
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
              <div>
                 <h2 className="text-xl font-black mb-10">Infrastructure Insight</h2>
                 <div className="space-y-8">
                    <div className="group">
                       <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Platform Architecture</div>
                       <div className="text-4xl font-black group-hover:text-green-400 transition-colors uppercase">{health.platform}-{health.arch}</div>
                    </div>
                    <div className="h-px bg-white/5 w-full"></div>
                    <div>
                       <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Isolation Context</div>
                       <div className="text-sm font-bold text-gray-400 italic leading-relaxed uppercase">
                          System operating in high-availability mode. All core services are reporting optimal latency within the defined threshold.
                       </div>
                    </div>
                 </div>
              </div>
              <div className="mt-20">
                 <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center gap-6">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">Heartbeat Persistent</span>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
