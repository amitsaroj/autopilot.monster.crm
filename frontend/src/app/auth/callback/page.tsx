'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { setToken } from '@/lib/auth';
import api from '@/lib/api/client';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      const handleAuth = async () => {
        // 1. Initial token setting (so we can call /users/me)
        setToken(accessToken, refreshToken);
        
        try {
          // 2. Fetch full user profile and tenant info from the newly created session
          const response = await api.get('/users/me');
          const userData = response.data.data;
          
          // 3. Update global auth state
          setAuth({
            accessToken,
            refreshToken,
            user: userData,
            tenant: { id: userData.tenantId }
          });
          
          toast.success('Successfully logged in!');
          
          const roles = userData?.roles || [];
          if (roles.includes('SUPER_ADMIN')) {
            router.push('/superadmin');
          } else if (roles.includes('ADMIN')) {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('OAuth Callback Error:', error);
          toast.error('Authentication failed. Please try again.');
          router.push('/login');
        }
      };
      
      handleAuth();
    } else {
      router.push('/login');
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-background">
      <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-xl border border-gray-100 dark:border-border flex flex-col items-center max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-foreground mb-2">Finalizing Authentication</h2>
        <p className="text-gray-500 dark:text-muted-foreground text-sm">
          Please wait a moment while we synchronize your profile and secure your session.
        </p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
