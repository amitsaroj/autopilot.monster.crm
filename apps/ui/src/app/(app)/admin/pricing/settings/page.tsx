'use client';

import { useState, useEffect } from 'react';
import { adminPricingService } from '@/services/admin-pricing.service';

export default function AdminPricingSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminPricingService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load pricing settings', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Pricing Settings</h1>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Global Pricing & Presentation</h2>
          </div>
          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {settings.map((setting) => (
                <div key={setting.key} className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{setting.key.replace(/_/g, ' ')}</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      defaultValue={typeof setting.value === 'object' ? JSON.stringify(setting.value) : setting.value}
                      className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm font-mono"
                    />
                    <button className="bg-blue-50 text-blue-600 px-3 py-2 rounded text-xs font-bold hover:bg-blue-100">Save</button>
                  </div>
                </div>
              ))}
            </div>

            {settings.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <div className="text-gray-300 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                  </svg>
                </div>
                <div className="text-gray-400 text-sm">No pricing settings found.</div>
                <button className="mt-4 text-blue-600 text-sm font-bold hover:underline">+ Initialize Default Settings</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
