'use client';

import { useState, useEffect } from 'react';
import { subAdminSettingsService } from '@/services/sub-admin-settings.service';

export default function SubAdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await subAdminSettingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
       console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await subAdminSettingsService.updateSettings(settings);
      alert('Tenant profile updated successfully.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-gray-400 font-bold animate-pulse uppercase tracking-widest">Syncing tenant profile...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-10 uppercase tracking-widest text-gray-900">SubAdmin / Organizational Identity</h1>

      <div className="max-w-4xl">
         <form onSubmit={handleSave} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-12 space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Legal Entity Name</label>
                     <input 
                       required
                       value={settings.name}
                       onChange={e => setSettings({...settings, name: e.target.value})}
                       className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-black focus:bg-white transition-all"
                       placeholder="e.g. Acme Corp"
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Operational Domain</label>
                     <input 
                       value={settings.domain || ''}
                       onChange={e => setSettings({...settings, domain: e.target.value})}
                       className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-black focus:bg-white transition-all"
                       placeholder="acme.com"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Brand Manifest (Logo URL)</label>
                  <input 
                    value={settings.logo || ''}
                    onChange={e => setSettings({...settings, logo: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-black focus:bg-white transition-all"
                    placeholder="https://..."
                  />
               </div>

               <div className="p-10 bg-gray-900 rounded-[2.5rem] text-white">
                  <h3 className="text-sm font-black mb-6 uppercase tracking-widest flex items-center gap-3">
                     Internal Metadata
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  </h3>
                  <div className="space-y-4 font-mono text-[10px]">
                     <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-500 uppercase tracking-tighter">Tenant UUID</span>
                        <span className="text-gray-300">{settings.id}</span>
                     </div>
                     <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-500 uppercase tracking-tighter">Creation Sequence</span>
                        <span className="text-gray-300">{new Date(settings.createdAt).toLocaleDateString()}</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-gray-50/50 border-t border-gray-100 flex justify-end">
               <button 
                 type="submit"
                 disabled={saving}
                 className="bg-black text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
               >
                 {saving ? 'UPDATING...' : 'COMMIT CHANGES'}
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}
