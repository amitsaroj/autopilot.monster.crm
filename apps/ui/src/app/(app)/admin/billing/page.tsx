'use client';

import { useState, useEffect } from 'react';
import { adminBillingService } from '@/services/admin-billing.service';

export default function AdminBillingPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, statsRes] = await Promise.all([
        adminBillingService.getSettings(),
        adminBillingService.getStats()
      ]);
      setSettings(settingsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load billing data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Global Billing</h1>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400 font-bold uppercase mb-1">Total Revenue</div>
                <div className="text-3xl font-extrabold text-green-600">${stats.totalRevenue?.toFixed(2)}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                </svg>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400 font-bold uppercase mb-1">Pending Revenue</div>
                <div className="text-3xl font-extrabold text-yellow-600">${stats.pendingRevenue?.toFixed(2)}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Billing Configurations</h2>
            </div>
            <div className="p-6 space-y-6">
              {settings.map((setting) => (
                <div key={setting.key} className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="mb-2 md:mb-0">
                    <div className="font-bold text-gray-900">{setting.key.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-gray-400">Section: {setting.group}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="text" 
                      defaultValue={typeof setting.value === 'object' ? JSON.stringify(setting.value) : setting.value}
                      className="border border-gray-200 rounded px-3 py-1 text-sm font-mono w-64"
                    />
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-bold">Update</button>
                  </div>
                </div>
              ))}
              {settings.length === 0 && (
                <div className="text-center py-8 text-gray-400 italic">No billing settings found. Initialize them in settings.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
