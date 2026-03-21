import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md px-8 py-10 my-24 rounded-2xl border border-gray-200 dark:border-border bg-white dark:bg-card shadow-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">Create your account</h1>
      <p className="text-sm text-gray-500 dark:text-muted-foreground mb-8">Start your 14-day free trial</p>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">First name</label>
            <input type="text" placeholder="John" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">Last name</label>
            <input type="text" placeholder="Doe" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">Work email</label>
          <input type="email" placeholder="you@company.com" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-foreground block mb-1.5">Password</label>
          <input type="password" placeholder="Min 8 characters" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-input bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20">
          Create account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-muted-foreground">
        Already have an account? <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
