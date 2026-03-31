'use client';

import { useState, useEffect } from 'react';
import { adminCostRulesService } from '@/services/admin-cost-rules.service';

export default function AdminCostRulesPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminCostRulesService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load cost rules', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCostRulesService.updateSettings(settings);
      alert('Global markup and fiscal arbitration rules committed.');
    } catch (error) {
      console.error('Failed to update cost rules', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Fiscal Arbitrage & Markup</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'RECALCULATING MARGINS...' : 'COMMIT FISCAL POLICY'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Analyzing revenue vectors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl">
           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10">Usage Markup Manifest (%)</h2>
              <div className="space-y-8 relative z-10">
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">AI Inference</label>
                       <input 
                         type="number"
                         value={settings.aiMarkup}
                         onChange={e => setSettings({...settings, aiMarkup: Number(e.target.value)})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">SMS Ingress</label>
                       <input 
                         type="number"
                         value={settings.smsMarkup}
                         onChange={e => setSettings({...settings, smsMarkup: Number(e.target.value)})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Voice Transit</label>
                       <input 
                         type="number"
                         value={settings.voiceMarkup}
                         onChange={e => setSettings({...settings, voiceMarkup: Number(e.target.value)})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Binary Storage</label>
                       <input 
                         type="number"
                         value={settings.storageMarkup}
                         onChange={e => setSettings({...settings, storageMarkup: Number(e.target.value)})}
                         className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none"
                       />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white flex flex-col justify-between">
              <div>
                 <h2 className="text-xl font-black mb-10">Wallet Shielding</h2>
                 <div className="space-y-6">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Minimum Mandatory Balance ($)</label>
                    <div className="relative">
                       <input 
                         type="number"
                         step="0.01"
                         value={settings.minimumBalance}
                         onChange={e => setSettings({...settings, minimumBalance: Number(e.target.value)})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-2xl font-black focus:border-green-500 transition-all outline-none text-white pl-12"
                       />
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-black text-xl">$</span>
                    </div>
                 </div>
              </div>

              <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 italic text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                 Fiscal policy updates are calculated at the moment of ingestion. Changes do not apply retroactively to existing pending usage records.
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
