'use client';

import { useState, useEffect } from 'react';
import { adminUsageRulesService } from '@/services/admin-usage-rules.service';

export default function AdminUsageRulesPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminUsageRulesService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load usage rules', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUsageRulesService.updateSettings(settings);
      alert('Global usage enforcement manifest updated.');
    } catch (error) {
      console.error('Failed to update usage rules', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Mandatory Usage Policy</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'UPDATING QUOTAS...' : 'COMMIT USAGE RULES'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Calculating resource vectors...</div>
      ) : (
        <div className="space-y-10 max-w-5xl">
           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10 flex items-center gap-3">
                 Threshold Arbitration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10 font-black uppercase tracking-widest text-[10px] text-gray-400">
                 <div>
                    <label className="block mb-2 ml-1">Soft Limit Trigger (%)</label>
                    <div className="relative">
                       <input 
                         type="number"
                         value={settings.softLimitThreshold}
                         onChange={e => setSettings({...settings, softLimitThreshold: Number(e.target.value)})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-yellow-500 transition-all outline-none"
                       />
                       <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black">%</span>
                    </div>
                    <div className="mt-2 text-gray-300">Triggers 'Near Limit' broadcast</div>
                 </div>

                 <div>
                    <label className="block mb-2 ml-1">Hard Limit Enforcement (%)</label>
                    <div className="relative">
                       <input 
                         type="number"
                         value={settings.hardLimitThreshold}
                         onChange={e => setSettings({...settings, hardLimitThreshold: Number(e.target.value)})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-red-500 transition-all outline-none"
                       />
                       <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black">%</span>
                    </div>
                    <div className="mt-2 text-gray-300">Strict resource neutralization</div>
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white">
              <h2 className="text-xl font-black mb-8 relative z-10">Neutralization Strategy</h2>
              <div className="space-y-8">
                 <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-red-500/50 transition-all">
                    <div>
                       <div className="text-white font-bold text-sm">Automated Outage on Hard Limit</div>
                       <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Disables all tenant-facing API endpoints instantly</div>
                    </div>
                    <input 
                      type="checkbox"
                      checked={settings.autoDisableOnHardLimit}
                      onChange={e => setSettings({...settings, autoDisableOnHardLimit: e.target.checked})}
                      className="w-8 h-8 rounded-xl accent-red-600 shadow-lg"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Leniency/Grace Period (Days)</label>
                       <input 
                         type="number"
                         value={settings.gracePeriodDays}
                         onChange={e => setSettings({...settings, gracePeriodDays: Number(e.target.value)})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-white transition-all outline-none text-white"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Alert Baseline (%)</label>
                       <input 
                         type="number"
                         value={settings.notifyOnThreshold}
                         onChange={e => setSettings({...settings, notifyOnThreshold: Number(e.target.value)})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-white transition-all outline-none text-white"
                       />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
