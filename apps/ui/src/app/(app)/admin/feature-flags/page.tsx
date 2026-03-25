'use client';

import { useState, useEffect } from 'react';
import { adminFeatureFlagsService } from '@/services/admin-feature-flags.service';

export default function AdminFeatureFlagsPage() {
  const [globalFlags, setGlobalFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGlobalFlags();
  }, []);

  const loadGlobalFlags = async () => {
    try {
      const response = await adminFeatureFlagsService.getGlobalFlags();
      setGlobalFlags(response.data);
    } catch (error) {
      console.error('Failed to load global flags', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (key: string, currentStatus: boolean) => {
    try {
      await adminFeatureFlagsService.updateGlobalFlag({ key, enabled: !currentStatus });
      loadGlobalFlags();
    } catch (error) {
      console.error('Failed to update flag', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Feature Flags</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Global System Flags</h2>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              <div>Loading...</div>
            ) : (
              globalFlags.map((flag) => (
                <div key={flag.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-bold text-gray-900 font-mono text-xs">{flag.key}</div>
                    <div className="text-[10px] text-gray-400">System-wide toggle</div>
                  </div>
                  <button 
                    onClick={() => toggleFlag(flag.key, flag.value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${flag.value ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.value ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))
            )}
            {globalFlags.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-400 italic text-sm">No global flags defined.</div>
            )}
            <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs font-bold text-gray-400 hover:border-blue-200 hover:text-blue-400 transition-all">
              + ADD NEW GLOBAL FLAG
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Tenant Override</h2>
          </div>
          <div className="p-12 text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-sm font-medium mb-4">Select a tenant to manage custom flag overrides.</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-200">Open Tenant Selector</button>
          </div>
        </div>
      </div>
    </div>
  );
}
