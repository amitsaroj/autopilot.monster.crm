'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, Zap } from 'lucide-react';
import { authService } from '@/services/auth.service';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setTimeout(() => router.push('/login'), 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token, router]);

  if (status === 'loading') {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-muted-foreground transition">Verifying your email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">Email Verified!</h1>
        <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">
          Your email has been successfully verified. Redirecting to login...
        </p>
        <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          Go to login now
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">Verification Failed</h1>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">{message}</p>
      <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
        Back to login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md px-8 py-10 my-24 rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black text-gray-900 dark:text-foreground tracking-tight">AutopilotMonster</span>
      </div>

      <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
