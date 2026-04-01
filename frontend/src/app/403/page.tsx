import Link from 'next/link';

export default function Forbidden403() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-6xl font-bold text-destructive">403</h1>
      <h2 className="text-2xl mt-4">Access Forbidden</h2>
      <p className="mt-2 text-muted-foreground">You do not have the required permissions to view this resource.</p>
      <Link href="/dashboard" className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
        Return to Dashboard
      </Link>
    </div>
  );
}
