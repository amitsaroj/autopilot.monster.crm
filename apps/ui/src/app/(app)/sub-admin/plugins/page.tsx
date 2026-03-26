'use client';

import { useState, useEffect } from 'react';
import { subAdminPluginsService } from '@/services/sub-admin-plugins.service';

export default function SubAdminPluginsPage() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      const response = await subAdminPluginsService.getPlugins();
      setPlugins(response.data || []);
    } catch (error) {
       console.error('Failed to load plugins', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (plugin: any) => {
    try {
      if (plugin.active) {
         await subAdminPluginsService.disablePlugin(plugin.id);
      } else {
         await subAdminPluginsService.enablePlugin(plugin.id);
      }
      loadPlugins();
    } catch (error) {
       console.error('Plugin toggle failed', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-10 uppercase tracking-widest text-gray-900">SubAdmin / Capability Extensions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-[120rem]">
         {loading ? (
             <div className="col-span-3 p-20 text-center animate-pulse uppercase tracking-widest font-black text-gray-300">Scanning plugin manifold...</div>
         ) : plugins.map(plugin => (
            <div key={plugin.id} className={`p-10 rounded-[4rem] border transition-all group relative overflow-hidden ${plugin.active ? 'bg-white border-black shadow-xl shadow-black/5' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
               <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-[2rem] flex items-center justify-center text-2xl group-hover:bg-black group-hover:text-white transition-all">
                     {plugin.icon || '🧩'}
                  </div>
                  <div className="flex flex-col items-end">
                     <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${plugin.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {plugin.active ? 'Active Vector' : 'Deactivated'}
                     </span>
                  </div>
               </div>
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">{plugin.name}</h3>
               <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-10">
                  {plugin.description || 'Standard extension module for augmenting workspace capabilities.'}
               </p>
               <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                  <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ver: {plugin.version || '1.0.0'}</div>
                  <button 
                    onClick={() => handleToggle(plugin)}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${plugin.active ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-black text-white hover:scale-105'}`}
                  >
                    {plugin.active ? 'DISABLE' : 'ENABLE'}
                  </button>
               </div>
            </div>
         ))}
         {!loading && plugins.length === 0 && (
            <div className="col-span-3 p-32 text-center border-2 border-dashed border-gray-100 rounded-[5rem]">
               <div className="text-[5rem] mb-10 grayscale">🧩</div>
               <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-4">No Extension Manifolds Established</h2>
               <p className="text-sm text-gray-400 font-medium max-w-md mx-auto mb-10">
                  Your tenant boundary currently has zero active capability extensions. Explore the marketplace to enhance your operational manifold.
               </p>
               <button className="bg-black text-white px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl">
                  Browse Marketplace
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
