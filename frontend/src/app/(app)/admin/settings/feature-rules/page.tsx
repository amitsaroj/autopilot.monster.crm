'use client';

import { useState, useEffect } from 'react';
import { adminFeatureRulesService } from '@/services/admin-feature-rules.service';

export default function AdminFeatureRulesPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminFeatureRulesService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load feature rules', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminFeatureRulesService.updateSettings(settings);
      alert('Global feature availability manifest updated.');
    } catch (error) {
      console.error('Failed to update feature rules', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Global Feature Availability</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'RECONFIGURING STACK...' : 'SYNC FEATURE MANIFEST'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Syncing feature state...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl">
           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10 flex items-center gap-3">
                 System Core Toggles
              </h2>
              <div className="space-y-6 relative z-10 font-black uppercase tracking-widest text-[10px] text-gray-400">
                 <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                    <div className="text-gray-900 text-sm normal-case">Autonomous AI Agents</div>
                    <input 
                      type="checkbox"
                      checked={settings.enableAiAgents}
                      onChange={e => setSettings({...settings, enableAiAgents: e.target.checked})}
                      className="w-6 h-6 rounded-lg accent-indigo-600"
                    />
                 </div>
                 <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                    <div className="text-gray-900 text-sm normal-case">Global Bulk SMS Engine</div>
                    <input 
                      type="checkbox"
                      checked={settings.enableBulkSms}
                      onChange={e => setSettings({...settings, enableBulkSms: e.target.checked})}
                      className="w-6 h-6 rounded-lg accent-indigo-600"
                    />
                 </div>
                 <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                    <div className="text-gray-900 text-sm normal-case">Real-time Voice Transit</div>
                    <input 
                      type="checkbox"
                      checked={settings.enableLiveCalls}
                      onChange={e => setSettings({...settings, enableLiveCalls: e.target.checked})}
                      className="w-6 h-6 rounded-lg accent-indigo-600"
                    />
                 </div>
                 <div className="flex items-center justify-between p-6 bg-gray-900 rounded-3xl text-white">
                    <div className="text-sm normal-case font-bold">Experimental (Beta) Features</div>
                    <input 
                      type="checkbox"
                      checked={settings.enableBetaFeatures}
                      onChange={e => setSettings({...settings, enableBetaFeatures: e.target.checked})}
                      className="w-6 h-6 rounded-lg accent-indigo-400"
                    />
                 </div>
              </div>
           </div>

           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-8">Maintenance Interjection</h2>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Universal Maintenance Message</label>
                    <textarea 
                      value={settings.maintenanceMessage}
                      onChange={e => setSettings({...settings, maintenanceMessage: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none resize-none"
                      rows={6}
                      placeholder="Maintenance protocol active..."
                    />
                 </div>
                 <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 italic text-[10px] font-bold text-indigo-700 leading-relaxed uppercase tracking-widest">
                    This message will be served to all tenant-level users if core features are toggled off or during scheduled system downtime.
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
