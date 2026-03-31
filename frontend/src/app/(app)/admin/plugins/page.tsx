'use client';

import { useState, useEffect } from 'react';
import { adminPluginsService } from '@/services/admin-plugins.service';

export default function AdminPluginsPage() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    try {
      const response = await adminPluginsService.findAll();
      setPlugins(response.data);
    } catch (error) {
      console.error('Failed to load plugins', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / System Plugins</h1>
      </div>

      {loading ? (
        <div>Loading plugins...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-blue-500 text-lg">
                    {plugin.name.charAt(0)}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    plugin.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {plugin.status}
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">{plugin.name}</h3>
                <p className="text-xs text-gray-400 mb-4 tracking-tight">Version {plugin.version}</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-50 text-gray-700 font-bold py-2 rounded-xl text-xs hover:bg-gray-100 transition-all">
                  SETTINGS
                </button>
                <button className="flex-1 bg-black text-white font-bold py-2 rounded-xl text-xs hover:bg-gray-900 transition-all">
                  {plugin.status === 'ACTIVE' ? 'DISABLE' : 'ENABLE'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
