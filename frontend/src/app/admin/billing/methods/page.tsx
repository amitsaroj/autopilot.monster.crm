'use client';

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
    const target = methods.find((m) => m.id === id);
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-wide font-bold">
            Manage Saved Payment Methods
          </p>
        </div>
        <button
          onClick={() => toast.info('Use billing setup intent flow to add a card')}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Card
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
        <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <p className="text-xs text-foreground">
          All payment data is encrypted and stored securely via{' '}
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Stripe</span>. We never
          store raw card details.
        </p>
        <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`p-6 rounded-2xl border transition-all ${method.isDefault ? 'bg-blue-500/5 border-blue-500/30' : 'bg-card border-border'}`}
          >
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-2xl">
                  {BRAND_EMOJIS[method.brand?.toLowerCase() ?? ''] || '💳'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{method.brand}</h3>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">•••• •••• •••• {method.lastFour}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Type</p>
                <p className="text-xs font-semibold text-foreground">{method.type}</p>
              </div>
              <div className="p-3 rounded-xl bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Expires
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {method.expMonth}/{method.expYear}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {!method.isDefault && (
                <button
                  onClick={() => setDefault(method.id)}
                  className="flex-1 py-2.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground uppercase tracking-wide hover:bg-blue-500/20 hover:border-blue-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" /> Set as
                  Default
                </button>
              )}
              <button
                onClick={() => remove(method.id)}
                className={`p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all ${method.isDefault ? 'opacity-30 cursor-not-allowed' : ''}`}
                disabled={method.isDefault}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {methods.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground text-sm">
            No payment methods on file.
          </div>
        )}
      </div>
    </div>
  );
}
