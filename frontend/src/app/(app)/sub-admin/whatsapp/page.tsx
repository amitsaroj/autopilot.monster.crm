'use client';

import { useState, useEffect } from 'react';
import { subAdminWhatsappService } from '@/services/sub-admin-whatsapp.service';

export default function SubAdminWhatsappPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await subAdminWhatsappService.getProfiles();
      setProfiles(response.data || []);
    } catch (error) {
       console.error('Failed to load WhatsApp profiles', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase tracking-widest">SubAdmin / WhatsApp Manifests</h1>
        <button className="bg-[#25D366] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#25D366]/20">
           Link Business Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[120rem]">
         {loading ? (
             <div className="col-span-3 p-20 text-center animate-pulse uppercase tracking-widest font-black text-gray-300">Syncing WhatsApp manifolds...</div>
         ) : profiles.map(profile => (
            <div key={profile.id} className="bg-white p-10 rounded-[4.5rem] border border-gray-100 shadow-sm relative group overflow-hidden">
               <div className="absolute top-0 right-0 w-3 h-full bg-[#25D366] opacity-0 group-hover:opacity-100 transition-all"></div>
               <div className="flex justify-between items-start mb-10">
                  <div className="text-4xl text-[#25D366]">💬</div>
                  <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">Verified Vector</span>
               </div>
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">{profile.name || 'WABA Profile Alpha'}</h3>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-10">
                  Phone Linked: +{profile.phone || '18885550199'}
               </p>
               <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                  <div className="space-y-1">
                     <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Templates: 24 Approved</div>
                     <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Flows: Nominal</div>
                  </div>
                  <button className="text-[10px] font-black text-gray-900 hover:scale-110 transition-transform uppercase tracking-widest">Inspect</button>
               </div>
            </div>
         ))}
         {!loading && profiles.length === 0 && (
            <div className="col-span-3 p-32 text-center border-2 border-dashed border-gray-100 rounded-[5rem]">
               <div className="text-[5rem] mb-10">💬</div>
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-4">No WhatsApp Vectors Established</h2>
               <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto mb-10 text-center">
                  Your tenant boundary currently lacks WhatsApp manifolds. Link a meta business account to enable direct message orchestration.
               </p>
               <button className="bg-black text-white px-12 py-5 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl">
                  LINK BUSINESS VECTOR
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
