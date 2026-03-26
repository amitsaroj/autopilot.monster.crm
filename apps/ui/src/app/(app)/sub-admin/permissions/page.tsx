'use client';

import { useState, useEffect } from 'react';
import { subAdminPermissionsService } from '@/services/sub-admin-permissions.service';

export default function SubAdminPermissionsPage() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const response = await subAdminPermissionsService.getPermissions();
      setPermissions(response.data || []);
    } catch (error) {
      console.error('Failed to load permission catalog', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-10 uppercase tracking-widest text-gray-900">SubAdmin / Capability Matrix</h1>

      <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden max-w-[120rem]">
         <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div>
               <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Available System Vectors</h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global capability catalog for custom role mapping</p>
            </div>
            <div className="text-[10px] font-black text-gray-400 flex items-center gap-3">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
               {permissions.length} VECTORS SYNCED
            </div>
         </div>
         
         <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
               <div className="col-span-3 p-20 text-center animate-pulse uppercase tracking-widest text-gray-300 font-black">Decrypting core manifold capability set...</div>
            ) : permissions.map((p, idx) => (
               <div key={idx} className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                     <span className="text-[8px] font-black bg-white px-2 py-1 rounded-md border border-gray-100 text-gray-400 group-hover:text-blue-600 transition-colors">
                        {p.action || 'ACCESS'}
                     </span>
                     <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{p.name}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium leading-relaxed">
                     {p.description || 'Ability to interact with the designated system resource under the specified action vector.'}
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
