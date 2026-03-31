'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { adminTenantOverrideService } from '@/services/admin-tenant-override.service';

export default function AdminTenantOverridePage() {
  const { id } = useParams();
  const [overrides, setOverrides] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadOverrides();
  }, [id]);

  const loadOverrides = async () => {
    try {
      const response = await adminTenantOverrideService.getOverrides(id as string);
      setOverrides(response.data || { features: {}, limits: {} });
    } catch (error) {
      console.error('Failed to load overrides', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminTenantOverrideService.updateOverrides(id as string, overrides);
      alert('Tenant-specific overrides synchronized.');
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

  const updateLimit = (key: string, value: number) => {
    setOverrides({
      ...overrides,
      limits: {
        ...overrides.limits,
        [key]: value
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-4">
           <span>Admin / Tenant Exception Layer</span>
           <span className="text-xs font-black bg-purple-100 text-purple-700 px-3 py-1 rounded-full uppercase tracking-widest">{id}</span>
        </h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'AUTHORIZING OVERRIDES...' : 'COMMIT EXCEPTIONS'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Accessing tenant manifest...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl">
           <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-gray-900 mb-8">Feature Bitmask Overrides</h2>
              <div className="space-y-6">
                 {['AI_AGENTS', 'BULK_MESSAGING', 'WHATSAPP_API', 'VOICE_DIALER', 'CUSTOM_DOMAIN', 'WHITE_LABEL'].map(f => (
                   <div key={f} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group hover:bg-indigo-50 transition-all border-2 border-transparent hover:border-indigo-100">
                      <div>
                         <div className="text-sm font-black text-gray-900">{f.replace('_', ' ')}</div>
                         <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">Forced enablement for tenant</div>
                      </div>
                      <input 
                        type="checkbox"
                        checked={overrides.features?.[f] || false}
                        onChange={() => toggleFeature(f)}
                        className="w-8 h-8 rounded-xl accent-indigo-600"
                      />
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white">
              <h2 className="text-xl font-black mb-8">Metric Boundary Overrides</h2>
              <div className="space-y-10">
                 {[
                   { label: 'Max Active Users', key: 'USERS' },
                   { label: 'Daily SMS Quota', key: 'SMS_DAILY' },
                   { label: 'Storage (MB)', key: 'STORAGE' },
                   { label: 'ConcurrentIndexing', key: 'INDEX_SPEED' }
                 ].map(l => (
                    <div key={l.key}>
                       <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">{l.label}</label>
                       <input 
                         type="number"
                         value={overrides.limits?.[l.key] || ''}
                         onChange={e => updateLimit(l.key, Number(e.target.value))}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black focus:border-indigo-400 transition-all outline-none text-white"
                         placeholder="Using Plan Default"
                       />
                    </div>
                 ))}
              </div>
              <div className="mt-12 p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed">
                    Exceptions defined here supersede the base subscription plan. Values left empty will default to the tenant's current active plan manifest.
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
