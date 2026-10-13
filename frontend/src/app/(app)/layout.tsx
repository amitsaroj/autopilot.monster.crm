import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readChunkedCookie } from '@/lib/cookie-chunks';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = readChunkedCookie((name) => cookieStore.get(name), 'access_token');

  if (!token) {
    redirect('/login');
  }

  return (
    <div className="app-shell flex h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">{children}</main>
      </div>
    </div>
  );
}
