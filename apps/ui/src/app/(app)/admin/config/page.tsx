'use client';

import { useState, useEffect } from 'react';
import { adminConfigService } from '@/services/admin-config.service';

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ key: '', value: '', group: 'GENERAL', isPublic: false });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await adminConfigService.findAll();
      setConfigs(response.data);
    } catch (error) {
      console.error('Failed to load configs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Try to parse value as JSON if possible
      let value = form.value;
      try {
        value = JSON.parse(form.value);
      } catch (e) {}

      await adminConfigService.update({ ...form, value });
      setShowAdd(false);
      setForm({ key: '', value: '', group: 'GENERAL', isPublic: false });
      loadConfigs();
    } catch (error) {
      console.error('Failed to update config', error);
    }
  };

  const removeConfig = async (key: string) => {
    if (!confirm(`Delete config ${key}?`)) return;
    try {
      await adminConfigService.remove(key);
      loadConfigs();
    } catch (error) {
      console.error('Failed to remove config', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Platform Core Registry</h1>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-black text-white px-8 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10"
        >
          APPEND REGISTRY
        </button>
      </div>

      {showAdd && (
        <div className="mb-10 bg-white p-10 rounded-[3rem] border-4 border-black/5 shadow-2xl">
          <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-blue-600">New Registry Entry</h2>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Registry Key</label>
                <input 
                  value={form.key}
                  onChange={e => setForm({...form, key: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                  placeholder="e.g. platform_api_v1_enabled"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Registry Group</label>
                <input 
                  value={form.group}
                  onChange={e => setForm({...form, group: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payload (JSON or String)</label>
                <textarea 
                  value={form.value}
                  onChange={e => setForm({...form, value: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-mono focus:bg-white focus:border-black transition-all outline-none"
                  rows={4}
                  placeholder='{"enabled": true}'
                  required
                />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <button type="submit" className="flex-1 bg-black text-white font-black py-5 rounded-2xl shadow-lg hover:bg-gray-800 transition-all uppercase text-xs tracking-widest">COMMIT TO REGISTRY</button>
                <button type="button" onClick={() => setShowAdd(false)} className="px-10 bg-white text-gray-400 font-bold py-5 rounded-2xl border-2 border-gray-100 hover:text-gray-600 transition-all uppercase text-xs tracking-widest">Abort</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 font-black animate-pulse uppercase tracking-widest">Syncing with registry...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {configs.map((config) => (
            <div key={config.key} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between hover:border-black transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                <div>
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{config.group}</div>
                  <div className="text-lg font-black text-gray-900 tracking-tight">{config.key}</div>
                  <div className="text-xs font-mono text-gray-400 mt-1 max-w-xl truncate">
                    {JSON.stringify(config.value)}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => {
                    setForm({ key: config.key, value: JSON.stringify(config.value), group: config.group, isPublic: config.isPublic });
                    setShowAdd(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest"
                >
                  Modify
                </button>
                <button 
                  onClick={() => removeConfig(config.key)}
                  className="text-[10px] font-black text-red-300 hover:text-red-500 uppercase tracking-widest"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {configs.length === 0 && (
            <div className="py-20 text-center text-gray-300 italic font-medium">Registry is currently empty. Initialize the platform configuration.</div>
          )}
        </div>
      )}
    </div>
  );
}
