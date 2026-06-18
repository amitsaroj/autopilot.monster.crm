'use client';

import { useEffect, useState } from 'react';
import { Wallet, Plus, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { toast } from 'sonner';

import { walletService, Wallet as WalletType, WalletTransaction } from '@/services/wallet.service';

export default function BillingWalletPage() {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('50');
  const [toppingUp, setToppingUp] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(),
      ]);
      setWallet(walletRes.data?.data ?? null);
      setTransactions(txRes.data?.data ?? []);
    } catch {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (Number.isNaN(amount) || amount <= 0) return;
    setToppingUp(true);
    try {
      await walletService.addCredits(amount, 'Manual top-up');
      toast.success('Credits added');
      void load();
    } catch {
      toast.error('Top-up failed');
    } finally {
      setToppingUp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">Wallet</h1>
        <p className="page-description">Prepaid credits for usage-based features</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[hsl(246,80%,60%)]/10 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available balance</p>
            <p className="text-3xl font-bold">
              {wallet?.currency ?? 'USD'} {Number(wallet?.balance ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background"
          />
          <button
            onClick={() => void handleTopUp()}
            disabled={toppingUp}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] text-white rounded-lg text-sm disabled:opacity-50"
          >
            {toppingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Credits
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {tx.type === 'CREDIT' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-medium ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}{Number(tx.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
