'use client';

import { useState, useEffect } from 'react';
import { adminEnvironmentService } from '@/services/admin-environment.service';

export default function AdminEnvironmentPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnv();
  }, []);

  const loadEnv = async () => {
    try {
      const response = await adminEnvironmentService.getEnv();
      setData(response.data);
    } catch (error) {
      console.error('Failed to load environment data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Local Environment Visibility</h1>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Scanning system parameters...</div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black text-blue-500 uppercase mb-2">Node.js Engine</div>
              <div className="text-2xl font-black text-gray-900">{data.nodeVersion}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black text-green-500 uppercase mb-2">Host Platform</div>
              <div className="text-2xl font-black text-gray-900 uppercase">{data.platform}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black text-purple-500 uppercase mb-2">Process Uptime</div>
              <div className="text-2xl font-black text-gray-900">{Math.floor(data.uptime / 3600)}h {Math.floor((data.uptime % 3600) / 60)}m</div>
            </div>
          </div>

          <div className="bg-black p-10 rounded-[3rem] text-white">
            <h2 className="text-lg font-black mb-6 flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
              Redacted Environment Manifest
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
              {Object.entries(data.env).map(([key, value]) => (
                <div key={key} className="flex flex-col border-b border-white/10 pb-2">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest truncate">{key}</span>
                  <span className="text-xs font-mono text-blue-300 truncate">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-6">Memory Heap Profiler</h2>
            <div className="space-y-6">
              {Object.entries(data.memoryUsage).map(([key, value]: [string, any]) => {
                 const mb = Math.round(value / 1024 / 1024 * 100) / 100;
                 return (
                   <div key={key}>
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{key}</span>
                       <span className="text-xs font-black text-gray-900">{mb} MB</span>
                     </div>
                     <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (mb/1024)*100)}%` }}></div>
                     </div>
                   </div>
                 )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
