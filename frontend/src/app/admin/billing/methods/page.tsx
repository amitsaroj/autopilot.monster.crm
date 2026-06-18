"use client";

import { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, CheckCircle2, Lock, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { billingService, type PaymentMethod } from '@/services/billing.service';

const BRAND_EMOJIS: Record<string, string> = {
  visa: '💳',
  mastercard: '🔴',
  amex: '💙',
};

export default function AdminBillingMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const res = await billingService.listPaymentMethods();
      const payload = res.data?.data ?? res.data;
      setMethods(Array.isArray(payload) ? payload : []);
    } catch {
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const setDefault = async (id: string) => {
    try {
      await billingService.setDefaultPaymentMethod(id);
      await loadMethods();
      toast.success('Default payment method updated');
    } catch {
      toast.error('Failed to update default payment method');
    }
  };

  const remove = async (id: string) => {
    const target = methods.find(m => m.id === id);
    if (target?.isDefault) {
      toast.error('Cannot remove default payment method');
      return;
    }
    try {
      await billingService.removePaymentMethod(id);
      await loadMethods();
      toast.success('Payment method removed');
    } catch {
      toast.error('Failed to remove payment method');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Payment Methods</h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Manage Saved Payment Methods</p>
        </div>
        <button onClick={() => toast.info('Use billing setup intent flow to add a card')}
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
                  {BRAND_EMOJIS[method.brand?.toLowerCase() ?? ''] || '💳'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">{method.brand}</h3>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-black text-indigo-400 uppercase tracking-widest">Default</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">•••• •••• •••• {method.lastFour}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Type</p>
                <p className="text-xs font-black text-white">{method.type}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">Expires</p>
                <p className="text-xs font-black text-white">{method.expMonth}/{method.expYear}</p>
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

        {methods.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 text-sm">No payment methods on file.</div>
        )}
      </div>
    </div>
  );
}
