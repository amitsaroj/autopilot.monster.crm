import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { decodeToken } from '@/lib/auth';
import { canAccessRoleRoute } from '@/lib/role-access';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readChunkedCookie } from '@/lib/cookie-chunks';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = readChunkedCookie((name) => cookieStore.get(name), 'access_token');

  if (!token) {
    redirect('/login');
  }

  const payload = decodeToken(token);
  if (!payload || !Array.isArray(payload.roles)) redirect('/login');
  if (!canAccessRoleRoute('/superadmin', payload.roles)) redirect('/403');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden bg-[#060a14]">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
