'use client';

import { useState, useEffect } from 'react';
import { adminRateLimitService } from '@/services/admin-rate-limit.service';

export default function AdminRateLimitPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminRateLimitService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load rate limit settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminRateLimitService.updateSettings(settings);
      alert('Global traffic throttling policy updated.');
    } catch (error) {
      console.error('Failed to update rate limit settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Traffic Throttling Control</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'SYNCING THROTTLES...' : 'COMMIT RATE POLICY'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Analyzing traffic patterns...</div>
      ) : (
        <div className="space-y-10 max-w-7xl">
           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10 flex items-center gap-3">
                 Universal Inbound Limits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Default Burst Window (Seconds)</label>
                    <input 
                      type="number"
                      value={settings.globalTtl}
                      onChange={e => setSettings({...settings, globalTtl: Number(e.target.value)})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Max Requests per Window</label>
                    <input 
                      type="number"
                      value={settings.globalLimit}
                      onChange={e => setSettings({...settings, globalLimit: Number(e.target.value)})}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                    />
                 </div>
              </div>
           </div>

           <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white">
              <h2 className="text-xl font-black mb-10">Sub-System Arbitration Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-yellow-500/50 transition-all group">
                    <div className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-4">Auth Stack</div>
                    <input 
                      type="number"
                      value={settings.authLimit}
                      onChange={e => setSettings({...settings, authLimit: Number(e.target.value)})}
                      className="w-full bg-transparent text-3xl font-black text-white border-b-2 border-white/10 focus:border-yellow-500 outline-none pb-2"
                    />
                    <div className="text-[10px] font-bold text-gray-500 mt-4 uppercase">Requests / minute / IP</div>
                 </div>

                 <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-green-500/50 transition-all group">
                    <div className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mb-4">Core API</div>
                    <input 
                      type="number"
                      value={settings.apiLimit}
                      onChange={e => setSettings({...settings, apiLimit: Number(e.target.value)})}
                      className="w-full bg-transparent text-3xl font-black text-white border-b-2 border-white/10 focus:border-green-500 outline-none pb-2"
                    />
                    <div className="text-[10px] font-bold text-gray-500 mt-4 uppercase">Requests / minute / Tenant</div>
                 </div>

                 <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all group">
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Webhooks</div>
                    <input 
                      type="number"
                      value={settings.webhookLimit}
                      onChange={e => setSettings({...settings, webhookLimit: Number(e.target.value)})}
                      className="w-full bg-transparent text-3xl font-black text-white border-b-2 border-white/10 focus:border-blue-500 outline-none pb-2"
                    />
                    <div className="text-[10px] font-bold text-gray-500 mt-4 uppercase">Ingress / minute / Provider</div>
                 </div>
              </div>
           </div>

           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-start gap-10">
                 <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center shrink-0">
                    <div className="w-2 h-8 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-4 bg-blue-300 rounded-full animate-bounce delay-75 mx-2"></div>
                    <div className="w-2 h-6 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">Dynamic Throttling Intelligence</h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-bold max-w-2xl uppercase tracking-widest">
                       Policy updates propagate instantly to the platform-wide Redis cache layer. Active connections are evaluated against the current manifest in real-time. Extreme violation patterns trigger automated perimeter IP blacklisting.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
