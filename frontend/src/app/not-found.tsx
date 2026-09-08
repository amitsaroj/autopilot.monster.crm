import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-4">404 — Not Found</h1>
        <p className="text-lg mb-4">
          The resource you requested does not exist. If you reached this page while probing
          programmatically, please consult our machine-readable API at <Link href="/openapi.json">/openapi.json</Link>,
          the developer index at <Link href="/api-docs">/api-docs</Link>, or our agent discoverability file at
          <Link href="/.well-known/llms.txt">/.well-known/llms.txt</Link>.
        </p>
        <p className="text-sm text-gray-600">Return to <Link href="/">homepage</Link>.</p>
      </div>
    </main>
  );
}
