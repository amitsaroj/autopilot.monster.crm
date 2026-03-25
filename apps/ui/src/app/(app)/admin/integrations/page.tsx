'use client';

import { useState, useEffect } from 'react';
import { adminIntegrationsService } from '@/services/admin-integrations.service';

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await adminIntegrationsService.findAll();
      setIntegrations(response.data);
    } catch (error) {
      console.error('Failed to load integrations', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Global Integration Layer</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div>Loading system integrations...</div>
        ) : (
          integrations.map((integration) => (
            <div key={integration.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-50 transition-all"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-xs font-black text-blue-500 uppercase tracking-widest">{integration.type}</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    integration.status === 'CONFIGURED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {integration.status}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">{integration.name}</h2>
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-xs hover:bg-black transition-all">
                    CONFIGURE API KEYS
                  </button>
                  <button className="w-full bg-white text-gray-400 font-bold py-3 rounded-xl text-xs border border-gray-100 hover:text-gray-600 transition-all">
                    SYSTEM TEST
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 bg-black p-10 rounded-[3rem] text-white">
        <h3 className="text-xl font-black mb-4 tracking-tight underline decoration-blue-500 decoration-4 underline-offset-8">Critical Infrastructure</h3>
        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
          These global integrations provide the backbone for email delivery, SMS notifications, and payment processing across all tenants. Changes here affect every tenant on the platform.
        </p>
      </div>
    </div>
  );
}
