'use client';

import { useState, useEffect } from 'react';
import { subAdminBillingService } from '@/services/sub-admin-billing.service';

export default function SubAdminBillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sRes, iRes] = await Promise.all([
        subAdminBillingService.getSubscription(),
        subAdminBillingService.getInvoices()
      ]);
      setSubscription(sRes.data);
      setInvoices(iRes.data || []);
    } catch (error) {
       console.error('Failed to load billing data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-10 uppercase tracking-widest text-gray-900">SubAdmin / Financial Footprint</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 max-w-[120rem]">
         <div className="xl:col-span-2 space-y-10">
            <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:border-black transition-all">
               <div className="absolute top-0 right-0 w-64 h-64 bg-black/[0.02] rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="flex justify-between items-start relative z-10 mb-10">
                  <div>
                     <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Active Mandate</h2>
                     <div className="text-4xl font-black text-gray-900">{subscription?.plan?.name || 'PLAN_X_IDENTIFIED'}</div>
                  </div>
                  <span className="px-6 py-2 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                     Operational
                  </span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Billing Cycle</div>
                     <div className="text-[11px] font-bold text-gray-900 uppercase">Monthly Recurring</div>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Next Renewal</div>
                     <div className="text-[11px] font-bold text-gray-900 uppercase">April 24, 2026</div>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                     <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Wallet Credits</div>
                     <div className="text-[11px] font-bold text-gray-900 uppercase underline decoration-gray-200">$450.00</div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-gray-50">
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Transactional Ledger</h2>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                           <th className="px-10 py-8">Invoice Vector</th>
                           <th className="px-10 py-8">Timestamp</th>
                           <th className="px-10 py-8 text-right">Magnitude</th>
                           <th className="px-10 py-8 text-right">Status</th>
                        </tr>
                     </thead>
                     <tbody className="text-sm font-bold text-gray-600">
                        {loading ? (
                           <tr><td colSpan={4} className="px-10 py-20 text-center animate-pulse uppercase tracking-widest text-gray-300">Syncing transaction registry...</td></tr>
                        ) : invoices.map(inv => (
                           <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="px-10 py-6 text-gray-900 font-mono text-[11px] uppercase">{inv.invoiceNumber}</td>
                              <td className="px-10 py-6 text-gray-400 text-[11px] font-medium">{new Date(inv.createdAt).toLocaleDateString()}</td>
                              <td className="px-10 py-6 text-right text-gray-900 font-black">${inv.amount}</td>
                              <td className="px-10 py-6 text-right">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${inv.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {inv.status}
                                 </span>
                              </td>
                           </tr>
                        ))}
                        {!loading && invoices.length === 0 && (
                           <tr><td colSpan={4} className="px-10 py-20 text-center uppercase tracking-widest text-gray-300 font-black">Zero financial signals detected in this manifold.</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         <div className="bg-gray-900 p-12 rounded-[4.5rem] text-white flex flex-col justify-between">
            <div>
               <h2 className="text-xl font-black mb-10 uppercase tracking-widest">Identity Mapping</h2>
               <div className="space-y-8">
                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                     <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Operating Unit</div>
                     <div className="text-lg font-bold truncate">Acme Orbital Solutions</div>
                  </div>
                  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                     <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Mandate Source</div>
                     <div className="text-lg font-bold">PRO_MANDATE_V4</div>
                  </div>
               </div>
            </div>
            <div className="mt-20">
               <button className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-white/10">
                  Update Payment Vector
               </button>
               <p className="mt-8 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center leading-relaxed">
                  Encryption Layer: SHA-512 Operational<br/>
                  Financial Compliance: PCI-DSS Level 1
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
