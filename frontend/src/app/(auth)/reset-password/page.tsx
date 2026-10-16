'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, Zap, Loader2, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        token,
        newPassword: data.password,
      });
      toast.success('Password reset successfully');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-4">Invalid Link</h1>
        <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">
          The password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label
          htmlFor="reset-password-password"
          className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5"
        >
          New Password
        </label>
        <input
          id="reset-password-password"
          {...register('password')}
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition',
            errors.password && 'border-red-500 focus:ring-red-500',
          )}
        />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>
      <div>
        <label
          htmlFor="reset-password-confirmPassword"
          className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5"
        >
          Confirm New Password
        </label>
        <input
          id="reset-password-confirmPassword"
          {...register('confirmPassword')}
          type="password"
          placeholder="••••••••"
          disabled={isLoading}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition',
            errors.confirmPassword && 'border-red-500 focus:ring-red-500',
          )}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-500 hover:to-blue-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md px-8 py-10 my-24 rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <BrandLogo />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">
        Set new password
      </h1>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">
        Choose a strong password for your account
      </p>

      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-muted-foreground">
        <Link
          href="/login"
          className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
