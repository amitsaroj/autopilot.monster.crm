'use client';

import { useState, useEffect } from 'react';
import { adminEmailSettingsService } from '@/services/admin-email-settings.service';

export default function AdminEmailSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminEmailSettingsService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load email settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminEmailSettingsService.updateSettings(settings);
      alert('Email settings updated successfully.');
    } catch (error) {
      console.error('Failed to update email settings', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) return alert('Enter a test recipient email.');
    try {
      await adminEmailSettingsService.sendTestEmail(testEmail);
      alert('Test email dispatched.');
    } catch (error) {
      alert('Email dispatch failed.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Global SMTP Transit</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'SYNCING SMTP...' : 'COMMIT SMTP CONFIG'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Establishing SMTP handshake...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
             <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10">Transit Credentials</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">SMTP Host</label>
                      <input 
                        value={settings.host}
                        onChange={e => setSettings({...settings, host: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">SMTP Port</label>
                      <input 
                        type="number"
                        value={settings.port}
                        onChange={e => setSettings({...settings, port: Number(e.target.value)})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Auth Username</label>
                      <input 
                        value={settings.user}
                        onChange={e => setSettings({...settings, user: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Auth Password</label>
                      <input 
                        type="password"
                        value={settings.password}
                        onChange={e => setSettings({...settings, password: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                        placeholder="••••••••"
                      />
                   </div>
                </div>
             </div>

             <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 mb-8">Sender Identity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">From Email Address</label>
                      <input 
                        value={settings.fromEmail}
                        onChange={e => setSettings({...settings, fromEmail: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Display Name</label>
                      <input 
                        value={settings.fromName}
                        onChange={e => setSettings({...settings, fromName: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-10">
             <div className="bg-black p-10 rounded-[3rem] text-white">
                <h2 className="text-lg font-black mb-6 flex items-center gap-3">
                   <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                   Connection Test
                </h2>
                <p className="text-gray-500 text-xs mb-8 leading-relaxed">
                   Verify your SMTP relay is correctly accepting platform-wide broadcasts.
                </p>
                <input 
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold mb-4 focus:border-yellow-500 outline-none text-white tracking-widest placeholder:text-gray-700"
                  placeholder="RECIPIENT@DOMAIN.COM"
                />
                <button 
                  onClick={handleTest}
                  className="w-full bg-yellow-500 text-black font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all"
                >
                  DISPATCH TEST PACKET
                </button>
             </div>

             <div className="bg-blue-600 p-10 rounded-[3rem] text-white overflow-hidden relative">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mb-16 -mr-16"></div>
                <h3 className="text-lg font-black mb-4">Security Policy</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase">Force TLS/SSL</span>
                      <input type="checkbox" checked={settings.encryption === 'tls'} readOnly className="w-4 h-4 accent-blue-900" />
                   </div>
                   <p className="text-[10px] text-blue-200 leading-relaxed font-bold">
                      Platform requires encrypted transit for all administrative and tenant-level transactional communication. Unencrypted SMTP is disabled by system policy.
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
