'use client';

import { useState, useEffect } from 'react';
import { adminVoiceSettingsService } from '@/services/admin-voice-settings.service';

export default function AdminVoiceSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminVoiceSettingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load voice settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminVoiceSettingsService.updateSettings(settings);
      alert('Global voice synthesis parameters updated.');
    } catch (error) {
      console.error('Failed to update voice settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Global Voice Transit Layer</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'SYNCING ACOUSTICS...' : 'COMMIT VOICE CONFIG'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Calibrating acoustic relays...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl">
           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10">Synthesis Engine (ElevenLabs)</h2>
              <div className="space-y-6 relative z-10">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ElevenLabs API Key</label>
                    <input 
                      type="password"
                      value={settings.elevenLabsKey}
                      onChange={e => setSettings({...settings, elevenLabsKey: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                      placeholder="••••••••"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Default Synthesis Voice ID</label>
                    <input 
                      value={settings.defaultVoiceId}
                      onChange={e => setSettings({...settings, defaultVoiceId: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
                      placeholder="e.g. monica_v2"
                    />
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white">
              <h2 className="text-xl font-black mb-8">Telephony Bridge (Twilio Voice)</h2>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Twilio Application SID</label>
                    <input 
                      value={settings.twilioVoiceSid}
                      onChange={e => setSettings({...settings, twilioVoiceSid: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-orange-500 transition-all outline-none text-white"
                      placeholder="AP..."
                    />
                 </div>
                 <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                       This bridge establishes the SIP/PSTN handshake for real-time autonomous voice agents across both admin and tenant workspaces.
                    </p>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-8">Agent Orchestration API Tokens</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Vapi API Key</label>
                    <input 
                      type="password"
                      value={settings.vapiApiKey}
                      onChange={e => setSettings({...settings, vapiApiKey: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Retell AI API Key</label>
                    <input 
                      type="password"
                      value={settings.retellApiKey}
                      onChange={e => setSettings({...settings, retellApiKey: e.target.value})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-black transition-all outline-none"
                    />
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
