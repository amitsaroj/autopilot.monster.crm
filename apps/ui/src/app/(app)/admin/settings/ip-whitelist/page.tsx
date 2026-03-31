'use client';

import { useState, useEffect } from 'react';
import { adminIpWhitelistService } from '@/services/admin-ip-whitelist.service';

export default function AdminIpWhitelistPage() {
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIp, setNewIp] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadWhitelist();
  }, []);

  const loadWhitelist = async () => {
    try {
      const response = await adminIpWhitelistService.getWhitelist();
      setWhitelist(response.data || []);
    } catch (error) {
      console.error('Failed to load IP whitelist', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;
    setAdding(true);
    try {
      await adminIpWhitelistService.addIp({ ip: newIp, description: newDesc });
      setNewIp('');
      setNewDesc('');
      loadWhitelist();
    } catch (error) {
       alert('Failed to add IP. Ensure valid format.');
    } finally {
       setAdding(false);
    }
  };

  const handleRemove = async (ip: string) => {
    if (!confirm(`Revoke access for ${ip}?`)) return;
    try {
      await adminIpWhitelistService.removeIp(ip);
      loadWhitelist();
    } catch (error) {
      alert('Removal failed.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Perimeter IP Firewall</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm sticky top-6">
              <h2 className="text-lg font-black text-gray-900 mb-6">Authorize New Vector</h2>
              <form onSubmit={handleAdd} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Static IP Address</label>
                    <input 
                      value={newIp}
                      onChange={e => setNewIp(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-red-500 transition-all outline-none"
                      placeholder="e.g. 1.2.3.4"
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Identity/Description</label>
                    <input 
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-red-500 transition-all outline-none"
                      placeholder="e.g. Headquarters VPN"
                    />
                 </div>
                 <button 
                   disabled={adding}
                   className="w-full bg-black text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:scale-[1.02] transition-all disabled:opacity-50"
                 >
                   {adding ? 'AUTHORIZING...' : 'ADD TO WHITELIST'}
                 </button>
              </form>
           </div>
        </div>

        <div className="lg:col-span-2">
           {loading ? (
             <div className="text-gray-400 font-bold animate-pulse">Scanning perimeter whitelist...</div>
           ) : (
             <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-gray-50/50">
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Source</th>
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Added Chronology</th>
                         <th className="px-10 py-6 text-right"></th>
                      </tr>
                   </thead>
                   <tbody>
                      {whitelist.map((item: any) => (
                        <tr key={item.ip} className="border-b border-gray-50 group hover:bg-gray-50 transition-all">
                           <td className="px-10 py-8">
                              <div className="text-sm font-black text-gray-900 font-mono tracking-tight">{item.ip}</div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase mt-1">{item.description}</div>
                           </td>
                           <td className="px-10 py-8 text-xs font-bold text-gray-500">{new Date(item.addedAt).toLocaleString()}</td>
                           <td className="px-10 py-8 text-right">
                              <button 
                                onClick={() => handleRemove(item.ip)}
                                className="text-red-500 hover:text-red-700 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all"
                              >
                                Revoke Access
                              </button>
                           </td>
                        </tr>
                      ))}
                      {whitelist.length === 0 && (
                         <tr>
                            <td colSpan={3} className="px-10 py-20 text-center text-gray-400 font-bold italic">
                               Perimeter is open (No IP restrictions enforced)
                            </td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
