import Link from 'next/link';
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-8 py-10 rounded-2xl border border-border bg-card shadow-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
        <p className="text-sm text-muted-foreground mb-8">Start your 14-day free trial</p>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">First name</label>
              <input type="text" placeholder="John" className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Last name</label>
              <input type="text" placeholder="Doe" className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Work email</label>
            <input type="email" placeholder="you@company.com" className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <input type="password" placeholder="Min 8 characters" className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(246,80%,60%)]" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg font-semibold text-sm transition-colors">
            Create account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-[hsl(246,80%,60%)] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
