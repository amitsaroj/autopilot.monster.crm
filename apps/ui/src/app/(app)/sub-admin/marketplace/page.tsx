'use client';

import { useState, useEffect } from 'react';
import { subAdminMarketplaceService } from '@/services/sub-admin-marketplace.service';

export default function SubAdminMarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketplace();
  }, []);

  const loadMarketplace = async () => {
    try {
      const response = await subAdminMarketplaceService.discover();
      setItems(response.data || []);
    } catch (error) {
       console.error('Failed to discover marketplace', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (id: string) => {
    try {
      await subAdminMarketplaceService.installItem(id);
      alert('Marketplace vector deployed to your boundary.');
      loadMarketplace();
    } catch (error) {
       console.error('Installation failed', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase tracking-widest">SubAdmin / Marketplace Manifold</h1>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Discover and deploy advanced operational vectors</p>
        </div>
        <div className="bg-gray-100 px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400">
           {items.length} Vectors Available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[140rem]">
         {loading ? (
             <div className="col-span-4 p-20 text-center animate-pulse uppercase tracking-[0.3em] font-black text-gray-300">Syncing marketplace registry...</div>
         ) : items.map(item => (
            <div key={item.id} className="bg-white rounded-[4rem] border border-gray-100 shadow-sm hover:border-black transition-all group overflow-hidden">
               <div className="h-48 bg-gray-50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">
                  {item.icon || '📦'}
               </div>
               <div className="p-10">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{item.name}</h3>
                     <span className="text-[10px] font-black text-blue-500">${item.price || 'Free'}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-8 line-clamp-2">
                     {item.description || 'Enhance your tenant manifold with this specialized capability pack.'}
                  </p>
                  <div className="flex gap-2 mb-10">
                     <span className="px-3 py-1 bg-gray-50 rounded-full text-[8px] font-black text-gray-400 uppercase tracking-widest">Advanced</span>
                     <span className="px-3 py-1 bg-gray-50 rounded-full text-[8px] font-black text-gray-400 uppercase tracking-widest">Verified</span>
                  </div>
                  <button 
                    onClick={() => handleInstall(item.id)}
                    className="w-full bg-black text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-black/10"
                  >
                    DEPLOY TO BOUNDARY
                  </button>
               </div>
            </div>
         ))}
         {!loading && items.length === 0 && (
            <div className="col-span-4 p-32 text-center border-2 border-dashed border-gray-100 rounded-[5rem]">
               <div className="text-[5rem] mb-10">🌌</div>
               <h2 className="text-xl font-black text-gray-300 uppercase tracking-widest">Marketplace Registry Empty</h2>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-4">Zero items currently verified for deployment.</p>
            </div>
         )}
      </div>
    </div>
  );
}
