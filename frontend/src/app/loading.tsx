import { BrandLogo } from '@/components/brand-logo';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] flex flex-col items-center justify-center gap-5 p-6"
    >
      <BrandLogo />
      <span className="text-sm text-muted-foreground">Loading your workspace…</span>
      <div className="h-1 w-40 rounded-full overflow-hidden bg-muted">
        <div className="h-full w-2/3 rounded-full bg-primary animate-pulse" />
      </div>
    </div>
  );
}
