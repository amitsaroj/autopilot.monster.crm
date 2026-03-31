'use client';

import { useState, useEffect } from 'react';
import { adminSmsSettingsService } from '@/services/admin-sms-settings.service';

export default function AdminSmsSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminSmsSettingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load SMS settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSmsSettingsService.updateSettings(settings);
      alert('SMS settings updated successfully.');
    } catch (error) {
      console.error('Failed to update SMS settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Global SMS Gateway</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'SYNCING GATEWAY...' : 'COMMIT GATEWAY CONFIG'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Initializing SMS relay...</div>
      ) : (
        <div className="max-w-4xl">
          <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10">Provider Credentials (Twilio)</h2>
             <div className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Account SID</label>
                      <input 
                        value={settings.accountSid}
                        onChange={e => setSettings({...settings, accountSid: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none"
                        placeholder="AC..."
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Auth Token</label>
                      <input 
                        type="password"
                        value={settings.authToken}
                        onChange={e => setSettings({...settings, authToken: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none"
                        placeholder="••••••••"
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Default From Number/Sender ID</label>
                   <input 
                     value={settings.fromNumber}
                     onChange={e => setSettings({...settings, fromNumber: e.target.value})}
                     className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none"
                     placeholder="+1234567890"
                   />
                </div>
             </div>
          </div>

          <div className="mt-10 bg-gray-900 p-12 rounded-[3.5rem] text-white">
             <div className="flex items-start gap-6">
                <div className="bg-white/10 p-4 rounded-2xl">
                   <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                </div>
                <div>
                   <h3 className="text-lg font-black mb-2">Relay Information</h3>
                   <p className="text-gray-500 text-xs leading-relaxed max-w-md">
                      These settings define the primary delivery mechanism for transactional SMS and 2FA codes across the platform. Platform-level overrides are possible per-tenant via the Marketplace.
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
