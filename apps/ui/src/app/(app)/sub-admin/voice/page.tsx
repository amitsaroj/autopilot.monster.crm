'use client';

import { useState, useEffect } from 'react';
import { subAdminVoiceService } from '@/services/sub-admin-voice.service';

export default function SubAdminVoicePage() {
  const [numbers, setNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNumbers();
  }, []);

  const loadNumbers = async () => {
    try {
      const response = await subAdminVoiceService.getNumbers();
      setNumbers(response.data || []);
    } catch (error) {
       console.error('Failed to load voice numbers', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase tracking-widest">SubAdmin / VOIP Manifolds</h1>
        <button className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10">
           Provision New Vector
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[120rem]">
         {loading ? (
             <div className="col-span-3 p-20 text-center animate-pulse uppercase tracking-widest font-black text-gray-300">Syncing voice manifolds...</div>
         ) : numbers.map(num => (
            <div key={num.id} className="bg-white p-10 rounded-[4.5rem] border border-gray-100 shadow-sm relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-3 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-all"></div>
               <div className="flex justify-between items-start mb-10">
                  <div className="text-4xl">📞</div>
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">Active Line</span>
               </div>
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">+1 (888) {num.value || '555-0199'}</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-10">
                  Assigned Manifold: Customer Support Vector
               </p>
               <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                  <div className="space-y-1">
                     <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Inbound: <span className="text-green-500">NOMINAL</span></div>
                     <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Outbound: <span className="text-green-500">NOMINAL</span></div>
                  </div>
                  <button className="text-[10px] font-black text-gray-900 hover:scale-110 transition-transform uppercase tracking-widest">Edit Logic</button>
               </div>
            </div>
         ))}
         {!loading && numbers.length === 0 && (
            <div className="col-span-3 p-32 text-center border-2 border-dashed border-gray-100 rounded-[5rem]">
               <div className="text-[5rem] mb-10">📞</div>
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-4">No Voice Vectors Established</h2>
               <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mb-10 text-center">
                  Your tenant boundary currently lacks telephony manifolds. Provision a voice number to enable real-time audio communication.
               </p>
               <button className="bg-black text-white px-12 py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl">
                  PROVISION FIRST LINE
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
