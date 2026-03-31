'use client';

import { useState, useEffect } from 'react';
import { adminMarketplaceService } from '@/services/admin-marketplace.service';

export default function AdminMarketplacePage() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', version: '1.0.0', price: 0, category: 'GENERAL' });

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      const response = await adminMarketplaceService.getPlugins();
      setPlugins(response.data);
    } catch (error) {
      console.error('Failed to load plugins', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminMarketplaceService.createPlugin(form);
      setShowAdd(false);
      setForm({ name: '', description: '', version: '1.0.0', price: 0, category: 'GENERAL' });
      loadPlugins();
    } catch (error) {
      console.error('Failed to create plugin', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Marketplace Master Control</h1>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-black/10"
        >
          RELEASE NEW PLUGIN
        </button>
      </div>

      {showAdd && (
        <div className="mb-8 bg-gray-50 border border-gray-100 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <h2 className="text-lg font-black text-gray-900 mb-6 relative z-10">Deploy New Asset</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Asset Name</label>
                <input 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="e.g. Advanced CRM Analytics"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Description</label>
                <textarea 
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="What does this plugin do?"
                  rows={3}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Version</label>
                  <input 
                    value={form.version}
                    onChange={e => setForm({...form, version: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Launch Price ($)</label>
                  <input 
                    type="number"
                    value={form.price}
                    onChange={e => setForm({...form, price: Number(e.target.value)})}
                    className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm outline-none shadow-sm"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest">Deploy to Market</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 bg-white text-gray-400 font-bold py-4 rounded-2xl border border-gray-100 hover:text-gray-600 transition-all uppercase text-xs tracking-widest">Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 animate-pulse font-bold">Cataloging assets...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-5 text-left">Internal Asset</th>
                <th className="px-8 py-5 text-left">Version</th>
                <th className="px-8 py-5 text-left">Pricing</th>
                <th className="px-8 py-5 text-right">Active Installs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {plugins.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-xs group-hover:bg-blue-600 transition-all">
                        {p.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-400 font-medium truncate max-w-xs">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">v{p.version}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-black text-gray-900">${p.price || 0}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-[10px] font-black uppercase text-blue-500 hover:underline tracking-widest">
                      View Installs
                    </button>
                  </td>
                </tr>
              ))}
              {plugins.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-300 italic font-medium">Marketplace is currently empty. Start by releasing a new plugin.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
