'use client';

import { useState, useEffect } from 'react';
import { subAdminIntegrationsService } from '@/services/sub-admin-integrations.service';

const INTEGRATION_TEMPLATES = [
  { key: 'WHATSAPP', name: 'WhatsApp Business API', icon: '💬' },
  { key: 'STRIPE', name: 'Stripe Payments', icon: '💳' },
  { key: 'TWILIO', name: 'Twilio Programmable Voice', icon: '📞' },
  { key: 'SENDGRID', name: 'SendGrid Email', icon: '📧' },
];

export default function SubAdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await subAdminIntegrationsService.getIntegrations();
      setIntegrations(response.data || []);
    } catch (error) {
       console.error('Failed to load integrations', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Sever this integration vector?')) return;
    try {
      await subAdminIntegrationsService.deleteIntegration(id);
      loadIntegrations();
    } catch (error) {
       console.error('Failed to deactivate integration', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase tracking-widest">SubAdmin / External Manifolds</h1>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
           <button 
             onClick={() => setActiveTab('active')}
             className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Active Vectors
           </button>
           <button 
             onClick={() => setActiveTab('catalog')}
             className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'catalog' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Available Catalog
           </button>
        </div>
      </div>

      <div className="max-w-[120rem]">
         {activeTab === 'active' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-3 p-20 text-center animate-pulse uppercase tracking-widest font-black text-gray-300">Syncing active manifolds...</div>
              ) : integrations.map(int => (
                <div key={int.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative group overflow-hidden">
                   <div className="absolute top-0 right-0 w-2 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-all"></div>
                   <div className="flex justify-between items-start mb-8">
                      <div className="text-4xl">{INTEGRATION_TEMPLATES.find(t => t.key === int.key)?.icon || '🧩'}</div>
                      <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">Linked</span>
                   </div>
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">{int.key}</h3>
                   <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-10">
                      Standard operational vector for {int.key}. Status: Nominal.
                   </p>
                   <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                      <button className="text-[10px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest">Configure</button>
                      <button 
                        onClick={() => handleDeactivate(int.id)}
                        className="text-[10px] font-black text-red-300 hover:text-red-600 transition-colors uppercase tracking-widest"
                      >
                        Deactivate
                      </button>
                   </div>
                </div>
              ))}
              {!loading && integrations.length === 0 && (
                <div className="col-span-3 p-20 text-center border-2 border-dashed border-gray-100 rounded-[4rem]">
                   <div className="text-sm font-black text-gray-300 uppercase tracking-widest mb-4">No active manifolds established</div>
                   <button 
                     onClick={() => setActiveTab('catalog')}
                     className="bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10"
                   >
                     Forge First Connection
                   </button>
                </div>
              )}
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {INTEGRATION_TEMPLATES.map(template => (
                <div key={template.key} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm hover:border-black transition-all group relative cursor-pointer">
                   <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">{template.icon}</div>
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">{template.name}</h3>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-10">Deploy to manifold</p>
                   <button className="w-full bg-gray-50 group-hover:bg-black group-hover:text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                      Establish Vector
                   </button>
                </div>
              ))}
           </div>
         )}
      </div>
    </div>
  );
}
