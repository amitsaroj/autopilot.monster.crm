import { SubAdminSidebar } from '@/components/layout/sub-admin-sidebar';
import { Header } from '@/components/layout/header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { readChunkedCookie } from '@/lib/cookie-chunks';

export default async function SubAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = readChunkedCookie((name) => cookieStore.get(name), 'access_token');

  if (!token) {
    redirect('/login');
  }

  // Sub-admin routes require the literal ADMIN role — RolesGuard on the
  // backend does an exact string match, no hierarchy, so SUPER_ADMIN and
  // TENANT_ADMIN do not implicitly get in here either.
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
    const payload = JSON.parse(decodedJson);

    const roles: string[] = payload.roles || [];
    if (!roles.includes('ADMIN')) {
      redirect('/403');
    }
  } catch (e) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SubAdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 bg-background custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
