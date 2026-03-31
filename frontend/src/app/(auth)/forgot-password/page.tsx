'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Loader2, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/auth.service';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md px-8 py-10 my-24 rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">Check your email</h1>
        <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">
          If an account exists for that email, we&apos;ve sent a password reset link.
        </p>
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          Back to sign in
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-8 py-10 my-24 rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black text-gray-900 dark:text-foreground tracking-tight">AutopilotMonster</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">Reset your password</h1>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">We&apos;ll email you a reset link</p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">Email address</label>
          <input
            {...register('email')}
            type="email"
            placeholder="autopilot.monster@gmail.com"
            disabled={isLoading}
            className={cn(
              "w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
              errors.email && "border-red-500 focus:ring-red-500"
            )}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Send reset link'
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-muted-foreground">
        <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}
