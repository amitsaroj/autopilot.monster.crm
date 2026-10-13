import { SubAdminSidebar } from '@/components/layout/sub-admin-sidebar';
import { Header } from '@/components/layout/header';
import { decodeToken } from '@/lib/auth';
import { canAccessRoleRoute } from '@/lib/role-access';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readChunkedCookie } from '@/lib/cookie-chunks';

export default async function SubAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = readChunkedCookie((name) => cookieStore.get(name), 'access_token');

  if (!token) {
    redirect('/login');
  }

  const payload = decodeToken(token);
  if (!payload || !Array.isArray(payload.roles)) redirect('/login');
  if (!canAccessRoleRoute('/sub-admin', payload.roles)) redirect('/403');

  return (
    <div className="app-shell flex h-dvh overflow-hidden">
      <SubAdminSidebar />
      <div className="flex min-w-0 flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
