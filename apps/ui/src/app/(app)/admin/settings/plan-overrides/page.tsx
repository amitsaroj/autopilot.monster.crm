'use client';

import { useState, useEffect } from 'react';
import { adminPlanOverrideService } from '@/services/admin-plan-override.service';

export default function AdminPlanOverridePage() {
  const [overrides, setOverrides] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOverrides();
  }, []);

  const loadOverrides = async () => {
    try {
      const response = await adminPlanOverrideService.getOverrides();
      setOverrides(response.data || {});
    } catch (error) {
      console.error('Failed to load plan overrides', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminPlanOverrideService.updateOverrides(overrides);
      alert('Plan-level global overrides synchronized.');
    } catch (error) {
       console.error('Failed to update plan overrides', error);
    } finally {
       setSaving(false);
    }
  };

  const updateOverride = (planId: string, field: string, value: any) => {
     setOverrides({
       ...overrides,
       [planId]: {
         ...(overrides[planId] || {}),
         [field]: value
       }
     });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin / Global Plan Hotfixes</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-10 py-4 rounded-[2rem] font-black text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
        >
          {saving ? 'UPDATING MANIFEST...' : 'COMMIT PLAN OVERRIDES'}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 font-bold animate-pulse">Syncing plan vectors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl">
           {['BASIC', 'PRO', 'ENTERPRISE'].map(planId => (
             <div key={planId} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <h2 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-widest">{planId} Plan Override</h2>
                <div className="space-y-6 relative z-10">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bonus SMS Credits (Monthly)</label>
                      <input 
                        type="number"
                        value={overrides[planId]?.extraSms || ''}
                        onChange={e => updateOverride(planId, 'extraSms', Number(e.target.value))}
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all outline-none"
                        placeholder="0"
                      />
                   </div>
                   <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                      <div className="text-sm font-black text-gray-900">Unlock Beta AI Engine</div>
                      <input 
                        type="checkbox"
                        checked={overrides[planId]?.unlockBetaAi || false}
                        onChange={e => updateOverride(planId, 'unlockBetaAi', e.target.checked)}
                        className="w-6 h-6 rounded-lg accent-indigo-600"
                      />
                   </div>
                </div>
             </div>
           ))}

           <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white flex flex-col justify-center">
              <h2 className="text-xl font-black mb-6">Policy Propagation</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-relaxed">
                 Overrides defined here apply to ALL tenants subscribed to the respective plans. These are "Hotfixes" used for promotions or emergency limit adjustments without altering the core plan definitions.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
