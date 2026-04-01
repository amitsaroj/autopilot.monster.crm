import Link from 'next/link';

export default function Unauthorized401() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-6xl font-bold text-destructive">401</h1>
      <h2 className="text-2xl mt-4">Unauthorized</h2>
      <p className="mt-2 text-muted-foreground">Your session has expired or you are not logged in.</p>
      <Link href="/login" className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
        Go to Login
      </Link>
    </div>
  );
}
