import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decodeToken } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = decodeToken(token);
  const roles = payload?.roles || [];
  
  if (!roles.some((r: string) => ['SUPER_ADMIN', 'ADMIN'].includes(r))) {
    redirect('/403');
  }

  return <>{children}</>;
}
