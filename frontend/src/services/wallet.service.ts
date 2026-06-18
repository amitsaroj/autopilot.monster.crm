import api from '../lib/api/client';

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export const walletService = {
  getWallet: () => api.get<{ data: Wallet }>('/billing/wallet'),
  getTransactions: () => api.get<{ data: WalletTransaction[] }>('/billing/wallet/transactions'),
  addCredits: (amount: number, description?: string) =>
    api.post<{ data: Wallet }>('/billing/wallet/credits', { amount, description }),
};
