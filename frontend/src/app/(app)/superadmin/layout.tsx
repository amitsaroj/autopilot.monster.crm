import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decodeToken } from '@/lib/auth';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = decodeToken(token);
  const roles: string[] = payload?.roles || [];

  if (!roles.includes('SUPER_ADMIN')) {
    redirect('/403');
  }

  return <>{children}</>;
}
