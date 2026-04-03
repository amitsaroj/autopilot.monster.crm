import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  // Basic role check on the edge/server
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
    const payload = JSON.parse(decodedJson);
    
    const roles: string[] = payload.roles || [];
    if (!roles.includes('SUPER_ADMIN')) {
      redirect('/403');
    }
  } catch (e) {
    redirect('/login');
  }

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
