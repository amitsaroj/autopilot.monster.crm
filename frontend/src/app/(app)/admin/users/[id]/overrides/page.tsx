'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { adminUserOverrideService } from '@/services/admin-user-override.service';

export default function AdminUserOverridePage() {
  const { id } = useParams();
  const [overrides, setOverrides] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadOverrides();
  }, [id]);

  const loadOverrides = async () => {
    try {
      const response = await adminUserOverrideService.getOverrides(id as string);
      setOverrides(response.data || { features: {}, limits: {} });
    } catch (error) {
      console.error('Failed to load user overrides', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminUserOverrideService.updateOverrides(id as string, overrides);
      alert('User-level individual overrides synchronized.');
    } catch (error) {
      console.error('Failed to update overrides', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (key: string) => {
    setOverrides({
      ...overrides,
      features: {
        ...overrides.features,
        [key]: !overrides.features?.[key]
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-4">
           <span>Admin / Individual Privilege Override</span>
           <span className="text-xs font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest">{id}</span>
        </h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'AUTHORIZING INDIVIDUAL PRIVILEGES...' : 'COMMIT USER OVERRIDES'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Scanning user identity...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl">
           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h2 className="text-xl font-black text-gray-900 mb-8 relative z-10 flex items-center gap-3">
                 Granular Permission Overrides
              </h2>
              <div className="space-y-6 relative z-10 font-black uppercase tracking-widest text-[10px] text-gray-400">
                 {['BYPASS_RATE_LIMITS', 'ACCESS_DEBUG_TOOLS', 'EXPORT_SYSTEM_LOGS', 'MANAGE_PLATFORM_PLUGINS', 'BYPASS_IP_WHITELIST'].map(f => (
                   <div key={f} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-100">
                      <div>
                         <div className="text-sm font-black text-gray-900">{f.replace('_', ' ')}</div>
                         <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Direct assignment to user metadata</div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={overrides.features?.[f] || false}
                        onChange={() => toggleFeature(f)}
                        className="w-8 h-8 rounded-xl accent-blue-600"
                      />
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white">
              <h2 className="text-xl font-black mb-8">Personal Metric Constraints</h2>
              <div className="space-y-10">
                 {[
                   { label: 'Max Active Campaigns', key: 'CAMPAIGNS' },
                   { label: 'Concurrent AI Tasks', key: 'AI_TASKS' }
                 ].map(l => (
                    <div key={l.key}>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">{l.label}</label>
                       <input 
                         type="number"
                         value={overrides.limits?.[l.key] || ''}
                         onChange={e => setOverrides({...overrides, limits: {...overrides.limits, [l.key]: Number(e.target.value)}})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black focus:border-blue-400 transition-all outline-none text-white"
                         placeholder="Using Role Default"
                       />
                    </div>
                 ))}
              </div>
              <div className="mt-12 p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed">
                    Personal overrides take highest precedence in the authority chain (User &gt; Tenant &gt; Plan). These should only be used for system administrators or VIP accounts.
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
