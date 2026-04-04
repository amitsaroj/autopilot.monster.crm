"use client";

import { useState } from 'react';
import { CreditCard, Plus, Trash2, CheckCircle2, Lock, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const mockMethods = [
  { id: '1', type: 'CARD', brand: 'Visa', last4: '4242', expiry: '12/2027', isDefault: true, holderName: 'Admin User', country: 'US' },
  { id: '2', type: 'CARD', brand: 'Mastercard', last4: '5555', expiry: '08/2026', isDefault: false, holderName: 'Admin User', country: 'US' },
];

const BRAND_EMOJIS: Record<string, string> = {
  Visa: '💳',
  Mastercard: '🔴',
  Amex: '💙',
};

export default function AdminBillingMethodsPage() {
  const [methods, setMethods] = useState(mockMethods);

  const setDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    toast.success('Default payment method updated');
  };

  const remove = (id: string) => {
    if (methods.find(m => m.id === id)?.isDefault) {
      toast.error('Cannot remove default payment method');
      return;
    }
    setMethods(prev => prev.filter(m => m.id !== id));
    toast.success('Payment method removed');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Payment Methods</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Saved Payment Methods</p>
        </div>
        <button onClick={() => toast.info('Stripe checkout modal would open')}
          className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Card
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
        <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
        <p className="text-xs text-gray-300">All payment data is encrypted and stored securely via <span className="text-emerald-400 font-bold">Stripe</span>. We never store raw card details.</p>
        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {methods.map(method => (
          <div key={method.id} className={`p-6 rounded-2xl border transition-all ${method.isDefault ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-white/[0.02] border-white/[0.05]'}`}>
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-2xl">
                  {BRAND_EMOJIS[method.brand] || '💳'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">{method.brand}</h3>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-black text-indigo-400 uppercase tracking-widest">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">•••• •••• •••• {method.last4}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Card Holder</p>
                <p className="text-xs font-black text-white">{method.holderName}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Expires</p>
                <p className="text-xs font-black text-white">{method.expiry}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {!method.isDefault && (
                <button onClick={() => setDefault(method.id)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[10px] font-black text-white uppercase tracking-widest hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Set as Default
                </button>
              )}
              <button onClick={() => remove(method.id)}
                className={`p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all ${method.isDefault ? 'opacity-30 cursor-not-allowed' : ''}`}
                disabled={method.isDefault}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <div onClick={() => toast.info('Stripe checkout modal would open')}
          className="p-6 rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center text-center gap-4 hover:border-indigo-500/30 transition-all group cursor-pointer min-h-[220px]">
          <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-all">
            <Plus className="w-7 h-7 text-gray-600 group-hover:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Add New Card</p>
            <p className="text-xs text-gray-600 mt-1">Secured via Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
