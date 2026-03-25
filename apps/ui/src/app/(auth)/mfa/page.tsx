'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MfaPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, mfaPendingEmail, mfaPendingPassword } = useAuth() as any; // Using any for new fields
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await login({ 
        email: mfaPendingEmail, 
        password: mfaPendingPassword, 
        mfaCode: code 
      });
      toast.success('MFA Verified!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid MFA code');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mfaPendingEmail) {
    router.push('/login');
    return null;
  }

  return (
    <div className="w-full max-w-md px-8 py-10 my-24 rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black text-gray-900 dark:text-foreground tracking-tight">AutopilotMonster</span>
      </div>

      <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground text-center mb-1">Two-Factor Authentication</h1>
      <p className="text-sm text-gray-500 dark:text-muted-foreground text-center mb-8">
        Enter the 6-digit code from your authenticator app.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            disabled={isLoading}
            className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Verify & Continue'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-muted-foreground">
        Having trouble? <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline" onClick={() => (useAuth as any).getState().clearAuth()}>Back to login</Link>
      </p>
    </div>
  );
}
