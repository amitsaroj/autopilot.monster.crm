'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Loader2, Github } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="w-full max-w-md px-8 py-10 my-24 rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card shadow-2xl">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black text-gray-900 dark:text-foreground tracking-tight">AutopilotMonster</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">Sign in to your workspace</p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">Email</label>
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
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-900 dark:text-foreground">Password</label>
            <Link href="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            className={cn(
              "w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
              errors.password && "border-red-500 focus:ring-red-500"
            )}
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200 dark:border-border"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-card px-3 text-gray-500 font-medium">Or continue with</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
          title="Google"
          className="p-2.5 rounded-full border border-gray-300 dark:border-input bg-white dark:bg-background hover:bg-gray-50 dark:hover:bg-accent/50 transition-all text-gray-700 dark:text-foreground shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.31 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.13c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.8z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.8c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`}
          title="GitHub"
          className="p-2.5 rounded-full border border-gray-300 dark:border-input bg-white dark:bg-background hover:bg-gray-50 dark:hover:bg-accent/50 transition-all text-gray-700 dark:text-foreground shadow-sm"
        >
          <Github className="w-5 h-5" />
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`}
          title="Facebook"
          className="p-2.5 rounded-full border border-gray-300 dark:border-input bg-white dark:bg-background hover:bg-gray-50 dark:hover:bg-accent/50 transition-all text-gray-700 dark:text-foreground shadow-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/apple`}
          title="Apple"
          className="p-2.5 rounded-full border border-gray-300 dark:border-input bg-white dark:bg-background hover:bg-gray-50 dark:hover:bg-accent/50 transition-all text-gray-700 dark:text-foreground shadow-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.96.95-2.05 2-3.15 2-1.09 0-1.51-.68-2.73-.68-1.21 0-1.68.66-2.71.68-1.04.02-2.31-1.12-3.28-2.09-2-2.02-3.52-5.71-3.52-8.3 0-4.04 2.51-6.17 4.93-6.17 1.28 0 2.49.88 3.28.88.79 0 2.24-1.06 3.79-1.06 1.13 0 3.03.4 4.19 2.09-2.8 1.67-2.34 5.38.41 6.33-1 2.27-2.33 4.41-3.21 5.28zm-2.11-15.35c.78-.94 1.3-2.25 1.3-3.56 0-1.1-.94-2.05-1.96-2.05-1.34 0-2.61.64-3.32 1.57-.74.92-1.2 2.21-1.2 3.46 0 1.05 1.03 2.11 2.05 2.11.83 0 2.12-.66 3.13-1.53z" />
          </svg>
        </a>
      </div>


      <p className="mt-6 text-center text-sm text-gray-500 dark:text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          Get started
        </Link>
      </p>
    </div>
  );
}
