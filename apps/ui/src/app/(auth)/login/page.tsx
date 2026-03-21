import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(246,80%,60%)]/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md px-8 py-10 rounded-2xl border border-border bg-card shadow-2xl animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[hsl(246,80%,60%)] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-foreground tracking-tight">AutopilotMonster</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-8">Sign in to your workspace</p>

        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)] transition"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs text-[hsl(246,80%,60%)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg font-semibold text-sm transition-colors"
          >
            Sign in
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[hsl(246,80%,60%)] font-medium hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
