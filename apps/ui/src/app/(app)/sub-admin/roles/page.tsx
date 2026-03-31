'use client';

import { useState, useEffect } from 'react';
import { subAdminRolesService } from '@/services/sub-admin-roles.service';

export default function SubAdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await subAdminRolesService.getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Failed to load tenant roles', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await subAdminRolesService.createRole(newRole);
      setNewRole({ name: '', description: '' });
      alert('Custom authority structure forged.');
      loadRoles();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Abolish this role from the tenant boundary?')) return;
    try {
      await subAdminRolesService.deleteRole(id);
      loadRoles();
    } catch (error) {
       console.error('Failed to delete role', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase tracking-widest">SubAdmin / Authorization Structures</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-[120rem]">
         <div className="lg:col-span-1">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm sticky top-6">
               <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Forge New Custom Role</h2>
               <form onSubmit={handleCreate} className="space-y-6">
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Role Name</label>
                     <input 
                       required
                       value={newRole.name}
                       onChange={e => setNewRole({...newRole, name: e.target.value})}
                       className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-black focus:bg-white transition-all"
                       placeholder="e.g. Sales Specialist"
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Description</label>
                     <textarea 
                       value={newRole.description}
                       onChange={e => setNewRole({...newRole, description: e.target.value})}
                       className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-black focus:bg-white transition-all h-32 resize-none"
                       placeholder="Define the operational boundaries..."
                     />
                  </div>
                  <button 
                    type="submit"
                    disabled={creating}
                    className="w-full bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                  >
                    {creating ? 'FORGING...' : 'ESTABLISH ROLE'}
                  </button>
               </form>
            </div>
         </div>

         <div className="lg:col-span-2">
            <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-12 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest text-gray-400">Current Authorization Set</h3>
                  <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{roles.length} Vectors Defined</div>
               </div>
               <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    <div className="p-20 text-center animate-pulse text-gray-300 font-black uppercase tracking-widest col-span-2">Scanning authorization set...</div>
                  ) : roles.map(role => (
                    <div key={role.id} className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-transparent hover:border-gray-100 hover:bg-white transition-all group relative">
                       <div className="flex justify-between items-start mb-4">
                          <div className="bg-white px-4 py-1.5 rounded-full border border-gray-100 text-[9px] font-black text-gray-900 uppercase tracking-widest">
                             {role.name}
                          </div>
                          <button 
                            onClick={() => handleDelete(role.id)}
                            className="text-[10px] font-black text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            REMOVE
                          </button>
                       </div>
                       <div className="text-[11px] text-gray-500 font-medium leading-relaxed mb-6">
                          {role.description || 'No description defined for this operational vector.'}
                       </div>
                       <div className="flex gap-2">
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-100 pb-1 cursor-default">
                             {role.permissions?.length || 0} PERMISSIONS MAPPED
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
