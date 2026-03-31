'use client';

import { useState, useEffect } from 'react';
import { adminSecuritySettingsService } from '@/services/admin-security-settings.service';

export default function AdminSecuritySettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminSecuritySettingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load security settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSecuritySettingsService.updateSettings(settings);
      alert('Global security policy synchronized.');
    } catch (error) {
      console.error('Failed to update security settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Platform Shield Policy</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'HARDENING ENFORCEMENT...' : 'SAVE SECURITY POLICY'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Scanning security vectors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl">
           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/50 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-red-100/50 transition-all duration-700"></div>
              <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10 flex items-center gap-3">
                 Authentication Protocols
              </h2>
              <div className="space-y-10 relative z-10 font-black uppercase tracking-widest text-[10px] text-gray-400">
                 <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-red-500/20 transition-all">
                    <div>
                       <div className="text-gray-900 text-sm normal-case mb-1">Enforce Mandatory 2FA</div>
                       <div>Platform-wide requirement for ALL accounts</div>
                    </div>
                    <input 
                      type="checkbox"
                      checked={settings.enforce2fa}
                      onChange={e => setSettings({...settings, enforce2fa: e.target.checked})}
                      className="w-6 h-6 rounded-lg accent-red-600"
                    />
                 </div>

                 <div>
                    <label className="block mb-2 ml-1">Universal Password Min Length</label>
                    <input 
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={e => setSettings({...settings, passwordMinLength: Number(e.target.value)})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-red-500 transition-all outline-none"
                    />
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white space-y-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_10%,#111_0%,#000_100%)]"></div>
              <div className="relative z-10">
                 <h2 className="text-xl font-black mb-8">Session & Threat Mitigation</h2>
                 <div className="space-y-8">
                    <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Idle Session Expiry (Seconds)</label>
                       <input 
                         type="number"
                         value={settings.sessionTimeout}
                         onChange={e => setSettings({...settings, sessionTimeout: Number(e.target.value)})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-red-500 transition-all outline-none text-white"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Max Failed Auth Attempts</label>
                       <input 
                         type="number"
                         value={settings.failedLoginLimit}
                         onChange={e => setSettings({...settings, failedLoginLimit: Number(e.target.value)})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-red-500 transition-all outline-none text-white"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Temporary Account Lockout (Seconds)</label>
                       <input 
                         type="number"
                         value={settings.lockoutDuration}
                         onChange={e => setSettings({...settings, lockoutDuration: Number(e.target.value)})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-red-500 transition-all outline-none text-white"
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
