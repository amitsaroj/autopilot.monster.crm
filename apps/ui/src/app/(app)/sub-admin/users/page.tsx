'use client';

import { useState, useEffect } from 'react';
import { subAdminUsersService } from '@/services/sub-admin-users.service';

export default function SubAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await subAdminUsersService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load tenant users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await subAdminUsersService.inviteUser({ email: inviteEmail, roleId: 'DEFAULT' });
      setInviteEmail('');
      alert('Invitation dispatched to the target node.');
      loadUsers();
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Evict this user from the tenant manifold?')) return;
    try {
      await subAdminUsersService.removeUser(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to remove user', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase tracking-widest">SubAdmin / Tenant Personnel</h1>
        <form onSubmit={handleInvite} className="flex gap-4">
           <input 
             type="email"
             required
             placeholder="Target email..."
             value={inviteEmail}
             onChange={e => setInviteEmail(e.target.value)}
             className="bg-white border-2 border-gray-100 rounded-2xl px-6 py-3 text-xs font-bold outline-none focus:border-black transition-all w-64"
           />
           <button 
             type="submit"
             disabled={inviting}
             className="bg-black text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
           >
             {inviting ? 'TRANSMITTING...' : 'INVITE OPERATOR'}
           </button>
        </form>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                     <th className="px-10 py-8">Operator Identity</th>
                     <th className="px-10 py-8">Access Level</th>
                     <th className="px-10 py-8">Operational Status</th>
                     <th className="px-10 py-8 text-right">Manifold Controls</th>
                  </tr>
               </thead>
               <tbody className="text-sm font-bold text-gray-600">
                  {loading ? (
                    <tr><td colSpan={4} className="px-10 py-20 text-center animate-pulse uppercase tracking-widest text-gray-300">Scanning personnel registry...</td></tr>
                  ) : users.map(user => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-black text-xs">
                                {user.firstName?.[0] || user.email[0].toUpperCase()}
                             </div>
                             <div>
                                <div className="text-gray-900">{user.firstName} {user.lastName}</div>
                                <div className="text-[10px] text-gray-400 font-mono">{user.email}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-6">
                          <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-widest">
                             {user.role || 'OPERATOR'}
                          </span>
                       </td>
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                             <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
                             <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">{user.status}</span>
                          </div>
                       </td>
                       <td className="px-10 py-6 text-right">
                          <button 
                            onClick={() => handleRemove(user.id)}
                            className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            EVICT
                          </button>
                       </td>
                    </tr>
                  ))}
                  {!loading && users.length === 0 && (
                     <tr><td colSpan={4} className="px-10 py-20 text-center uppercase tracking-widest text-gray-300 font-black">Zero operators registered in this manifold.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
