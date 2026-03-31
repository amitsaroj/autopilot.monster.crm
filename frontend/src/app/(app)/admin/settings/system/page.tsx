'use client';

import { useState, useEffect } from 'react';
import { adminSystemSettingsService } from '@/services/admin-system-settings.service';

export default function AdminSystemSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminSystemSettingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load system settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSystemSettingsService.updateSettings(settings);
      alert('System settings updated successfully.');
    } catch (error) {
      console.error('Failed to update system settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Platform Global Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'SYNCING CHANGES...' : 'SAVE CHANGES'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Initializing platform parameters...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-10">
          <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10">Core Branding & Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Platform Identity Name</label>
                <input 
                  value={settings.platformName}
                  onChange={e => setSettings({...settings, platformName: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none shadow-inner"
                  placeholder="e.g. Autopilot Monster"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Platform Admin Email</label>
                <input 
                  value={settings.contactEmail}
                  onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none shadow-inner"
                  placeholder="admin@autopilot.monster"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-12 rounded-[3.5rem] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#1a1a1a_0%,#000_100%)]"></div>
            <div className="relative z-10">
              <h2 className="text-xl font-black text-white mb-8">Disaster Mitigation & Policy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-red-500/50 transition-all">
                  <div>
                    <div className="text-white font-bold text-sm">Emergency Maintenance Mode</div>
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Blocks all non-admin traffic</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})}
                    className="w-6 h-6 rounded-lg accent-red-500"
                  />
                </div>
                <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
                  <div>
                    <div className="text-white font-bold text-sm">Global User Registration</div>
                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Toggle new tenant onboarding</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={e => setSettings({...settings, allowRegistration: e.target.checked})}
                    className="w-6 h-6 rounded-lg accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden group">
            <h2 className="text-xl font-black text-gray-900 mb-8">Asset Resources</h2>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Logo Dynamic URL</label>
              <input 
                value={settings.logoUrl}
                onChange={e => setSettings({...settings, logoUrl: e.target.value})}
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none shadow-inner"
                placeholder="https://cdn..."
              />
              <div className="mt-6 p-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                {settings.logoUrl ? (
                   <img src={settings.logoUrl} alt="Logo Preview" className="max-h-16" />
                ) : (
                   <span className="text-gray-300 font-bold italic">Logo asset preview will appear here</span>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
