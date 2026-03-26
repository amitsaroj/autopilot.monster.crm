'use client';

import { useState, useEffect } from 'react';
import { subAdminUsageService } from '@/services/sub-admin-usage.service';

export default function SubAdminUsagePage() {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await subAdminUsageService.getUsageSummary();
      setUsage(response.data);
    } catch (error) {
       console.error('Failed to load usage data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-gray-400 font-black animate-pulse uppercase tracking-[0.3em]">Calibrating usage sensors...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-10 uppercase tracking-widest text-gray-900">SubAdmin / Resource Consumption Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-[120rem]">
         <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm group hover:border-black transition-all">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">AI Token Pulse</h3>
            <div className="text-4xl font-black text-gray-900 mb-2">{usage.aiTokens.toLocaleString()}</div>
            <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
               <div className="h-full bg-black" style={{ width: '45%' }}></div>
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">
               <span>45% Allocated</span>
               <span>500k Limit</span>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm group hover:border-black transition-all">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">SMS Transmission</h3>
            <div className="text-4xl font-black text-gray-900 mb-2">{usage.smsCount.toLocaleString()}</div>
            <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
               <div className="h-full bg-black" style={{ width: '12%' }}></div>
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">
               <span>12% Allocated</span>
               <span>10k Limit</span>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm group hover:border-black transition-all">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Voice Manifold</h3>
            <div className="text-4xl font-black text-gray-900 mb-2">{usage.voiceMinutes.toLocaleString()} m</div>
            <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
               <div className="h-full bg-black" style={{ width: '68%' }}></div>
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">
               <span>68% Allocated</span>
               <span>1k Limit</span>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm group hover:border-black transition-all">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Cloud Storage</h3>
            <div className="text-4xl font-black text-gray-900 mb-2">{(usage.storageBytes / 1024 / 1024 / 1024).toFixed(2)} GB</div>
            <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
               <div className="h-full bg-black" style={{ width: '85%' }}></div>
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">
               <span>85% Allocated</span>
               <span>10 GB Limit</span>
            </div>
         </div>
      </div>

      <div className="mt-10 bg-gray-900 p-12 rounded-[4rem] text-white overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/[0.03] rounded-full blur-3xl -mr-40 -mt-40 group-hover:bg-white/[0.05] transition-all duration-1000"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div>
               <h2 className="text-2xl font-black mb-4 uppercase tracking-widest">Efficiency Insight</h2>
               <p className="text-sm font-medium text-gray-400 max-w-2xl leading-relaxed">
                  Your current operational intensity is optimal. Resource consumption patterns suggest a {usage.aiTokens > 100000 ? 'high' : 'stable'} dependency on AI vectors. Consider scaling your cloud storage manifold as you approach the 90% threshold.
               </p>
            </div>
            <button className="bg-white text-black px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap hover:scale-105 transition-all shadow-2xl shadow-white/5">
               Request Quota Boost
            </button>
         </div>
      </div>
    </div>
  );
}
