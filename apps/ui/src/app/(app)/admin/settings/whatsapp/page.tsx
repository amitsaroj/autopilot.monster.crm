'use client';

import { useState, useEffect } from 'react';
import { adminWhatsAppSettingsService } from '@/services/admin-whatsapp-settings.service';

export default function AdminWhatsAppSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminWhatsAppSettingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load WhatsApp settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminWhatsAppSettingsService.updateSettings(settings);
      alert('WhatsApp Business settings updated.');
    } catch (error) {
      console.error('Failed to update WhatsApp settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Global WhatsApp Business API</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'SYNCING META...' : 'COMMIT META CONFIG'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Establishing Meta Graph handshake...</div>
      ) : (
        <div className="max-w-5xl">
          <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-green-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10">Meta Developer Platform Credentials</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                <div className="space-y-6 text-xs font-black uppercase tracking-widest text-gray-400">
                   <div>
                      <label className="block mb-2 ml-1">App ID</label>
                      <input 
                        value={settings.appId}
                        onChange={e => setSettings({...settings, appId: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none text-gray-900"
                        placeholder="1234..."
                      />
                   </div>
                   <div>
                      <label className="block mb-2 ml-1">App Secret</label>
                      <input 
                        type="password"
                        value={settings.appSecret}
                        onChange={e => setSettings({...settings, appSecret: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none text-gray-900"
                        placeholder="••••••••"
                      />
                   </div>
                </div>
                <div className="space-y-6 text-xs font-black uppercase tracking-widest text-gray-400">
                   <div>
                      <label className="block mb-2 ml-1">Permanent Access Token</label>
                      <textarea 
                        value={settings.accessToken}
                        onChange={e => setSettings({...settings, accessToken: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none text-gray-900"
                        rows={5}
                        placeholder="EAAB..."
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-900 mb-6">Business Identifiers</h3>
                <div className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone Number ID</label>
                      <input 
                        value={settings.phoneNumberId}
                        onChange={e => setSettings({...settings, phoneNumberId: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Business Account ID</label>
                      <input 
                        value={settings.businessAccountId}
                        onChange={e => setSettings({...settings, businessAccountId: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-green-500 transition-all outline-none"
                      />
                   </div>
                </div>
             </div>

             <div className="bg-green-600 p-10 rounded-[3rem] text-white flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700"></div>
                <h3 className="text-2xl font-black mb-4 tracking-tighter">Enterprise Messaging</h3>
                <p className="text-green-100 text-xs leading-relaxed font-bold opacity-80 mb-6">
                   These settings enable platform-wide WhatsApp automation, template broadcasting, and interactive chat flows. High-bandwidth Meta Cloud API is enforced.
                </p>
                <div className="flex gap-2">
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
