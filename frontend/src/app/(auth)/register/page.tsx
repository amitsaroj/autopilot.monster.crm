'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { ArrowRight, Zap, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantName: z.string().min(2, 'Workspace name is too short'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(data);
      toast.success('Registration successful! Please check your email.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md px-8 py-10 my-24 rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card shadow-2xl">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <BrandLogo />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">
        Create your account
      </h1>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">
        Start your 14-day free trial
      </p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="register-firstName" className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">
              First name
            </label>
            <input id="register-firstName"
              {...register('firstName')}
              type="text"
              placeholder="John"
              disabled={isLoading}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition',
                errors.firstName && 'border-red-500 focus:ring-red-500',
              )}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="register-lastName" className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">
              Last name
            </label>
            <input id="register-lastName"
              {...register('lastName')}
              type="text"
              placeholder="Doe"
              disabled={isLoading}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition',
                errors.lastName && 'border-red-500 focus:ring-red-500',
              )}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="register-tenantName" className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">
            Workspace Name
          </label>
          <input id="register-tenantName"
            {...register('tenantName')}
            type="text"
            placeholder="Acme Corp"
            disabled={isLoading}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition',
              errors.tenantName && 'border-red-500 focus:ring-red-500',
            )}
          />
          {errors.tenantName && (
            <p className="mt-1 text-xs text-red-500">{errors.tenantName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="register-email" className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">
            Work email
          </label>
          <input id="register-email"
            {...register('email')}
            type="email"
            placeholder="autopilots.monster@gmail.com"
            disabled={isLoading}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition',
              errors.email && 'border-red-500 focus:ring-red-500',
            )}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="register-password" className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">
            Password
          </label>
          <input id="register-password"
            {...register('password')}
            type="password"
            placeholder="Min 8 characters"
            disabled={isLoading}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition',
              errors.password && 'border-red-500 focus:ring-red-500',
            )}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-500 hover:to-blue-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
