"use client";

import { useEffect, useState } from 'react';
import { CreditCard, Plus, CheckCircle2, MoreVertical, Building } from 'lucide-react';
import Link from 'next/link';

import { billingService, PaymentMethod } from '@/services/billing.service';
import { StripeCardSetup } from '@/components/billing/stripe-card-setup';

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  const loadMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await billingService.listPaymentMethods();
      setMethods(res.data.data ?? []);
    } catch {
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMethods();
  }, []);

  const handleAdd = () => {
    setShowCardForm(true);
    setError(null);
  };

  const handleSetDefault = async (id: string) => {
    await billingService.setDefaultPaymentMethod(id);
    await loadMethods();
  };

  const handleRemove = async (id: string) => {
    await billingService.removePaymentMethod(id);
    await loadMethods();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/billing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Billing</Link>
            <span className="text-muted-foreground text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Payment Methods</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Payment Methods</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your credit cards and billing information.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Payment Method
        </button>
      </div>

      {error && <p className="text-sm text-amber-700">{error}</p>}

      {showCardForm && (
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Add Payment Method</h2>
          <StripeCardSetup
            onComplete={() => {
              setShowCardForm(false);
              void loadMethods();
            }}
            onCancel={() => setShowCardForm(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Saved Cards</h2>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : methods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment methods on file.</p>
          ) : (
            methods.map((method) => (
              <div
                key={method.id}
                className={`bg-card border rounded-xl p-5 shadow-sm ${method.isDefault ? 'border-[hsl(246,80%,60%)]' : 'border-border'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground capitalize">
                          {method.brand} ending in {method.lastFour}
                        </h3>
                        {method.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Expires {method.expMonth}/{method.expYear}
                      </p>
                    </div>
                  </div>
                  <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-sm">
                  {!method.isDefault && (
                    <button onClick={() => handleSetDefault(method.id)} className="text-primary hover:underline font-medium">
                      Make Default
                    </button>
                  )}
                  {method.isDefault && (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Active subscription billing card
                    </span>
                  )}
                  <button onClick={() => handleRemove(method.id)} className="text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Billing Information</h2>
          <div className="bg-muted/30 border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Building className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Billing profile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tax ID and billing address are managed in your account settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
